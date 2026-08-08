import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Wand2, Palette, Rocket, Check, ArrowRight, Sparkles, Store, Smartphone, Globe,
} from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import { Pointer } from '@/components/site/Pointer';

interface Stage {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  blurb: string;
  tone: string;      // gradient classes
  chip: string;      // chip bg
  ticks: string[];   // things that "complete" during this stage
  seconds: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    icon: Upload,
    title: 'Drop your menu',
    blurb: 'Photo, PDF, spreadsheet or a napkin scan. Anything you already have works.',
    tone: 'from-fuchsia-500 to-pink-500',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    ticks: ['menu.pdf uploaded', 'Pages scanned', 'Prices detected'],
    seconds: '~30 seconds of your time',
  },
  {
    id: 2,
    icon: Wand2,
    title: 'We read it for you',
    blurb: 'Items, prices, sizes and modifiers get sorted into categories automatically.',
    tone: 'from-violet-500 to-indigo-500',
    chip: 'bg-violet-100 text-violet-700',
    ticks: ['86 items parsed', 'Categories grouped', 'Modifiers matched'],
    seconds: 'You do nothing here',
  },
  {
    id: 3,
    icon: Palette,
    title: 'Pick a vibe',
    blurb: 'Tap a look. Your POS layout, ordering site and one-page website all restyle together.',
    tone: 'from-sky-500 to-cyan-400',
    chip: 'bg-sky-100 text-sky-700',
    ticks: ['Theme applied', 'Logo colors pulled', 'Buttons sized for gloves'],
    seconds: 'One tap',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Go live everywhere',
    blurb: 'Touchscreen, phones, online ordering, rewards and reports switch on at once.',
    tone: 'from-emerald-500 to-lime-400',
    chip: 'bg-emerald-100 text-emerald-700',
    ticks: ['POS synced', 'Ordering site live', 'Rewards switched on'],
    seconds: 'Open for business',
  },
];

const PREVIEWS = [
  { icon: Store, label: 'Touchscreen POS' },
  { icon: Smartphone, label: 'Phone & food truck' },
  { icon: Globe, label: 'Ordering site' },
];

const FlowShowcase: React.FC = () => {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  // advance the "ticks" inside a stage, then move to the next stage
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => {
      setTick((prev) => {
        if (prev < STAGES[active].ticks.length) return prev + 1;
        setActive((a) => (a + 1) % STAGES.length);
        return 0;
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [active, tick, paused]);

  const select = (i: number) => {
    setActive(i);
    setTick(0);
  };

  const stage = STAGES[active];
  const StageIcon = stage.icon;
  const progress = ((active + Math.min(tick, stage.ticks.length) / stage.ticks.length) / STAGES.length) * 100;

  return (
    <section className="relative overflow-hidden bg-white py-16">
      {/* soft animated blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 animate-blob rounded-full bg-sky-300/30 blur-3xl [animation-delay:3s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/25">
            <Sparkles className="h-3.5 w-3.5 animate-wiggle" /> Watch the build happen
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            It really is <span className="text-gradient-vibe">this effortless</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            No coding, no installers, no waiting on a rep. Hover a step to explore it — otherwise just watch it run.
          </p>
        </Reveal>

        {/* progress rail */}
        <Reveal delay={80} className="mt-10">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(6, progress)}%` }}
            />
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          {/* step selector */}
          <div className="grid gap-3 sm:grid-cols-2">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              const isDone = i < active;
              return (
                <Reveal key={s.id} delay={i * 70}>
                  <button
                    onMouseEnter={() => { setPaused(true); select(i); }}
                    onMouseLeave={() => setPaused(false)}
                    onFocus={() => { setPaused(true); select(i); }}
                    onBlur={() => setPaused(false)}
                    onClick={() => select(i)}
                    className={`relative h-full w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-transparent bg-white shadow-xl ring-2 ring-orange-400 lg:-translate-y-1'
                        : 'border-slate-200 bg-white/70 hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-orange-500 to-amber-400" />
                    )}
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow-md ${
                          isActive ? 'animate-float' : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {s.id}</p>
                        <h3 className="font-extrabold text-slate-900">{s.title}</h3>
                      </div>
                      {isDone && (
                        <span className="ml-auto flex h-7 w-7 animate-pop-in items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{s.blurb}</p>
                    <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${s.chip}`}>
                      {s.seconds}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* live "build console" */}
          <Reveal delay={140}>
            <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-2xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-400">vibe-os · building your store</span>
              </div>

              <div className="rounded-2xl bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stage.tone} text-white shadow-lg animate-pop-in`}>
                    <StageIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Step {stage.id} of 4</p>
                    <p className="text-lg font-extrabold text-white">{stage.title}</p>
                  </div>
                </div>

                <ul className="mt-5 space-y-2">
                  {stage.ticks.map((t, i) => {
                    const done = i < tick;
                    return (
                      <li
                        key={t}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
                          done ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {done ? (
                          <span className="flex h-5 w-5 animate-pop-in items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-dashed border-slate-500" />
                        )}
                        <span className="font-medium">{t}</span>
                        {!done && i === tick && (
                          <span className="ml-auto flex gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:120ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:240ms]" />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {PREVIEWS.map((p, i) => {
                    const Icon = p.icon;
                    const lit = active >= i + 1;
                    return (
                      <div
                        key={p.label}
                        className={`rounded-xl p-3 text-center transition-all duration-500 ${
                          lit ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900' : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        <Icon className={`mx-auto h-5 w-5 ${lit ? 'animate-float' : ''}`} />
                        <p className="mt-1 text-[10px] font-bold leading-tight">{p.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-5">
                <Link
                  to="/onboarding"
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 font-extrabold text-slate-900 transition hover:brightness-110"
                >
                  <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer bg-white/40 blur-md" />
                  <Upload className="h-5 w-5" /> Try it with my menu
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Pointer
                  label="start here"
                  dir="up"
                  tone="fuchsia"
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2"
                />
              </div>
              <div className="h-8" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default FlowShowcase;
