import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Wifi, ArrowRight, MonitorSmartphone, Boxes } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import DeviceHub from '@/components/site/DeviceHub';
import DeviceBar from '@/components/site/DeviceBar';
import StationMonitor from '@/components/site/StationMonitor';
import CopilotDock, { askCopilot } from '@/components/site/CopilotDock';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { DEVICE_KINDS } from '@/data/platform';

/**
 * /devices — the hardware station manager.
 *
 * Previously this only existed as a section embedded in the home page, so the
 * "Devices" nav link (which pointed at "/#devices") went nowhere from any
 * other page. This gives the equipment console a real, linkable route.
 */
const Devices: React.FC = () => {
  const [gear, setGear] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handles = Array.from(
      new Set(DEVICE_KINDS.flatMap((d: any) => (d.productHandles || d.handles || []) as string[])),
    ).filter(Boolean);

    const run = async () => {
      const query = supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('status', 'active');

      const { data, error } = handles.length
        ? await query.in('handle', handles)
        : await query.limit(8);

      if (error) console.error('[Devices] gear lookup failed:', error.message);
      setGear(data || []);
      setLoaded(true);
    };
    run();
  }, []);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-16">
        <div className="pointer-events-none absolute -left-24 top-6 h-80 w-80 animate-blob rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 animate-blob rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:3s]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-200">
            <MonitorSmartphone className="h-3.5 w-3.5" /> Equipment console
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            Pair every printer, drawer and reader — and test it before the first ticket.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Real ESC/POS command emulation. Send a test print, kick the drawer, tap a card,
            scan a barcode and watch the live terminal log respond, device by device.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-slate-900 transition hover:scale-[1.03]"
            >
              <Boxes className="h-4 w-4" /> Shop all hardware
            </Link>
            <Link
              to="/stay-open-offline"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              <Wifi className="h-4 w-4" /> If the internet drops
            </Link>
            <button
              onClick={() => askCopilot('Which devices do I actually need to open?')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              <Printer className="h-4 w-4" /> Ask what I need
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <DeviceBar />
      </div>

      <DeviceHub />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Live station board
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Every paired device gets checked on a loop all day. If a printer goes quiet mid-rush,
          you find out here — not from a customer waiting on food.
        </p>
        <div className="mt-6">
          <StationMonitor />
        </div>
      </section>

      <section className="border-t border-orange-100 bg-gradient-to-b from-white to-amber-50/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                The gear behind these drivers
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Everything on this page runs on hardware you can buy today. Free shipping on all orders.
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
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          ) : gear.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {gear.slice(0, 8).map((p) => (
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

export default Devices;
