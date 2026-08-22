import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Printer,
  RotateCcw,
  Backpack,
  Target,
  LifeBuoy,
} from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import ReadinessCheck from '@/components/site/ReadinessCheck';
import { TEST_RUN_PATHWAYS, BRING_LIST, SUCCESS_SIGNALS, TOTAL_MINUTES } from '@/data/testRun';
import { printDocument } from '@/lib/printDoc';

const KEY = 'lle_test_run_progress';

const readProgress = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

/**
 * /test-run — the weekend on-site runbook.
 * Every pathway you planned to test, in the order you walk them, with a
 * live pre-flight, per-step checkboxes that survive a refresh, and a
 * printable version for the clipboard on the counter.
 */
const TestRun: React.FC = () => {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setDone(readProgress());
    setNotes(localStorage.getItem(`${KEY}_notes`) || '');
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  const saveNotes = (v: string) => {
    setNotes(v);
    try {
      localStorage.setItem(`${KEY}_notes`, v);
    } catch {
      /* private mode */
    }
  };

  const reset = () => {
    setDone({});
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  };

  const totalSteps = useMemo(
    () => TEST_RUN_PATHWAYS.reduce((n, p) => n + p.steps.length, 0),
    [],
  );
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0;

  const pathwayDone = (pid: string) =>
    TEST_RUN_PATHWAYS.find((p) => p.id === pid)!.steps.every((_, i) => done[`${pid}-${i}`]);

  const printRunbook = () => {
    const lines: string[] = [
      `Total time: about ${Math.round(TOTAL_MINUTES / 60)}h ${TOTAL_MINUTES % 60}m across ${TEST_RUN_PATHWAYS.length} pathways`,
      '---',
      'BRING WITH YOU',
      ...BRING_LIST.map((b) => `[ ] ${b}`),
      '---',
    ];
    TEST_RUN_PATHWAYS.forEach((p) => {
      lines.push(`${p.title.toUpperCase()}  (${p.minutes} min · ${p.where})`);
      p.steps.forEach((s) => {
        lines.push(`[ ] ${s.do}`);
        lines.push(`      -> ${s.expect}`);
      });
      lines.push(`If it fails: ${p.fallback}`);
      lines.push('---');
    });
    lines.push('GO / NO-GO SIGNALS');
    SUCCESS_SIGNALS.forEach((s) => lines.push(`${s.label}\t${s.target}`));

    printDocument({
      format: 'report',
      title: 'Weekend Test Run',
      subtitle: 'On-site pathway runbook — Love Local Eats POS',
      lines,
      footer: 'Write the failures down as you go. The punch list is worth more than the passes.',
    });
  };

  return (
    <PageShell copilot="floor">
      <section className="border-b border-stone-200 bg-gradient-to-br from-stone-900 via-violet-950 to-stone-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
            <ClipboardCheck className="h-3.5 w-3.5" /> Weekend runbook
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Take it to the restaurant and break it on purpose.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-300">
            Every pathway you planned to test, in the order you walk them — build, website, register, staff, kitchen,
            internet-down, online order, close. About {Math.round(TOTAL_MINUTES / 60)}h {TOTAL_MINUTES % 60}m end to end.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={printRunbook}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.03]"
            >
              <Printer className="h-4 w-4" /> Print the runbook
            </button>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Start pathway 1 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 max-w-xl">
            <div className="flex items-center justify-between text-sm font-bold text-stone-300">
              <span>
                {doneCount} of {totalSteps} steps cleared
              </span>
              <span className="text-amber-300">{pct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-500 to-amber-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <ReadinessCheck />

        {/* Bring list + go/no-go */}
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
              <Backpack className="h-5 w-5 text-amber-600" /> Carry this in the door
            </h2>
            <ul className="mt-4 space-y-2">
              {BRING_LIST.map((b) => {
                const id = `bring-${b}`;
                return (
                  <li key={b}>
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={!!done[id]}
                        onChange={() => toggle(id)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className={done[id] ? 'text-stone-400 line-through' : ''}>{b}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
              <Target className="h-5 w-5 text-fuchsia-600" /> Go / no-go signals
            </h2>
            <p className="mt-1 text-sm text-stone-600">Hit these and you switch on Monday. Miss one and you know exactly what to fix.</p>
            <ul className="mt-4 space-y-2">
              {SUCCESS_SIGNALS.map((s) => (
                <li
                  key={s.label}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-stone-50 px-4 py-2.5"
                >
                  <span className="text-sm font-bold text-stone-900">{s.label}</span>
                  <span className="text-sm text-stone-600">{s.target}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Pathways */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">The eight pathways</h2>
              <p className="mt-1 text-stone-600">Tick each step on the tablet as you go — it saves on this device.</p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset checklist
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {TEST_RUN_PATHWAYS.map((p) => {
              const complete = pathwayDone(p.id);
              return (
                <article
                  key={p.id}
                  className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                    complete ? 'border-emerald-300 bg-emerald-50/40' : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/70 p-5 sm:p-6">
                    <div className="min-w-[16rem] flex-1">
                      <h3 className="text-lg font-extrabold tracking-tight text-stone-900">{p.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{p.blurb}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {p.minutes} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {p.where}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {p.who}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={p.route}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
                    >
                      {p.routeLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <ul className="divide-y divide-stone-100">
                    {p.steps.map((s, i) => {
                      const id = `${p.id}-${i}`;
                      return (
                        <li key={id}>
                          <label className="flex cursor-pointer items-start gap-3 px-5 py-3 transition hover:bg-stone-50 sm:px-6">
                            <input
                              type="checkbox"
                              checked={!!done[id]}
                              onChange={() => toggle(id)}
                              className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="min-w-0">
                              <span
                                className={`block text-sm font-semibold ${
                                  done[id] ? 'text-stone-400 line-through' : 'text-stone-900'
                                }`}
                              >
                                {s.do}
                              </span>
                              <span className="mt-0.5 block text-xs text-emerald-700">Should happen: {s.expect}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="flex items-start gap-2 border-t border-stone-100 bg-stone-50/70 px-5 py-3 text-xs text-stone-600 sm:px-6">
                    <LifeBuoy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>
                      <strong className="font-bold text-stone-800">If it fails:</strong> {p.fallback}
                    </span>
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Punch list */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-stone-900">Punch list</h2>
          <p className="mt-1 text-sm text-stone-600">
            Anything that annoyed you or your staff. Type it here and it stays on this tablet — bring it back to the
            copilot and we fix it in one pass.
          </p>
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            rows={6}
            placeholder="e.g. Modifier screen needs bigger buttons — Maria hit the wrong one twice…"
            className="mt-4 w-full rounded-xl border border-stone-300 p-4 text-sm text-stone-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-white"
            >
              Review the day’s numbers <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-800 transition hover:bg-stone-50"
            >
              Order the gear you were missing
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default TestRun;
