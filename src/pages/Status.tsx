import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw, Database, Cloud, Server, Timer,
} from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import { supabase } from '@/lib/supabase';
import { catalogSource, fetchActiveProducts } from '@/lib/catalog';

type Level = 'ok' | 'warn' | 'fail' | 'pending';

interface Check {
  id: string;
  label: string;
  detail: string;
  hint?: string;
  level: Level;
  ms: number;
  icon: React.ComponentType<{ className?: string }>;
}

const ICON: Record<Level, React.ReactNode> = {
  ok: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  warn: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  fail: <XCircle className="h-5 w-5 text-rose-500" />,
  pending: <Loader2 className="h-5 w-5 animate-spin text-stone-400" />,
};

const RING: Record<Level, string> = {
  ok: 'border-emerald-200 bg-emerald-50/70',
  warn: 'border-amber-200 bg-amber-50/70',
  fail: 'border-rose-200 bg-rose-50/70',
  pending: 'border-stone-200 bg-white',
};

const timed = async <T,>(fn: () => Promise<T>): Promise<{ result: T | null; ms: number; error: string | null }> => {
  const t0 = performance.now();
  try {
    const result = await fn();
    return { result, ms: Math.round(performance.now() - t0), error: null };
  } catch (e: any) {
    return { result: null, ms: Math.round(performance.now() - t0), error: e?.message || 'Request failed' };
  }
};

const Status: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);
  const [ranAt, setRanAt] = useState<string>('');

  const run = useCallback(async () => {
    setRunning(true);
    const out: Check[] = [];

    /* 1 — database reachability (cheap head count) */
    {
      const { result, ms, error } = await timed(async () => {
        const { count, error: qErr } = await supabase
          .from('ecom_products')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active');
        if (qErr) throw new Error(qErr.message);
        return count || 0;
      });
      out.push({
        id: 'db',
        label: 'Database',
        icon: Database,
        detail: error
          ? `Unreachable — ${error}`
          : `Answering · ${result} active products counted`,
        hint: error
          ? 'A "project has been deleted" or 404 here means the client is pointed at the wrong project ref in src/lib/supabase.ts.'
          : undefined,
        level: error ? 'fail' : (result as number) > 0 ? 'ok' : 'warn',
        ms,
      });
    }

    /* 2 — tax engine edge function */
    {
      const { result, ms, error } = await timed(async () => {
        const { data, error: fErr } = await supabase.functions.invoke('calculate-tax', {
          body: { state: 'TX', subtotal: 10000 },
        });
        if (fErr) throw new Error(fErr.message);
        return data;
      });
      const cents = (result as any)?.taxCents;
      out.push({
        id: 'tax',
        label: 'Tax engine (calculate-tax)',
        icon: Server,
        detail: error
          ? `No answer — ${error}`
          : `$100.00 in TX → $${((cents || 0) / 100).toFixed(2)} tax`,
        hint: error ? 'Checkout will fall back to 0% tax until this answers.' : undefined,
        level: error ? 'fail' : (result as any)?.success ? 'ok' : 'warn',
        ms,
      });
    }

    /* 3 — shipping calculator edge function */
    {
      const { result, ms, error } = await timed(async () => {
        const { data, error: fErr } = await supabase.functions.invoke('calculate-shipping', {
          body: {
            cartItems: [{ name: 'Status probe', quantity: 1, price: 10000 }],
            shippingRules: 'Free shipping on all orders',
            subtotal: 10000,
          },
        });
        if (fErr) throw new Error(fErr.message);
        return data;
      });
      const ship = (result as any)?.shippingCents;
      out.push({
        id: 'shipping',
        label: 'Shipping calculator (calculate-shipping)',
        icon: Server,
        detail: error
          ? `No answer — ${error}`
          : `$100.00 order → ${ship === 0 ? 'free shipping' : `$${((ship || 0) / 100).toFixed(2)}`}`,
        hint: error ? 'Checkout will default to free shipping until this answers.' : undefined,
        level: error ? 'fail' : (result as any)?.success ? 'ok' : 'warn',
        ms,
      });
    }

    /* 4 — catalog source (live vs bundled snapshot) */
    {
      const { result, ms } = await timed(async () => {
        const rows = await fetchActiveProducts();
        return rows.length;
      });
      const live = catalogSource() === 'live';
      out.push({
        id: 'catalog',
        label: 'Storefront catalog',
        icon: Cloud,
        detail: live
          ? `Live catalog · ${result} products served from the database`
          : `Offline catalog · ${result} products served from the bundled snapshot`,
        hint: live
          ? undefined
          : 'The shop still sells, but pricing may be a few hours stale. Fix the database check above and retry.',
        level: live ? 'ok' : 'warn',
        ms,
      });
    }

    setChecks(out);
    setRanAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const fails = checks.filter((c) => c.level === 'fail').length;
  const warns = checks.filter((c) => c.level === 'warn').length;
  const overall: Level = checks.length === 0 ? 'pending' : fails > 0 ? 'fail' : warns > 0 ? 'warn' : 'ok';
  const totalMs = checks.reduce((s, c) => s + c.ms, 0);

  const banner =
    overall === 'fail'
      ? { cls: 'border-rose-300 bg-rose-50 text-rose-800', text: `${fails} service down — the storefront is degraded.` }
      : overall === 'warn'
      ? { cls: 'border-amber-300 bg-amber-50 text-amber-900', text: `Serving, with ${warns} degraded service${warns === 1 ? '' : 's'}.` }
      : overall === 'ok'
      ? { cls: 'border-emerald-300 bg-emerald-50 text-emerald-800', text: 'All systems answering.' }
      : { cls: 'border-stone-300 bg-white text-stone-600', text: 'Running checks…' };

  return (
    <PageShell>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">System status</h1>
            <p className="mt-2 max-w-xl text-stone-600">
              Live probes against the database and the edge functions this store depends on. A failure that used to
              live in the browser console is diagnosed here in one click.
            </p>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-extrabold text-white transition hover:scale-[1.03] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} /> Re-run all checks
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${banner.cls}`}>
          <p className="font-extrabold">{banner.text}</p>
          <p className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-4 w-4" /> {totalMs} ms total
            </span>
            <span>{ranAt ? `Checked ${ranAt}` : 'Checking…'}</span>
          </p>
        </div>

        <ul className="mt-5 space-y-3">
          {(checks.length
            ? checks
            : [{ id: 'p', label: 'Checking services…', detail: 'Probing database and edge functions', level: 'pending' as Level, ms: 0, icon: Server }]
          ).map((c) => {
            const CIcon = c.icon;
            return (
              <li key={c.id} className={`flex items-start gap-4 rounded-2xl border p-5 ${RING[c.level]}`}>
                <span className="mt-0.5 shrink-0">{ICON[c.level]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CIcon className="h-4 w-4 text-stone-500" />
                    <p className="font-bold text-stone-900">{c.label}</p>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 font-mono text-[11px] font-bold text-stone-600">
                      {c.ms} ms
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-700">{c.detail}</p>
                  {c.hint && <p className="mt-1 text-xs text-stone-500">{c.hint}</p>}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/shop" className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-bold text-stone-700 hover:bg-stone-50">
            Open the shop
          </Link>
          <Link to="/audit" className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-bold text-stone-700 hover:bg-stone-50">
            Platform audit
          </Link>
          <Link to="/test-run" className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-bold text-stone-700 hover:bg-stone-50">
            Weekend pre-flight
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default Status;
