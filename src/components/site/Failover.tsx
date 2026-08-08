import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, WifiOff, Signal, Smartphone, CloudOff, RefreshCw, Check, ArrowRight,
  BatteryCharging, Truck, ShieldCheck,
} from 'lucide-react';

import Reveal from '@/components/site/Reveal';
import { Pointer } from '@/components/site/Pointer';
import { FAILOVER_STAGES, PHONE_PIVOT_ABILITIES } from '@/data/platform';

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  lte: Signal,
  phone: Smartphone,
  'phone-pos': Truck,
  offline: CloudOff,
};

const Failover: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [queued, setQueued] = useState(0);
  const [synced, setSynced] = useState(false);

  const current = FAILOVER_STAGES[stage];
  const StageIcon = STAGE_ICONS[current.id] || Wifi;
  const degraded = stage > 0;

  const cutTheCord = () => {
    setSynced(false);
    setStage((s) => {
      const next = Math.min(s + 1, FAILOVER_STAGES.length - 1);
      if (next >= 3) setQueued((q) => q + 3);
      return next;
    });
  };

  const restore = () => {
    setStage(0);
    setSynced(queued > 0);
    setQueued(0);
  };

  const ringUp = () => setQueued((q) => q + 1);

  return (
    <section id="failover" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 animate-blob rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
            <WifiOff className="h-3.5 w-3.5" /> Stay open when the internet does not
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            WiFi dies. <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">You keep selling.</span>
          </h2>
          <p className="mt-3 text-white/70">
            Five rungs of backup, and every one of them still takes money. Cut the connection below and watch the shop
            fall down the ladder — all the way to a phone in your apron with no bars at all.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          {/* Ladder */}
          <div className="space-y-3">
            {FAILOVER_STAGES.map((s, i) => {
              const SIcon = STAGE_ICONS[s.id] || Wifi;
              const isCurrent = i === stage;
              const passed = i < stage;
              return (
                <button
                  key={s.id}
                  onClick={() => { setStage(i); setSynced(false); }}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                    isCurrent
                      ? 'border-white/30 bg-white/15 shadow-lg'
                      : passed
                      ? 'border-white/10 bg-white/5 opacity-60'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow ${isCurrent ? 'animate-pulse-ring' : ''}`}>
                    <SIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white">{s.name}</span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
                        {s.status}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300">{s.seconds}</span>
                    </span>
                    <span className="mt-1 block text-sm text-white/65">{s.detail}</span>
                  </span>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">
                      Live
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={cutTheCord}
                disabled={stage >= FAILOVER_STAGES.length - 1}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
              >
                <WifiOff className="h-4 w-4" /> Cut the connection
              </button>
              <button
                onClick={restore}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-5 py-3 font-bold text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" /> Bring it back
              </button>
              <Pointer label="break it on purpose" dir="up" tone="fuchsia" className="hidden sm:inline-flex" />

            </div>
          </div>

          {/* Phone register */}
          <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                <Smartphone className="h-4 w-4" /> Phone register
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  degraded ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
                }`}
              >
                <StageIcon className="h-3.5 w-3.5" /> {current.name}
              </span>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Order in progress</p>
              <div className="mt-2 space-y-1.5 text-sm text-white/85">
                <div className="flex justify-between"><span>2 × Birria Taco</span><span>$9.00</span></div>
                <div className="flex justify-between"><span>1 × Horchata</span><span>$4.00</span></div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
                  <span>Total</span><span>$14.07</span>
                </div>
              </div>

              <button
                onClick={ringUp}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-extrabold text-slate-900 transition active:scale-95"
              >
                {degraded ? 'Take payment · queue it' : 'Take payment'}
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-white/70">
                <span className="rounded-lg bg-white/10 py-2">Tap to pay</span>
                <span className="rounded-lg bg-white/10 py-2">Plug-in swiper</span>
                <span className="rounded-lg bg-white/10 py-2">Camera scan</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs">
              {queued > 0 ? (
                <p className="flex items-center gap-2 text-amber-300">
                  <BatteryCharging className="h-4 w-4 shrink-0" />
                  {queued} order{queued > 1 ? 's' : ''} held on this phone · settles automatically when data returns
                </p>
              ) : synced ? (
                <p className="flex items-center gap-2 text-emerald-300">
                  <Check className="h-4 w-4 shrink-0" /> Queue settled — every order landed in reports with its real
                  timestamp.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-white/60">
                  <ShieldCheck className="h-4 w-4 shrink-0" /> Nothing queued. Cut the connection and ring one up.
                </p>
              )}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-white/50">
              This is why a truck can run on a phone as its only register: the menu, the tabs and the drawer live in your
              account, not in a box bolted to a counter.
            </p>
          </div>
        </div>

        {/* What a phone can still do */}
        <div className="mt-10">
          <h3 className="text-lg font-extrabold text-white">With zero bars, a phone can still…</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PHONE_PIVOT_ABILITIES.map((a, i) => (
              <Reveal key={a.id} delay={i * 55}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="flex items-start gap-2 text-sm font-bold text-white">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {a.label}
                  </p>
                  <p className="mt-1.5 pl-6 text-xs text-white/60">{a.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products/phone-card-swiper-plugin"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-slate-900 transition hover:scale-[1.03]"
          >
            Get the plug-in swiper <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/products/lte-failover-router"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Add LTE failover
          </Link>
          <Link
            to="/products/phone-card-scan-kit"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Camera card scan kit
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Failover;
