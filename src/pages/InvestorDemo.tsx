import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Layers,
  Pause,
  Play,
  Presentation,
  Printer,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { printDocument } from '@/lib/printDoc';

import PageShell from '@/components/site/PageShell';
import DemoAgenda from '@/components/demo/DemoAgenda';
import DemoRunner from '@/components/demo/DemoRunner';
import HardwareTheater from '@/components/demo/HardwareTheater';
import DemoIcon from '@/components/demo/demoIcons';
import {
  DEMO_CHAPTERS,
  DEMO_HEADLINES,
  TOTAL_DEMO_MINUTES,
  TOTAL_DEMO_STEPS,
  type DemoChapter,
} from '@/data/demoScript';
import { BRAND, PLANS, STATS } from '@/data/platform';

const SURFACE_MAP = [
  { to: '/onboarding', label: 'Menu-to-store builder', note: 'Concept, upload, parse, approve' },
  { to: '/templates-logo', label: 'Site & logo studio', note: 'Templates, palette, logo, preview' },
  { to: '/pos', label: 'Live register', note: 'Tabs, tickets, splits, tips' },
  { to: '/devices', label: 'Device hub', note: '12 device classes, live drivers' },
  { to: '/stay-open-offline', label: 'Failover ladder', note: 'WiFi → LTE → phone → offline' },
  { to: '/dashboard', label: 'Owner dashboard', note: 'Reports, tax, labor, rewards' },
  { to: '/locations', label: 'Multi-location group', note: '12 stores, roll-ups, reporting tree' },
  { to: '/audit', label: 'Full platform audit', note: '18 domains scored against the build' },
  { to: '/shop', label: 'Hardware shop', note: 'Optional gear at margin' },
  { to: '/starter', label: 'Starter kits', note: 'Phone-only through counter + kitchen' },
  { to: '/test-run', label: 'Weekend test run', note: 'Pre-flight before a real service' },
  { to: '/templates', label: 'Sample storefronts', note: 'What the guest sees' },
];


const fmtClock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * The leave-behind: the whole running order, talk track, proof points and
 * every executable step, printed from the same script the stage runs.
 */
