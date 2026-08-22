import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, CalendarDays, Gift, CreditCard, Download, TrendingUp, Users, Percent, Receipt, Package,
  Activity, ShieldCheck, ShieldAlert, Plug, Clock, Globe,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import StationMonitor from '@/components/site/StationMonitor';
import TaxRateSetting from '@/components/site/TaxRateSetting';
import TaxJurisdictions from '@/components/site/TaxJurisdictions';
import ItemTaxClasses from '@/components/site/ItemTaxClasses';
import PayrollTaxSetting from '@/components/site/PayrollTaxSetting';
import WebsiteSettings from '@/components/site/WebsiteSettings';
import BuildStatus from '@/components/site/BuildStatus';
import CopilotDock from '@/components/site/CopilotDock';


import { useDeviceHealth, sinceLabel } from '@/hooks/useDeviceHealth';

import {
  SALES_TREND, CATEGORY_MIX, TAX_JURISDICTIONS, SHIFTS, WEEK_DAYS, REPORTS, REWARD_PROGRAMS,
  PROCESSORS, calcProcessingCost, formatMoney, formatCents,
} from '@/data/platform';

const TABS = [
  { id: 'stations', label: 'Stations & hardware', icon: Plug },
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'sales', label: 'Sales & reports', icon: BarChart3 },
  { id: 'tax', label: 'Sales tax', icon: Receipt },
  { id: 'team', label: 'Schedule & labor', icon: CalendarDays },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'rates', label: 'Rate shopper', icon: CreditCard },
  { id: 'orders', label: 'Store orders', icon: Package },
];


