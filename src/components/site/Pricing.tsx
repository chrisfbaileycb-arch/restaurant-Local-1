import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Globe, ArrowRight, Wallet, CalendarClock } from 'lucide-react';

import Reveal from '@/components/site/Reveal';
import { PLANS, SETUP_FEE, HOSTING_DISCOUNT, BILLING_STEPS } from '@/data/platform';

const Pricing: React.FC = () => {
  const [wantsSite, setWantsSite] = useState(true);
  const selected = PLANS.find((p) => p.hosting === wantsSite) || PLANS[0];
  const firstYear = SETUP_FEE + selected.price * 12;

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          One price. Website hosting is the only choice.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          A one-time <strong className="text-slate-900">${SETUP_FEE} setup</strong> covers the build. Your monthly
          does not start until you go live — take two weeks or two months, we do not care.
        </p>
      </Reveal>

      {/* hosting toggle */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setWantsSite(true)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              wantsSite ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Globe className="h-4 w-4" /> Host my website
          </button>
          <button
            onClick={() => setWantsSite(false)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              !wantsSite ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            I have a website — save ${HOSTING_DISCOUNT}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {PLANS.map((p, i) => {
          const active = p.hosting === wantsSite;
          return (
            <Reveal key={p.id} delay={i * 100}>
              <div
                className={`flex h-full flex-col rounded-3xl border p-7 transition ${
                  active
                    ? 'border-transparent bg-gradient-to-br from-rose-600 via-fuchsia-600 to-orange-500 text-white shadow-2xl lg:-translate-y-2'
                    : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-extrabold ${active ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                  {p.hosting && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${active ? 'bg-amber-300 text-slate-900' : 'bg-rose-100 text-rose-600'}`}>
                      <Globe className="h-3 w-3" /> Hosting included
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-sm ${active ? 'text-white/85' : 'text-slate-600'}`}>{p.blurb}</p>

                <p className="mt-5">
                  <span className={`text-5xl font-extrabold ${active ? 'text-amber-200' : 'text-slate-900'}`}>
                    ${p.price}
                  </span>
                  <span className={`text-sm ${active ? 'text-white/70' : 'text-slate-500'}`}>{p.per}</span>
                </p>
                <p className={`mt-1 text-xs font-bold uppercase tracking-wide ${active ? 'text-white/70' : 'text-slate-400'}`}>
                  + ${SETUP_FEE} one-time setup · billing starts at go-live
                </p>

                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${active ? 'text-white/90' : 'text-slate-700'}`}>
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-amber-200' : 'text-emerald-500'}`} /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/onboarding"
                  className={`mt-7 rounded-xl py-3 text-center font-extrabold transition hover:scale-[1.02] ${
                    active ? 'bg-white text-rose-600' : 'bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* billing timeline */}
      <Reveal className="mt-10 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-white p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
            <CalendarClock className="h-3.5 w-3.5" /> How billing works
          </span>
          <p className="text-sm font-bold text-emerald-900">
            ${SETUP_FEE} today. ${selected.price}/mo the day you open — not a day sooner.
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
            <Wallet className="h-4 w-4" /> First 12 months, all in: ${firstYear.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> No commission on your orders
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> Month to month, cancel any time
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" /> Hardware sold separately, at cost-plus
          </span>
        </div>
      </Reveal>
    </section>
  );
};

export default Pricing;
