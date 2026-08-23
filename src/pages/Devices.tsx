import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plug, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchProductsByHandles } from '@/lib/catalog';
import PageShell from '@/components/site/PageShell';
import DeviceBar from '@/components/site/DeviceBar';
import DeviceHub from '@/components/site/DeviceHub';
import StationMonitor from '@/components/site/StationMonitor';
import ProductCard from '@/components/ProductCard';
import { DEVICE_KINDS, DEVICE_PROMISE } from '@/data/platform';

/**
 * /devices — the hardware station manager.
 * ESC/POS console, live station board and the real gear behind every driver,
 * priced from the catalog layer (never a hardcoded hardware list, and never a
 * blank grid if the catalog is briefly unreachable).
 */
const Devices: React.FC = () => {
  const [gear, setGear] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    const handles = Array.from(new Set(DEVICE_KINDS.flatMap((k) => k.handles)));
    if (handles.length === 0) return;
    fetchProductsByHandles(handles).then((rows) => {
      if (!alive) return;
      setGear([...rows].sort((a, b) => (a.price || 0) - (b.price || 0)));
    });
    return () => {
      alive = false;
    };
  }, []);


  return (
    <PageShell copilot="equipment">
      <section className="border-b border-stone-200 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky-300">
            <Plug className="h-3.5 w-3.5" /> Device hub
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Every printer, drawer and reader — paired, tested and firing.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-300">
            Real drivers, not a picture of a printer. Run a test print, kick the drawer, push a ticket to the kitchen
            screen and run a $0.00 card read right here.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {DEVICE_PROMISE.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-stone-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <DeviceBar />
        <DeviceHub />
        <StationMonitor />

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">The gear behind these drivers</h2>
              <p className="mt-1 text-stone-600">Priced live from the hardware shop. Free shipping on everything.</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-amber-700 hover:underline">
              See the full hardware shop →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {gear.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                <p className="font-bold text-stone-900">Loading the hardware catalog…</p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Shop all hardware <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              gear.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Devices;
