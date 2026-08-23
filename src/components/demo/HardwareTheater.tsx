import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, PlayCircle, Terminal, Zap } from 'lucide-react';

import DemoIcon from '@/components/demo/demoIcons';
import {
  DEVICE_KINDS,
  DEVICE_PROMISE,
  DEVICE_SEVERITY,
  SEVERITY_COPY,
  type DeviceAction,
  type DeviceKind,
} from '@/data/platform';

interface LogLine {
  id: string;
  device: string;
  command: string;
  result: string;
  at: string;
}

const stamp = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * Hardware theater — every device class we ship, every driver action it
 * exposes, runnable on stage. This is the section where the investor gets
 * to press the buttons themselves.
 */
const HardwareTheater: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(DEVICE_KINDS[0].id);
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const [ranAll, setRanAll] = useState(false);
  const timers = useRef<number[]>([]);

  const active: DeviceKind = DEVICE_KINDS.find((d) => d.id === activeId) || DEVICE_KINDS[0];

  const fire = (device: DeviceKind, action: DeviceAction, delay = 0) => {
    const key = `${device.id}-${action.id}`;
    timers.current.push(
      window.setTimeout(() => {
        setBusy(key);
        timers.current.push(
          window.setTimeout(() => {
            setBusy(null);
            setLog((l) =>
              [
                { id: `${key}-${Date.now()}`, device: device.name, command: action.command, result: action.result, at: stamp() },
                ...l,
              ].slice(0, 40),
            );
          }, 620),
        );
      }, delay),
    );
  };

  const runEveryDevice = () => {
    setRanAll(true);
    setLog([]);
    let delay = 0;
    DEVICE_KINDS.forEach((d) => {
      const first = d.actions[0];
      if (!first) return;
      fire(d, first, delay);
      delay += 780;
    });
  };

  const severity = SEVERITY_COPY[DEVICE_SEVERITY[active.id]];

  return (
    <section id="hardware" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-600">Hardware theater</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Every hardware function, live on stage
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            {DEVICE_KINDS.length} device classes, {DEVICE_KINDS.reduce((s, d) => s + d.actions.length, 0)} driver
            actions. Pick a device, fire the command, watch the terminal answer. Hand the laptop over and let him
            press them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runEveryDevice}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.03]"
          >
            <Zap className="h-4 w-4" /> Self-test every device
          </button>
          <Link
            to="/devices"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Open the device hub
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* device rail */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {DEVICE_KINDS.map((d) => {
              const sev = SEVERITY_COPY[DEVICE_SEVERITY[d.id]];
              const on = d.id === activeId;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveId(d.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    on
                      ? 'border-transparent bg-slate-900 text-white shadow-lg'
                      : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  <span
                    className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${d.tone} text-white`}
                  >
                    <DemoIcon name={d.icon} className="h-4 w-4" />
                  </span>
                  <p className={`text-xs font-bold leading-tight ${on ? 'text-white' : 'text-slate-900'}`}>{d.name}</p>
                  <p className={`mt-1 text-[10px] font-semibold ${on ? 'text-white/60' : 'text-slate-400'}`}>
                    {sev.short}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* active device */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${active.tone} text-white`}
              >
                <DemoIcon name={active.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{active.name}</h3>
                <p className="text-xs font-semibold text-slate-400">{active.connection}</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">{active.blurb}</p>

            <span
              className={`mt-3 inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${severity.chip}`}
            >
              {severity.label}
            </span>
            <p className="mt-2 text-xs text-slate-500">{severity.explain}</p>

            <div className="mt-5 space-y-2">
              {active.actions.map((a) => {
                const key = `${active.id}-${a.id}`;
                const isBusy = busy === key;
                const done = log.some((l) => l.command === a.command);
                return (
                  <button
                    key={a.id}
                    onClick={() => fire(active, a)}
                    disabled={isBusy}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-70"
                  >
                    {isBusy ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky-600" />
                    ) : done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <PlayCircle className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900">{a.label}</span>
                      <code className="block truncate font-mono text-[11px] text-slate-400">{a.command}</code>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
              Offline: {active.offline}
            </p>
          </div>
        </div>

        {/* console */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Terminal className="h-3.5 w-3.5" /> device log
              {ranAll && <span className="ml-auto text-emerald-400">full self-test</span>}
            </div>
            <div className="h-[420px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
              {log.length === 0 ? (
                <p className="text-slate-600">No commands sent yet. Fire an action and it lands here.</p>
              ) : (
                log.map((l) => (
                  <div key={l.id} className="mb-3 animate-pop-in border-l-2 border-sky-500/40 pl-2">
                    <p className="text-slate-500">
                      {l.at} · {l.device}
                    </p>
                    <p className="text-sky-300">$ {l.command}</p>
                    <p className="text-emerald-300">✓ {l.result}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEVICE_PROMISE.map((p) => (
          <div key={p} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" />
            {p}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HardwareTheater;
