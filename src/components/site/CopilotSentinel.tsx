import React from 'react';
import { Signal, SignalHigh, Printer, ChefHat, Archive, CreditCard, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

import { useDeviceHealth, sinceLabel } from '@/hooks/useDeviceHealth';
import { useOps } from '@/lib/opsStore';
import { SENTINEL_CHANNELS } from '@/data/copilot';
import type { DeviceKindId } from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Signal, Printer, ChefHat, Archive, CreditCard,
};

const TONE = {
  ok: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25',
  busy: 'bg-sky-400/15 text-sky-300 border-sky-400/25',
  down: 'bg-red-500/20 text-red-300 border-red-500/35',
};

/**
 * Hardware + network watchdog. Reads the same heartbeat that locks the
 * register, so what the operator sees here is the real station state.
 */
const CopilotSentinel: React.FC<{ onDiagnose?: (id: DeviceKindId) => void }> = ({ onDiagnose }) => {
  const { devices, sweeping, lastSweep, verifyAll, ordersBlocked } = useDeviceHealth();
  const ops = useOps();
  const onLte = ops.network === 'lte';

  const rowFor = (id: string) => devices.find((d) => d.id === id);

  return (
    <div className="border-t border-white/10 bg-slate-950/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {ordersBlocked ? (
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          )}
          System sentinel
        </span>
        <button
          onClick={verifyAll}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-200 transition hover:bg-white/20"
        >
          {sweeping ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {sweeping ? 'Checking' : `Swept ${sinceLabel(lastSweep)}`}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {SENTINEL_CHANNELS.map((c) => {
          if (c.id === 'network') {
            return (
              <button
                key={c.id}
                onClick={() => ops.setNetwork(onLte ? 'wifi' : 'lte')}
                title="Tap to simulate a Wi-Fi drop"
                className={`col-span-2 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition ${
                  onLte ? 'border-amber-400/35 bg-amber-400/15 text-amber-200' : TONE.ok
                }`}
              >
                {onLte ? <Signal className="h-3.5 w-3.5 shrink-0 animate-pulse" /> : <SignalHigh className="h-3.5 w-3.5 shrink-0" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold leading-tight">
                    {onLte ? 'LTE failover active' : 'Wi-Fi · synced'}
                  </span>
                  <span className="block truncate text-[10px] opacity-70">
                    {onLte ? 'Cards + tickets still running on cell data' : 'Primary connection healthy'}
                  </span>
                </span>
              </button>
            );
          }

          const row = rowFor(c.id);
          const Icon = ICONS[c.icon] || Printer;
          const tone = !row ? TONE.busy : row.state === 'down' ? TONE.down : row.state === 'checking' ? TONE.busy : TONE.ok;
          return (
            <button
              key={c.id}
              onClick={() => onDiagnose?.(c.id as DeviceKindId)}
              className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition hover:brightness-125 ${tone}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-bold leading-tight">{c.label}</span>
                <span className="block truncate text-[9px] opacity-75">
                  {!row ? 'not paired' : row.state === 'down' ? 'no answer' : row.state === 'checking' ? 'pinging…' : `${row.latency ?? 0}ms`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CopilotSentinel;
