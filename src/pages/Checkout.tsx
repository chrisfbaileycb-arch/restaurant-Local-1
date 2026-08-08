import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Truck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import { useCart } from '@/contexts/CartContext';
import {
  formatCents, SHIPPING_RULES, STRIPE_ACCOUNT_ID, STRIPE_PUBLISHABLE_KEY, CRM_SUBSCRIBE_URL, PROJECT_ID,
} from '@/data/platform';

const stripePromise =
  STRIPE_ACCOUNT_ID && STRIPE_ACCOUNT_ID !== 'STRIPE_ACCOUNT_ID'
    ? loadStripe(STRIPE_PUBLISHABLE_KEY, { stripeAccount: STRIPE_ACCOUNT_ID })
    : null;

const PaymentForm: React.FC<{ onSuccess: (pi: any) => void; total: number; busy: boolean }> = ({
  onSuccess, total, busy,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent);
    } else {
      setError('Payment could not be completed. Please try another card.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading || busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 font-bold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {(loading || busy) && <Loader2 className="h-4 w-4 animate-spin" />}
        <Lock className="h-4 w-4" /> Pay {formatCents(total)}
      </button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [address, setAddress] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US',
  });

  const total = subtotal + shippingCost + tax;
  const cartRef = useMemo(() => cart, [cart]);

  // shipping (AI rules)
  useEffect(() => {
    if (subtotal <= 0) return;
    supabase.functions
      .invoke('calculate-shipping', {
        body: {
          cartItems: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          shippingRules: SHIPPING_RULES,
          subtotal,
        },
      })
      .then(({ data }) => {
        if (typeof data?.shippingCents === 'number') setShippingCost(data.shippingCents);
      })
      .catch(() => setShippingCost(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // tax by state
  useEffect(() => {
    if (subtotal <= 0 || address.state.trim().length < 2) {
      setTax(0);
      return;
    }
    supabase.functions
      .invoke('calculate-tax', { body: { state: address.state.trim(), subtotal } })
      .then(({ data }) => {
        if (data?.success) setTax(data.taxCents || 0);
      })
      .catch(() => setTax(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.state, subtotal]);

  // payment intent
  useEffect(() => {
    if (total <= 0) return;
    let cancelled = false;
    setPaymentError('');
    supabase.functions
      .invoke('create-payment-intent', { body: { amount: total, currency: 'usd' } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.clientSecret) {
          setPaymentError('Unable to initialize payment. Please refresh and try again.');
          return;
        }
        setClientSecret(data.clientSecret);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const valid =
    address.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email) && address.address && address.city && address.state && address.zip;

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setPlacing(true);
    try {
      const { data: customer } = await supabase
        .from('ecom_customers')
        .upsert({ email: address.email, name: address.name, phone: address.phone || null }, { onConflict: 'email' })
        .select('id, email, name')
        .single();

      const { data: order } = await supabase
        .from('ecom_orders')
        .insert({
          customer_id: customer?.id,
          status: 'paid',
          subtotal,
          tax,
          shipping: shippingCost,
          total,
          shipping_address: address,
          stripe_payment_intent_id: paymentIntent.id,
        })
        .select('id')
        .single();

      if (order) {
        const items = cartRef.map((i) => ({
          order_id: order.id,
          product_id: i.product_id,
          variant_id: i.variant_id || null,
          product_name: i.name,
          variant_title: i.variant_title || null,
          sku: i.sku || null,
          quantity: i.quantity,
          unit_price: i.price,
          total: i.price * i.quantity,
        }));
        await supabase.from('ecom_order_items').insert(items);

        const { data: orderItems } = await supabase
          .from('ecom_order_items')
          .select('*')
          .eq('order_id', order.id);

        fetch(`https://famous.ai/api/ecommerce/${PROJECT_ID}/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customerEmail: address.email,
            customerName: address.name,
            orderItems,
            subtotal,
            shipping: shippingCost,
            tax,
            total,
            shippingAddress: address,
          }),
        }).catch(() => {});
      }

      fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: address.email,
          name: address.name || undefined,
          phone: address.phone || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'checkout',
          tags: ['customer'],
        }),
      }).catch(() => {});

      clearCart();
      navigate(`/order-confirmation?order=${order?.id || ''}`);
    } catch {
      setPaymentError('Payment succeeded but we could not save the order. Contact support with your receipt.');
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-bold text-stone-900">Nothing to check out</h1>
          <Link to="/shop" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white">
            Browse hardware
          </Link>
        </div>
      </PageShell>
    );
  }

  const field = 'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-500';

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 font-bold text-stone-900">Shipping address</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={`${field} sm:col-span-2`} placeholder="Full name" value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                <input className={`${field} sm:col-span-2`} type="email" placeholder="Email" value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                <input className={`${field} sm:col-span-2`} type="tel" placeholder="Phone number (optional)" value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                <label className="flex items-start gap-2 text-xs text-stone-600 sm:col-span-2">
                  <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 h-4 w-4" />
                  <span>Text me order and shipping updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
                </label>
                <input className={`${field} sm:col-span-2`} placeholder="Street address" value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                <input className={field} placeholder="City" value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input className={field} placeholder="State (e.g. TX)" maxLength={2} value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
                <input className={field} placeholder="ZIP code" value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
                <input className={field} placeholder="Country" value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 font-bold text-stone-900">Payment</h2>
              {!stripePromise ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  Payment processing is being set up. Please check back soon.
                </div>
              ) : !valid ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                  Fill in your shipping details above to unlock the payment form.
                </div>
              ) : paymentError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{paymentError}</div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <PaymentForm onSuccess={handlePaymentSuccess} total={total} busy={placing} />
                </Elements>
              ) : (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading secure payment form…
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-bold text-stone-900">Order summary</h2>
            <div className="mt-4 space-y-3">
              {cart.map((i) => (
                <div key={`${i.product_id}-${i.variant_id || 'base'}`} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-stone-900">{i.name}</p>
                    <p className="text-stone-500">
                      {i.variant_title ? `${i.variant_title} · ` : ''}Qty {i.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{formatCents(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatCents(subtotal)}</span></div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'font-semibold text-emerald-700' : ''}>
                  {shippingCost === 0 ? 'Free' : formatCents(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax{address.state ? ` (${address.state})` : ''}</span>
                <span>{formatCents(tax)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold text-stone-900">
              <span>Total</span><span>{formatCents(total)}</span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-stone-500">
              <Truck className="h-4 w-4 text-emerald-600" /> Free shipping on all orders
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-stone-500">
              <Lock className="h-4 w-4" /> Secured by Stripe · PCI compliant
            </p>
          </aside>
        </div>
      </div>
    </PageShell>
  );
};

export default Checkout;
