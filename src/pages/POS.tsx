import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wifi, WifiOff, Trash2, Minus, Plus, CreditCard, DollarSign, Gift, Check, RefreshCw, Percent, Receipt, Loader2, Upload, Lock, Ban, Bot, Smartphone, Monitor,
  ChefHat, QrCode, Package, BarChart3, Sparkles, Layers,
} from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import DeviceBar from '@/components/site/DeviceBar';
import HealthBanner from '@/components/site/HealthBanner';
import CopilotDock, { askCopilot } from '@/components/site/CopilotDock';
import ZeroHardware, { type StationView } from '@/components/site/ZeroHardware';
import KitchenDisplaySystem from '@/components/kds/KitchenDisplaySystem';
import QRMenuGenerator from '@/components/qr/QRMenuGenerator';
import InventoryAlerts from '@/components/inventory/InventoryAlerts';
import DailySalesSummary from '@/components/sales/DailySalesSummary';

import type { MenuItem } from '@/data/menu';
import { formatCents, formatTaxRate } from '@/data/platform';
import { taxClass as taxClassDef } from '@/data/taxClasses';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceHealth } from '@/hooks/useDeviceHealth';
import { useOps } from '@/lib/opsStore';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import { computeTax } from '@/lib/taxEngine';
import type { LoadedMenu } from '@/lib/menuStore';

type PosActiveTab = 'register' | 'kds' | 'qr' | 'inventory' | 'sales';

interface Line extends MenuItem {
  qty: number;
  lineId: string;
}

