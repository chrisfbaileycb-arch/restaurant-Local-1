import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Loader2, Truck, ArrowRight } from 'lucide-react';

import { fetchProductsByHandles } from '@/lib/catalog';
import { useCart } from '@/contexts/CartContext';
import { formatCents } from '@/data/platform';

export interface KitSuggestion {
  planId: string;
  name: string;
  who: string;
  note: string;
  handles: string[];
}

/**
 * The equipment copilot's answer, rendered as a real buildable cart:
 * live products from the catalog layer, a running total, remove-before-you-buy
 * and one button that pushes the whole kit into the cart and heads to checkout.
 */
const CopilotKitCard: React.FC<{ kit: KitSuggestion }> = ({ kit }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropped, setDropped] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchProductsByHandles(kit.handles).then((rows) => {
      if (cancelled) return;
      // keep the plan's own order
      const ordered = kit.handles.map((h) => rows.find((p) => p.handle === h)).filter(Boolean);
      setProducts(ordered as any[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.handles.join('|')]);


  const kept = products.filter((p) => !dropped.includes(p.handle));
  const total = kept.reduce((s, p) => s + (p.price || 0), 0);

  const addKit = (checkout: boolean) => {
    if (kept.length === 0) return;
    kept.forEach((p) =>
      addToCart(
        {
          product_id: p.id,
          name: p.name,
          sku: p.sku || p.handle,
          price: p.price,
          image: p.images?.[0],
        },
        1,
      ),
    );
    setAdded(true);
    if (checkout) navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[11px] text-slate-300">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pricing the {kit.name} kit…
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-amber-300/30 bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
            {kit.name} kit
          </p>
          <p className="truncate text-[10px] text-slate-400">{kit.who}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
          <Truck className="h-3 w-3" /> Free shipping
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {products.map((p) => {
          const off = dropped.includes(p.handle);
          return (
            <div key={p.id} className={`flex items-center gap-2.5 px-3 py-2 ${off ? 'opacity-40' : ''}`}>
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="h-10 w-10 shrink-0 rounded-lg bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[12px] font-bold text-white ${off ? 'line-through' : ''}`}>{p.name}</p>
                <p className="truncate text-[10px] text-slate-400">{p.product_type || 'Hardware'}</p>
              </div>
              <span className="shrink-0 text-[12px] font-extrabold text-white">{formatCents(p.price)}</span>
              <button
                onClick={() => setDropped((d) => (off ? d.filter((h) => h !== p.handle) : [...d, p.handle]))}
                title={off ? 'Put it back in the kit' : 'Take it out of the kit'}
                aria-label={off ? `Add ${p.name} back` : `Remove ${p.name}`}
                className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                {off ? <ArrowRight className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Kit total · {kept.length} piece{kept.length === 1 ? '' : 's'}
          </span>
          <span className="text-lg font-extrabold text-white">{formatCents(total)}</span>
        </div>
        <button
          onClick={() => addKit(true)}
          disabled={kept.length === 0}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 px-3 py-2.5 text-[12px] font-extrabold text-slate-900 transition hover:brightness-105 disabled:opacity-40"
        >
          <ShoppingCart className="h-4 w-4" /> Add this kit to cart
        </button>
        <button
          onClick={() => addKit(false)}
          disabled={kept.length === 0}
          className="mt-1.5 w-full rounded-lg border border-white/15 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          Add and keep talking
        </button>
        {added && (
          <p className="mt-2 text-center text-[10px] font-bold text-emerald-300">
            Added to your cart — checkout whenever you are ready.
          </p>
        )}
      </div>
    </div>
  );
};

export default CopilotKitCard;
