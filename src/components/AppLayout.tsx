import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor, ShoppingBag, Globe, Gift, CalendarDays, BarChart3, CreditCard, Package,
  ArrowRight, Check, Wifi, WifiOff, Upload, Sparkles, Star, ShieldCheck, Wallet, Heart,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SignupForm from '@/components/site/SignupForm';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/site/Reveal';
import { Pointer, TapRing } from '@/components/site/Pointer';
import FlowShowcase from '@/components/site/FlowShowcase';
import ServiceFloor from '@/components/site/ServiceFloor';
import SiteHosting from '@/components/site/SiteHosting';
import DeviceHub from '@/components/site/DeviceHub';
import Failover from '@/components/site/Failover';
import Pricing from '@/components/site/Pricing';


import {
  BRAND, HERO_IMAGE, FEATURES, STATS, BUSINESS_TYPES, LAUNCH_STEPS, REPORTS,
  REWARD_PROGRAMS, PROCESSORS, PARTNER_SERVICES, TESTIMONIALS,
  SETUP_FEE, PLANS, calcProcessingCost, formatMoney,
} from '@/data/platform';

import { useAuth } from '@/contexts/AuthContext';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, ShoppingBag, Globe, Gift, CalendarDays, BarChart3, CreditCard, Package,
};

const FEATURE_TONES = [
  'from-fuchsia-500 to-pink-500',
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-400',
  'from-emerald-500 to-lime-400',
  'from-amber-400 to-orange-500',
  'from-rose-500 to-red-500',
  'from-teal-500 to-emerald-400',
  'from-indigo-500 to-blue-500',
];

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<any[]>([]);
  const [volume, setVolume] = useState(45000);
  const [ticket, setTicket] = useState(14);
  const [reportFilter, setReportFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('All');
  const [online, setOnline] = useState(true);
  const [liveMenu, setLiveMenu] = useState<LoadedMenu>(DEMO_LOADED_MENU);

  useEffect(() => {
    supabase
      .from('ecom_products')
      .select('*, variants:ecom_product_variants(*)')
      .eq('status', 'active')
      .contains('tags', ['featured'])
      .limit(8)
      .then(({ data }) => setFeatured(data || []));
  }, []);

  useEffect(() => {
    loadShopMenu(user?.id || null)
      .then(setLiveMenu)
      .catch(() => setLiveMenu(DEMO_LOADED_MENU));
  }, [user?.id]);

  const mockItems = liveMenu.items.slice(0, 9);
  const mockSubtotal = mockItems.slice(0, 3).reduce((s, m) => s + m.price, 0);
  // Tax rate comes from the shop's settings, never a hardcoded number.
  const mockTax = Math.round(mockSubtotal * liveMenu.taxRate);


  const ranked = [...PROCESSORS]
    .map((p) => ({ ...p, cost: calcProcessingCost(p, volume, ticket) }))
    .sort((a, b) => a.cost - b.cost);
  const savings = ranked.length > 1 ? ranked[ranked.length - 1].cost - ranked[0].cost : 0;

  const visibleReports = REPORTS.filter((r) => reportFilter === 'All' || r.cadence === reportFilter);

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/40">
      <Header />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500">
        <img
          src={HERO_IMAGE}
          alt="Restaurant counter with a Love Local Eats POS touchscreen"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(76,29,149,.85),rgba(219,39,119,.55),rgba(249,115,22,.35))]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-blob rounded-full bg-amber-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 animate-blob rounded-full bg-cyan-300/30 blur-3xl [animation-delay:4s]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
          <div>
            <span className="inline-flex animate-pop-in items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 animate-wiggle text-amber-300" /> No code. No contracts. No commission.
            </span>
            <h1 className="mt-6 animate-rise-in text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Upload your menu.<br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-lime-200 bg-clip-text text-transparent">
                Launch your whole business.
              </span>
            </h1>
            <p className="mt-5 inline-flex animate-rise-in items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-bold text-rose-100 ring-1 ring-white/20">
              <Heart className="h-4 w-4 animate-wiggle fill-current text-rose-300" /> {BRAND.promise}
            </p>
            <p className="mt-4 max-w-xl animate-rise-in text-lg text-white/85 [animation-delay:120ms]">{BRAND.subtitle}</p>


            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="relative inline-flex rounded-xl">
                <TapRing />
                <Link
                  to="/onboarding"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3.5 font-extrabold text-violet-700 shadow-xl transition hover:scale-[1.03]"
                >
                  <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
                  <Upload className="h-5 w-5" /> Upload my menu
                </Link>
              </span>
              <Link
                to="/pos"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 px-6 py-3.5 font-bold text-white transition hover:bg-white/15"
              >
                Try the POS demo <ArrowRight className="h-4 w-4 animate-bob-x" />
              </Link>
              <Pointer label="60 seconds, promise" dir="left" tone="amber" className="hidden sm:inline-flex" />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 90}>
                  <p className="text-2xl font-extrabold text-amber-200">{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-white/70">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Live terminal mock */}
          <div className="relative animate-float-slow">
            <div className="rounded-3xl border border-white/25 bg-slate-900/85 p-4 shadow-2xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {liveMenu.isDemo ? 'Station 1 · Front counter' : `Station 1 · ${liveMenu.shopName}`}
                </span>
                <button
                  onClick={() => setOnline((o) => !o)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    online ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'
                  }`}
                >
                  {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                  {online ? 'Online · synced' : 'Offline · LTE backup · 4 queued'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mockItems.map((m, i) => (
                  <div
                    key={m.id}
                    className={`rounded-xl bg-gradient-to-br p-3 text-left ${
                      ['from-fuchsia-500/25 to-violet-500/10', 'from-sky-500/25 to-cyan-500/10', 'from-amber-400/25 to-orange-500/10'][i % 3]
                    }`}
                  >
                    <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">{m.name}</p>
                    <p className="mt-1 text-[11px] font-bold text-amber-300">${(m.price / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-white/5 p-3">
                <div className="flex justify-between text-xs text-slate-300"><span>Subtotal</span><span>${(mockSubtotal / 100).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-slate-300"><span>Tax</span><span>${(mockTax / 100).toFixed(2)}</span></div>
                <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                  <span>Total</span><span>${((mockSubtotal + mockTax) / 100).toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/pos"
                className="mt-3 block animate-tap-ping rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-center text-sm font-extrabold text-slate-900"
              >
                {liveMenu.isDemo ? 'Open the live demo' : 'Open my POS'}
              </Link>
            </div>

            <p className="mt-3 text-center text-xs text-white/70">
              Tap the status pill — that is exactly what a network failure looks like on the floor.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- ANIMATED BUILD FLOW ---------------- */}
      <FlowShowcase />

      {/* ---------------- BUSINESS TYPES ---------------- */}
      <section className="bg-vibe-mesh mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Built for <span className="text-gradient-vibe">your kind of shop</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Pick a concept and the whole build changes — POS layout, modifiers, ordering flow and website copy.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS_TYPES.map((b, i) => (
            <Reveal key={b.id} delay={i * 60}>
              <Link
                to={`/onboarding?type=${b.id}`}
                className="hover-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-sm"
              >
                <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${b.accent}`} />
                <div className={`mb-4 mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${b.accent} text-white shadow-md transition group-hover:animate-wiggle`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-slate-900">{b.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{b.blurb}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600 opacity-0 transition group-hover:opacity-100">
                  Build this <ArrowRight className="h-3.5 w-3.5 animate-bob-x" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          No full bar programs — beer, wine and a short mixed-drink list are fully supported.
        </p>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
              Four steps from menu to open sign
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {LAUNCH_STEPS.map((s, i) => (
              <Reveal key={s.id} delay={i * 110}>
                <div className="hover-lift relative h-full rounded-2xl border border-orange-100 bg-gradient-to-b from-amber-50 to-white p-6">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${FEATURE_TONES[i % FEATURE_TONES.length]} text-lg font-extrabold text-white shadow-lg`}>
                    {s.id}
                  </span>
                  {i < LAUNCH_STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-9 hidden h-5 w-5 animate-bob-x text-orange-400 md:block" />
                  )}
                  <h3 className="mt-4 font-extrabold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-7 py-3.5 font-extrabold text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.03]"
            >
              Start my build <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            One platform, <span className="text-gradient-vibe">everything switched on</span>
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Most owners duct-tape six vendors together. Love Local Eats POS ships all of it configured from the same
            menu upload.
          </p>

        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon] || Monitor;
            return (
              <Reveal key={f.id} delay={i * 60}>
                <div className="hover-lift group flex h-full flex-col rounded-2xl border border-white bg-white p-6 shadow-sm">
                  <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${FEATURE_TONES[i % FEATURE_TONES.length]} text-white shadow-md transition group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-extrabold leading-snug text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.body}</p>
                  <ul className="mt-4 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- SERVICE FLOOR (roles, tabs, ticket routing) ---------------- */}
      <ServiceFloor />

      {/* ---------------- DEVICE HUB (hardware actually fires) ---------------- */}
      <DeviceHub />

      {/* ---------------- CONNECTIVITY FAILOVER / PHONE PIVOT ---------------- */}
      <Failover />

      {/* ---------------- HOSTED ONE-PAGE WEBSITE ---------------- */}
      <SiteHosting />



      {/* ---------------- REPORTS ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 py-16">
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 animate-blob rounded-full bg-amber-300/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {REPORTS.length} standard reports, already built
              </h2>
              <p className="mt-3 max-w-2xl text-white/75">
                Sales tax filings, daily close, tips, payroll exports and year-end summaries. Nothing to configure.
              </p>
            </Reveal>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setReportFilter(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    reportFilter === c
                      ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 shadow-lg'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleReports.map((r, i) => (
              <div
                key={r.id}
                style={{ animationDelay: `${i * 45}ms` }}
                className="animate-pop-in rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{r.name}</h3>
                  <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-bold uppercase text-slate-900">
                    {r.cadence}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">{r.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-violet-700 transition hover:scale-[1.03]">
              Open a live report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- RATE SHOPPER ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
              <ShieldCheck className="h-3.5 w-3.5" /> Lowest-rate swipe search
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Stop overpaying on every swipe
            </h2>
            <p className="mt-3 text-slate-600">
              We re-shop live swipe, chip and keyed rates weekly, then route each transaction down the cheapest
              compliant path. Move the sliders to see your number.
            </p>
            <div className="mt-6 space-y-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700">
                  <span>Monthly card volume</span>
                  <span className="text-emerald-600">{formatMoney(volume)}</span>
                </div>
                <input type="range" min={5000} max={250000} step={1000} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700">
                  <span>Average ticket</span>
                  <span className="text-emerald-600">${ticket}</span>
                </div>
                <input type="range" min={4} max={80} step={1} value={ticket}
                  onChange={(e) => setTicket(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-500" />
              </div>
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-lime-50 p-4">
                <p className="text-sm text-emerald-900">
                  Switching to <strong>{ranked[0].name}</strong> saves about{' '}
                  <strong className="text-emerald-700">{formatMoney(savings)}</strong>/mo — {formatMoney(savings * 12)} a year.
                </p>
              </div>
              <Pointer label="drag me" dir="up" tone="emerald" />
            </div>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-100 to-amber-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Processor</th>
                  <th className="px-4 py-3">Swipe</th>
                  <th className="px-4 py-3">Per txn</th>
                  <th className="px-4 py-3 text-right">Est. monthly</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p, i) => (
                  <tr key={p.id} className={i === 0 ? 'bg-emerald-50' : 'border-t border-slate-100'}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        {p.name}
                        {i === 0 && (
                          <span className="animate-pop-in rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            Best
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{p.note}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{p.swipeRate.toFixed(2)}%</td>
                    <td className="px-4 py-4 text-slate-700">${p.perTxn.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right font-extrabold text-slate-900">{formatMoney(p.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 p-4">
              <Link to="/products/processing-rate-audit" className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 hover:text-orange-700">
                Get a free statement audit <ArrowRight className="h-4 w-4 animate-bob-x" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- REWARDS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Pick a rewards program in one tap</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Guests join with a phone number at the terminal. No app, no plastic card, no separate vendor bill.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REWARD_PROGRAMS.map((r, i) => (
              <Reveal key={r.id} delay={i * 70}>
                <div className="hover-lift h-full rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50 to-white p-6">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${FEATURE_TONES[i % FEATURE_TONES.length]} text-white shadow`}>
                    <Gift className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-extrabold text-slate-900">{r.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{r.rule}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-pink-500">{r.best}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED HARDWARE ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Hardware, spec&apos;d for your concept</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Ships pre-loaded with your menu. Free shipping on every order.
            </p>
          </Reveal>
          <Link to="/shop" className="hidden items-center gap-2 rounded-xl border-2 border-orange-200 px-5 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50 sm:inline-flex">
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-amber-100" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-8 sm:hidden">
          <Link to="/shop" className="block rounded-xl border-2 border-orange-200 py-3 text-center font-bold text-orange-600">
            Shop all hardware
          </Link>
        </div>
      </section>

      {/* ---------------- BUDGET / NO STICKER SHOCK ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="grid gap-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-50 p-7 lg:grid-cols-[1fr_.9fr] lg:p-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                <Wallet className="h-3.5 w-3.5" /> No sticker shock
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                Start cheap. Add gear when business is good.
              </h2>
              <p className="mt-3 max-w-xl text-slate-700">
                You do not need a $1,300 terminal to open. Run Love Local Eats POS on the phone in your pocket, or build
                a real touchscreen counter with a $149 tablet, a $39 stand, an $89 locking cash drawer, a $49 tap reader
                and cheap thermal printers for the guest and the line.
              </p>


              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  'Phone-only mode for food trucks',
                  '10" touchscreen tablet — $149',
                  'Countertop & truck tablet mounts',
                  'Compact locking cash drawer — $89',
                  'Guest receipt printer — $99',
                  'Kitchen ticket printer — $149',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/starter"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.03]"
                >
                  Build a budget kit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/collections/budget-starter"
                  className="rounded-xl border-2 border-emerald-300 bg-white px-6 py-3.5 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  See everything under $150
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { name: 'Phone Only', price: '$159', who: 'Food trucks & pop-ups', detail: 'Window mount + tap reader + receipt printer. Use your own phone.' },
                { name: 'One Tablet Counter', price: '$336', who: 'Coffee, cookies, smoothies', detail: '10" tablet, swivel stand, tap reader and guest receipts.' },
                { name: 'Counter + Kitchen', price: '$577', who: 'Bakeries & quick-service', detail: 'Adds locking cash drawer and a ticket printer on the line.' },
              ].map((k) => (
                <Link
                  key={k.name}
                  to="/starter"
                  className="hover-lift flex flex-col rounded-2xl border border-white bg-white p-5 shadow-sm"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-extrabold text-slate-900">{k.name}</span>
                    <span className="text-xl font-extrabold text-emerald-600">{k.price}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-orange-500">{k.who}</p>
                  <p className="mt-2 text-sm text-slate-600">{k.detail}</p>
                </Link>
              ))}
              <p className="text-center text-xs text-slate-500">
                Software is ${PLANS[1].price}/mo (${PLANS[0].price} with website hosting) · ${SETUP_FEE} one-time setup ·
                free shipping · no contract.
              </p>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- PARTNERS / AFFILIATE ---------------- */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Vetted partners, member pricing</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Once your menu is in, we recommend the services a shop your size actually needs — and negotiate the rate.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PARTNER_SERVICES.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <div className="hover-lift flex h-full flex-col rounded-2xl border border-white bg-white p-5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-600">{p.category}</span>
                  <h3 className="mt-1 font-extrabold text-slate-900">{p.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{p.offer}</p>
                  <p className="mt-auto pt-3 text-xs font-bold text-emerald-600">{p.payout}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <Pricing />


      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Owners who launched themselves</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <figure className="hover-lift h-full rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-6">
                  <div className="flex gap-0.5 text-amber-400">
                    {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4">
                    <p className="font-extrabold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.shop}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-r from-fuchsia-600 via-orange-500 to-amber-400 py-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 animate-blob rounded-full bg-white/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow sm:text-4xl">
              Send your menu. Get your store back in 48 hours.
            </h2>
            <p className="mt-3 text-white/90">
              We build the POS layout, ordering site, one-page website and rewards program — then hand you the keys.
            </p>
            <Pointer label="takes one minute" dir="down" tone="sky" className="mt-5" />
          </Reveal>
          <Reveal delay={120} className="rounded-3xl bg-slate-900 p-6 shadow-2xl">
            <SignupForm
              source="popup"
              tags={['waitlist', 'launch-request']}
              cta="Build my store free"
              dark
              heading="Claim a free build slot"
              sub="We open 25 launch slots a week."
            />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AppLayout;
