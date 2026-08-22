import React, { useMemo, useState } from 'react';
import { ShoppingBag, Instagram, Facebook, Star, Truck, Utensils } from 'lucide-react';

import MenuCardGrid, { type SiteMenuItem } from '@/components/website/MenuCardGrid';
import BusinessHoursBlock, { openStatus, type HoursRow } from '@/components/website/BusinessHoursBlock';
import ContactHiringForm from '@/components/website/ContactHiringForm';
import { conceptPreset, templateById, type SiteTemplate } from '@/data/vibe';
import { DEMO_HOURS, formatCents } from '@/data/platform';

export interface OnePageSiteProps {
  shopName: string;
  tagline: string;
  /** BusinessType id — drives the concept theme engine */
  conceptId: string;
  /** overrides the concept's template when the owner picks one by hand */
  templateId?: string;
  items: SiteMenuItem[];
  hours?: HoursRow[];
  address?: string;
  phone?: string;
  mapUrl?: string;
  logoUrl?: string | null;
  socials?: string[];
  hiring?: boolean;
}

const SOCIAL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Facebook,
  'Google Reviews': Star,
  TikTok: Star,
};

/**
 * The customer-facing one-page site the platform generates from the POS
 * catalog: hero + order header, category nav, live ordering grid, photo
 * place cards, Google-synced hours, contact/map, hiring and socials.
 */
const OnePageSiteTemplate: React.FC<OnePageSiteProps> = ({
  shopName,
  tagline,
  conceptId,
  templateId,
  items,
  hours = DEMO_HOURS,
  address = '412 Harbor St, Riverside',
  phone = '(555) 214-8890',
  mapUrl,
  logoUrl,
  socials = ['Instagram', 'Facebook', 'Google Reviews'],
  hiring = true,
}) => {
  const preset = conceptPreset(conceptId);
  const template: SiteTemplate = templateById(templateId || preset.templateId);
  const [tab, setTab] = useState(preset.tabs[0]);
  const [cart, setCart] = useState<Record<string, number>>({});

  const status = openStatus(hours);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [name, qty]) => {
        const it = items.find((i) => i.name === name);
        return sum + (it ? it.price * qty : 0);
      }, 0),
    [cart, items],
  );

  const add = (item: SiteMenuItem) =>
    setCart((c) => ({ ...c, [item.name]: (c[item.name] || 0) + 1 }));

  const isTruck = conceptId === 'food-truck';

  return (
    <div className={`${template.surface} ${template.radius} overflow-hidden`}>
      {/* Hero & order header */}
      <header className={`bg-gradient-to-br ${template.hero} px-5 py-7 text-white`}>
        <div className="flex items-start gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${shopName} logo`}
              className="h-14 w-14 shrink-0 rounded-xl bg-white/20 object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Utensils className="h-7 w-7" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className={`text-2xl leading-tight ${template.font} text-white`}>{shopName}</h1>
            <p className="mt-1 text-sm text-white/85">{tagline}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                status.open ? 'bg-white text-emerald-700' : 'bg-black/30 text-white'
              }`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTab(preset.tabs[0])}
          className={`mt-5 flex w-full items-center justify-center gap-2 bg-white/95 ${template.radius} px-4 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:scale-[1.02]`}
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 ? `Checkout — ${cartCount} item${cartCount > 1 ? 's' : ''} · ${formatCents(cartTotal)}` : preset.cta}
        </button>

        {isTruck && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white/90">
            <Truck className="h-3.5 w-3.5" /> Parked today: Fifth &amp; Marion · LTE tracker live
          </p>
        )}
      </header>

      {/* Category navigation */}
      <nav className="flex gap-1 overflow-x-auto border-b border-black/5 px-4 py-2">
        {preset.tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
              tab === t ? `bg-gradient-to-r ${template.button} text-white` : `${template.body} hover:opacity-100`
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="space-y-5 px-4 py-5">
        {tab === preset.tabs[0] && (
          <section>
            <h2 className={`mb-3 text-sm ${template.font} ${template.heading}`}>
              Order online — 0% commission
            </h2>
            <MenuCardGrid items={items} template={template} added={cart} onAdd={add} />
            <p className={`mt-3 text-[11px] ${template.body}`}>
              {preset.focus} Orders print straight to the kitchen.
            </p>
          </section>
        )}

        {tab === preset.tabs[1] && (
          <section>
            <h2 className={`mb-3 text-sm ${template.font} ${template.heading}`}>{preset.tabs[1]}</h2>
            <MenuCardGrid items={items} template={template} added={cart} onAdd={add} gallery />
          </section>
        )}

        {(tab === 'Hours' || tab === preset.tabs[2]) && (
          <BusinessHoursBlock
            template={template}
            rows={hours}
            address={address}
            phone={phone}
            mapUrl={mapUrl}
          />
        )}

        {(tab === 'Contact' || tab === 'Hiring') && (
          <div className="space-y-4">
            <div className={`overflow-hidden border ${template.card} ${template.radius}`}>
              <iframe
                title="Map"
                className="h-40 w-full border-0"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              />
            </div>
            <ContactHiringForm template={template} shopName={shopName} hiring={hiring} />
          </div>
        )}

        {/* Socials always sit in the footer */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
          {socials.map((s) => {
            const Icon = SOCIAL_ICON[s] || Star;
            return (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${template.card} ${template.body}`}
              >
                <Icon className="h-3.5 w-3.5" /> {s}
              </span>
            );
          })}
        </footer>
      </div>
    </div>
  );
};

export default OnePageSiteTemplate;
