import React from 'react';
import { ShoppingBag, MapPin, Star, Instagram, Facebook, Camera, ExternalLink } from 'lucide-react';

import { templateById, type SiteTemplate } from '@/data/vibe';
import { formatCents } from '@/data/platform';

/**
 * A live render of the ONE page every shop gets, in a phone frame.
 * Same three jobs on every template: order, a Google link for hours &
 * contact, and social links. Only the vibe changes.
 */
export interface PreviewItem {
  name: string;
  price: number;
  note?: string;
}

interface Props {
  templateId?: string | null;
  template?: SiteTemplate;
  shopName: string;
  tagline?: string;
  logoUrl?: string | null;
  items: PreviewItem[];
  socials?: string[];
  /** compact drops the footer note (used inside tight grids) */
  compact?: boolean;
}

const SOCIAL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Facebook,
  'Google Reviews': Star,
};

const SitePreview: React.FC<Props> = ({
  templateId, template, shopName, tagline, logoUrl, items, socials = [], compact,
}) => {
  const t = template || templateById(templateId);

  return (
    <div className={`overflow-hidden border ${t.card} ${t.radius} ${t.surface}`}>
      {/* Hero — logo, name, one line, order button */}
      <div className={`bg-gradient-to-br ${t.hero} px-4 py-6 text-center`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${shopName} logo`}
            className="mx-auto h-14 w-14 rounded-xl bg-white/90 object-contain p-1 shadow"
          />
        ) : (
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/25 text-2xl font-black text-white backdrop-blur">
            {shopName.trim().charAt(0).toUpperCase() || 'L'}
          </span>
        )}
        <p className={`mt-3 text-xl text-white ${t.font}`}>{shopName}</p>
        {tagline && <p className="mt-1 text-xs text-white/85">{tagline}</p>}
        <button
          type="button"
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r ${t.button} px-4 py-3 text-sm font-extrabold text-white shadow ${t.radius}`}
        >
          <ShoppingBag className="h-4 w-4" /> Order online · 0% commission
        </button>
      </div>

      {/* Menu place cards, straight from the POS catalog */}
      <div className="px-4 py-4">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${t.body}`}>From the kitchen</p>
        <div className={`mt-2 grid gap-2 ${t.cardCols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {items.slice(0, 4).map((m) => (
            <div key={m.name} className={`overflow-hidden border ${t.card} ${t.radius}`}>
              <div className={`flex h-14 items-center justify-center bg-gradient-to-br ${t.hero} opacity-80`}>
                <Camera className="h-4 w-4 text-white/80" />
              </div>
              <div className="p-2">
                <p className={`line-clamp-1 text-[11px] ${t.heading} font-bold`}>{m.name}</p>
                {m.note && <p className={`line-clamp-1 text-[10px] ${t.body}`}>{m.note}</p>}
                <p className={`text-[11px] font-extrabold ${t.heading}`}>{formatCents(m.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Google is the single source for hours, address and phone */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className={`mt-3 flex items-center justify-between border px-3 py-2.5 ${t.card} ${t.radius}`}
        >
          <span className={`flex items-center gap-2 text-[11px] font-bold ${t.heading}`}>
            <MapPin className="h-3.5 w-3.5" /> Hours, address &amp; phone
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${t.body}`}>
            Google <ExternalLink className="h-3 w-3" />
          </span>
        </a>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {socials.map((s) => {
              const Icon = SOCIAL_ICON[s] || Star;
              return (
                <span
                  key={s}
                  className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold ${t.card} ${t.heading} ${t.radius}`}
                >
                  <Icon className="h-3 w-3" /> {s}
                </span>
              );
            })}
          </div>
        )}

        {!compact && (
          <p className={`mt-3 text-center text-[10px] ${t.body}`}>
            One page. Order, Google, socials — nothing else to maintain.
          </p>
        )}
      </div>
    </div>
  );
};

export default SitePreview;
