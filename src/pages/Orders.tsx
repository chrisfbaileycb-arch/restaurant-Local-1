import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Lock, RefreshCw, AlertTriangle, ShoppingBag } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { formatCents } from '@/data/platform';
import {
  fetchOrdersForEmail,
  formatOrderDate,
  orderRef,
  statusMeta,
  type OrderRow,
} from '@/lib/orders';

const Orders: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const email: string | undefined = user?.email;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchOrdersForEmail(email);
    setOrders(res.orders);
    setError(res.error);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  /* ---------------- signed out ---------------- */
  if (!authLoading && !user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white">
              <Lock className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-stone-900">Sign in to see your orders</h1>
            <p className="mt-2 text-stone-600">
              Order history is tied to the email you checked out with. Sign in with that address and every order,
              receipt and shipping address will be here.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-extrabold text-white transition hover:scale-[1.03]"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
              >
                Browse hardware
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-10 sm:px-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">My orders</h1>
            <p className="mt-2 text-stone-600">
              Everything ordered with <span className="font-semibold text-stone-800">{email}</span>.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">We could not reach the order service.</p>
              <p className="mt-0.5">{error}</p>
              <Link to="/status" className="mt-1 inline-block font-bold underline">
                Open the status board
              </Link>
            </div>
          </div>
        )}

        {loading || authLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-stone-900">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-stone-600">
              When you buy a terminal, a reader or a starter kit, it shows up here with its receipt, shipping address
              and payment reference.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-extrabold text-white transition hover:scale-[1.03]"
            >
              Shop the hardware <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => {
              const meta = statusMeta(o.status);
              return (
                <li key={o.id}>
                  <Link
                    to={`/orders/${o.id}`}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                      <Package className="h-5 w-5" />
                    </span>
                    <span className="min-w-[9rem] flex-1">
                      <span className="block font-mono text-sm font-bold text-stone-900">#{orderRef(o.id)}</span>
                      <span className="block text-sm text-stone-500">{formatOrderDate(o.created_at)}</span>
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>
                      {meta.label}
                    </span>
                    <span className="text-sm text-stone-600">
                      {o.itemCount || 0} item{(o.itemCount || 0) === 1 ? '' : 's'}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      <span className="text-base font-extrabold text-stone-900">{formatCents(o.total)}</span>
                      <ArrowRight className="h-4 w-4 text-stone-400" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
};

export default Orders;