const printPresenterScript = () => {
  const lines: string[] = [
    `${DEMO_CHAPTERS.length} chapters · ${TOTAL_DEMO_STEPS} steps · about ${TOTAL_DEMO_MINUTES} minutes`,
    '---',
  ];
  DEMO_CHAPTERS.forEach((c) => {
    lines.push(`${c.num} — ${c.title}\t~${c.minutes} min`);
    lines.push(`Act: ${c.act}${c.href ? ` · Screen: ${c.href}` : ''}`);
    lines.push(`Say: ${c.talkTrack}`);
    c.proof.forEach((p) => lines.push(`  • ${p}`));
    lines.push(`Investor note: ${c.investorNote}`);
    c.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s.label} → ${s.output}`));
    lines.push(`Close: ${c.closing}`);
    lines.push('---');
  });
  printDocument({
    format: 'report',
    title: `${BRAND.name} — investor walkthrough script`,
    subtitle: 'Every workflow and hardware function, in running order.',
    lines,
    footer: `${BRAND.domain} · ${BRAND.supportPhone}`,
  });
};

const InvestorDemo: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [covered, setCovered] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [ticking, setTicking] = useState(false);
  const [autoRunKey, setAutoRunKey] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const chapter: DemoChapter = DEMO_CHAPTERS[activeIdx];

  useEffect(() => {
    if (!ticking) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [ticking]);

  const goTo = (idx: number, run = false) => {
    const next = Math.min(Math.max(idx, 0), DEMO_CHAPTERS.length - 1);
    setActiveIdx(next);
    if (run) setAutoRunKey((k) => k + 1);
    window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const markCovered = (id: string) => setCovered((c) => (c.includes(id) ? c : [...c, id]));

  const progress = useMemo(
    () => Math.round((covered.length / DEMO_CHAPTERS.length) * 100),
    [covered.length],
  );

  const startPresenting = () => {
    setTicking(true);
    goTo(0, true);
  };

  return (
    <PageShell copilot={false} workflows="floor">
      {/* ---------------- cover ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 animate-blob rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 animate-blob rounded-full bg-amber-400/20 blur-3xl [animation-delay:4s]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
            <Presentation className="h-3.5 w-3.5" /> Guided platform walkthrough
          </span>

          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            The complete{' '}
            <span className="bg-gradient-to-r from-fuchsia-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
              {BRAND.shortName}
            </span>{' '}
            platform, every workflow and every hardware function.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-300">
            {DEMO_CHAPTERS.length} chapters, {TOTAL_DEMO_STEPS} executable steps, roughly {TOTAL_DEMO_MINUTES} minutes
            end to end. Each chapter runs live on this page and links straight to the real screen it demonstrates —
            nothing here is a slide or a video.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={startPresenting}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-7 py-4 text-base font-extrabold shadow-xl shadow-orange-500/30 transition hover:scale-[1.03]"
            >
              <Play className="h-5 w-5" /> Start the walkthrough
            </button>
            <button
              onClick={() => setTicking((t) => !t)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-sm font-bold backdrop-blur transition hover:bg-white/20"
            >
              {ticking ? <Pause className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
              {ticking ? 'Pause timer' : 'Start timer'}
              <span className="ml-1 font-mono text-amber-300">{fmtClock(seconds)}</span>
            </button>
            <button
              onClick={() => {
                setSeconds(0);
                setTicking(false);
                setCovered([]);
                goTo(0);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" /> Reset room
            </button>
            <a
              href="#hardware"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              Jump to hardware <ArrowRight className="h-4 w-4" />
            </a>
            <button
              onClick={printPresenterScript}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              <Printer className="h-4 w-4" /> Print the script
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_HEADLINES.map((h) => (
              <div key={h.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-extrabold text-amber-300">{h.value}</p>
                <p className="mt-1 text-sm text-slate-300">{h.label}</p>
              </div>
            ))}
          </div>

          {/* progress */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Room progress</span>
              <span>
                {covered.length} / {DEMO_CHAPTERS.length} chapters run
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- stage ---------------- */}
      <section ref={stageRef} className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <Layers className="h-4 w-4" /> Running order
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> {TOTAL_DEMO_MINUTES}m
                </span>
              </div>
              <DemoAgenda
                activeId={chapter.id}
                covered={covered}
                onPick={(c) => goTo(DEMO_CHAPTERS.findIndex((x) => x.id === c.id))}
              />
            </div>
          </aside>

          <div className="lg:col-span-9">
            <DemoRunner
              chapter={chapter}
              index={activeIdx}
              total={DEMO_CHAPTERS.length}
              onPrev={() => goTo(activeIdx - 1)}
              onNext={() => goTo(activeIdx + 1)}
              onComplete={markCovered}
              autoRunKey={autoRunKey}
            />

            {/* quick chapter chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {DEMO_CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => goTo(i)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    i === activeIdx
                      ? 'border-transparent bg-slate-900 text-white'
                      : covered.includes(c.id)
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DemoIcon name={c.icon} className="h-3.5 w-3.5" /> {c.num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- hardware theater ---------------- */}
      <div className="border-y border-slate-200 bg-white">
        <HardwareTheater />
      </div>

      {/* ---------------- surface map + close ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600">Hand-off</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Every screen he can click himself</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              The walkthrough is the guided path. These are the live surfaces underneath it — open any of them in a
              second tab and let him drive.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SURFACE_MAP.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    {s.label}
                    <ArrowRight className="h-4 w-4 text-orange-500 opacity-0 transition group-hover:opacity-100" />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{s.note}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-violet-950 p-6 text-white shadow-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">The ask, in numbers</p>
              <div className="mt-4 space-y-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                {PLANS.map((p) => (
                  <div key={p.id} className="flex items-baseline justify-between py-1.5 text-sm">
                    <span className="font-semibold text-slate-300">{p.name}</span>
                    <span className="font-extrabold text-amber-300">
                      ${p.price}
                      <span className="text-xs font-semibold text-slate-400">{p.per}</span>
                    </span>
                  </div>
                ))}
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Build funded by a ${PLANS[0].deposit} deposit at signup; the balance invoices only when the operator
                  approves delivery. No hardware subsidy, no contract, no commission on their orders.
                </p>
              </div>
              <Link
                to="/onboarding"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-4 py-3 text-sm font-extrabold text-white transition hover:scale-[1.02]"
              >
                Build a store live on stage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default InvestorDemo;
