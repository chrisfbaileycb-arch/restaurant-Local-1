import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Nfc, ScanLine, CreditCard, Smartphone, Monitor, Check, Loader2, ShieldCheck, Zap, X, Camera,
} from 'lucide-react';

import { PAY_RAILS, ZERO_HARDWARE_POINTS, railCost, formatCents, type PayRail } from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Nfc, ScanLine, CreditCard,
};

export type StationView = 'terminal' | 'mobile';

interface Props {
  /** amount due on the open ticket, in cents */
  total: number;
  /** shop connectivity — drives the offline queue copy */
  online: boolean;
  /** order entry locked / empty ticket */
  disabled?: boolean;
  /** fires when a rail authorises the sale */
  onPaid: (method: string, note: string) => void;
  /** which view this instance is rendered in */
  station?: StationView;
  onStationChange?: (next: StationView) => void;
}

type Phase = 'idle' | 'arming' | 'reading' | 'routing' | 'approved';

const MASKED = ['4242', '8813', '0197', '5561'];

/**
 * Zero-Hardware Checkout.
 *
 * Two rails that need nothing but the device already in the operator's hand:
 * Tap to Pay over NFC, and an OCR camera scan for cards that will not tap.
 * Smart interchange optimization prices both against every other path and
 * routes the sale down the cheapest compliant one.
 */
