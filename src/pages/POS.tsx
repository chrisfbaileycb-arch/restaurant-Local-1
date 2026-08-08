import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, WifiOff, Trash2, Minus, Plus, CreditCard, DollarSign, Gift, Check, RefreshCw, Percent, Receipt, Loader2, Upload, Lock,
} from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import DeviceBar from '@/components/site/DeviceBar';
import HealthBanner from '@/components/site/HealthBanner';

import type { MenuItem } from '@/data/menu';
import { formatCents } from '@/data/platform';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceHealth } from '@/hooks/useDeviceHealth';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';

interface Line extends MenuItem {
  qty: number;
  lineId: string;
}

const TAX_RATE = 0.0825;


const POS: React.FC = () => {
  const { user } = useAuth();
  const { ordersBlocked, blockingDevices } = useDeviceHealth();
  const [loaded, setLoaded] = useState<LoadedMenu>(DEMO_LOADED_MENU);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [tipPct, setTipPct] = useState(0);
  const [member, setMember] = useState('');
  const [memberFound, setMemberFound] = useState<null | { name: string; points: number }>(null);
  const [receipt, setReceipt] = useState<null | { total: number; method: string; offline: boolean }>(null);


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadShopMenu(user?.id || null)
      .then((m) => {
        if (cancelled) return;
        setLoaded(m);
        setCategory(m.categories[0] || '');
      })
      .catch(() => setLoaded(DEMO_LOADED_MENU))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const items = useMemo(
    () => loaded.items.filter((m) => m.category === category),
    [loaded, category]
  );

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const tip = Math.round(subtotal * (tipPct / 100));
  const total = subtotal + tax + tip;

  const add = (m: MenuItem) => {
    // Hard stop: a dark kitchen printer / display / reader holds order entry.
    if (ordersBlocked) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === m.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...m, qty: 1, lineId: `${m.id}-${Date.now()}` }];
    });
  };


  const bump = (lineId: string, delta: number) =>
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));

  const lookupMember = () => {
    if (member.replace(/\D/g, '').length < 7) {
      setMemberFound(null);
      return;
    }
    setMemberFound({ name: 'Returning guest', points: 240 });
  };

  const pay = (method: string) => {
    if (lines.length === 0) return;
    setReceipt({ total, method, offline: !online });
    if (!online) setQueued((q) => q + 1);
    setLines([]);
    setTipPct(0);
    setMember('');
    setMemberFound(null);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Live POS</h1>
            <p className="text-sm text-stone-600">
              {loaded.isDemo
                ? 'Showing the demo menu — upload your own to load it here automatically.'
                : `Running the saved menu for ${loaded.shopName} · ${loaded.items.length} items`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnline((o) => !o)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                online ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {online ? 'Online · synced' : `Offline · LTE backup${queued ? ` · ${queued} queued` : ''}`}
            </button>
            {!online && (
              <button
                onClick={() => { setOnline(true); setQueued(0); }}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white"
              >
                <RefreshCw className="h-4 w-4" /> Reconnect &amp; sync
              </button>
            )}
          </div>
        </div>

        {loaded.isDemo && !loading && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <span>No saved menu found on this account or device.</span>
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 font-bold text-white">
              <Upload className="h-4 w-4" /> Upload my menu
            </Link>
          </div>
        )}

        {!online && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Network down — orders and card payments continue on cell data and queue locally. Nothing is lost.
          </div>
        )}

        {/* Live station health — turns red and holds order entry when critical gear drops */}
        <div className="mt-4">
          <HealthBanner />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div>
            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your menu…
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {loaded.categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        category === c ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="relative mt-4">
                  <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${ordersBlocked ? 'pointer-events-none opacity-30' : ''}`}>
                    {items.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => add(m)}
                        disabled={ordersBlocked}
                        className="flex min-h-[104px] flex-col justify-between rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 p-4 text-left transition active:scale-95"
                      >
                        <span className="text-sm font-bold leading-snug text-white">{m.name}</span>
                        <span className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-400">{formatCents(m.price)}</span>
                          {m.mods && m.mods.length > 0 && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-stone-300">
                              {m.mods.length} mods
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  {ordersBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                      <div className="mx-4 max-w-sm rounded-2xl border-2 border-red-300 bg-white p-5 text-center shadow-xl">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <Lock className="h-5 w-5" />
                        </span>
                        <p className="mt-3 font-extrabold text-stone-900">Order entry locked</p>
                        <p className="mt-1 text-sm text-stone-600">
                          Reconnect the {blockingDevices.length} device{blockingDevices.length > 1 ? 's' : ''} flagged above,
                          then hit Verify now. Items unlock the moment it answers.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <p className="mt-4 text-xs text-stone-500">
              Layout, modifiers and button order are generated from your menu upload — no configuration screens.
            </p>
          </div>


          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-900">Order ticket</h2>
              {lines.length > 0 && (
                <button onClick={() => setLines([])} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>

            <div className="mt-4 min-h-[140px] space-y-2">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-400">Tap items to start an order</p>
              ) : (
                lines.map((l) => (
                  <div key={l.lineId} className="flex items-center gap-2 rounded-xl border border-stone-200 p-2.5">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-900">{l.name}</p>
                      <p className="text-xs text-stone-500">{formatCents(l.price)} each</p>
                    </div>
                    <div className="flex items-center rounded-lg border border-stone-300">
                      <button onClick={() => bump(l.lineId, -1)} className="px-2 py-1 text-stone-600" aria-label="Less">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{l.qty}</span>
                      <button onClick={() => bump(l.lineId, 1)} className="px-2 py-1 text-stone-600" aria-label="More">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="w-16 text-right text-sm font-bold text-stone-900">{formatCents(l.price * l.qty)}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-xl bg-stone-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500">
                <Gift className="h-3.5 w-3.5" /> Rewards lookup
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  value={member}
                  onChange={(e) => setMember(e.target.value)}
                  placeholder="Guest phone number"
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <button onClick={lookupMember} className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-bold text-white">
                  Find
                </button>
              </div>
              {memberFound && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> {memberFound.name} · {memberFound.points} points · $10 reward available
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500">
                <Percent className="h-3.5 w-3.5" /> Tip
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[0, 15, 18, 20].map((p) => (
                  <button
                    key={p}
                    onClick={() => setTipPct(p)}
                    className={`rounded-lg py-2 text-sm font-bold transition ${
                      tipPct === p ? 'bg-amber-500 text-stone-900' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {p === 0 ? 'None' : `${p}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatCents(subtotal)}</span></div>
              <div className="flex justify-between text-stone-600"><span>Tax (8.25%)</span><span>{formatCents(tax)}</span></div>
              <div className="flex justify-between text-stone-600"><span>Tip</span><span>{formatCents(tip)}</span></div>
              <div className="flex justify-between pt-1 text-lg font-extrabold text-stone-900"><span>Total</span><span>{formatCents(total)}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => pay('Card')}
                disabled={lines.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 font-bold text-white disabled:opacity-40"
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
              <button
                onClick={() => pay('Cash')}
                disabled={lines.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-3.5 font-bold text-stone-800 disabled:opacity-40"
              >
                <DollarSign className="h-4 w-4" /> Cash
              </button>
            </div>

            {receipt && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="flex items-center gap-2 font-bold">
                  <Receipt className="h-4 w-4" /> {receipt.method} payment approved · {formatCents(receipt.total)}
                </p>
                <p className="mt-1 text-xs">
                  {receipt.offline
                    ? 'Stored offline — will sync automatically when the connection returns.'
                    : 'Synced to reporting and rewards instantly.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hardware strip — the gear this station can actually drive */}
        <div className="mt-6">
          <DeviceBar />
        </div>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold text-stone-900">Want this on your counter?</h2>
          <p className="mt-1 text-sm text-stone-600">
            Every sale here would already be in your daily close, sales tax report and rewards ledger — and every
            printer, drawer and reader above fires from this same screen.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/onboarding" className="rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white">Upload my menu</Link>
            <Link to="/dashboard" className="rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100">See the reports</Link>
            <Link to="/collections/pos-terminals" className="rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100">Shop terminals</Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default POS;