const PIE_COLORS = ['#f59e0b', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [tab, setTab] = useState('stations');
  const [orders, setOrders] = useState<any[]>([]);
  const [volume, setVolume] = useState(45000);
  const [ticket, setTicket] = useState(14);
  const { devices, downCount, connectedCount, ordersBlocked, lastSweep } = useDeviceHealth();


  useEffect(() => {
    supabase
      .from('ecom_orders')
      .select('id, status, total, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setOrders(data || []));
  }, []);

  const weekSales = SALES_TREND.reduce((s, d) => s + d.sales, 0);
  const weekLabor = SALES_TREND.reduce((s, d) => s + d.labor, 0);
  const weekOrders = SALES_TREND.reduce((s, d) => s + d.orders, 0);
  const laborPct = ((weekLabor / weekSales) * 100).toFixed(1);
  const avgTicket = (weekSales / weekOrders).toFixed(2);

  const taxTotal = TAX_JURISDICTIONS.reduce((s, j) => s + j.taxable * (j.rate / 100), 0);

  const ranked = [...PROCESSORS]
    .map((p) => ({ ...p, cost: calcProcessingCost(p, volume, ticket) }))
    .sort((a, b) => a.cost - b.cost);

  const download = (name: string) => {
    const rows = [['Day', 'Sales', 'Labor', 'Orders'], ...SALES_TREND.map((d) => [d.day, d.sales, d.labor, d.orders])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpi = (label: string, value: string, sub: string, Icon: any) => (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p>
        <Icon className="h-4 w-4 text-amber-600" />
      </div>
      <p className="mt-2 text-2xl font-extrabold text-stone-900">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{sub}</p>
    </div>
  );

  return (
    <PageShell copilot={false}>

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Owner dashboard</h1>
              <p className="mt-2 text-stone-600">Sample data from a single-location coffee &amp; sandwich shop.</p>
            </div>
            <button
              onClick={() => setTab('stations')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                ordersBlocked
                  ? 'animate-pulse bg-red-600 text-white hover:bg-red-700'
                  : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              {ordersBlocked ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {ordersBlocked ? 'Equipment alert · order entry held' : `All ${connectedCount} stations connected`}
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    tab === t.id ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                  {t.id === 'stations' && downCount > 0 && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {downCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Where this shop's build sits, milestone by milestone. */}
        <BuildStatus />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === 'stations' && (

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpi('Devices paired', String(devices.length), 'Across this location', Plug)}
              {kpi('Connected now', `${connectedCount}/${devices.length}`, downCount ? `${downCount} not answering` : 'Everything answering', Activity)}
              {kpi('Order entry', ordersBlocked ? 'Held' : 'Open', ordersBlocked ? 'Critical device offline' : 'No blocking faults', ordersBlocked ? ShieldAlert : ShieldCheck)}
              {kpi('Last verified', sinceLabel(lastSweep), 'Automatic heartbeat', Clock)}
            </div>
            <StationMonitor />
          </div>
        )}

        {tab === 'sales' && (

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpi('Week sales', formatMoney(weekSales), '+12.4% vs last week', TrendingUp)}
              {kpi('Orders', String(weekOrders), `Avg ticket $${avgTicket}`, Receipt)}
              {kpi('Labor', `${laborPct}%`, `${formatMoney(weekLabor)} of sales`, Users)}
              {kpi('Card fees', formatMoney(weekSales * 0.0215), 'Least-cost routing active', Percent)}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-stone-900">Sales vs labor</h2>
                  <button onClick={() => download('weekly-sales')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                    <Download className="h-4 w-4" /> CSV
                  </button>
                </div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="labor" fill="#1c1917" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="font-bold text-stone-900">Category mix</h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CATEGORY_MIX} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                        {CATEGORY_MIX.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {CATEGORY_MIX.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {c.name}
                      </span>
                      <span className="font-semibold">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-bold text-stone-900">All standard reports</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {REPORTS.map((r) => (
                  <div key={r.id} className="flex flex-col rounded-xl border border-stone-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-stone-900">{r.name}</p>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">{r.cadence}</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">{r.detail}</p>
                    <button onClick={() => download(r.name)} className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-bold text-amber-700">
                      <Download className="h-3.5 w-3.5" /> Export CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'tax' && (
          <div className="space-y-6">
            {/* Stacked jurisdictions: state + county + city + special districts */}
            <TaxJurisdictions />

            {/* Which items are taxed as what (alcohol, grocery, never-taxed) */}
            <ItemTaxClasses />

            {/* Single blended rate — used only until jurisdictions are added */}
            <TaxRateSetting />

            {/* Employer payroll / unemployment taxes — calculated at payroll, not at the register */}
            <PayrollTaxSetting />

            <div className="grid gap-4 sm:grid-cols-3">
              {kpi('Taxable sales', formatMoney(18420), 'Current filing period', Receipt)}
              {kpi('Tax collected', formatMoney(taxTotal), 'Ready to remit', Percent)}
              {kpi('Exempt sales', formatMoney(640), 'Grocery, resale & gift cards', BarChart3)}
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="font-bold text-stone-900">Sales tax by jurisdiction</h2>
                <button onClick={() => download('sales-tax-filing')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                  <Download className="h-4 w-4" /> Filing export
                </button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3">Jurisdiction</th>
                    <th className="px-5 py-3">Rate</th>
                    <th className="px-5 py-3">Taxable</th>
                    <th className="px-5 py-3 text-right">Tax due</th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_JURISDICTIONS.map((j) => (
                    <tr key={j.name} className="border-t border-stone-100">
                      <td className="px-5 py-4 font-semibold text-stone-900">{j.name}</td>
                      <td className="px-5 py-4 text-stone-700">{j.rate.toFixed(2)}%</td>
                      <td className="px-5 py-4 text-stone-700">{formatMoney(j.taxable)}</td>
                      <td className="px-5 py-4 text-right font-bold text-stone-900">{formatMoney(j.taxable * (j.rate / 100))}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-stone-200 bg-stone-50">
                    <td className="px-5 py-4 font-bold text-stone-900" colSpan={3}>Total due</td>
                    <td className="px-5 py-4 text-right font-extrabold text-stone-900">{formatMoney(taxTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-stone-500">
              Sample filing figures. Live filings are generated from POS and online orders using the jurisdictions
              above — taxable vs exempt sales are split per authority, including tips and refunds.
            </p>
          </div>
        )}


        {tab === 'team' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {kpi('Scheduled hours', '214', 'This week, 5 employees', CalendarDays)}
              {kpi('Labor cost', formatMoney(weekLabor), `${laborPct}% of sales`, Users)}
              {kpi('Overtime risk', '1 employee', 'June K. at 38.5 hrs', TrendingUp)}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    {WEEK_DAYS.map((d) => <th key={d} className="px-4 py-3">{d}</th>)}
                    <th className="px-4 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIFTS.map((s) => (
                    <tr key={s.name} className="border-t border-stone-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-stone-900">{s.name}</p>
                        <p className="text-xs text-stone-500">{s.role}</p>
                      </td>
                      {s.days.map((d, i) => (
                        <td key={i} className="px-4 py-4">
                          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                            d === 'OFF' ? 'bg-stone-100 text-stone-400' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {d}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-4 text-right font-semibold text-stone-900">${s.rate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-bold text-stone-900">Labor vs sales, by day</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="labor" stroke="#1c1917" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <button onClick={() => download('payroll-export')} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <Download className="h-4 w-4" /> Payroll export (hours, breaks, tips)
              </button>
            </div>
          </div>
        )}

        {tab === 'rewards' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {kpi('Members', '1,284', '+96 this month', Users)}
              {kpi('Enrollment rate', '38%', 'Of all transactions', Percent)}
              {kpi('Repeat lift', '+2.1 visits', 'Members vs non-members', TrendingUp)}
              {kpi('Reward cost', formatMoney(412), '2.2% of member sales', Gift)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REWARD_PROGRAMS.map((r) => (
                <div key={r.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                  <Gift className="h-5 w-5 text-amber-600" />
                  <h3 className="mt-3 font-bold text-stone-900">{r.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">{r.rule}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-400">{r.best}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-bold text-stone-900">Automated win-backs</h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li>Lapsed 30 days → text a free drip coffee (opened 61%)</li>
                <li>Birthday month → email $5 off (redeemed 44%)</li>
                <li>3 visits in 14 days → unlock VIP tier automatically</li>
                <li>Big spender over $60 → thank-you text with rewards signup link</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'rates' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="font-bold text-stone-900">Lowest-rate swipe search</h2>
              <p className="mt-1 text-sm text-stone-600">Live rate comparison, re-shopped weekly.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex justify-between text-sm font-semibold text-stone-700">
                    <span>Monthly card volume</span><span>{formatMoney(volume)}</span>
                  </div>
                  <input type="range" min={5000} max={250000} step={1000} value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))} className="mt-2 w-full accent-amber-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold text-stone-700">
                    <span>Average ticket</span><span>${ticket}</span>
                  </div>
                  <input type="range" min={4} max={80} step={1} value={ticket}
                    onChange={(e) => setTicket(Number(e.target.value))} className="mt-2 w-full accent-amber-600" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3">Processor</th>
                    <th className="px-5 py-3">Swipe</th>
                    <th className="px-5 py-3">Per txn</th>
                    <th className="px-5 py-3">Monthly fee</th>
                    <th className="px-5 py-3 text-right">Est. cost</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((p, i) => (
                    <tr key={p.id} className={i === 0 ? 'bg-emerald-50/70' : 'border-t border-stone-100'}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">
                          {p.name} {i === 0 && <span className="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Best</span>}
                        </p>
                        <p className="text-xs text-stone-500">{p.note}</p>
                      </td>
                      <td className="px-5 py-4">{p.swipeRate.toFixed(2)}%</td>
                      <td className="px-5 py-4">${p.perTxn.toFixed(2)}</td>
                      <td className="px-5 py-4">{p.monthly ? formatMoney(p.monthly) : '—'}</td>
                      <td className="px-5 py-4 text-right font-bold text-stone-900">{formatMoney(p.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-stone-100 p-4">
                <Link to="/products/processing-rate-audit" className="text-sm font-bold text-amber-700 hover:text-amber-800">
                  Order a statement audit →
                </Link>
              </div>
            </div>
          </div>
        )}

        {tab === 'website' && <WebsiteSettings />}

        {tab === 'orders' && (

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="font-bold text-stone-900">Your hardware orders</h2>
              <p className="text-sm text-stone-500">Gear and services purchased from the Love Local Eats shop.</p>


            </div>
            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-stone-900">No orders yet</p>
                <Link to="/shop" className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
                  Shop hardware
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Placed</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-stone-100">
                      <td className="px-5 py-4 font-mono font-semibold text-stone-900">{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-4 text-stone-600">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold capitalize text-emerald-800">{o.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-stone-900">{formatCents(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Build-side copilot: "Ask the copilot" on the Website tab opens this. */}
      <CopilotDock mode="website" />
    </PageShell>

  );
};

export default Dashboard;
