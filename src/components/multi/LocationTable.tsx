import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search, Wifi } from 'lucide-react';
import {
  LOCATIONS,
  REGIONS,
  STATUS_COPY,
  CONNECTIVITY_COPY,
  laborPct,
  avgTicket,
  salesDelta,
  type StoreLocation,
  type RegionId,
} from '@/data/locations';
import { formatMoney } from '@/data/platform';

type SortKey = 'name' | 'sales' | 'orders' | 'avgTicket' | 'labor' | 'delta' | 'devices';

const LocationTable: React.FC<{
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ selectedId, onSelect }) => {
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('sales');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = LOCATIONS.filter(
      (l) =>
        (region === 'all' || l.region === region) &&
        (q === '' ||
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.concept.toLowerCase().includes(q) ||
          l.manager.toLowerCase().includes(q)),
    );
    const val = (l: StoreLocation) => {
      switch (sort) {
        case 'name': return l.name.toLowerCase();
        case 'orders': return l.orders;
        case 'avgTicket': return avgTicket(l);
        case 'labor': return laborPct(l);
        case 'delta': return salesDelta(l);
        case 'devices': return l.devicesTotal > 0 ? l.devicesOnline / l.devicesTotal : 0;
        default: return l.sales;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [region, query, sort, dir]);

  const toggle = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const Th: React.FC<{ k: SortKey; label: string; right?: boolean }> = ({ k, label, right }) => (
    <th className={`px-3 py-2 ${right ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => toggle(k)}
        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide transition hover:text-orange-600 ${
          sort === k ? 'text-orange-600' : 'text-slate-500'
        }`}
      >
        {label}
        {sort === k &&
          (dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  return (
    <div className="rounded-2xl border border-orange-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-orange-100 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRegion('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              region === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All {LOCATIONS.length}
          </button>
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                region === r.id
                  ? `bg-gradient-to-r ${r.tone} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Store, city, concept or manager"
            aria-label="Search locations"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-orange-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-amber-50/60">
            <tr>
              <Th k="name" label="Store" />
              <Th k="sales" label="Sales" right />
              <Th k="delta" label="vs LW" right />
              <Th k="orders" label="Orders" right />
              <Th k="avgTicket" label="Avg ticket" right />
              <Th k="labor" label="Labor %" right />
              <Th k="devices" label="Devices" right />
              <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const delta = salesDelta(l);
              const lp = laborPct(l);
              const allOnline = l.devicesOnline === l.devicesTotal;
              return (
                <tr
                  key={l.id}
                  onClick={() => onSelect(l.id)}
                  className={`cursor-pointer border-t border-orange-50 transition hover:bg-amber-50/70 ${
                    selectedId === l.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <div className="font-bold text-slate-900">{l.nickname}</div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-slate-500">
                        {l.concept} · {l.city}, {l.state}
                      </span>
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${STATUS_COPY[l.status].chip}`}>
                        {STATUS_COPY[l.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-900">{formatMoney(l.sales)}</td>
                  <td className="px-3 py-3 text-right">
                    {l.priorSales === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                      >
                        {delta >= 0 ? '+' : ''}
                        {delta.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">{l.orders}</td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {l.orders ? `$${avgTicket(l).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-bold ${
                        lp === 0 ? 'text-slate-400' : lp > 28 ? 'text-rose-600' : lp > 24 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {lp ? `${lp.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-bold ${
                        allOnline
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      {l.devicesOnline}/{l.devicesTotal}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold ${
                        CONNECTIVITY_COPY[l.connectivity].chip
                      }`}
                    >
                      <Wifi className="h-3 w-3" /> {CONNECTIVITY_COPY[l.connectivity].label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-500">
                  No store matches that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationTable;
