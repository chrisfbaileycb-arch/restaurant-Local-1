import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, Signal, Smartphone, Database, ArrowRight } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import Failover from '@/components/site/Failover';
import CopilotDock, { askCopilot } from '@/components/site/CopilotDock';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { PHONE_PIVOT_ABILITIES } from '@/data/platform';

/** Hardware that actually keeps a shop open when the line goes down. */
const RESCUE_HANDLES = [
  'lte-failover-router',
  'phone-card-swiper-plugin',
  'phone-card-scan-kit',
  'phone-pos-starter-kit',
  'mini-receipt-printer-bluetooth',
  'vibe-pocket-reader',
];

/**
 * /stay-open-offline — the 5-tier failover ladder as its own page.
 * Was previously only a section on the home page with no route behind the
 * "Stay open offline" nav link.
 */
const StayOpenOffline: React.FC = () => {
  const [gear, setGear] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('ecom_products')
      .select('*, variants:ecom_product_variants(*)')
      .in('handle', RESCUE_HANDLES)
      .eq('status', 'active')
      .then(({ data, error }) => {
        if (error) console.error('[StayOpenOffline] gear lookup failed:', error.message);
        setGear(data || []);
        setLoaded(true);
      });
  }, []);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 animate-blob rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <WifiOff className="h-3.5 w-3.5" /> Five layers deep
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            The internet goes out. You keep taking money.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Shop WiFi drops to LTE in under three seconds. LTE drops to a staff phone hotspot.
            The terminal dies and any phone becomes the register. Everything dies and the orders,
            prints and card reads queue on the device until data returns.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => askCopilot('Simulate a network cut at my busiest hour')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-slate-900 transition hover:scale-[1.03]"
            >
              <Signal className="h-4 w-4" /> Simulate a network cut
            </button>
            <Link
              to="/devices"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              <Database className="h-4 w-4" /> Device console
            </Link>
          </div>
        </div>
      </section>

      <Failover />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          What a phone can still do with zero bars
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          This is the food-truck answer: the register is an account, not a machine.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHONE_PIVOT_ABILITIES.map((a) => (
            <div key={a.id} className="hover-lift rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <Smartphone className="h-5 w-5 text-fuchsia-500" />
              <p className="mt-3 font-extrabold text-slate-900">{a.label}</p>
              <p className="mt-1 text-sm text-slate-600">{a.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-orange-100 bg-gradient-to-b from-white to-amber-50/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                The gear that keeps you open
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Cheap insurance against a dead night. Free shipping on all orders.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 px-5 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
            >
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!loaded ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          ) : gear.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gear.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-orange-200 bg-white p-10 text-center">
              <p className="font-bold text-slate-900">The catalog is being restocked</p>
              <Link
                to="/shop"
                className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Shop all hardware
              </Link>
            </div>
          )}
        </div>
      </section>

      <CopilotDock mode="equipment" />

    </PageShell>
  );
};

export default StayOpenOffline;
