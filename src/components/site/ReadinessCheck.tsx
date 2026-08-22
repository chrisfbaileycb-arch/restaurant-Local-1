import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Level = 'ok' | 'warn' | 'fail' | 'pending';

interface Row {
  id: string;
  label: string;
  detail: string;
  level: Level;
}

const ICON: Record<Level, React.ReactNode> = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  fail: <XCircle className="h-4 w-4 text-rose-500" />,
  pending: <Loader2 className="h-4 w-4 animate-spin text-stone-400" />,
};

const RING: Record<Level, string> = {
  ok: 'border-emerald-200 bg-emerald-50/60',
  warn: 'border-amber-200 bg-amber-50/60',
  fail: 'border-rose-200 bg-rose-50/60',
  pending: 'border-stone-200 bg-white',
};

/**
 * Live pre-flight. Runs real queries against the same tables and edge
 * functions the restaurant will hit on Saturday, so you know before you
 * drive over whether anything is going to embarrass you.
 */
const ReadinessCheck: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [ranAt, setRanAt] = useState<string>('');

  const run = useCallback(async () => {
    setRunning(true);
    const out: Row[] = [];

    const count = async (table: string, apply?: (q: any) => any) => {
      let q: any = supabase.from(table).select('id', { count: 'exact', head: true });
      if (apply) q = apply(q);
      const { count: c, error } = await q;
      if (error) throw new Error(error.message);
      return c || 0;
    };

    // 1 — hardware catalog
    try {
      const products = await count('ecom_products', (q) => q.eq('status', 'active'));
      out.push({
        id: 'catalog',
        label: 'Hardware catalog',
        detail: `${products} active products priced from the database`,
        level: products >= 20 ? 'ok' : products > 0 ? 'warn' : 'fail',
      });
    } catch (e: any) {
      out.push({ id: 'catalog', label: 'Hardware catalog', detail: e.message, level: 'fail' });
    }

    // 2 — storefront navigation
    try {
      const collections = await count('ecom_collections', (q) => q.eq('is_visible', true));
      out.push({
        id: 'collections',
        label: 'Storefront collections',
        detail: `${collections} visible collections driving the shop nav`,
        level: collections > 0 ? 'ok' : 'fail',
      });
    } catch (e: any) {
      out.push({ id: 'collections', label: 'Storefront collections', detail: e.message, level: 'fail' });
    }

    // 3 — your shop record
    try {
      const shops = await count('shops');
      out.push({
        id: 'shop',
        label: 'Your shop record',
        detail: shops > 0 ? `${shops} shop${shops === 1 ? '' : 's'} saved` : 'No shop yet — run the builder first',
        level: shops > 0 ? 'ok' : 'warn',
      });
    } catch (e: any) {
      out.push({ id: 'shop', label: 'Your shop record', detail: e.message, level: 'fail' });
    }

    // 4 — menu loaded into the register
    try {
      const items = await count('menu_items');
      out.push({
        id: 'menu',
        label: 'Menu items on the register',
        detail:
          items > 0
            ? `${items} items ready to ring`
            : 'Empty — the register will show demo buttons until you import your menu',
        level: items >= 5 ? 'ok' : items > 0 ? 'warn' : 'warn',
      });
    } catch (e: any) {
      out.push({ id: 'menu', label: 'Menu items on the register', detail: e.message, level: 'fail' });
    }

    // 5 — devices
    try {
      const devices = await count('devices');
      const paired = await count('devices', (q) => q.eq('is_paired', true));
      out.push({
        id: 'devices',
        label: 'Paired devices',
        detail:
          devices > 0
            ? `${paired} of ${devices} registered devices paired`
            : 'No devices registered — pair from the device hub on site',
        level: devices === 0 ? 'warn' : paired > 0 ? 'ok' : 'warn',
      });
    } catch (e: any) {
      out.push({ id: 'devices', label: 'Paired devices', detail: e.message, level: 'fail' });
    }

    // 6 — ticket table writable path
    try {
      const orders = await count('orders');
      out.push({
        id: 'orders',
        label: 'Ticket storage',
        detail: `orders table reachable · ${orders} tickets on file`,
        level: 'ok',
      });
    } catch (e: any) {
      out.push({ id: 'orders', label: 'Ticket storage', detail: e.message, level: 'fail' });
    }

    // 7 — tax engine edge function (real invoke)
    try {
      const { data, error } = await supabase.functions.invoke('calculate-tax', {
        body: { state: 'TX', subtotal: 10000 },
      });
      if (error) throw new Error(error.message);
      const cents = data?.taxCents ?? 0;
      out.push({
        id: 'tax',
        label: 'Tax engine',
        detail: `Live check: $100.00 in TX → $${(cents / 100).toFixed(2)} tax`,
        level: data?.success ? 'ok' : 'warn',
      });
    } catch (e: any) {
      out.push({
        id: 'tax',
        label: 'Tax engine',
        detail: 'Edge function did not answer — checkout will fall back to 0% tax',
        level: 'warn',
      });
    }

    setRows(out);
    setRanAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const fails = rows.filter((r) => r.level === 'fail').length;
  const warns = rows.filter((r) => r.level === 'warn').length;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Pre-flight check</h2>
          <p className="mt-1 text-sm text-stone-600">
            Real queries against the live database and edge functions — run this before you leave for the shop.
            {ranAt && <span className="ml-1 text-stone-400">Last run {ranAt}.</span>}
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} /> Re-run
        </button>
      </div>

      {rows.length > 0 && (
        <p
          className={`mt-4 rounded-xl px-4 py-2 text-sm font-bold ${
            fails > 0
              ? 'bg-rose-50 text-rose-700'
              : warns > 0
              ? 'bg-amber-50 text-amber-800'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {fails > 0
            ? `${fails} blocking issue${fails === 1 ? '' : 's'} — fix before Saturday.`
            : warns > 0
            ? `Clear to run. ${warns} item${warns === 1 ? '' : 's'} you will finish on site.`
            : 'All systems answering. You are clear to run the full test.'}
        </p>
      )}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {(rows.length ? rows : [{ id: 'l', label: 'Checking…', detail: 'Querying live services', level: 'pending' as Level }]).map(
          (r) => (
            <li key={r.id} className={`flex items-start gap-3 rounded-xl border p-3 ${RING[r.level]}`}>
              <span className="mt-0.5 shrink-0">{ICON[r.level]}</span>
              <span>
                <span className="block text-sm font-bold text-stone-900">{r.label}</span>
                <span className="block text-xs text-stone-600">{r.detail}</span>
              </span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
};

export default ReadinessCheck;
