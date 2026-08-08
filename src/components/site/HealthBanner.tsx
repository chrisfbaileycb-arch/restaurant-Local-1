import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Ban, RefreshCw, ShieldCheck, Activity, PlugZap } from 'lucide-react';

import { useDeviceHealth } from '@/hooks/useDeviceHealth';
import { BLOCK_REASONS, DEVICE_KINDS, HEALTH_CHECK } from '@/data/platform';

/**
 * The alert strip that sits on top of the register.
 * When a critical device stops answering, this turns red and the POS
 * stops accepting new items until the device is back.
 */
const HealthBanner: React.FC = () => {
  const {
    ordersBlocked, blockingDevices, warnDevices, verifyNow, reconnect, sweeping, lastSweep,
  } = useDeviceHealth();

  const nameOf = (id: string) => DEVICE_KINDS.find((d) => d.id === id)?.name || id;
  const ago = lastSweep ? `${Math.max(0, Math.round((Date.now() - lastSweep) / 1000))}s ago` : 'just now';

  if (!ordersBlocked) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <span className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" /> All stations answering · verified {ago}
          {warnDevices.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
              {warnDevices.length} warning
            </span>
          )}
        </span>
        <span className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-emerald-800">
            <Activity className="h-3.5 w-3.5" /> {HEALTH_CHECK.label}
          </span>
          <button onClick={verifyNow} className="inline-flex items-center gap-1.5 font-bold text-emerald-900 underline">
            <RefreshCw className={`h-3.5 w-3.5 ${sweeping ? 'animate-spin' : ''}`} /> Verify now
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-xl bg-red-600 text-white">
            <Ban className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-extrabold text-red-900">
              Order entry paused — {blockingDevices.map(nameOf).join(' & ')} not connected
            </p>
            <p className="mt-1 text-sm text-red-800">
              {BLOCK_REASONS[blockingDevices[0] as keyof typeof BLOCK_REASONS] ||
                'A device the kitchen depends on stopped answering. New orders are held until it is back.'}
            </p>
            <p className="mt-1 text-xs text-red-700">
              Open tickets, tabs and anything already fired are untouched. Nothing is lost.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={verifyNow}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <RefreshCw className={`h-4 w-4 ${sweeping ? 'animate-spin' : ''}`} /> Verify now
          </button>
          <button
            onClick={() => blockingDevices.forEach((id) => reconnect(id))}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <PlugZap className="h-4 w-4" /> It is plugged back in
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-800"
          >
            <AlertTriangle className="h-4 w-4" /> Station monitor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthBanner;