const ZeroHardware: React.FC<Props> = ({
  total, online, disabled, onPaid, station = 'terminal', onStationChange,
}) => {
  const [enabled, setEnabled] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [rail, setRail] = useState<PayRail | null>(null);
  const [scan, setScan] = useState<{ pan: string; exp: string } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Least-cost routing: price this exact ticket down every available rail.
  const priced = useMemo(
    () =>
      PAY_RAILS.map((r) => ({ rail: r, cost: railCost(r, Math.max(total, 0)) })).sort((a, b) => a.cost - b.cost),
    [total],
  );
  const cheapest = priced[0];
  const dearest = priced[priced.length - 1];
  const savings = Math.max(dearest.cost - cheapest.cost, 0);

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase('idle');
    setRail(null);
    setScan(null);
  };

  const run = (r: PayRail) => {
    if (disabled || total <= 0) return;
    reset();
    setRail(r);
    const pan = MASKED[Math.floor(Math.random() * MASKED.length)];
    const exp = `0${Math.floor(Math.random() * 9) + 1}/2${Math.floor(Math.random() * 5) + 7}`;

    setPhase('arming');
    timers.current.push(
      window.setTimeout(() => {
        setPhase('reading');
        if (r.id === 'scan') setScan({ pan, exp });
      }, 700),
      window.setTimeout(() => setPhase('routing'), 1500),
      window.setTimeout(() => {
        setPhase('approved');
        onPaid(
          r.id === 'tap' ? 'Tap to Pay' : 'Camera scan',
          `•••• ${pan} · routed ${r.routesTo} · ${r.rate.toFixed(2)}% + $${r.perTxn.toFixed(2)}${
            online ? '' : ' · queued offline, settles on reconnect'
          }`,
        );
      }, 2300),
    );
  };

  const busy = phase !== 'idle' && phase !== 'approved';
  const zeroRails = PAY_RAILS.filter((r) => !r.needsHardware);

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      {/* header + master toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 bg-white/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow">
            <Nfc className="h-5 w-5" />

          </span>
          <div>
            <p className="text-sm font-extrabold leading-tight text-stone-900">Zero-Hardware Checkout</p>
            <p className="text-[11px] font-semibold text-stone-500">
              No dongles. Take the card on the {station === 'mobile' ? 'phone in your apron' : 'screen in front of you'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* station switch — the same rails on the counter or in your hand */}
          {onStationChange && (
            <div className="inline-flex rounded-xl border border-stone-200 bg-white p-0.5">
              {([
                { id: 'terminal' as const, label: 'Terminal', Icon: Monitor },
                { id: 'mobile' as const, label: 'Mobile station', Icon: Smartphone },
              ]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { onStationChange(id); reset(); }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    station === id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          )}

          <button
            role="switch"
            aria-checked={enabled}
            onClick={() => { setEnabled((v) => !v); reset(); }}
            className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}
            aria-label="Toggle zero-hardware checkout"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                enabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {!enabled ? (
        <div className="px-4 py-5 text-sm text-stone-600">
          Zero-hardware rails are off. This station will only take payment on a paired chip/tap reader or cash.
          <button
            onClick={() => setEnabled(true)}
            className="ml-2 font-bold text-violet-700 underline underline-offset-2"
          >
            Turn it back on
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {zeroRails.map((r) => {
              const Icon = ICONS[r.icon] || CreditCard;
              const active = rail?.id === r.id;
              const cost = railCost(r, Math.max(total, 0));
              const best = cheapest.rail.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => run(r)}
                  disabled={disabled || busy || total <= 0}
                  className={`relative flex flex-col rounded-2xl border-2 p-4 text-left transition disabled:opacity-50 ${
                    active
                      ? 'border-violet-500 bg-white shadow-lg'
                      : 'border-transparent bg-white shadow-sm hover:-translate-y-0.5 hover:border-violet-200'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${r.tone} text-white shadow`}>
                      <Icon className="h-5 w-5" />

                    </span>
                    {best && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">
                        Cheapest rail
                      </span>
                    )}
                  </span>
                  <span className="mt-2.5 text-sm font-extrabold text-stone-900">
                    {r.id === 'scan' ? 'Scan with Camera' : r.name}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-stone-600">{r.how}</span>
                  <span className="mt-2 text-[11px] font-bold text-violet-700">
                    {r.rate.toFixed(2)}% + ${r.perTxn.toFixed(2)} · {formatCents(cost)} on this ticket
                  </span>
                </button>
              );
            })}
          </div>

          {/* live authorisation strip */}
          {rail && (
            <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300">
                  {phase === 'approved' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {rail.id === 'tap' ? 'Tap to Pay (NFC)' : 'Camera card scan'}
                </p>
                <button onClick={reset} aria-label="Cancel" className="rounded-lg p-1 text-stone-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-sm font-semibold">
                {phase === 'arming' && (rail.id === 'tap'
                  ? `Hold the card or phone to the back of this ${station === 'mobile' ? 'phone' : 'tablet'}…`
                  : 'Camera armed — line the card up inside the frame…')}
                {phase === 'reading' && (rail.id === 'tap'
                  ? 'Contactless read complete · encrypted at the antenna'
                  : `Read •••• ${scan?.pan} · exp ${scan?.exp} · masked before storage`)}
                {phase === 'routing' && 'Smart interchange optimization — pricing every compliant rail…'}
                {phase === 'approved' && `Approved ${formatCents(total)} · ${rail.routesTo}`}
              </p>

              {rail.id === 'scan' && phase !== 'approved' && (
                <div className="mt-3 flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-fuchsia-400/60 bg-fuchsia-500/10">
                  <Camera className="h-5 w-5 animate-pulse text-fuchsia-300" />
                  <span className="ml-2 text-xs font-semibold text-fuchsia-200">
                    {scan ? `•••• ${scan.pan}  ${scan.exp}` : 'Scanning card front…'}
                  </span>
                </div>
              )}

              {phase === 'approved' && (
                <p className="mt-2 text-xs text-emerald-300">
                  {online
                    ? 'Settled to reporting, rewards and your daily close.'
                    : 'Held in the offline queue — settles itself the second data returns.'}
                </p>
              )}
            </div>
          )}

          {/* smart interchange readout */}
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <Zap className="h-3.5 w-3.5" /> Smart interchange optimization
            </p>
            <p className="mt-1.5 text-sm text-emerald-900">
              {total > 0 ? (
                <>
                  This <strong>{formatCents(total)}</strong> ticket routes <strong>{cheapest.rail.routesTo}</strong> at{' '}
                  {cheapest.rail.rate.toFixed(2)}% + ${cheapest.rail.perTxn.toFixed(2)} —{' '}
                  <strong>{formatCents(cheapest.cost)}</strong> in fees, saving {formatCents(savings)} against the
                  worst path on this sale.
                </>
              ) : (
                <>Ring up a ticket and we price every card-present and scanned rail before the card is even read.</>
              )}
            </p>
            <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
              {ZERO_HARDWARE_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-[11px] text-emerald-900">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZeroHardware;
