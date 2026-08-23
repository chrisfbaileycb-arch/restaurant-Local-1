import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Lock, AlertTriangle } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { formatCents } from '@/data/platform';
import {
  fetchOrderDetail,
  fetchOrdersForEmail,
  formatOrderDate,
  orderRef,
  statusMeta,
  type OrderItemRow,
  type OrderRow,
} from '@/lib/orders';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const email: string | undefined = user?.email;

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let alive = true;
    if (authLoading) return;
    if (!email || !id) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      // Confirm this order belongs to the signed-in customer before showing it.
      const mine = await fetchOrdersForEmail(email);
      if (!alive) return;
      const owned = mine.orders.some((o) => o.id === id);
      if (!owned) {
        setDenied(true);
        setError(mine.error);
        setLoading(false);
        return;
      }

      const res = await fetchOrderDetail(id);
      if (!alive) return;
      setOrder(res.order);
      setItems(res.items);
      setError(res.error);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [authLoading, email, id]);

  if (!authLoading && !user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-stone-900">Sign in to view this order</h1>
          <Link to="/login" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-extrabold text-white">
            Sign in
          </Link>
        </div>
      </PageShell>
    );
  }

  const addr = order?.shipping_address || {};
  const meta = statusMeta(order?.status);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : denied || !order ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-xl font-extrabold text-stone-900">Order not found</h1>
            <p className="mt-2 text-stone-600">
              {error
                ? error
                : 'That order is not on the account you are signed in with. Check you used the same email at checkout.'}
            </p>
            <Link to="/orders" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-extrabold text-white">
              Back to my orders
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-mono text-2xl font-extrabold tracking-tight text-stone-900">
                  Order #{orderRef(order.id)}
                </h1>
                <p className="mt-1 text-stone-600">Placed {formatOrderDate(order.created_at)}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
            </div>
            {meta.blurb && <p className="mt-2 text-sm text-stone-500">{meta.blurb}</p>}

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 border-b border-stone-200 px-6 py-4">
                <Package className="h-4 w-4 text-stone-500" />
                <h2 className="font-bold text-stone-900">Items</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {items.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-stone-500">No line items were recorded on this order.</p>
                ) : (
                  items.map((i) => (
                    <div key={i.id} className="flex justify-between gap-4 px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-stone-900">{i.product_name}</p>
                        <p className="text-stone-500">
                          {i.variant_title ? `${i.variant_title} · ` : ''}Qty {i.quantity}
                          {i.sku ? ` · SKU ${i.sku}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-stone-900">{formatCents(i.total)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2 border-t border-stone-200 bg-stone-50 px-6 py-4 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatCents(order.subtotal)}</span></div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCents(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-stone-600"><span>Tax</span><span>{formatCents(order.tax)}</span></div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
                  <span>Total</span><span>{formatCents(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-stone-500" />
                  <h2 className="font-bold text-stone-900">Shipping to</h2>
                </div>
                <div className="mt-3 space-y-0.5 text-sm text-stone-600">
                  {addr.name && <p className="font-semibold text-stone-900">{addr.name}</p>}
                  {addr.address && <p>{addr.address}</p>}
                  {(addr.city || addr.state || addr.zip) && (
                    <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.country && <p>{addr.country}</p>}
                  {addr.email && <p className="pt-2">{addr.email}</p>}
                  {addr.phone && <p>{addr.phone}</p>}
                  {!addr.name && !addr.address && <p>No shipping address recorded.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-stone-500" />
                  <h2 className="font-bold text-stone-900">Payment</h2>
                </div>
                <div className="mt-3 space-y-1 text-sm text-stone-600">
                  <p>
                    Reference{' '}
                    <span className="font-mono text-stone-900">
                      {order.stripe_payment_intent_id || '—'}
                    </span>
                  </p>
                  <p>Charged {formatCents(order.total)}</p>
                  <p className="pt-2 text-xs text-stone-500">
                    Card details are held by our payment processor, never by us. Quote this reference if you contact
                    support about the charge.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-extrabold text-white">
                Order more gear
              </Link>
              <Link
                to="/onboarding"
                className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                Finish my build
              </Link>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default OrderDetail;
