import React from 'react';
import { Plus, Check, ImageIcon } from 'lucide-react';

import type { SiteTemplate } from '@/data/vibe';
import { formatCents } from '@/data/platform';

export interface SiteMenuItem {
  name: string;
  price: number; // cents
  note: string;
  /** number of modifier options on this item, shown on the card */
  modifiers?: number;
  image?: string | null;
  soldOut?: boolean;
}

/**
 * The live online-ordering grid on the generated one-page site.
 * Photo, title, price, modifier count and a working quick-add button.
 */
const MenuCardGrid: React.FC<{
  items: SiteMenuItem[];
  template: SiteTemplate;
  added: Record<string, number>;
  onAdd: (item: SiteMenuItem) => void;
  /** photo-only place card gallery instead of the ordering grid */
  gallery?: boolean;
}> = ({ items, template, added, onAdd, gallery = false }) => {
  if (!items.length) {
    return (
      <p className={`text-sm ${template.body}`}>
        No items yet — the grid fills itself the moment your menu is parsed.
      </p>
    );
  }

  return (
    <div className={`grid gap-3 ${template.cardCols === 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {items.map((item) => {
        const qty = added[item.name] || 0;
        return (
          <article
            key={item.name}
            className={`flex gap-3 border p-3 ${template.card} ${template.radius} transition hover:shadow-lg`}
          >
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden ${template.radius} bg-gradient-to-br ${template.hero}`}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-7 w-7 text-white/80" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className={`truncate text-sm ${template.font} ${template.heading}`}>{item.name}</h4>
              <p className={`mt-0.5 line-clamp-2 text-xs ${template.body}`}>{item.note}</p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${template.heading}`}>
                  {formatCents(item.price)}
                  {item.modifiers ? (
                    <span className={`ml-2 font-medium ${template.body}`}>
                      {item.modifiers} option{item.modifiers > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </span>

                {!gallery && (
                  <button
                    type="button"
                    disabled={item.soldOut}
                    onClick={() => onAdd(item)}
                    className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${template.button} px-3 py-1.5 text-[11px] font-extrabold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {item.soldOut ? (
                      'Sold out'
                    ) : qty > 0 ? (
                      <>
                        <Check className="h-3 w-3" /> {qty} in cart
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Add {formatCents(item.price)}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default MenuCardGrid;
