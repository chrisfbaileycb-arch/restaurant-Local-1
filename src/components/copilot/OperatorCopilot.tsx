import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  X,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  ChevronRight,
  Rocket,
  ClipboardCheck,
  BellRing,
  Stethoscope,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

import {
  COPILOT_WORKFLOWS,
  matchWorkflow,
  totalRunMs,
  workflowsForMode,
  type CopilotWorkflow,
  type WorkflowStepState,
} from '@/components/copilot/CopilotWorkflows';
import { COPILOT_MODES, type CopilotModeId } from '@/data/copilotModes';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  ClipboardCheck,
  BellRing,
  Stethoscope,
};

interface RunState {
  workflowId: string;
  index: number;
  states: Record<string, WorkflowStepState>;
  finished: boolean;
}

/**
 * Operator Copilot — the floating trigger plus the sliding drawer that
 * actually RUNS the hardwired workflows (build & ingestion, closeout,
 * floor pings, hardware self-test).
 *
 * Open it from anywhere:
 *   window.dispatchEvent(new CustomEvent('lle:operator-copilot', {
 *     detail: { workflowId: 'device-diagnostics' }
 *   }))
 */
const OperatorCopilot: React.FC<{ mode?: CopilotModeId; label?: string }> = ({
  mode = 'floor',
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(true);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<CopilotWorkflow | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const timers = useRef<number[]>([]);

  const modeMeta = COPILOT_MODES[mode];
  const list = useMemo(() => workflowsForMode(mode), [mode]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const start = useCallback(
    (w: CopilotWorkflow) => {
      clearTimers();
      setActive(w);
      setRun({ workflowId: w.id, index: 0, states: {}, finished: false });

      let elapsed = 0;
      w.steps.forEach((s, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setRun((r) =>
              r && r.workflowId === w.id
                ? { ...r, index: i, states: { ...r.states, [s.id]: 'running' } }
                : r,
            );
          }, elapsed),
        );
        elapsed += s.ms;
        timers.current.push(
          window.setTimeout(() => {
            setRun((r) =>
              r && r.workflowId === w.id
                ? {
                    ...r,
                    states: { ...r.states, [s.id]: s.flag ? 'flag' : 'done' },
                    finished: i === w.steps.length - 1,
                  }
                : r,
            );
          }, elapsed),
        );
      });
    },
    [clearTimers],
  );

  const openWith = useCallback(
    (workflowId?: string) => {
      setOpen(true);
      setNudge(false);
      if (workflowId) {
        const w = COPILOT_WORKFLOWS.find((x) => x.id === workflowId);
        if (w) start(w);
      }
    },
    [start],
  );

  useEffect(() => {
    const handler = (e: Event) => openWith((e as CustomEvent)?.detail?.workflowId);
    window.addEventListener('lle:operator-copilot', handler as EventListener);
    return () => window.removeEventListener('lle:operator-copilot', handler as EventListener);
  }, [openWith]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = matchWorkflow(query);
    if (w) {
      start(w);
      setQuery('');
    } else {
      setQuery('');
      setActive(null);
      setRun(null);
    }
  };

  const flagged = active && run ? active.steps.filter((s) => run.states[s.id] === 'flag') : [];

  return (
    <>
      {/* Floating trigger — present on every screen it is mounted on */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-end gap-3">
          {nudge && (
            <button
              onClick={() => openWith()}
              className="hidden max-w-[15rem] animate-pop-in rounded-2xl border border-fuchsia-200 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-700 shadow-xl sm:block"
            >
              {modeMeta.nudge}
              <span className="mt-1 block text-[11px] font-bold text-fuchsia-600">
                Operator Copilot Demo
              </span>
            </button>
          )}
          <button
            onClick={() => openWith()}
            aria-label="Open Operator Copilot"
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-orange-500 text-white shadow-2xl shadow-fuchsia-500/40 transition hover:scale-110"
          >
            <Bot className="h-7 w-7 transition group-hover:rotate-6" />
          </button>
        </div>
      )}

      {/* Sliding drawer */}
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-full max-w-md animate-slide-in flex-col border-l border-fuchsia-200 bg-white shadow-2xl">
            <header className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-fuchsia-600 to-orange-500 px-4 py-4 text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Bot className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{label || 'Operator Copilot Demo'}</p>
                <p className="text-xs text-white/80">{modeMeta.role} · runs real action chains</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close copilot"
                className="rounded-lg p-1 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {!active && (
                <>
                  <p className="text-sm text-slate-600">{modeMeta.greeting}</p>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-fuchsia-600">
                    Workflows I can run right now
                  </p>
                  <div className="mt-2 space-y-2">
                    {list.map((w) => {
                      const Icon = ICONS[w.icon] || Bot;
                      return (
                        <button
                          key={w.id}
                          onClick={() => start(w)}
                          className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-fuchsia-300 hover:bg-fuchsia-50"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${w.tone} text-white`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-900">{w.title}</span>
                            <span className="block text-xs text-slate-500">{w.purpose}</span>
                            <span className="mt-1 block text-[11px] font-semibold text-fuchsia-600">
                              “{w.trigger}” · {w.steps.length} steps ·{' '}
                              {Math.round(totalRunMs(w) / 1000)}s
                            </span>
                          </span>
                          <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {active && run && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-slate-900">{active.title}</p>
                    <button
                      onClick={() => {
                        clearTimers();
                        setActive(null);
                        setRun(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-fuchsia-600"
                    >
                      All workflows
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{active.purpose}</p>

                  <ol className="mt-4 space-y-2">
                    {active.steps.map((s) => {
                      const st = run.states[s.id] || 'idle';
                      return (
                        <li
                          key={s.id}
                          className={`rounded-xl border p-3 transition ${
                            st === 'idle'
                              ? 'border-slate-200 bg-white opacity-60'
                              : st === 'running'
                                ? 'border-fuchsia-300 bg-fuchsia-50'
                                : st === 'flag'
                                  ? 'border-amber-300 bg-amber-50'
                                  : 'border-emerald-200 bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0">
                              {st === 'running' ? (
                                <Loader2 className="h-4 w-4 animate-spin text-fuchsia-600" />
                              ) : st === 'done' ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : st === 'flag' ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <span className="block h-4 w-4 rounded-full border-2 border-slate-300" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900">{s.label}</p>
                              <p className="font-mono text-[11px] text-slate-500">{s.command}</p>
                              {st !== 'idle' && st !== 'running' && (
                                <p className="mt-1 text-xs text-slate-700">{s.output}</p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {run.finished && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-800">{active.closing}</p>
                      {flagged.length > 0 && (
                        <p className="mt-2 text-xs font-bold text-amber-700">
                          {flagged.length} item{flagged.length > 1 ? 's' : ''} flagged for a human.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => start(active)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Run again
                        </button>
                        {active.href && (
                          <Link
                            to={active.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-fuchsia-600 to-orange-500 px-3 py-1.5 text-xs font-extrabold text-white"
                          >
                            Open that screen <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tell me what to do — “close out the day”"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-orange-500 text-white transition hover:scale-105"
                  aria-label="Run"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
};

/** Fire from any button to open the copilot and optionally run a workflow. */
export const runCopilotWorkflow = (workflowId?: string) =>
  window.dispatchEvent(new CustomEvent('lle:operator-copilot', { detail: { workflowId } }));

export default OperatorCopilot;
