import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown, CheckCircle2, Loader2, Circle, SkipForward, CreditCard,
  RotateCcw, ArrowRight, Rocket,
} from 'lucide-react';

import { BUILD_STAGES, PLANS, planById, SETUP_DEPOSIT, type BuildStageStatus } from '@/data/platform';

const PLAN_KEY = 'lle_build_plan';
const STAGE_KEY = 'lle_build_stage';

const read = (key: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — the tracker still works for this session */
  }
};

const STATUS_STYLE: Record<BuildStageStatus, { chip: string; dot: string }> = {
  done: { chip: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  active: { chip: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500' },
  pending: { chip: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-300' },
  bypassed: { chip: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-300' },
};

export interface BuildStatusProps {
  /** dark surface (agent console) vs light card (owner dashboard) */
  tone?: 'light' | 'dark';
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Build Status tracker — the milestone stepper shared by the Operator Dashboard
 * and the Agent Console. Website stages are bypassed on the POS Only tier and
 * the last stage is what triggers the setup balance invoice.
 */
const BuildStatus: React.FC<BuildStatusProps> = ({ tone = 'light', defaultOpen = false, className = '' }) => {
  const [planId, setPlanId] = useState(() => read(PLAN_KEY, PLANS[0].id));
  const [stage, setStage] = useState(() => Number(read(STAGE_KEY, '1')) || 1);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => write(PLAN_KEY, planId), [planId]);
  useEffect(() => write(STAGE_KEY, String(stage)), [stage]);

  const plan = planById(planId);
  const posOnly = !plan.hosting;

  const statusOf = (index: number): BuildStageStatus => {
    const s = BUILD_STAGES[index];
    if (posOnly && s.websiteOnly) return 'bypassed';
    if (s.id < stage) return 'done';
    if (s.id === stage) return 'active';
    return 'pending';
  };

  /** stages that actually apply to this tier */
  const liveStages = useMemo(
    () => BUILD_STAGES.filter((s) => !(posOnly && s.websiteOnly)),
    [posOnly],
  );

  const doneCount = liveStages.filter((s) => s.id < stage).length;
  const complete = stage > BUILD_STAGES.length;
  const pct = Math.round((doneCount / liveStages.length) * 100);
  const current = complete ? null : BUILD_STAGES.find((s) => s.id === stage) || null;

  const advance = () => {
    let next = stage + 1;
    // skip any website stage on the POS Only tier
    while (next <= BUILD_STAGES.length) {
      const s = BUILD_STAGES.find((x) => x.id === next);
      if (s && posOnly && s.websiteOnly) next += 1;
      else break;
    }
    setStage(next);
  };

  const reset = () => setStage(1);

  const dark = tone === 'dark';
  const shell = dark
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-stone-200 bg-white text-stone-900';

  const headline = complete
    ? 'Launched — balance settled'
    : `Step ${current?.id ?? 1} of ${BUILD_STAGES.length} · ${current?.title ?? ''}`;

  return (
    <div className={`overflow-hidden rounded-2xl border ${shell} ${className}`}>
      {/* header / dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
          dark ? 'hover:bg-white/5' : 'hover:bg-stone-50'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
            complete ? 'from-emerald-500 to-lime-400' : 'from-fuchsia-600 to-orange-500'
          } text-white shadow`}
        >
          {complete ? <Rocket className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-white/50' : 'text-stone-400'}`}>
            Build status · {plan.name}
          </span>
          <span className="block truncate text-sm font-extrabold">{headline}</span>
        </span>
        <span className={`hidden text-xs font-bold sm:block ${dark ? 'text-white/60' : 'text-stone-500'}`}>
          {pct}%
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* progress rail */}
      <div className={`h-1.5 w-full ${dark ? 'bg-white/10' : 'bg-stone-100'}`}>
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-fuchsia-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {open && (
        <div className="space-y-3 px-4 py-4">
          {/* tier switch — decides whether the website stages run at all */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-white/50' : 'text-stone-400'}`}>
              Package
            </span>
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  p.id === planId
                    ? 'bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white shadow'
                    : dark
                    ? 'bg-white/10 text-white/70 hover:bg-white/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <ol className="space-y-2">
            {BUILD_STAGES.map((s, i) => {
              const st = statusOf(i);
              const style = STATUS_STYLE[st];
              const label =
                st === 'done'
                  ? s.doneLabel
                  : st === 'active'
                  ? s.activeLabel
                  : st === 'bypassed'
                  ? 'Bypassed — POS Only'
                  : 'Queued';
              return (
                <li
                  key={s.key}
                  className={`rounded-xl border p-3 ${
                    st === 'active'
                      ? dark
                        ? 'border-amber-400/40 bg-amber-400/10'
                        : 'border-amber-200 bg-amber-50'
                      : dark
                      ? 'border-white/10 bg-white/5'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${style.dot} text-white`}>
                      {st === 'done' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : st === 'active' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : st === 'bypassed' ? (
                        <SkipForward className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-extrabold">
                          {s.id}. {s.title}
                        </p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.chip}`}>
                          {label}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs ${dark ? 'text-white/60' : 'text-stone-600'}`}>{s.detail}</p>
                      {s.billing && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CreditCard className="h-3.5 w-3.5" />
                          ${SETUP_DEPOSIT} deposit paid · ${plan.balance} balance on approval
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!complete ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-110"
              >
                {current?.billing ? `Approve & settle $${plan.balance}` : `Mark "${current?.title}" complete`}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Live — ${plan.price}/mo billing started
              </span>
            )}
            <button
              type="button"
              onClick={reset}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                dark ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          <p className={`text-[11px] ${dark ? 'text-white/45' : 'text-stone-400'}`}>
            ${SETUP_DEPOSIT} deposit kicks off menu parsing. The ${plan.balance} balance is only invoiced once you approve
            delivery — nothing to refund, nothing to claw back.
          </p>
        </div>
      )}
    </div>
  );
};

export default BuildStatus;
