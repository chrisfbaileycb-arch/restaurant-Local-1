import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, RefreshCw, PlugZap, Activity } from 'lucide-react';

import { useDeviceHealth, sinceLabel } from '@/hooks/useDeviceHealth';

/**
 * The strip that sits above the register. Green while every station answers,
 * pulsing red — and order entry held — the moment a critical device goes dark.
 */
const HealthBanner: React.FC = () => {
  const { ordersBlocked, blockingDevices, lastSweep, sweeping, verifyAll, reconnect, openAlerts } =
    useDeviceHealth();

  if (!ordersBlocked) {
    const warnings = openAlerts.filter((a) => a.severity !== 'blocking' && !a.acknowledged);
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <ShieldCheck className="h-4 w-4" />
          All stations answering
          <span className="font-medium text-emerald-700">· verified {sinceLabel(lastSweep)}</span>
          {warnings.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
        </p>
        <button
          onClick={verifyAll}
          disabled={sweeping}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${sweeping ? 'animate-spin' : ''}`} /> Verify now
        </button>
      </div>
    );
  }

  const dead = blockingDevices[0];

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-red-400 bg-red-50">
      <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-white">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <p className="text-sm font-extrabold uppercase tracking-wide">Order entry paused</p>
        <span className="ml-auto text-xs font-semibold text-red-100">
          {blockingDevices.length} critical device{blockingDevices.length > 1 ? 's' : ''} not connected
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-[240px] flex-1">
          <p className="flex items-center gap-2 text-sm font-bold text-red-900">
            <ShieldAlert className="h-4 w-4" /> {blockingDevices.map((d) => d.name).join(' · ')} stopped answering
          </p>
          <p className="mt-1 text-xs text-red-800">
            {dead?.name} last answered {sinceLabel(dead?.lastGood ?? null)}. New orders are held so the line never
            gets food it cannot see. Open tickets and payment still work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={verifyAll}
            disabled={sweeping}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-800 ring-1 ring-red-300 transition hover:bg-red-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${sweeping ? 'animate-spin' : ''}`} /> Verify now
          </button>
          <button
            onClick={() => blockingDevices.forEach((d) => reconnect(d.id))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            <PlugZap className="h-3.5 w-3.5" /> It is plugged back in
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-800 transition hover:bg-red-100"
          >
            <Activity className="h-3.5 w-3.5" /> Station monitor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthBanner;
