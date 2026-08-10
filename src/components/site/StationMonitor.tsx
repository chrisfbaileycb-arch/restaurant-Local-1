import React from 'react';
import {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet, Store, Router, Tag, Scale,
  Activity, RefreshCw, PlugZap, Unplug, ShieldCheck, ShieldAlert, BellRing, Check,
} from 'lucide-react';

import { useDeviceHealth, sinceLabel } from '@/hooks/useDeviceHealth';
import { DEVICE_KINDS, SEVERITY_COPY, HEALTH_CHECK, HEALTH_RULES } from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Monitor, Tablet, Store, Router, Tag, Scale,
};

const timeOf = (ts: number | null) =>
  ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

/** The owner's live equipment board: every paired device, checked all day. */
const StationMonitor: React.FC = () => {
  const {
    devices, alerts, openAlerts, lastSweep, sweeping, ordersBlocked, blockingDevices,
    verifyAll, verifyOne, simulateDrop, reconnect, acknowledge, isForcedDown,
  } = useDeviceHealth();

  return (
    <div className="space-y-6">
      {/* Master bar */}
      <div
        className={`overflow-hidden rounded-2xl border-2 ${
          ordersBlocked ? 'border-red-400 bg-red-50' : 'border-emerald-300 bg-emerald-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${
                ordersBlocked ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {ordersBlocked ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </span>
            <div>
              <p className={`text-lg font-extrabold ${ordersBlocked ? 'text-red-900' : 'text-emerald-900'}`}>
                {ordersBlocked
                  ? `Order entry held — ${blockingDevices.map((d) => d.name).join(', ')} not connected`
                  : 'Every station is answering'}
              </p>
              <p className={`mt-0.5 text-sm ${ordersBlocked ? 'text-red-800' : 'text-emerald-800'}`}>
                Checked {HEALTH_CHECK.intervalLabel} · {HEALTH_CHECK.windowLabel} · last sweep {sinceLabel(lastSweep)}
                {lastSweep ? ` (${timeOf(lastSweep)})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={verifyAll}
            disabled={sweeping}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${sweeping ? 'animate-spin' : ''}`} />
            {sweeping ? 'Verifying…' : 'Verify all stations'}
          </button>
        </div>
      </div>

      {/* Device cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((d) => {
          const kind = DEVICE_KINDS.find((k) => k.id === d.id);
          const Icon = ICONS[kind?.icon || 'Printer'] || Printer;
          const sev = SEVERITY_COPY[d.severity];
          const down = d.state === 'down';
          const checking = d.state === 'checking';
          return (
            <div
              key={d.id}
              className={`rounded-2xl border bg-white p-4 transition ${
                down ? 'border-red-300 ring-2 ring-red-100' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                    kind?.tone || 'from-stone-500 to-stone-700'
                  } text-white`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-900">{d.name}</p>
                  <p className="truncate text-[11px] text-stone-500">{kind?.connection}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    down
                      ? 'bg-red-100 text-red-800'
                      : checking
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {down ? 'Not connected' : checking ? 'Checking…' : 'Connected'}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${sev.chip}`}>
                  {sev.short} · {sev.label}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2.5 text-[11px]">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-stone-400">Last answer</dt>
                  <dd className={`font-bold ${down ? 'text-red-700' : 'text-stone-800'}`}>{sinceLabel(d.lastGood)}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-stone-400">Latency</dt>
                  <dd className="font-bold text-stone-800">{d.latency != null ? `${d.latency} ms` : 'no reply'}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => verifyOne(d.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  <RefreshCw className="h-3 w-3" /> Verify
                </button>
                {isForcedDown(d.id) ? (
                  <button
                    onClick={() => reconnect(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                  >
                    <PlugZap className="h-3 w-3" /> Reconnect
                  </button>
                ) : (
                  <button
                    onClick={() => simulateDrop(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-bold text-stone-600 transition hover:bg-stone-100"
                  >
                    <Unplug className="h-3 w-3" /> Simulate drop
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert feed */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="flex items-center gap-2 font-bold text-stone-900">
          <BellRing className="h-4 w-4 text-amber-600" /> Connection alerts
          {openAlerts.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
              {openAlerts.length} open
            </span>
          )}
        </h3>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            Nothing has dropped today. Every heartbeat since open has come back clean.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {alerts.slice(0, 8).map((a) => (
              <li
                key={a.id}
                className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm ${
                  a.resolved
                    ? 'border-stone-200 bg-stone-50 text-stone-600'
                    : a.severity === 'blocking'
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                <span className="flex-1">
                  <span className="font-bold">{a.name}</span> ·{' '}
                  {a.resolved ? 'reconnected' : SEVERITY_COPY[a.severity].label.toLowerCase()} ·{' '}
                  <span className="text-xs">{a.reason}</span>
                </span>
                <span className="text-xs font-semibold">
                  {timeOf(a.opened)}
                  {a.resolved ? ` → ${timeOf(a.resolved)}` : ''}
                </span>
                {!a.resolved && a.severity !== 'blocking' && !a.acknowledged && (
                  <button
                    onClick={() => acknowledge(a.id)}
                    className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-900 ring-1 ring-amber-300"
                  >
                    Acknowledge
                  </button>
                )}
                {a.acknowledged && !a.resolved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                    <Check className="h-3 w-3" /> Acknowledged
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Plain-English explainer */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="flex items-center gap-2 font-bold text-stone-900">
          <Activity className="h-4 w-4 text-sky-600" /> How the check works
        </h3>
        <ul className="mt-3 space-y-2">
          {HEALTH_RULES.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StationMonitor;
