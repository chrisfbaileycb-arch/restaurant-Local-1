import React from 'react';
import { Building2, DollarSign, Receipt, Users, Cpu, TrendingUp } from 'lucide-react';
import { LOCATIONS, REGIONS, byRegion, rollup } from '@/data/locations';
import { formatMoney } from '@/data/platform';

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; tone: string }> = ({
  icon,
  label,
  value,
  sub,
  tone,
}) => (
  <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
      {icon}
    </div>
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-2xl font-extrabold text-slate-900">{value}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);

const LocationRollup: React.FC = () => {
  const all = rollup(LOCATIONS);
  const open = LOCATIONS.filter((l) => l.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi
          icon={<DollarSign className="h-5 w-5" />}
          label="Group sales"
          value={formatMoney(all.sales)}
          sub={`${all.delta >= 0 ? '+' : ''}${all.delta.toFixed(1)}% vs last week`}
          tone="from-fuchsia-500 to-pink-500"
        />
        <Kpi
          icon={<Receipt className="h-5 w-5" />}
          label="Orders"
          value={all.orders.toLocaleString()}
          sub={`$${all.avgTicket.toFixed(2)} average ticket`}
          tone="from-orange-500 to-amber-500"
        />
        <Kpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Labor"
          value={`${all.laborPct.toFixed(1)}%`}
          sub={`${formatMoney(all.labor)} of sales`}
          tone="from-emerald-500 to-teal-400"
        />
        <Kpi
          icon={<Building2 className="h-5 w-5" />}
          label="Locations"
          value={`${LOCATIONS.length}`}
          sub={`${open} open · ${LOCATIONS.length - open} building or closed`}
          tone="from-violet-500 to-indigo-500"
        />
        <Kpi
          icon={<Cpu className="h-5 w-5" />}
          label="Devices online"
          value={`${all.devicesOnline}/${all.devicesTotal}`}
          sub="Heartbeat every 45 seconds"
          tone="from-sky-500 to-cyan-400"
        />
        <Kpi
          icon={<Users className="h-5 w-5" />}
          label="On shift now"
          value={`${all.staff}`}
          sub={`Cash variance ${all.variance < 0 ? '-' : ''}$${Math.abs(all.variance).toFixed(2)}`}
          tone="from-amber-600 to-orange-600"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {REGIONS.map((r) => {
          const stores = byRegion(r.id);
          const sum = rollup(stores);
          const share = all.sales > 0 ? (sum.sales / all.sales) * 100 : 0;
          return (
            <div key={r.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900">{r.name}</h3>
                <span className={`rounded-lg bg-gradient-to-r ${r.tone} px-2 py-0.5 text-[11px] font-bold text-white`}>
                  {stores.length} stores
                </span>
              </div>
              <p className="pt-1 text-xs text-slate-500">{r.note}</p>
              <p className="pt-3 text-2xl font-extrabold text-slate-900">{formatMoney(sum.sales)}</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full bg-gradient-to-r ${r.tone}`} style={{ width: `${share}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Share</p>
                  <p className="text-sm font-bold text-slate-800">{share.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Labor</p>
                  <p className="text-sm font-bold text-slate-800">{sum.laborPct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Devices</p>
                  <p className="text-sm font-bold text-slate-800">
                    {sum.devicesOnline}/{sum.devicesTotal}
                  </p>
                </div>
              </div>
              <p className="pt-3 text-xs font-semibold text-slate-600">Lead: {r.lead}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationRollup;
