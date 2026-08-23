import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import LocationRollup from '@/components/multi/LocationRollup';
import LocationTable from '@/components/multi/LocationTable';
import LocationDetail from '@/components/multi/LocationDetail';
import ReportingTree from '@/components/multi/ReportingTree';
import { LOCATIONS, MULTI_CAPABILITIES, rollup } from '@/data/locations';
import { formatMoney } from '@/data/platform';

const Locations: React.FC = () => {
  const [selected, setSelected] = useState(LOCATIONS[3].id);
  const all = rollup(LOCATIONS);

  return (
    <PageShell copilot="floor">

      {/* Hero */}
      <section className="border-b border-orange-100 bg-gradient-to-br from-slate-900 via-slate-900 to-fuchsia-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Building2 className="h-3.5 w-3.5" /> Multi-location group view
          </span>
          <h1 className="max-w-3xl pt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            {LOCATIONS.length} stores. One account. One number.
          </h1>
          <p className="max-w-2xl pt-3 text-lg text-white/80">
            Every location keeps its own menu, staff, drawer and tax jurisdiction. You see them side by side, roll
            them up by region, brand, legal entity or the whole group — and staff only ever see the store they
            clocked into.
          </p>
          <div className="flex flex-wrap gap-6 pt-6">
            <div>
              <p className="text-3xl font-extrabold">{formatMoney(all.sales)}</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Group sales yesterday</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">
                {all.devicesOnline}/{all.devicesTotal}
              </p>
              <p className="text-xs uppercase tracking-wide text-white/60">Devices answering fleet-wide</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{all.laborPct.toFixed(1)}%</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Blended labor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roll-ups */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
          <LocationRollup />

          <div>
            <h2 className="pb-1 text-2xl font-extrabold text-slate-900">Every store, side by side</h2>
            <p className="pb-4 text-sm text-slate-600">
              Sort any column, filter by region, or search a city, concept or manager. Click a row to drill in.
            </p>
            <LocationTable selectedId={selected} onSelect={setSelected} />
          </div>

          <div>
            <h2 className="pb-1 text-2xl font-extrabold text-slate-900">Store drill-in</h2>
            <p className="pb-4 text-sm text-slate-600">
              The same close-out an individual owner sees — plus who owns it and what is flagged today.
            </p>
            <LocationDetail id={selected} />
          </div>
        </div>
      </section>

      {/* Reporting structures */}
      <section className="border-y border-orange-100 bg-white/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Reporting structures</h2>
          <p className="max-w-3xl pb-6 pt-2 text-slate-600">
            Numbers are only allowed to combine along the tree. A store rolls into a region, a region into the group;
            legal entity is a separate axis because that is what actually files sales tax and gets funded.
          </p>
          <ReportingTree />
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            What a multi-unit operator gets that a single store does not
          </h2>
          <div className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
            {MULTI_CAPABILITIES.map((c) => (
              <div key={c.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <h3 className="font-extrabold text-slate-900">{c.title}</h3>
                <p className="pt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-amber-50 to-fuchsia-50 p-6">
            <ShieldCheck className="h-8 w-8 shrink-0 text-fuchsia-500" />
            <p className="min-w-[240px] flex-1 text-sm font-semibold text-slate-700">
              Permissions follow the same tree. A store manager cannot open a region report, and only the owner sees
              the group P&amp;L — it is enforced where the report is generated, not hidden in the menu.
            </p>
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
            >
              See the full platform audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Locations;
