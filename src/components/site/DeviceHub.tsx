import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet,
  Store, Router, Tag, Scale, Check, Plug, Loader2, Terminal, ArrowRight, ShieldCheck, Zap, Activity,
} from 'lucide-react';

import Reveal from '@/components/site/Reveal';
import { Pointer } from '@/components/site/Pointer';
import { useDevices } from '@/hooks/useDevices';
import { supabase } from '@/lib/supabase';
import {
  DEVICE_KINDS, DEVICE_PROMISE, HEALTH_CHECK, HEALTH_RULES, formatCents, type DeviceKindId,
} from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet, Store, Router, Tag, Scale,
};


const DeviceHub: React.FC = () => {
  const { paired, statusOf, pair, run, testAll, log, clearLog } = useDevices();
  const [active, setActive] = useState<DeviceKindId>('receipt-printer');
  const [gear, setGear] = useState<Record<string, { name: string; price: number; handle: string; image?: string }>>({});

  const device = DEVICE_KINDS.find((d) => d.id === active) || DEVICE_KINDS[0];
  const Icon = ICONS[device.icon] || Printer;

  useEffect(() => {
    const handles = DEVICE_KINDS.flatMap((d) => d.handles);
    if (handles.length === 0) return;
    supabase
      .from('ecom_products')
      .select('handle, name, price, images')
      .in('handle', handles)
      .then(({ data }) => {
        const map: Record<string, { name: string; price: number; handle: string; image?: string }> = {};
        (data || []).forEach((p: any) => {
          map[p.handle] = { name: p.name, price: p.price, handle: p.handle, image: p.images?.[0] };
        });
        setGear(map);
      });
  }, []);

  const matched = device.handles.map((h) => gear[h]).filter(Boolean);

  return (
    <section id="devices" className="relative overflow-hidden bg-slate-950 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 animate-blob rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 animate-blob rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:3s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
            <Plug className="h-3.5 w-3.5" /> Device hub · everything actually fires
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Every piece of gear we sell is <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">wired to the software</span>
          </h2>
          <p className="mt-3 text-white/70">
            A POS that cannot kick a cash drawer or fire a kitchen ticket is a pretty screen. Pair a device below and
            actually run it — test print, open the drawer, run a $0.00 card read. This is the same panel that lives in
            your terminal settings.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Device list */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Station 1 · {paired.length} paired
              </span>
              <button
                onClick={testAll}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-400/30"
              >
                <Zap className="h-3 w-3" /> Self test
              </button>
            </div>
            <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {DEVICE_KINDS.map((d) => {
                const DIcon = ICONS[d.icon] || Printer;
                const status = statusOf(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => setActive(d.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      active === d.id ? 'bg-white/15 ring-1 ring-white/25' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${d.tone} text-white shadow`}>
                      <DIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{d.name}</span>
                      <span className="block truncate text-[11px] text-white/50">{d.connection}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        status === 'ready'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : status === 'unpaired'
                          ? 'bg-white/10 text-white/50'
                          : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      {status === 'ready' ? 'Ready' : status === 'unpaired' ? 'Off' : '…'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail + console */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${device.tone} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{device.name}</h3>
                    <p className="text-xs text-white/50">{device.connection}</p>
                  </div>
                </div>
                <button
                  onClick={() => pair(device.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
                    statusOf(device.id) === 'unpaired'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:scale-[1.03]'
                      : 'border border-white/25 text-white hover:bg-white/10'
                  }`}
                >
                  {statusOf(device.id) === 'pairing' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Pairing…</>
                  ) : statusOf(device.id) === 'unpaired' ? (
                    <><Plug className="h-4 w-4" /> Pair device</>
                  ) : (
                    <><Check className="h-4 w-4 text-emerald-400" /> Paired · remove</>
                  )}
                </button>
              </div>

              <p className="mt-4 text-sm text-white/75">{device.blurb}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {device.actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => run(device.id, a.id)}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 active:scale-95"
                  >
                    {a.label}
                  </button>
                ))}
                <Pointer label="tap one" dir="left" tone="amber" className="hidden sm:inline-flex" />
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> {device.offline}
              </div>

              {matched.length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Gear that runs this driver
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matched.map((g) => (
                      <Link
                        key={g.handle}
                        to={`/products/${g.handle}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
                      >
                        {g.image && <img src={g.image} alt={g.name} className="h-6 w-6 rounded object-cover" />}
                        {g.name}
                        <span className="text-amber-300">{formatCents(g.price)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live console */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono text-xs backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  <Terminal className="h-3.5 w-3.5" /> love local eats · device log
                </span>
                <button onClick={clearLog} className="text-[11px] font-bold text-white/40 transition hover:text-white">
                  clear
                </button>
              </div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {log.length === 0 ? (
                  <p className="py-6 text-center text-white/35">
                    Pair a device or run a test — every command shows up here, exactly like the terminal.
                  </p>
                ) : (
                  log.map((l) => (
                    <div key={l.id} className="animate-pop-in flex gap-2 leading-relaxed">
                      <span className="shrink-0 text-white/30">{l.at}</span>
                      <span className={`shrink-0 font-bold ${l.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {l.ok ? '✓' : '!'}
                      </span>
                      <span className="min-w-0">
                        <span className="text-sky-300">{l.device}</span>{' '}
                        <span className="text-white/40">{l.command}</span>{' '}
                        <span className="text-white/80">{l.text}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEVICE_PROMISE.map((p, i) => (
            <Reveal key={p} delay={i * 70}>
              <div className="flex h-full items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {p}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Watched all day, and it stops you ringing food you cannot cook */}
        <Reveal className="mt-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-200">
                  <Activity className="h-3.5 w-3.5" /> {HEALTH_CHECK.label}
                </span>
                <h3 className="mt-3 text-2xl font-extrabold text-white">
                  Every device is checked all day — and a dark printer stops the register
                </h3>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:scale-[1.03]"
              >
                Open the station monitor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {HEALTH_RULES.map((r) => (
                <div key={r} className="flex items-start gap-2 rounded-xl bg-white/5 p-4 text-sm text-white/75">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {r}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-slate-900 transition hover:scale-[1.03]"
          >
            Shop the hardware <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default DeviceHub;
