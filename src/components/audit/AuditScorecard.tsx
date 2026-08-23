import React from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, ClipboardCheck } from 'lucide-react';
import {
  AUDIT_GROUPS,
  AUDIT_DOMAINS,
  ALL_FINDINGS,
  OVERALL_SCORE,
  PRIORITY_ACTIONS,
  countBy,
  groupScore,
  domainScore,
} from '@/data/audit';

const Ring: React.FC<{ score: number; size?: number }> = ({ score, size = 112 }) => {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const tone = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} className="shrink-0" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-slate-900 font-extrabold"
        style={{ fontSize: size / 3.4 }}
      >
        {score}
      </text>
    </svg>
  );
};

const AuditScorecard: React.FC<{ onJump: (domainId: string) => void }> = ({ onJump }) => (
  <div className="space-y-6">
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex items-center gap-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        <Ring score={OVERALL_SCORE} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Overall readiness</p>
          <p className="text-lg font-extrabold text-slate-900">
            {AUDIT_DOMAINS.length} domains · {ALL_FINDINGS.length} checks
          </p>
          <p className="pt-1 text-sm text-slate-600">
            Scored as pass = 1, partial = 0.5, gap = 0. No check is scored on intent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:col-span-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="pt-2 text-3xl font-extrabold text-emerald-800">{countBy('pass')}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Pass — shipped & provable</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <CircleDashed className="h-5 w-5 text-amber-600" />
          <p className="pt-2 text-3xl font-extrabold text-amber-900">{countBy('partial')}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Partial — works, needs hardening</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <p className="pt-2 text-3xl font-extrabold text-rose-800">{countBy('gap')}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Gap — named and scheduled</p>
        </div>
      </div>
    </div>

    {/* group scores */}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {AUDIT_GROUPS.map((g) => {
        const domains = AUDIT_DOMAINS.filter((d) => d.group === g.id);
        const score = groupScore(g.id);
        return (
          <div key={g.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-slate-900">{g.name}</h3>
              <span className={`rounded-lg bg-gradient-to-r ${g.tone} px-2 py-0.5 text-sm font-extrabold text-white`}>
                {score}
              </span>
            </div>
            <p className="pt-1 text-xs text-slate-500">{g.blurb}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full bg-gradient-to-r ${g.tone}`} style={{ width: `${score}%` }} />
            </div>
            <div className="space-y-1 pt-3">
              {domains.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onJump(d.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-orange-600"
                >
                  <span>{d.name}</span>
                  <span className="font-mono text-slate-400">{domainScore(d)}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>

    {/* priority list */}
    <div className="rounded-2xl border border-rose-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50/60 p-4">
        <ClipboardCheck className="h-5 w-5 text-rose-600" />
        <h3 className="font-extrabold text-slate-900">Priority list — high-severity items not yet Pass</h3>
        <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
          {PRIORITY_ACTIONS.length}
        </span>
      </div>
      <ol className="divide-y divide-rose-50">
        {PRIORITY_ACTIONS.map((f, i) => (
          <li key={f.id} className="flex gap-3 p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-slate-900">
                {f.title}{' '}
                <button
                  onClick={() => onJump(f.domainId)}
                  className="text-xs font-bold uppercase tracking-wide text-orange-600 hover:underline"
                >
                  {f.domainName}
                </button>
              </p>
              <p className="pt-1 text-sm text-slate-600">{f.action || f.evidence}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </div>
);

export default AuditScorecard;
