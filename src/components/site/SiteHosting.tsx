import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, ShoppingBag, Clock, MapPin, ClipboardList, Share2, ImageIcon,
  RefreshCw, Check, ArrowRight, Phone, Instagram, Facebook, Star, Camera, Bot, Sparkles,
} from 'lucide-react';


import Reveal from '@/components/site/Reveal';
import { askCopilot } from '@/components/site/CopilotDock';
import { BRAND, SITE_BLOCKS, DEMO_HOURS, SOCIAL_LINKS } from '@/data/platform';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, Clock, MapPin, ClipboardList, Share2, ImageIcon,
};

const TONES = [
  'from-fuchsia-500 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-sky-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-indigo-500',
  'from-rose-500 to-red-500',
];

// The whole page a guest ever sees, in order.
const PREVIEW_TABS = [
  { id: 'order', label: 'Order' },
  { id: 'cards', label: 'Menu cards' },
  { id: 'hours', label: 'Hours' },
  { id: 'contact', label: 'Contact' },
  { id: 'hiring', label: 'Hiring' },
] as const;

type TabId = (typeof PREVIEW_TABS)[number]['id'];

const SiteHosting: React.FC = () => {
  const [tab, setTab] = useState<TabId>('order');
  const [detail, setDetail] = useState(SITE_BLOCKS[0]);
  const [menu, setMenu] = useState<LoadedMenu>(DEMO_LOADED_MENU);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState('just now');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    loadShopMenu(null).then(setMenu).catch(() => setMenu(DEMO_LOADED_MENU));
  }, []);

  const cards = menu.items.slice(0, 4);

  const runSync = () => {
    setSyncing(true);
    setTab('hours');
    window.setTimeout(() => {
      setSyncing(false);
      setSyncedAt('a moment ago');
    }, 1400);
  };

  const todayIdx = new Date().getDay(); // 0 = Sun
  const todayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][todayIdx];

  return (
    <section id="website" className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/60 to-white py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-rose-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 animate-blob rounded-full bg-amber-200/50 blur-3xl [animation-delay:3s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
            <Globe className="h-3.5 w-3.5" /> Website hosting included
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            One page. One job. <span className="text-gradient-vibe">Get them fed.</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Nobody spends twenty minutes reading a restaurant website — they want a photo, the hours and an order
            button. So we host you a single, fast page with exactly that: online ordering, menu place cards, hours
            pulled straight from your Google Business Profile, contact, an employment application and your social
            links. Domain, SSL, updates and uptime are ours to worry about.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          {/* ---------- Animated phone preview of the hosted page ---------- */}
          <Reveal>
            <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate">https://{menu.isDemo ? 'riverside-fish-co' : menu.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.com</span>
                </div>
                <button
                  onClick={runSync}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:scale-105"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Reading Google…' : 'Sync Google hours'}
                </button>
              </div>

              {/* tabs = sections of the single page */}
              <div className="mt-4 flex flex-wrap gap-2">
                {PREVIEW_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTab(t.id);
                      const b = SITE_BLOCKS.find((s) => s.id === t.id);
                      if (b) setDetail(b);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      tab === t.id
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 min-h-[330px] rounded-2xl bg-slate-900 p-4 text-white">
                {/* mini site header always visible */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <p className="text-sm font-extrabold">{menu.isDemo ? 'Riverside Fish Co.' : menu.shopName}</p>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    Open now
                  </span>
                </div>

                {tab === 'order' && (
                  <div className="animate-pop-in space-y-3 pt-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Pickup in ~15 min</p>
                    {cards.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                        <span className="truncate text-sm">{m.name}</span>
                        <span className="ml-3 shrink-0 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-slate-900">
                          Add ${(m.price / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <button className="w-full animate-tap-ping rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-extrabold">
                      Order now · 0% commission
                    </button>
                  </div>
                )}

                {tab === 'cards' && (
                  <div className="animate-pop-in pt-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Photos you upload in the owner dashboard
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {cards.map((m, i) => (
                        <div key={m.id} className="overflow-hidden rounded-xl bg-white/5">
                          <div className={`flex h-16 items-center justify-center bg-gradient-to-br ${TONES[i % TONES.length]}`}>
                            <Camera className="h-5 w-5 text-white/80" />
                          </div>
                          <div className="p-2">
                            <p className="line-clamp-1 text-[11px] font-semibold">{m.name}</p>
                            <p className="text-[11px] font-bold text-amber-300">${(m.price / 100).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">
                      Added in your dashboard → live on the page and on the POS button in seconds.
                    </p>
                  </div>
                )}

                {tab === 'hours' && (
                  <div className="animate-pop-in pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Hours</p>
                      <span className={`text-[10px] font-bold ${syncing ? 'text-sky-300' : 'text-emerald-300'}`}>
                        {syncing ? 'Reading Google Business…' : `Google synced ${syncedAt}`}
                      </span>
                    </div>
                    <ul className={`mt-3 space-y-1.5 transition ${syncing ? 'opacity-40' : 'opacity-100'}`}>
                      {DEMO_HOURS.map((h) => (
                        <li
                          key={h.day}
                          className={`flex justify-between rounded-lg px-3 py-1.5 text-sm ${
                            h.day === todayLabel ? 'bg-white/10 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <span>{h.day}</span>
                          <span>{h.hours}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] text-slate-400">
                      Change them once in Google — the page follows within the hour.
                    </p>
                  </div>
                )}

                {tab === 'contact' && (
                  <div className="animate-pop-in space-y-3 pt-4">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                      <Phone className="h-4 w-4 text-emerald-300" /> {BRAND.supportPhone}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-rose-300" /> 412 River St · Tap for directions
                    </div>
                    <textarea
                      readOnly
                      value="Do you take large catering orders on Fridays?"
                      className="h-16 w-full resize-none rounded-xl bg-white/5 p-3 text-xs text-slate-300"
                    />
                    <button className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-2.5 text-sm font-extrabold text-slate-900">
                      Send message
                    </button>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SOCIAL_LINKS.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                          {s === 'Instagram' && <Instagram className="h-3 w-3" />}
                          {s === 'Facebook' && <Facebook className="h-3 w-3" />}
                          {s === 'Google Reviews' && <Star className="h-3 w-3 fill-current text-amber-300" />}
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'hiring' && (
                  <div className="animate-pop-in space-y-2.5 pt-4">
                    <p className="inline-flex items-center gap-2 rounded-full bg-lime-400/20 px-3 py-1 text-[11px] font-bold text-lime-300">
                      Now hiring · 2 open roles
                    </p>
                    {['Full name', 'Phone number', 'Role you want', 'Days you can work'].map((f) => (
                      <div key={f} className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-400">{f}</div>
                    ))}
                    <button
                      onClick={() => setApplied(true)}
                      className="w-full rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 py-2.5 text-sm font-extrabold text-slate-900"
                    >
                      {applied ? 'Application sent to the owner' : 'Apply now'}
                    </button>
                    <p className="text-[11px] text-slate-400">
                      Lands in the owner dashboard, not a shoebox by the register.
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Tap the sections — this is the entire website a guest ever sees.
              </p>
            </div>
          </Reveal>

          {/* ---------- What is on the page ---------- */}
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SITE_BLOCKS.map((b, i) => {
                const Icon = ICONS[b.icon] || Globe;
                const active = detail.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setDetail(b);
                      if (PREVIEW_TABS.some((t) => t.id === b.id)) setTab(b.id as TabId);
                    }}
                    className={`hover-lift flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                      active ? 'border-rose-300 bg-white shadow-md ring-2 ring-rose-200' : 'border-white bg-white shadow-sm'
                    }`}
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${TONES[i % TONES.length]} text-white shadow`}>
                      <Icon className="h-5 w-5" />

                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">{b.title}</h3>
                    <p className="mt-1 text-xs leading-snug text-slate-600">{b.body}</p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-rose-500">{b.source}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <h4 className="font-extrabold text-slate-900">{detail.title}</h4>
              <p className="mt-1 text-sm text-slate-600">{detail.body}</p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {detail.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/templates"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-extrabold text-white shadow"
                >
                  <Sparkles className="h-4 w-4" /> Templates, samples &amp; logo maker
                </Link>
                <button
                  onClick={() => askCopilot('Build my website page')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-2.5 text-sm font-extrabold text-white shadow"
                >
                  <Bot className="h-4 w-4" /> Have the copilot design my page
                </button>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 hover:text-orange-700"
                >
                  Get this page built for me <ArrowRight className="h-4 w-4 animate-bob-x" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SiteHosting;
