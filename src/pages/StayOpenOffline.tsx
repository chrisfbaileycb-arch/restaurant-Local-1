import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, ArrowRight } from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import Failover from '@/components/site/Failover';
import { PHONE_PIVOT_ABILITIES } from '@/data/platform';

/** /stay-open-offline — the 5-tier failover ladder and the phone-pivot answer. */
const StayOpenOffline: React.FC = () => (
  <PageShell copilot="equipment">
    <section className="border-b border-stone-200 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-900/40 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
          <WifiOff className="h-3.5 w-3.5" /> Stay open offline
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          The internet goes down. You keep selling.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-300">
          Five layers, automatic: shop WiFi, LTE router failover, phone hotspot, the phone itself as the register, and
          a full local queue when there is nothing at all. Cut the cord below and watch it happen.
        </p>
      </div>
    </section>

    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
      <Failover />

      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
          What a phone can still do with zero bars
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHONE_PIVOT_ABILITIES.map((a) => (
            <div key={a.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="font-bold text-stone-900">{a.label}</p>
              <p className="mt-1 text-sm text-stone-600">{a.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-stone-900 p-6 text-white sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold">Want the rescue hardware?</p>
          <p className="text-sm text-stone-300">
            LTE failover router, plug-in phone swiper, Bluetooth printer and a battery pack.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-stone-900">
            Shop hardware <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/devices" className="rounded-xl border border-stone-600 px-5 py-3 font-semibold text-white hover:bg-stone-800">
            Open the device hub
          </Link>
        </div>
      </section>
    </div>
  </PageShell>
);

export default StayOpenOffline;
