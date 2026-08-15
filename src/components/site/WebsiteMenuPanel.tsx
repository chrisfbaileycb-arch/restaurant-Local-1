import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Ban, ExternalLink, Percent } from 'lucide-react';

import { useOps } from '@/lib/opsStore';
import { formatCents } from '@/data/platform';
import type { LoadedMenu } from '@/lib/menuStore';

/**
 * Dashboard → Website → Live menu & ordering.
 * A read-only mirror of the POS catalog: categories, prices, modifiers and
 * 86 status, exactly as the public page renders them. Nothing is re-typed —
 * it is the same menu the register and the online cart use.
 */
const WebsiteMenuPanel: React.FC<{ menu: LoadedMenu; orderingOn: boolean; domain?: string | null }> = ({
  menu, orderingOn, domain,
}) => {
  const ops = useOps();
  const [cat, setCat] = useState<string>(menu.categories[0] || 'Menu');

  const items = useMemo(() => menu.items.filter((i) => i.category === cat), [menu.items, cat]);
  const offCount = menu.items.filter((i) => ops.is86(i.name)).length;


  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <UtensilsCrossed className="h-4 w-4 text-amber-600" /> Live menu &amp; ordering
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {menu.items.length} items across {menu.categories.length} categories, straight from the POS catalog.
            {offCount > 0 && ` ${offCount} 86'd right now and hidden from the page.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${
            orderingOn ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
          }`}>
            {orderingOn ? '0% commission ordering on' : 'Ordering off'}
          </span>
          <Link
            to="/pos"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 hover:border-stone-400"
          >
            Open register <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {ops.promos.length > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          <Percent className="h-3.5 w-3.5" />
          {ops.promos.map((p) => `${p.pct}% off ${p.scope}`).join(' · ')} — showing on the page too
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {menu.categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              cat === c ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-stone-100">
        {items.slice(0, 14).map((i) => {
          const off = ops.is86(i.name);
          const price = ops.priceFor(i.name, i.price);
          return (

            <li key={i.id} className="flex items-start justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${off ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                  {i.name}
                </p>
                {i.mods && i.mods.length > 0 && (
                  <p className="truncate text-xs text-stone-500">Modifiers: {i.mods.join(', ')}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-stone-900">{formatCents(price)}</p>
                {off && (
                  <p className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-red-600">
                    <Ban className="h-3 w-3" /> 86'd
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {items.length > 14 && <p className="mt-2 text-xs text-stone-500">+{items.length - 14} more in {cat}</p>}

      <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-xs text-stone-600">
        This is the same catalog the register rings. 86 an item or change a price at the terminal — or say it to the
        copilot — and this page, the online cart and the kitchen all move together.
        {domain ? ` Guests order at ${domain}/order.` : ' Save a domain above and guests order at yourshop.com/order.'}
      </p>
    </div>
  );
};

export default WebsiteMenuPanel;
