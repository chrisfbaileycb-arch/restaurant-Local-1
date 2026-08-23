import React, { useState } from 'react';
import { Layers, FileSpreadsheet, Download, Check } from 'lucide-react';
import { REPORTING_LEVELS, GROUP_REPORTS, type ReportingLevel } from '@/data/locations';
import { REPORTS } from '@/data/platform';

const LEVEL_TONE: Record<ReportingLevel['id'], string> = {
  store: 'from-sky-500 to-cyan-400',
  region: 'from-fuchsia-500 to-pink-500',
  brand: 'from-emerald-500 to-teal-400',
  entity: 'from-violet-500 to-indigo-500',
  group: 'from-amber-500 to-orange-600',
};

const ReportingTree: React.FC = () => {
  const [level, setLevel] = useState<ReportingLevel['id']>('group');
  const [pulled, setPulled] = useState<string[]>([]);
  const active = REPORTING_LEVELS.find((l) => l.id === level)!;
  const reports = GROUP_REPORTS.filter((r) => r.level === level);

  return (
    <div className="space-y-5">
      {/* the tree */}
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {REPORTING_LEVELS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              level === l.id
                ? 'border-orange-300 bg-white shadow-lg'
                : 'border-orange-100 bg-white/70 hover:border-orange-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${LEVEL_TONE[l.id]} text-xs font-extrabold text-white`}
              >
                {i + 1}
              </span>
              <span className="font-extrabold text-slate-900">{l.name}</span>
            </div>
            <p className="pt-2 text-xs text-slate-600">{l.scope}</p>
            <p className="pt-2 text-[11px] font-bold uppercase tracking-wide text-fuchsia-500">{l.whoSees}</p>
          </button>
        ))}
      </div>

      {/* detail for the selected level */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Layers className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-extrabold text-slate-900">{active.name} level</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
            {active.rolls}
          </span>
        </div>
        <p className="pt-2 text-sm text-slate-600">{active.scope}</p>

        <div className="grid gap-4 pt-4 md:grid-cols-2">
          <div>
            <h4 className="pb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Typical reports at this level
            </h4>
            <ul className="space-y-1">
              {active.examples.map((e) => (
                <li key={e} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="pb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Who can open it</h4>
            <p className="text-sm text-slate-700">
              {active.whoSees}. Anyone below this level in the tree gets the same report scoped to what they own —
              never the level above.
            </p>
          </div>
        </div>
      </div>

      {/* runnable group reports */}
      <div className="rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 p-4">
          <FileSpreadsheet className="h-5 w-5 text-fuchsia-500" />
          <h3 className="font-extrabold text-slate-900">
            Group reports {reports.length > 0 ? `at ${active.name.toLowerCase()} level` : ''}
          </h3>
          <span className="ml-auto text-xs text-slate-500">
            {GROUP_REPORTS.length} group reports on top of the {REPORTS.length} per-store reports
          </span>
        </div>
        <div className="divide-y divide-orange-50">
          {(reports.length ? reports : GROUP_REPORTS).map((r) => {
            const done = pulled.includes(r.id);
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {r.cadence}
                    </span>
                    <span
                      className={`rounded bg-gradient-to-r ${LEVEL_TONE[r.level]} px-1.5 py-0.5 text-[10px] font-bold uppercase text-white`}
                    >
                      {r.level}
                    </span>
                  </div>
                  <p className="pt-1 text-sm text-slate-600">{r.detail}</p>
                </div>
                <button
                  onClick={() => setPulled((p) => (p.includes(r.id) ? p : [...p, r.id]))}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    done
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {done ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Generated
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" /> Run report
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportingTree;
