import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Minus, Plus, ShoppingCart, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { formatCents, STARTER_PLANS, BUDGET_TAG } from '@/data/platform';

interface Selection {
  [handle: string]: number; // quantity, 0 / missing = not selected
}

const BudgetBuilder: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Selection>({});
  const [activePlan, setActivePlan] = useState<string>('phone');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('ecom_products')
        .select('*')
        .eq('status', 'active')
        .contains('tags', [BUDGET_TAG])
        .order('price');
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Apply the default plan once products arrive.
  useEffect(() => {
    if (products.length === 0) return;
    applyPlan('phone', products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const applyPlan = (planId: string, list = products) => {
    const plan = STARTER_PLANS.find((p) => p.id === planId);
    if (!plan) return;
    const next: Selection = {};
    plan.handles.forEach((h) => {
      if (list.some((p) => p.handle === h)) next[h] = 1;
    });
    setSel(next);
    setActivePlan(planId);
  };

  const toggle = (handle: string) => {
    setActivePlan('custom');
    setSel((s) => {
      const next = { ...s };
      if (next[handle]) delete next[handle];
      else next[handle] = 1;
      return next;
    });
  };

  const bump = (handle: string, delta: number) => {
    setActivePlan('custom');
    setSel((s) => {
      const next = { ...s };
      const q = (next[handle] || 0) + delta;
      if (q <= 0) delete next[handle];
      else next[handle] = Math.min(q, 20);
      return next;
    });
  };

  const chosen = useMemo(
    () => products.filter((p) => sel[p.handle] > 0),
    [products, sel]
  );
  const total = chosen.reduce((s, p) => s + p.price * (sel[p.handle] || 0), 0);
  const monthly = Math.round(total / 6); // 6 interest-free payments framing

  const addAll = (goToCart: boolean) => {
    if (chosen.length === 0) return;
    chosen.forEach((p) =>
      addToCart(
        {
          product_id: p.id,
          name: p.name,
          sku: p.sku || p.handle,
          price: p.price,
          image: p.images?.[0],
        },
        sel[p.handle] || 1
      )
    );
    if (goToCart) navigate('/cart');
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-stone-900">Build your opening-day kit</h3>
          <p className="text-sm text-stone-500">
            Start with a plan, then add or drop anything. You always see the real total before you buy.
          </p>
        </div>
      </div>

      {/* Plan presets */}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {STARTER_PLANS.map((plan) => {
          const planTotal = plan.handles.reduce(
            (s, h) => s + (products.find((p) => p.handle === h)?.price || 0),
            0
          );
          const active = activePlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => applyPlan(plan.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">{plan.name}</span>
                {active && <Check className="h-4 w-4 text-amber-600" />}
              </div>
              <p className="mt-1 text-2xl font-extrabold text-stone-900">
                {loading ? '—' : formatCents(planTotal)}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700">{plan.who}</p>
              <p className="mt-2 text-sm text-stone-600">{plan.note}</p>
            </button>
          );
        })}
      </div>

      {/* Item picker */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200">
          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse bg-stone-100" />)
          ) : (
            products.map((p) => {
              const qty = sel[p.handle] || 0;
              const on = qty > 0;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 transition ${on ? 'bg-emerald-50/50' : 'bg-white'}`}
                >
                  <button
                    onClick={() => toggle(p.handle)}
                    aria-label={`${on ? 'Remove' : 'Add'} ${p.name}`}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                      on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {on && <Check className="h-4 w-4" />}
                  </button>
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{p.name}</p>
                    <p className="truncate text-xs text-stone-500">{p.product_type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => bump(p.handle, -1)}
                      disabled={!on}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-300 text-stone-600 disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-stone-900">{qty}</span>
                    <button
                      onClick={() => bump(p.handle, 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-300 text-stone-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-bold text-stone-900">
                    {formatCents(p.price)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Running total */}
        <div className="h-fit rounded-2xl border border-stone-900 bg-stone-900 p-5 text-white lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Your total today</p>
          <p className="mt-1 text-4xl font-extrabold">{formatCents(total)}</p>
          <p className="mt-1 text-sm text-stone-400">
            or about <span className="font-semibold text-white">{formatCents(monthly)}/mo</span> over 6 payments ·
            free shipping
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {chosen.length === 0 && <li className="text-stone-400">Pick a plan or check items to start.</li>}
            {chosen.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 text-stone-300">
                <span className="truncate">
                  {sel[p.handle] > 1 ? `${sel[p.handle]}× ` : ''}
                  {p.name}
                </span>
                <span className="shrink-0 font-medium text-white">
                  {formatCents(p.price * (sel[p.handle] || 0))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2">
            <button
              onClick={() => addAll(true)}
              disabled={chosen.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-stone-900 transition hover:bg-amber-400 disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" /> Add kit to cart
            </button>
            <button
              onClick={() => addAll(false)}
              disabled={chosen.length === 0}
              className="w-full rounded-xl border border-stone-600 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-stone-800 disabled:opacity-40"
            >
              Add and keep shopping
            </button>
          </div>
          <p className="mt-3 text-xs text-stone-400">
            Software is $0/mo on Starter. No install fee, no contract, no early-termination anything.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetBuilder;
