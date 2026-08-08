import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Tablet, Printer, Wallet, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import BudgetBuilder from '@/components/site/BudgetBuilder';
import ProductCard from '@/components/ProductCard';
import { BUDGET_TAG, formatCents, SETUP_FEE, PLANS } from '@/data/platform';


const PROMISES = [
  {
    icon: Smartphone,
    title: 'Phone-only mode for trucks',
    body: 'Run the full POS on the phone in your pocket — tap payments, receipts, kitchen tickets and offline orders on cell data.',
  },
  {
    icon: Tablet,
    title: 'Any tablet works',
    body: 'Bring a tablet you already own, or add our $149 10" touchscreen. No proprietary terminal required.',
  },
  {
    icon: Printer,
    title: 'Cheap printers, real tickets',
    body: 'A $99 Bluetooth receipt printer for guests and a $149 WiFi ticket printer for the line.',
  },
  {
    icon: Wallet,
    title: 'No big first payout',
    body: `Just a $${SETUP_FEE} one-time setup, free shipping and nothing due for install. Monthly software does not start until you go live.`,
  },
];

const FAQS = [
  {
    q: 'Do I have to buy a terminal to start?',
    a: 'No. Love Local Eats POS runs in a browser on the phone or tablet you already own. Hardware is optional — most trucks start with just a $49 tap reader.',
  },
  {
    q: 'What happens when the WiFi or cell signal drops?',
    a: 'Orders keep ringing up on the device and queue locally. The moment a connection returns — WiFi or cell data — everything syncs, including card payments captured offline.',
  },
  {
    q: 'Can I add gear later without redoing setup?',
    a: 'Yes. Every device pairs to the same menu and reports. Add a cash drawer in month two and a kitchen printer in month six — nothing gets rebuilt.',
  },
  {
    q: 'What does the software actually cost?',
    a: `$${PLANS[1].price}/mo per location for the POS, or $${PLANS[0].price}/mo if we also host your one-page website with online ordering, Google-synced hours, contact, hiring form and menu photos. Both are month to month.`,
  },
  {
    q: 'When does billing start?',
    a: `You pay a $${SETUP_FEE} setup fee when you sign up, and nothing else while we build. Take two weeks or take two months — the monthly charge only begins the day your build goes live and you start taking orders.`,
  },
];


const StarterKit: React.FC = () => {
  const [budget, setBudget] = useState<any[]>([]);
  const [cheapest, setCheapest] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('ecom_products')
      .select('*, variants:ecom_product_variants(*)')
      .eq('status', 'active')
      .contains('tags', [BUDGET_TAG])
      .order('price')
      .then(({ data }) => {
        setBudget(data || []);
        if (data && data.length) setCheapest(data[0].price);
      });
  }, []);

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-stone-200 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <Wallet className="h-3.5 w-3.5" /> No sticker shock
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Open your shop for less than a slow Tuesday.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-300">
            Cheap touchscreen tablets, stands, a locking cash drawer, card readers and printers — plus a phone-only
            setup for food trucks. Pick only what you need, see the exact total before you pay, and add the rest when
            business is good.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#builder"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-stone-900 transition hover:bg-amber-400"
            >
              Build my kit <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/collections/budget-starter"
              className="rounded-xl border border-stone-600 px-6 py-3 font-semibold text-white transition hover:bg-stone-800"
            >
              Browse all budget gear
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-stone-300">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-400" /> Free shipping on everything
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> ${SETUP_FEE} setup · billing starts at go-live
            </span>

            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              {cheapest != null ? `Cheapest way in: ${formatCents(cheapest)}` : 'Start from under $50'}
            </span>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-stone-200 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-bold text-stone-900">{p.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Builder */}
      <section id="builder" className="bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BudgetBuilder />
        </div>
      </section>

      {/* Budget gear grid */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">Every budget piece, à la carte</h2>
              <p className="mt-1 text-stone-600">Buy one thing today, add the next when you are ready.</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-amber-700 hover:underline">
              See the full hardware shop →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {budget.length === 0
              ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-stone-200" />
                ))
              : budget.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-stone-200 bg-stone-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">Straight answers on cost</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-stone-200 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-stone-900">
                  {f.q}
                  <span className="float-right text-stone-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-stone-900 p-6 text-white sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold">Not sure what you need?</p>
              <p className="text-sm text-stone-300">
                Upload your menu and we spec the cheapest setup that actually fits your concept.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="mt-4 inline-block rounded-xl bg-amber-500 px-6 py-3 font-bold text-stone-900 transition hover:bg-amber-400 sm:mt-0"
            >
              Upload my menu
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default StarterKit;
