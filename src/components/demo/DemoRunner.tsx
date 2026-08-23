import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';

import DemoIcon from '@/components/demo/demoIcons';
import type { DemoChapter } from '@/data/demoScript';

export type StepState = 'idle' | 'running' | 'done' | 'flag';

/**
 * The stage: one chapter of the investor walkthrough, executed step by step
 * with a live console. Nothing here is a video — each step actually advances
 * state, logs its command and reports its own result.
 */
const DemoRunner: React.FC<{
  chapter: DemoChapter;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onComplete: (id: string) => void;
  autoRunKey?: number;
}> = ({ chapter, index, total, onPrev, onNext, onComplete, autoRunKey }) => {
  const [states, setStates] = useState<StepState[]>(() => chapter.steps.map(() => 'idle'));
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Reset whenever the presenter moves to another chapter.
  useEffect(() => {
    clearTimers();
    setStates(chapter.steps.map(() => 'idle'));
    setLog([]);
    setRunning(false);
    setFinished(false);
    return clearTimers;
  }, [chapter.id]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const run = () => {
    clearTimers();
    setStates(chapter.steps.map(() => 'idle'));
    setLog([`> ${chapter.title.toLowerCase().replace(/\s+/g, '-')} — starting`]);
    setRunning(true);
    setFinished(false);

    let at = 0;
    chapter.steps.forEach((step, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStates((s) => s.map((v, j) => (j === i ? 'running' : v)));
          setLog((l) => [...l, `$ ${step.command}`]);
        }, at),
      );
      at += step.ms;
      timers.current.push(
        window.setTimeout(() => {
          setStates((s) => s.map((v, j) => (j === i ? (step.flag ? 'flag' : 'done') : v)));
          setLog((l) => [...l, `${step.flag ? '! ' : '✓ '}${step.output}`]);
        }, at),
      );
      at += 160;
    });

    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setFinished(true);
        setLog((l) => [...l, `— ${chapter.closing}`]);
        onComplete(chapter.id);
      }, at + 120),
    );
  };

  // Presenter pressed "run all" on the cover — kick this chapter off.
  useEffect(() => {
    if (autoRunKey) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunKey]);

  const flags = chapter.steps.filter((s) => s.flag).length;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* header */}
      <div className={`bg-gradient-to-r ${chapter.tone} px-5 py-6 text-white sm:px-8`}>
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <DemoIcon name={chapter.icon} className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
              {chapter.act} · Chapter {chapter.num} of {String(total).padStart(2, '0')} · ~{chapter.minutes} min
            </p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{chapter.title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/85">{chapter.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-30"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              disabled={index === total - 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-30"
              aria-label="Next chapter"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-5">
        {/* steps */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-8">
            <button
              onClick={run}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.03] disabled:opacity-60"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? 'Running…' : finished ? 'Run it again' : `Run this workflow`}
            </button>
            {finished && !running && (
              <button
                onClick={() => {
                  clearTimers();
                  setStates(chapter.steps.map(() => 'idle'));
                  setLog([]);
                  setFinished(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
            {chapter.href && (
              <Link
                to={chapter.href}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-orange-600"
              >
                <ExternalLink className="h-4 w-4" /> {chapter.hrefLabel || 'Open the live screen'}
              </Link>
            )}
            <span className="ml-auto text-xs font-semibold text-slate-400">
              {chapter.steps.length} steps{flags > 0 ? ` · ${flags} need a human` : ''}
            </span>
          </div>

          <ol className="divide-y divide-slate-100">
            {chapter.steps.map((step, i) => {
              const st = states[i];
              return (
                <li key={step.id} className="flex gap-4 px-5 py-4 sm:px-8">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      st === 'done'
                        ? 'bg-emerald-500 text-white'
                        : st === 'flag'
                        ? 'bg-amber-500 text-white'
                        : st === 'running'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {st === 'running' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : st === 'done' ? (
                      <Check className="h-4 w-4" />
                    ) : st === 'flag' ? (
                      <CircleAlert className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{step.label}</p>
                    <code className="mt-0.5 block truncate font-mono text-[11px] text-slate-400">{step.command}</code>
                    {(st === 'done' || st === 'flag') && (
                      <p
                        className={`mt-2 animate-pop-in rounded-lg border px-3 py-2 text-xs font-medium ${
                          st === 'flag'
                            ? 'border-amber-200 bg-amber-50 text-amber-900'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        }`}
                      >
                        {step.output}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {finished && (
            <div className="animate-pop-in border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-8">
              <p className="text-sm font-bold text-slate-900">{chapter.closing}</p>
              {index < total - 1 && (
                <button
                  onClick={onNext}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Next chapter <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* talk track + console */}
        <aside className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 lg:col-span-2 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-600">What you say</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{chapter.talkTrack}</p>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-600">Proof points</p>
          <ul className="mt-2 space-y-2">
            {chapter.proof.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700">Investor note</p>
            <p className="mt-1.5 text-sm leading-relaxed text-violet-900">{chapter.investorNote}</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Terminal className="h-3.5 w-3.5" /> live console
            </div>
            <div ref={logRef} className="h-44 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
              {log.length === 0 ? (
                <p className="text-slate-600">Press “Run this workflow” to execute the chapter.</p>
              ) : (
                log.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.startsWith('!')
                        ? 'text-amber-300'
                        : line.startsWith('✓')
                        ? 'text-emerald-300'
                        : line.startsWith('$')
                        ? 'text-sky-300'
                        : 'text-slate-400'
                    }
                  >
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DemoRunner;
