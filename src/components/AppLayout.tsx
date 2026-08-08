import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor, ShoppingBag, Globe, Gift, CalendarDays, BarChart3, CreditCard, Package,
  ArrowRight, Check, Wifi, WifiOff, Upload, Sparkles, Star, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SignupForm from '@/components/site/SignupForm';
import ProductCard from '@/components/ProductCard';
import {
  BRAND, HERO_IMAGE, FEATURES, STATS, BUSINESS_TYPES, LAUNCH_STEPS, REPORTS,
  REWARD_PROGRAMS, PROCESSORS, PLANS, PARTNER_SERVICES, TESTIMONIALS,
  calcProcessingCost, formatMoney,
} from '@/data/platform';
import { useAuth } from '@/contexts/AuthContext';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, ShoppingBag, Globe, Gift, CalendarDays, BarChart3, CreditCard, Package,
};

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
  const mockTax = Math.round(mockSubtotal * 0.0825);


  const ranked = [...PROCESSORS]
    .map((p) => ({ ...p, cost: calcProcessingCost(p, volume, ticket) }))
    .sort((a, b) => a.cost - b.cost);
  const savings = ranked.length > 1 ? ranked[ranked.length - 1].cost - ranked[0].cost : 0;

  const visibleReports = REPORTS.filter((r) => reportFilter === 'All' || r.cadence === reportFilter);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <Header />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-stone-900">
        <img src={HERO_IMAGE} alt="Restaurant counter with Vibe OS touchscreen POS" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> No code. No contracts. No commission.
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Upload your menu.<br />
              <span className="text-amber-400">Launch your whole business.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">{BRAND.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-bold text-stone-900 transition hover:bg-amber-400">
                <Upload className="h-5 w-5" /> Upload my menu
              </Link>
              <Link to="/pos" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                Try the POS demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-amber-400">{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live terminal mock */}
          <div className="relative">
            <div className="rounded-3xl border border-white/15 bg-stone-950/80 p-4 shadow-2xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {liveMenu.isDemo ? 'Station 1 · Front counter' : `Station 1 · ${liveMenu.shopName}`}
                </span>
                <button
                  onClick={() => setOnline((o) => !o)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    online ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                  {online ? 'Online · synced' : 'Offline · LTE backup · 4 queued'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mockItems.map((m) => (
                  <div key={m.id} className="rounded-xl bg-gradient-to-br from-stone-800 to-stone-800/60 p-3 text-left">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">{m.name}</p>
                    <p className="mt-1 text-[11px] text-amber-400">${(m.price / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-white/5 p-3">
                <div className="flex justify-between text-xs text-stone-300"><span>Subtotal</span><span>${(mockSubtotal / 100).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-stone-300"><span>Tax</span><span>${(mockTax / 100).toFixed(2)}</span></div>
                <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                  <span>Total</span><span>${((mockSubtotal + mockTax) / 100).toFixed(2)}</span>
                </div>
              </div>
              <Link to="/pos" className="mt-3 block rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-stone-900">
                {liveMenu.isDemo ? 'Open the live demo' : 'Open my POS'}
              </Link>
            </div>

            <p className="mt-3 text-center text-xs text-stone-400">
              Tap the status pill — that is exactly what a network failure looks like on the floor.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- BUSINESS TYPES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Built for your kind of shop</h2>
          <p className="mt-3 text-stone-600">
            Pick a concept and the whole build changes — POS layout, modifiers, ordering flow and website copy.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS_TYPES.map((b) => (
            <Link
              key={b.id}
              to={`/onboarding?type=${b.id}`}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r ${b.accent}`} />
              <h3 className="font-bold text-stone-900">{b.label}</h3>
              <p className="mt-1 text-sm text-stone-500">{b.blurb}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 opacity-0 transition group-hover:opacity-100">
                Build this <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">
          No full bar programs — beer, wine and a short mixed-drink list are fully supported.
        </p>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-stone-900">
            Four steps from menu to open sign
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {LAUNCH_STEPS.map((s) => (
              <div key={s.id} className="relative rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 font-bold text-amber-400">
                  {s.id}
                </span>
                <h3 className="mt-4 font-bold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 font-bold text-white transition hover:bg-stone-800">
              Start my build <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">One platform, everything switched on</h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Most owners duct-tape six vendors together. Vibe OS ships all of it configured from the same menu upload.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = ICONS[f.icon] || Monitor;
            return (
              <div key={f.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:shadow-lg">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-bold leading-snug text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{f.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-stone-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- REPORTS ---------------- */}
      <section className="bg-stone-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {REPORTS.length} standard reports, already built
              </h2>
              <p className="mt-3 max-w-2xl text-stone-400">
                Sales tax filings, daily close, tips, payroll exports and year-end summaries. Nothing to configure.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setReportFilter(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    reportFilter === c ? 'bg-amber-500 text-stone-900' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleReports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{r.name}</h3>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase text-amber-300">
                    {r.cadence}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-400">{r.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-stone-900 transition hover:bg-amber-400">
              Open a live report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- RATE SHOPPER ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Lowest-rate swipe search
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900">
              Stop overpaying on every swipe
            </h2>
            <p className="mt-3 text-stone-600">
              We re-shop live swipe, chip and keyed rates weekly, then route each transaction down the cheapest
              compliant path. Move the sliders to see your number.
            </p>
            <div className="mt-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-stone-700">
                  <span>Monthly card volume</span>
                  <span>{formatMoney(volume)}</span>
                </div>
                <input type="range" min={5000} max={250000} step={1000} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold text-stone-700">
                  <span>Average ticket</span>
                  <span>${ticket}</span>
                </div>
                <input type="range" min={4} max={80} step={1} value={ticket}
                  onChange={(e) => setTicket(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-600" />
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-900">
                  Switching to <strong>{ranked[0].name}</strong> saves about{' '}
                  <strong>{formatMoney(savings)}</strong>/mo — {formatMoney(savings * 12)} a year.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Processor</th>
                  <th className="px-4 py-3">Swipe</th>
                  <th className="px-4 py-3">Per txn</th>
                  <th className="px-4 py-3 text-right">Est. monthly</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p, i) => (
                  <tr key={p.id} className={i === 0 ? 'bg-emerald-50/60' : 'border-t border-stone-100'}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-semibold text-stone-900">
                        {p.name}
                        {i === 0 && (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            Best
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-stone-500">{p.note}</p>
                    </td>
                    <td className="px-4 py-4 text-stone-700">{p.swipeRate.toFixed(2)}%</td>
                    <td className="px-4 py-4 text-stone-700">${p.perTxn.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right font-bold text-stone-900">{formatMoney(p.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-stone-100 p-4">
              <Link to="/products/processing-rate-audit" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
                Get a free statement audit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- REWARDS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Pick a rewards program in one tap</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Guests join with a phone number at the terminal. No app, no plastic card, no separate vendor bill.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REWARD_PROGRAMS.map((r) => (
              <div key={r.id} className="rounded-2xl border border-stone-200 p-6 transition hover:border-amber-400 hover:shadow-md">
                <Gift className="h-6 w-6 text-amber-600" />
                <h3 className="mt-3 font-bold text-stone-900">{r.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{r.rule}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-400">{r.best}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED HARDWARE ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Hardware, spec&apos;d for your concept</h2>
            <p className="mt-3 max-w-2xl text-stone-600">
              Ships pre-loaded with your menu. Free shipping on every order.
            </p>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 sm:inline-flex">
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div className="mt-8 sm:hidden">
          <Link to="/shop" className="block rounded-xl border border-stone-300 py-3 text-center font-semibold text-stone-700">
            Shop all hardware
          </Link>
        </div>
      </section>

      {/* ---------------- PARTNERS / AFFILIATE ---------------- */}
      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Vetted partners, member pricing</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Once your menu is in, we recommend the services a shop your size actually needs — and negotiate the rate.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PARTNER_SERVICES.map((p) => (
              <div key={p.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{p.category}</span>
                <h3 className="mt-1 font-bold text-stone-900">{p.name}</h3>
                <p className="mt-2 text-sm text-stone-600">{p.offer}</p>
                <p className="mt-auto pt-3 text-xs font-semibold text-emerald-700">{p.payout}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Simple software pricing</h2>
          <p className="mt-3 text-stone-600">No setup fees. No per-order commission. Cancel any month.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-3xl border p-7 ${
                p.highlight ? 'border-amber-500 bg-stone-900 text-white shadow-2xl lg:-translate-y-3' : 'border-stone-200 bg-white'
              }`}
            >
              {p.highlight && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase text-stone-900">
                  Most popular
                </span>
              )}
              <h3 className={`text-xl font-extrabold ${p.highlight ? 'text-white' : 'text-stone-900'}`}>{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? 'text-stone-300' : 'text-stone-600'}`}>{p.blurb}</p>
              <p className="mt-5">
                <span className={`text-4xl font-extrabold ${p.highlight ? 'text-amber-400' : 'text-stone-900'}`}>
                  ${p.price}
                </span>
                <span className={`text-sm ${p.highlight ? 'text-stone-400' : 'text-stone-500'}`}>{p.per}</span>
              </p>
              <ul className="mt-6 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/onboarding"
                className={`mt-7 rounded-xl py-3 text-center font-bold transition ${
                  p.highlight ? 'bg-amber-500 text-stone-900 hover:bg-amber-400' : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Owners who launched themselves</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <div className="flex gap-0.5 text-amber-500">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-stone-700">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4">
                  <p className="font-bold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.shop}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Send your menu. Get your store back in 48 hours.
            </h2>
            <p className="mt-3 text-stone-900/80">
              We build the POS layout, ordering site, one-page website and rewards program — then hand you the keys.
            </p>
          </div>
          <div className="rounded-3xl bg-stone-900 p-6">
            <SignupForm
              source="popup"
              tags={['waitlist', 'launch-request']}
              cta="Build my store free"
              dark
              heading="Claim a free build slot"
              sub="We open 25 launch slots a week."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AppLayout;
