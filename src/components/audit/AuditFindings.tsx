import React, { useMemo, useState } from 'react';
import {
  Scale, Palette, Tablet, Gauge, BookOpen, Code2, Accessibility, TrendingUp, AlertTriangle,
  Database, FlaskConical, Plug, Cloud, ShieldCheck, KeyRound, Boxes, Search, MousePointerClick, Type,
} from 'lucide-react';
import {
  AUDIT_DOMAINS,
  AUDIT_GROUPS,
  STATE_COPY,
  SEVERITY_LABEL,
  domainScore,
  type FindingState,
} from '@/data/audit';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Palette, Tablet, Gauge, BookOpen, Code2, Accessibility, TrendingUp, AlertTriangle,
  Database, FlaskConical, Plug, Cloud, ShieldCheck, KeyRound, Boxes, Search, MousePointerClick, Type,
};

const AuditFindings: React.FC<{ focusId?: string }> = ({ focusId }) => {
  const [state, setState] = useState<FindingState | 'all'>('all');
  const [group, setGroup] = useState<string>('all');

  const domains = useMemo(
    () =>
      AUDIT_DOMAINS.filter((d) => group === 'all' || d.group === group).map((d) => ({
        ...d,
        visible: d.findings.filter((f) => state === 'all' || f.state === state),
      })),
    [state, group],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setGroup('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              group === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All domains
          </button>
          {AUDIT_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                group === g.id
                  ? `bg-gradient-to-r ${g.tone} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {(['all', 'pass', 'partial', 'gap'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize transition ${
                state === s
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'Every finding' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {domains.map((d) => {
          if (d.visible.length === 0) return null;
          const Icon = ICONS[d.icon] || ShieldCheck;
          const score = domainScore(d);
          return (
            <section
              key={d.id}
              id={`audit-${d.id}`}
              className={`scroll-mt-24 rounded-2xl border bg-white shadow-sm transition ${
                focusId === d.id ? 'border-orange-400 ring-2 ring-orange-200' : 'border-orange-100'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-orange-50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-[200px] flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900">{d.name}</h3>
                  <p className="text-sm text-slate-500">{d.question}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-extrabold ${
                      score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {score}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {d.findings.length} checks
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-orange-50">
                {d.visible.map((f) => (
                  <li key={f.id} className="flex gap-3 p-4">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATE_COPY[f.state].dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">{f.title}</p>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATE_COPY[f.state].chip}`}>
                          {STATE_COPY[f.state].label}
                        </span>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_LABEL[f.severity].chip}`}>
                          {SEVERITY_LABEL[f.severity].label} severity
                        </span>
                      </div>
                      <p className="pt-1 text-sm text-slate-600">{f.evidence}</p>
                      {f.action && (
                        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                          <span className="font-bold uppercase tracking-wide">Action: </span>
                          {f.action}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default AuditFindings;
