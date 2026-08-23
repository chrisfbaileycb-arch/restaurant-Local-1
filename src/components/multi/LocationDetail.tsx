import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import {
  locationById,
  laborPct,
  avgTicket,
  salesDelta,
  STATUS_COPY,
  CONNECTIVITY_COPY,
  REGIONS,
} from '@/data/locations';
import { formatMoney, formatTaxRate } from '@/data/platform';

const Stat: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className="rounded-xl border border-orange-100 bg-amber-50/50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`text-lg font-extrabold ${tone || 'text-slate-900'}`}>{value}</p>
  </div>
);

const LocationDetail: React.FC<{ id: string }> = ({ id }) => {
  const l = locationById(id);
  const region = REGIONS.find((r) => r.id === l.region);
  const lp = laborPct(l);
  const delta = salesDelta(l);

  const exceptions: { text: string; bad: boolean }[] = [
    {
      text:
        l.devicesOnline === l.devicesTotal
          ? `All ${l.devicesTotal} paired devices answering`
          : `${l.devicesTotal - l.devicesOnline} device(s) not answering — alert open`,
      bad: l.devicesOnline !== l.devicesTotal,
    },
    {
      text:
        Math.abs(l.cashVariance) < 5
          ? `Drawer within tolerance (${l.cashVariance < 0 ? '-' : ''}$${Math.abs(l.cashVariance).toFixed(2)})`
          : `Cash short ${l.cashVariance < 0 ? '-' : ''}$${Math.abs(l.cashVariance).toFixed(2)} — review the close`,
      bad: Math.abs(l.cashVariance) >= 5,
    },
    {
      text:
        lp <= 28
          ? `Labor ${lp ? `${lp.toFixed(1)}%` : 'n/a'} — inside plan`
          : `Labor ${lp.toFixed(1)}% — over the 28% plan`,
      bad: lp > 28,
    },
    {
      text:
        l.sales > 0 && l.compsVoids / l.sales > 0.02
          ? `Comps & voids ${formatMoney(l.compsVoids)} — above 2% of sales`
          : `Comps & voids ${formatMoney(l.compsVoids)} — normal`,
      bad: l.sales > 0 && l.compsVoids / l.sales > 0.02,
    },
    {
      text:
        l.connectivity === 'offline'
          ? 'Running on the offline queue — sales will settle when data returns'
          : l.connectivity === 'lte'
          ? 'Carried by LTE failover — broadband is down at this address'
          : 'Primary broadband healthy',
      bad: l.connectivity !== 'wifi',
    },
  ];

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900">{l.name}</h3>
            <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${STATUS_COPY[l.status].chip}`}>
              {STATUS_COPY[l.status].label}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${CONNECTIVITY_COPY[l.connectivity].chip}`}
            >
              {CONNECTIVITY_COPY[l.connectivity].label}
            </span>
          </div>
          <p className="flex items-center gap-1 pt-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {l.city}, {l.state} · {l.concept} · opened {l.openedYear} ·{' '}
            {region?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Store ID</p>
          <p className="font-mono text-sm font-bold text-slate-700">{l.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 md:grid-cols-4">
        <Stat label="Sales yesterday" value={formatMoney(l.sales)} />
        <Stat
          label="vs same day last week"
          value={l.priorSales ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%` : '—'}
          tone={delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        />
        <Stat label="Orders" value={`${l.orders}`} />
        <Stat label="Average ticket" value={l.orders ? `$${avgTicket(l).toFixed(2)}` : '—'} />
        <Stat label="Labor cost" value={formatMoney(l.laborCost)} />
        <Stat
          label="Labor % of sales"
          value={lp ? `${lp.toFixed(1)}%` : '—'}
          tone={lp > 28 ? 'text-rose-600' : 'text-emerald-600'}
        />
        <Stat label="Ticket time" value={l.ticketAvgMinutes ? `${l.ticketAvgMinutes} min` : '—'} />
        <Stat label="On shift" value={`${l.staffOnShift}`} />
      </div>

      <div className="grid gap-4 pt-5 md:grid-cols-2">
        <div>
          <h4 className="pb-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">Exceptions</h4>
          <ul className="space-y-1.5">
            {exceptions.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {e.bad ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                )}
                <span className={e.bad ? 'font-semibold text-slate-800' : 'text-slate-600'}>{e.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="pb-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">Governance</h4>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Menu source</dt>
              <dd className="font-semibold text-slate-800">
                {l.menuSource === 'group' ? 'Group menu (published)' : 'Local menu (store-owned)'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Price tier</dt>
              <dd className="font-semibold text-slate-800">Tier {l.priceTier}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Sales tax</dt>
              <dd className="font-semibold text-slate-800">{formatTaxRate(l.taxRate)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Manager</dt>
              <dd className="font-semibold text-slate-800">{l.manager}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Paired devices</dt>
              <dd className="font-semibold text-slate-800">
                {l.devicesOnline} of {l.devicesTotal} answering
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-3">
            <Link
              to="/pos"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Open this register <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/devices"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Device health
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Store reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
