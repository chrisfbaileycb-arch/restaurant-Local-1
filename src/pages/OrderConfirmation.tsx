import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import { formatCents } from '@/data/platform';

const OrderConfirmation: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    supabase.from('ecom_orders').select('*').eq('id', orderId).single().then(({ data }) => setOrder(data));
    supabase.from('ecom_order_items').select('*').eq('order_id', orderId).then(({ data }) => setItems(data || []));
  }, [orderId]);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900">Order confirmed</h1>
          <p className="mt-2 text-stone-700">
            A receipt is on the way to your inbox. Your gear ships pre-loaded with your menu.
          </p>
          {orderId && (
            <p className="mt-3 text-sm text-stone-500">
              Order reference <span className="font-mono font-semibold text-stone-800">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center gap-2 border-b border-stone-200 px-6 py-4">
              <Package className="h-4 w-4 text-stone-500" />
              <h2 className="font-bold text-stone-900">What&apos;s shipping</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between px-6 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-stone-900">{i.product_name}</p>
                    <p className="text-stone-500">
                      {i.variant_title ? `${i.variant_title} · ` : ''}Qty {i.quantity}
                      {i.sku ? ` · SKU ${i.sku}` : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-stone-900">{formatCents(i.total)}</p>
                </div>
              ))}
            </div>
            {order && (
              <div className="space-y-2 border-t border-stone-200 bg-stone-50 px-6 py-4 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatCents(order.subtotal)}</span></div>
                <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCents(order.shipping)}</span></div>
                <div className="flex justify-between text-stone-600"><span>Tax</span><span>{formatCents(order.tax)}</span></div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
                  <span>Total paid</span><span>{formatCents(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold text-stone-900">While you wait — finish your build</h2>
          <p className="mt-1 text-sm text-stone-600">
            Upload your menu now and your POS layout, ordering site and one-page website will be waiting when the box arrives.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white">
              Upload my menu <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100">
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default OrderConfirmation;