export const POS: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTable = searchParams.get('table');
  const initialSource = searchParams.get('source');

  const { user } = useAuth();
  const { ordersBlocked, blockingDevices } = useDeviceHealth();
  const ops = useOps();

  const [activeTab, setActiveTab] = useState<PosActiveTab>('register');
  const [loaded, setLoaded] = useState<LoadedMenu>(DEMO_LOADED_MENU);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [tipPct, setTipPct] = useState(0);
  const [member, setMember] = useState('');
  const [memberFound, setMemberFound] = useState<null | { name: string; points: number }>(null);
  const [station, setStation] = useState<StationView>('terminal');
  const [receipt, setReceipt] = useState<null | { total: number; method: string; note?: string; offline: boolean }>(null);

  const tableLabel = initialTable || (station === 'mobile' ? 'Mobile Server' : 'Register 1');

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
    () =>
      loaded.items
        .filter((m) => m.category === category)
        .map((m) => ({ ...m, price: ops.priceFor(m.name, m.price), off: ops.is86(m.name) })),
    [loaded, category, ops],
  );

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = Math.round(subtotal * (ops.discountPct / 100));
  const taxResult = useMemo(
    () =>
      computeTax(
        lines.map((l) => {
          const gross = l.price * l.qty;
          return { amount: gross - Math.round(gross * (ops.discountPct / 100)), taxClass: l.taxClass };
        }),
        loaded.taxProfile,
      ),
    [lines, loaded.taxProfile, ops.discountPct],
  );
  const tax = taxResult.total;
  const tip = Math.round((subtotal - discount) * (tipPct / 100));
  const total = subtotal - discount + tax + tip;

  const add = (m: MenuItem & { off?: boolean }) => {
    if (ordersBlocked) return;
    if (m.off || ops.is86(m.name)) return;
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

  const pay = (method: string, note?: string) => {
    if (lines.length === 0) return;

    // Automatically fire KDS Ticket for line cooks
    ops.addKDSTicket({
      orderSource: initialSource === 'qr' ? 'QR Table' : station === 'mobile' ? 'Dine-In' : 'Dine-In',
      locationLabel: tableLabel,
      serverName: user?.email ? user.email.split('@')[0] : 'Counter Register',
      status: 'queued',
      priority: 'normal',
      items: lines.map((l) => ({
        id: `item-${l.id}-${Date.now()}`,
        name: l.name,
        qty: l.qty,
        modifiers: l.description ? [l.description.slice(0, 32)] : [],
        station:
          l.category.toLowerCase().includes('drink') ||
          l.category.toLowerCase().includes('beer') ||
          l.category.toLowerCase().includes('cocktail') ||
          l.category.toLowerCase().includes('beverage')
            ? 'bar'
            : l.category.toLowerCase().includes('fry') || l.category.toLowerCase().includes('side')
            ? 'fryer'
            : 'grill',
        done: false,
      })),
      specialInstructions: note || `Paid via ${method} (${tableLabel})`,
    });

    // Automatically decrement live inventory items
    ops.decrementInventoryForItems(lines.map((l) => ({ name: l.name, qty: l.qty })));

    setReceipt({ total, method, note, offline: !online });
    if (!online) setQueued((q) => q + 1);
    setLines([]);
    setTipPct(0);
    setMember('');
    setMemberFound(null);
  };

  return (
    <PageShell copilot={false}>
      {/* Copilot on the register */}
      <CopilotDock mode="floor" menu={loaded} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Top Operational Navigation Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-stone-100 p-1.5">
            {[
              { id: 'register' as PosActiveTab, label: 'Order Register', Icon: Monitor },
              { id: 'kds' as PosActiveTab, label: `KDS Kitchen Display (${ops.kdsTickets.filter(t => t.status !== 'completed').length})`, Icon: ChefHat },
              { id: 'qr' as PosActiveTab, label: 'Gemini QR Links', Icon: QrCode },
              { id: 'inventory' as PosActiveTab, label: `Inventory & 86 (${ops.eightySixed.length})`, Icon: Package },
              { id: 'sales' as PosActiveTab, label: 'Daily Sales Z-Report', Icon: BarChart3 },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                  activeTab === id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => askCopilot()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow"
            >
              <Sparkles className="h-3.5 w-3.5" /> Ask Gemini Copilot
            </button>
          </div>
        </div>

        {/* Tab 1: Sub-View KDS */}
        {activeTab === 'kds' && <KitchenDisplaySystem />}

        {/* Tab 2: Sub-View QR Menu */}
        {activeTab === 'qr' && (
          <QRMenuGenerator
            shopName={loaded.shopName}
            menuItems={loaded.items.map((i) => ({ name: i.name, category: i.category }))}
          />
        )}

        {/* Tab 3: Sub-View Inventory */}
        {activeTab === 'inventory' && <InventoryAlerts />}

        {/* Tab 4: Sub-View Daily Sales Summary */}
        {activeTab === 'sales' && <DailySalesSummary />}

        {/* Tab 5: Main Interactive POS Register */}
        {activeTab === 'register' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Live POS</h1>
                  {initialTable && (
                    <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-900">
                      Active: {initialTable}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600">
                  {loaded.isDemo
                    ? 'Showing the demo menu — orders automatically route to the real-time KDS line.'
                    : `Running the saved menu for ${loaded.shopName} · ${loaded.items.length} items`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-stone-200 bg-white p-0.5">
                  {([
                    { id: 'terminal' as StationView, label: 'Terminal', Icon: Monitor },
                    { id: 'mobile' as StationView, label: 'Mobile station', Icon: Smartphone },
                  ]).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setStation(id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                        station === id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>

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
                <span>Demo menu active — testing orders live pushes tickets to the kitchen display automatically.</span>
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

            <div className="mt-4">
              <HealthBanner />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
              <div>
                {loading ? (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white">
                    <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {loaded.categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                            category === c ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => add(m)}
                          disabled={ordersBlocked || m.off}
                          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                            ordersBlocked
                              ? 'cursor-not-allowed border-stone-200 bg-stone-100 opacity-60'
                              : m.off
                              ? 'cursor-not-allowed border-red-200 bg-red-50/70'
                              : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-extrabold text-stone-900">{m.name}</span>
                              {m.off && (
                                <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
                                  <Ban className="h-3 w-3" /> 86
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-stone-500">{m.description}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-stone-900">{formatCents(m.price)}</span>
                            <span className="font-mono text-stone-400">{formatTaxRate(m.taxClass)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Order Cart & Payment Sidebar */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-black text-stone-900">Current Order ({tableLabel})</h2>
                  {lines.length > 0 && (
                    <button onClick={() => setLines([])} className="text-xs font-bold text-red-600 hover:underline">
                      Clear Order
                    </button>
                  )}
                </div>

                <div className="mt-4 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                  {lines.length === 0 ? (
                    <div className="py-12 text-center text-xs font-semibold text-stone-400">
                      Select items from the menu to start order
                    </div>
                  ) : (
                    lines.map((l) => (
                      <div key={l.lineId} className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 p-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-stone-900">{l.name}</p>
                          <p className="text-[11px] font-mono text-stone-500">{formatCents(l.price)} each</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => bump(l.lineId, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-stone-900">{l.qty}</span>
                          <button
                            onClick={() => bump(l.lineId, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="w-16 text-right font-mono text-xs font-black text-stone-900">
                          {formatCents(l.price * l.qty)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {lines.length > 0 && (
                  <div className="mt-4 border-t border-stone-100 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-stone-900">{formatCents(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Promo Discount ({ops.discountPct}%)</span>
                        <span className="font-mono font-bold">-{formatCents(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Tax</span>
                      <span className="font-mono font-bold text-stone-900">{formatCents(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-black text-stone-900">
                      <span>Total Due</span>
                      <span className="font-mono text-lg">{formatCents(total)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => pay('Credit / Tap Card')}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-3 text-xs font-black text-white hover:bg-stone-800"
                      >
                        <CreditCard className="h-4 w-4" /> Tap / Card
                      </button>
                      <button
                        onClick={() => pay('Cash')}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-700"
                      >
                        <DollarSign className="h-4 w-4" /> Cash Pay
                      </button>
                    </div>
                  </div>
                )}

                {receipt && (
                  <div className="mt-4 animate-in fade-in rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900">
                    <div className="flex items-center gap-2 font-black">
                      <Check className="h-4 w-4 text-emerald-700" />
                      Order Fired to Kitchen ({formatCents(receipt.total)})
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-800">
                      Payment recorded via {receipt.method}. Live KDS ticket #{Math.max(100, ...ops.kdsTickets.map(t => t.ticketNumber))} created for kitchen line cooks!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware strip & Quick Links */}
            <div className="mt-6">
              <DeviceBar />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default POS;
