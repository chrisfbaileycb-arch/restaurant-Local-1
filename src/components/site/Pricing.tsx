import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Wallet, CalendarClock, Star, Nfc, Smartphone } from 'lucide-react';

import Reveal from '@/components/site/Reveal';
import {
  PLANS, PRICING_HEADLINE, PRICING_SUBHEAD, PREPAY_OPTIONS, BILLING_STEPS,
  prepayEffective, prepayTotal,
} from '@/data/platform';

const Pricing: React.FC = () => {
  // Which tier the prepay math and the billing timeline are quoting.
  const [planId, setPlanId] = useState(PLANS[0].id);
  const selected = PLANS.find((p) => p.id === planId) || PLANS[0];
  const firstYear = selected.setup + selected.price * 12;

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
          <Nfc className="h-3.5 w-3.5" /> Tap to Pay & camera scan included
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {PRICING_HEADLINE}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">{PRICING_SUBHEAD}</p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {PLANS.map((p, i) => {
          const active = p.id === planId;
          const popular = !!p.badge;
          return (
            <Reveal key={p.id} delay={i * 100}>
              {/* Clicking the card selects the tier the prepay math quotes. */}
              <div
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => setPlanId(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPlanId(p.id);
                  }
                }}
                className={`flex h-full cursor-pointer flex-col rounded-3xl border p-7 text-left transition ${
                  popular
                    ? 'border-transparent bg-gradient-to-br from-rose-600 via-fuchsia-600 to-orange-500 text-white shadow-2xl lg:-translate-y-2'
                    : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl'
                } ${active ? 'ring-4 ring-amber-300/70' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`text-xl font-extrabold ${popular ? 'text-white' : 'text-slate-900'}`}>
                    {p.name}
                  </h3>
                  {popular && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-900">
                      <Star className="h-3 w-3 fill-current" /> {p.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-sm ${popular ? 'text-white/85' : 'text-slate-600'}`}>{p.blurb}</p>

                <p className="mt-5">
                  <span className={`text-5xl font-extrabold ${popular ? 'text-amber-200' : 'text-slate-900'}`}>
                    ${p.price}
                  </span>
                  <span className={`text-sm ${popular ? 'text-white/70' : 'text-slate-500'}`}> / month</span>
                </p>
                <p className={`mt-1 text-xs font-bold uppercase tracking-wide ${popular ? 'text-white/75' : 'text-slate-400'}`}>
                  + ${p.setup} one-time setup · billing starts at go-live
                </p>

                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${popular ? 'text-white/90' : 'text-slate-700'}`}>
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${popular ? 'text-amber-200' : 'text-emerald-500'}`} /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/onboarding"
                  className={`mt-7 rounded-xl py-3 text-center font-extrabold transition hover:scale-[1.02] ${
                    popular ? 'bg-white text-rose-600' : 'bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>

          );
        })}
      </div>

      {/* zero-hardware promise */}
      <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-semibold text-violet-900">
        <span className="inline-flex items-center gap-2">
          <Smartphone className="h-4 w-4" /> Runs on the iPad, tablet, phone or laptop you already own
        </span>
        <span className="inline-flex items-center gap-2">
          <Nfc className="h-4 w-4" /> Tap to Pay on the device — zero dongles
        </span>
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" /> No contracts, cancel any month
        </span>
      </Reveal>

      {/* prepay incentives */}
      <Reveal className="mt-8 grid gap-4 sm:grid-cols-2">
        {PREPAY_OPTIONS.map((o) => {
          const effective = prepayEffective(selected.price, o);
          const total = prepayTotal(selected.price, o);
          return (
            <div
              key={o.id}
              className="hover-lift flex flex-col rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Prepay & save</p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                {o.label}: {o.detail}
              </h3>
              <p className="mt-2 text-sm text-emerald-900">
                On {selected.name} that is{' '}
                <strong>${effective}/mo effective</strong> — <strong>${total.toLocaleString()}</strong>{' '}
                for {o.months} months instead of ${(selected.price * o.months).toLocaleString()}.
              </p>
              <p className="mt-2 text-xs font-bold text-emerald-700">
                You keep {o.freeMonths} month{o.freeMonths > 1 ? 's' : ''} free · still no contract after it ends.
              </p>
              <Link
                to="/onboarding"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700"
              >
                Lock this in <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </Reveal>

      {/* billing timeline */}
      <Reveal className="mt-10 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-white p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
            <CalendarClock className="h-3.5 w-3.5" /> How billing works
          </span>
          <p className="text-sm font-bold text-emerald-900">
            ${selected.setup} today. ${selected.price}/mo the day you open — not a day sooner.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {BILLING_STEPS.map((s, i) => (
            <div key={s.id} className="relative rounded-2xl border border-white bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 text-sm font-extrabold text-white shadow">
                {s.id}
              </span>
              {i < BILLING_STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-8 hidden h-5 w-5 animate-bob-x text-emerald-400 md:block" />
              )}
              <h4 className="mt-3 text-sm font-extrabold text-slate-900">{s.title}</h4>
              <p className="mt-1 text-xs text-slate-600">{s.body}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-emerald-600">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-emerald-900">
          <span className="inline-flex items-center gap-2 font-bold">
            <Wallet className="h-4 w-4" /> First 12 months on {selected.name}: ${firstYear.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> 0% commission on your online orders
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> Month to month, cancel any time
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> Optional hardware, at cost-plus
          </span>
        </div>
      </Reveal>
    </section>
  );
};

export default Pricing;
