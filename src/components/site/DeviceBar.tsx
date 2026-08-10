import React from 'react';
import { Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine, Plug, Check, Zap, RefreshCw } from 'lucide-react';

import { useDevices } from '@/hooks/useDevices';
import { useDeviceHealth, sinceLabel } from '@/hooks/useDeviceHealth';
import { DEVICE_KINDS, type DeviceKindId } from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Printer, ChefHat, Wallet, CreditCard, Smartphone, ScanLine,
};

/** The devices a working station touches most — shown as a live strip in the POS. */
const STRIP: DeviceKindId[] = ['receipt-printer', 'kitchen-printer', 'cash-drawer', 'card-reader', 'phone-swiper', 'card-scan'];

/**
 * Compact hardware strip for the POS screen: pair a device, fire its primary
 * action (test print, open drawer, test read) and watch the live connection state.
 */
const DeviceBar: React.FC = () => {
  const { statusOf, pair, run, testAll, log } = useDevices();
  const { devices: health, verifyAll, sweeping, lastSweep } = useDeviceHealth();
  const devices = DEVICE_KINDS.filter((d) => STRIP.includes(d.id));
  const last = log[0];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-stone-900">
          <Plug className="h-4 w-4 text-sky-600" /> Connected hardware
          <span className="text-xs font-medium text-stone-500">· checked {sinceLabel(lastSweep)}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={verifyAll}
            disabled={sweeping}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${sweeping ? 'animate-spin' : ''}`} /> Verify connections
          </button>
          <button
            onClick={testAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200"
          >
            <Zap className="h-3.5 w-3.5" /> Run self test
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((d) => {
          const Icon = ICONS[d.icon] || Printer;
          const status = statusOf(d.id);
          const paired = status === 'ready' || status === 'busy';
          const row = health.find((h) => h.id === d.id);
          const down = paired && row?.state === 'down';
          const checking = paired && row?.state === 'checking';
          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                down ? 'border-red-300 bg-red-50' : 'border-stone-200'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${d.tone} text-white`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-stone-900">{d.name}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    down ? 'text-red-700' : checking ? 'text-sky-700' : paired ? 'text-emerald-600' : 'text-stone-400'
                  }`}
                >
                  {status === 'pairing'
                    ? 'Pairing…'
                    : down
                    ? 'Not connected'
                    : checking
                    ? 'Checking…'
                    : paired
                    ? 'Connected'
                    : 'Not paired'}
                </span>
              </span>
              {paired ? (
                <button
                  onClick={() => run(d.id, d.actions[0].id)}
                  disabled={down}
                  className="shrink-0 rounded-lg bg-stone-900 px-2.5 py-1.5 text-[11px] font-bold text-white transition active:scale-95 disabled:opacity-40"
                >
                  {down ? 'Offline' : d.actions[0].label}
                </button>
              ) : (
                <button
                  onClick={() => pair(d.id)}
                  className="shrink-0 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  Pair
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
        <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${last?.ok === false ? 'text-amber-500' : 'text-emerald-600'}`} />
        {last ? (
          <span>
            <span className="font-bold text-stone-800">{last.device}</span> · {last.text}{' '}
            <span className="text-stone-400">({last.at})</span>
          </span>
        ) : (
          <span>
            Every paired device is re-checked automatically all day. Drivers run on this terminal, so printers,
            drawers and readers keep firing with the internet down.
          </span>
        )}
      </p>
    </div>
  );
};

export default DeviceBar;
