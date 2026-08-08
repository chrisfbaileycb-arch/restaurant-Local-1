import React from 'react';
import {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet, Store, Router, Tag, Scale,
  Activity, RefreshCw, AlertTriangle, ShieldCheck, Plug, PlugZap, Check, Ban, Clock,
} from 'lucide-react';

import { useDeviceHealth } from '@/hooks/useDeviceHealth';
import {
  DEVICE_KINDS, DEVICE_SEVERITY, SEVERITY_COPY, HEALTH_CHECK, HEALTH_RULES, BLOCK_REASONS,
} from '@/data/platform';


const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet, Store, Router, Tag, Scale,
};

const ago = (ts: number | null) => {
  if (!ts) return 'never';
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m}m ago`;
};

const SEVERITY_STYLE: Record<string, string> = {
  blocking: 'bg-red-100 text-red-800',
  warn: 'bg-amber-100 text-amber-900',
  info: 'bg-stone-100 text-stone-600',
};

/**
 * Live equipment status board for the owner dashboard.
 * Every paired device is re-verified on a heartbeat; a dark critical device
 * raises an alert and holds order entry across every station.
 */
const StationMonitor: React.FC = () => {
  const {
    paired, statusFor, verifyNow, verifyOne, toggleDevice, downed, sweeping, lastSweep,
    openAlerts, acknowledge, ordersBlocked, blockingDevices, warnDevices, monitorOn, setMonitorOn,
  } = useDeviceHealth();

  const devices = DEVICE_KINDS.filter((d) => paired.includes(d.id));
  const onlineCount = devices.filter((d) => statusFor(d.id).state === 'online').length;

  return (
    <div className="space-y-6">
      {/* Master status bar */}
      <div
        className={`rounded-2xl border p-5 ${
          ordersBlocked ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                ordersBlocked ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {ordersBlocked ? <Ban className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </span>
            <div>
              <p className={`text-lg font-extrabold ${ordersBlocked ? 'text-red-900' : 'text-emerald-900'}`}>
                {ordersBlocked ? 'Order entry is held' : 'All stations verified'}
              </p>
              <p className={`text-sm ${ordersBlocked ? 'text-red-800' : 'text-emerald-800'}`}>
                {ordersBlocked
                  ? `${blockingDevices.map((d) => DEVICE_KINDS.find((k) => k.id === d)?.name).join(', ')} is not answering. New orders cannot be rung until it is back.`
                  : `${onlineCount} of ${devices.length} devices answering · checked ${ago(lastSweep)} · ${HEALTH_CHECK.label}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={verifyNow}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              <RefreshCw className={`h-4 w-4 ${sweeping ? 'animate-spin' : ''}`} /> Verify now
            </button>
            <button
              onClick={() => setMonitorOn(!monitorOn)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                monitorOn ? 'border-stone-300 bg-white text-stone-700' : 'border-amber-400 bg-amber-100 text-amber-900'
              }`}
            >
              <Activity className="h-4 w-4" /> Heartbeat {monitorOn ? 'on' : 'paused'}
            </button>
          </div>
        </div>

        {ordersBlocked && (
          <div className="mt-4 space-y-2">
            {blockingDevices.map((id) => (
              <p key={id} className="flex items-start gap-2 rounded-xl bg-white/70 p-3 text-sm text-red-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{BLOCK_REASONS[id] || 'This device is required to keep the line honest. Order entry is held.'}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Device grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((d) => {
          const Icon = ICONS[d.icon] || Printer;
          const h = statusFor(d.id);
          const severity = DEVICE_SEVERITY[d.id] || 'info';
          const isDown = h.state === 'offline';
          const isChecking = h.state === 'checking';
          return (
            <div
              key={d.id}
              className={`rounded-2xl border p-4 transition ${
                isDown
                  ? severity === 'blocking'
                    ? 'border-red-300 bg-red-50'
                    : 'border-amber-300 bg-amber-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${d.tone} text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-900">{d.name}</p>
                  <p className="truncate text-xs text-stone-500">{d.connection}</p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isDown ? 'bg-red-600 text-white' : isChecking ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDown ? 'bg-white' : isChecking ? 'animate-pulse bg-stone-500' : 'animate-pulse bg-emerald-500'
                    }`}
                  />
                  {isDown ? 'Not connected' : isChecking ? 'Checking' : 'Connected'}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wide ${SEVERITY_STYLE[severity]}`}>
                  {SEVERITY_COPY[severity].label}
                </span>
                <span className="inline-flex items-center gap-1 text-stone-500">
                  <Clock className="h-3 w-3" /> Last answer {ago(h.lastGood)}
                </span>
                {h.latencyMs != null && !isDown && <span className="text-stone-400">{h.latencyMs} ms</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => verifyOne(d.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} /> Verify
                </button>
                <button
                  onClick={() => toggleDevice(d.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    downed.includes(d.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {downed.includes(d.id) ? (
                    <>
                      <PlugZap className="h-3.5 w-3.5" /> Reconnect
                    </>
                  ) : (
                    <>
                      <Plug className="h-3.5 w-3.5" /> Simulate drop
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {devices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 md:col-span-2 xl:col-span-3">
            Nothing paired to this station yet — pair hardware from the device hub and it appears here.
          </div>
        )}
      </div>

      {/* Alert feed */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-bold text-stone-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Alerts today
          </h2>
          <div className="mt-3 space-y-2">
            {openAlerts.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                <Check className="h-4 w-4" /> No open alerts. Every paired device answered its last heartbeat.
              </p>
            ) : (
              openAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                    a.severity === 'blocking' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  <span className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      <span className="font-bold">{a.name}</span> · {a.message}
                      <span className="ml-1 text-xs opacity-70">
                        ({new Date(a.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </span>
                  </span>
                  {a.severity !== 'blocking' && !a.acknowledged && (
                    <button
                      onClick={() => acknowledge(a.id)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-sm"
                    >
                      Acknowledge
                    </button>
                  )}
                  {a.severity === 'blocking' && (
                    <span className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                      Orders held
                    </span>
                  )}
                </div>
              ))
            )}
            {warnDevices.length > 0 && (
              <p className="text-xs text-stone-500">
                {warnDevices.length} warning-level device{warnDevices.length > 1 ? 's are' : ' is'} down — you can keep ringing orders.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-900 p-5 text-white">
          <h2 className="flex items-center gap-2 font-bold">
            <Activity className="h-4 w-4 text-emerald-400" /> How the monitor behaves
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {HEALTH_RULES.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StationMonitor;
