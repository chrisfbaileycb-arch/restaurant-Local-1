import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, MapPin, Upload, Save, Check, Loader2, Link2, Briefcase, ImageIcon, Trash2,
  Megaphone, Phone, RefreshCw, MessageSquare, Star, ExternalLink, ShoppingBag, Eye,
  Palette, Sparkles, Smartphone, Monitor, X,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { loadShopMenu, DEMO_LOADED_MENU, type LoadedMenu } from '@/lib/menuStore';
import { askCopilot } from '@/components/site/CopilotDock';
import WebsiteMenuPanel from '@/components/site/WebsiteMenuPanel';
import OnePageSiteTemplate from '@/components/website/OnePageSiteTemplate';
import {
  loadSiteSettings, saveSiteSettings, uploadShopMedia, emptySiteSettings, fetchGooglePlace, placeToSettings,
  SITE_SECTIONS, SOCIAL_FIELDS, missingSitePieces, type SiteSettings, type GooglePlaceResult,
} from '@/lib/siteSettings';

/** Small on/off switch used across the panels. */
const Toggle: React.FC<{ on: boolean; onChange: () => void; label: string }> = ({ on, onChange, label }) => (
  <button
    onClick={onChange}
    role="switch"
    aria-checked={on}
    aria-label={label}
    className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-emerald-600' : 'bg-stone-300'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
  </button>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</label>
    {children}
    {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
  </div>
);

const inputCls = 'mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500';

/** Dashboard → Website: the real, saved one-page site the copilot reads and writes. */
const WebsiteSettings: React.FC = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState<LoadedMenu>(DEMO_LOADED_MENU);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('your shop');
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'logo' | 'dish' | null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [place, setPlace] = useState<GooglePlaceResult | null>(null);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [walkthroughDevice, setWalkthroughDevice] = useState<'phone' | 'desktop'>('phone');
  const logoInput = useRef<HTMLInputElement>(null);
  const dishInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadShopMenu(user?.id || null).then(async (m) => {
      if (cancelled) return;
      setMenu(m);
      setShopName(m.isDemo ? 'your shop' : m.shopName);
      setShopId(m.shopId);
      if (m.shopId) {
        const s = await loadSiteSettings(m.shopId);
        if (!cancelled) {
          const next = s || emptySiteSettings(m.shopId);
          setForm(next);
          setPlaceQuery(next.google_place_id || (m.isDemo ? '' : m.shopName));
        }
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const patch = (p: Partial<SiteSettings>) => {
    setForm((f) => (f ? { ...f, ...p } : f));
    setSaved(false);
  };

  const toggleSection = (id: string) => {
    if (!form) return;
    const on = form.section_order.includes(id);
    patch({
      section_order: on
        ? form.section_order.filter((s) => s !== id)
        : SITE_SECTIONS.map((s) => s.id).filter((s) => s === id || form.section_order.includes(s)),
    });
  };

  const syncGoogle = async () => {
    if (!placeQuery.trim()) return;
    setSyncing(true);
    setError('');
    setPlace(null);
    try {
      const result = await fetchGooglePlace(placeQuery.trim());
      if (!result.success) {
        setError(result.error || 'Google did not find that listing.');
      } else {
        setPlace(result);
        patch(placeToSettings(result));
      }
    } catch (e: any) {
      setError(e.message || 'Google lookup failed');
    } finally {
      setSyncing(false);
    }
  };

  const upload = async (file: File | undefined, kind: 'logo' | 'dish') => {
    if (!file || !shopId || !form) return;
    setUploading(kind);
    setError('');
    try {
      const url = await uploadShopMedia(file, shopId, kind);
      if (kind === 'logo') patch({ logo_url: url });
      else patch({ photos: [url, ...form.photos].slice(0, 12) });
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const next = await saveSiteSettings(form);
      setForm(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your website setup…
      </div>
    );
  }

  if (!shopId || !form) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <Globe className="mx-auto h-6 w-6 text-amber-600" />
        <p className="mt-3 font-bold text-stone-900">No shop built yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
          Upload a menu in the setup wizard first — then your domain, Google listing, banner, photos and sections all save here.
        </p>
        <a href="/onboarding" className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          Build my store
        </a>
      </div>
    );
  }

  const gaps = missingSitePieces(form);

  return (
    <div className="space-y-6">
      {/* Header + save */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <h2 className="font-bold text-stone-900">Website setup for {shopName}</h2>
          <p className="text-sm text-stone-600">
            {gaps.length ? `Still needed: ${gaps.join(', ')}.` : 'Everything is saved — this page is ready to publish.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWalkthroughModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
          >
            <Eye className="h-4 w-4 text-amber-600" />
            Live Walkthrough Demo
          </button>
          <Link
            to="/templates-logo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <Palette className="h-4 w-4 text-fuchsia-600" />
            Vibe &amp; Logo Studio
          </Link>
          <button
            onClick={() => askCopilot('Build my website page')}
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-400"
          >
            Ask copilot
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save settings'}
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      {/* Announcement banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <Megaphone className="h-4 w-4 text-amber-600" /> Announcement banner
            </p>
            <p className="text-xs text-stone-500">One line across the very top of the page — specials, weather, holiday hours.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">{form.announcement_on ? 'Showing' : 'Hidden'}</span>
            <Toggle on={form.announcement_on} onChange={() => patch({ announcement_on: !form.announcement_on })} label="Show banner" />
          </div>
        </div>
        <input
          value={form.announcement || ''}
          onChange={(e) => patch({ announcement: e.target.value })}
          placeholder="Friday fish fry, 4–8pm. Patio open."
          maxLength={140}
          className={inputCls}
        />
        {form.announcement && form.announcement_on && (
          <div className="mt-3 rounded-xl bg-stone-900 px-4 py-2.5 text-center text-sm font-bold text-amber-300">
            {form.announcement}
          </div>
        )}
        {form.holiday_note && (
          <p className="mt-2 text-xs font-semibold text-stone-600">Holiday hours note on file: {form.holiday_note}</p>
        )}
        <button
          onClick={() => askCopilot('Post a banner about ')}
          className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800"
        >
          Or just tell the copilot: “Post a banner about our Friday fish fry”
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Google Business sync */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <MapPin className="h-4 w-4 text-amber-600" /> Google Business sync
            </p>
            <p className="text-xs text-stone-500">
              Enter your Place ID, profile link or business name. We pull the verified address, weekly hours, phone and map link.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Smith's Diner, Asheville NC — or ChIJ… place ID"
              className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
            <button
              onClick={syncGoogle}
              disabled={syncing || !placeQuery.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
          </div>

          {(form.address || form.phone || form.hours.length > 0) && (
            <div className="space-y-2 rounded-xl border border-stone-200 p-4">
              {form.business_name && <p className="text-sm font-bold text-stone-900">{form.business_name}</p>}
              {form.address && (
                <p className="flex items-start gap-2 text-sm text-stone-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" /> {form.address}
                </p>
              )}
              {form.phone && (
                <p className="flex items-center gap-2 text-sm text-stone-700">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  <a href={`tel:${form.phone}`} className="font-semibold text-amber-700">{form.phone}</a>
                </p>
              )}
              {place?.rating != null && (
                <p className="flex items-center gap-1.5 text-sm text-stone-700">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> {place.rating} ({place.reviewCount} reviews)
                </p>
              )}
              {form.hours.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {form.hours.map((h) => (
                    <li key={h} className="text-xs text-stone-600">{h}</li>
                  ))}
                </ul>
              )}
              {form.map_url && (
                <a
                  href={form.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700"
                >
                  Open map &amp; directions <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {form.google_synced_at && (
                <p className="text-[11px] text-stone-400">Last synced {new Date(form.google_synced_at).toLocaleString()}</p>
              )}
            </div>
          )}

          <Field label="Domain name" hint="We register or transfer it, run the SSL and renew it for you.">
            <input
              value={form.domain || ''}
              onChange={(e) => patch({ domain: e.target.value })}
              placeholder="yourshop.com"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Media */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <ImageIcon className="h-4 w-4 text-amber-600" /> Media &amp; photos
          </p>
          <div className="flex items-center gap-4">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Shop logo" className="h-20 w-20 rounded-xl border border-stone-200 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-stone-300 text-xs text-stone-400">
                No logo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input ref={logoInput} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0], 'logo')} />
              <button
                onClick={() => logoInput.current?.click()}
                disabled={uploading === 'logo'}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-stone-400 disabled:opacity-50"
              >
                {uploading === 'logo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {form.logo_url ? 'Replace logo' : 'Upload logo'}
              </button>
              {form.logo_url && (
                <button onClick={() => patch({ logo_url: null })} className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <input
              ref={dishInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => upload(e.target.files?.[0], 'dish')}
            />
            <button
              onClick={() => dishInput.current?.click()}
              disabled={uploading === 'dish'}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-stone-400 disabled:opacity-50"
            >
              {uploading === 'dish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Add a dish or storefront photo
            </button>
            <p className="mt-2 text-xs text-stone-500">
              Shoot it on the phone or tablet at the register — it lands in this grid and on the menu cards.
            </p>
            {form.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {form.photos.map((p) => (
                  <div key={p} className="group relative">
                    <img src={p} alt="Shop" className="h-20 w-full rounded-lg border border-stone-200 object-cover" />
                    <button
                      onClick={() => patch({ photos: form.photos.filter((x) => x !== p) })}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-stone-600 opacity-0 transition group-hover:opacity-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field label="About / story" hint="Two or three lines under the menu. Say it to the copilot and it writes here too.">
            <textarea
              value={form.story || ''}
              onChange={(e) => patch({ story: e.target.value })}
              rows={3}
              placeholder="Family-run since 2016. Everything smoked in-house, biscuits rolled every morning."
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Live menu & ordering — reads the POS catalog */}
      <WebsiteMenuPanel menu={menu} orderingOn={form.ordering_enabled} domain={form.domain} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Social & contact */}
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Link2 className="h-4 w-4 text-amber-600" /> Social &amp; contact
          </p>
          {SOCIAL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                value={(form.socials as any)?.[f.key] || ''}
                onChange={(e) => patch({ socials: { ...form.socials, [f.key]: e.target.value } })}
                placeholder={f.placeholder}
                className={inputCls}
              />
            </Field>
          ))}
          <Field label="Phone shown on the page" hint="Click-to-call on a phone. Synced from Google, editable here.">
            <input
              value={form.phone || ''}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="(828) 555-0134"
              className={inputCls}
            />
          </Field>

          <div className="space-y-2 pt-1">
            {[
              { on: form.inquiry_enabled, key: 'inquiry_enabled', icon: MessageSquare, title: 'Customer inquiry form', body: 'Catering, private events and questions land in your dashboard.' },
              { on: form.ordering_enabled, key: 'ordering_enabled', icon: ShoppingBag, title: '0% commission online ordering', body: 'Same menu as the register, no third-party cut.' },
              { on: form.hiring_enabled, key: 'hiring_enabled', icon: Briefcase, title: 'Hiring form', body: 'Applications land in your dashboard instead of your inbox.' },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.key} className="flex items-start gap-3 rounded-xl border border-stone-200 p-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900">{row.title}</p>
                    <p className="text-xs text-stone-500">{row.body}</p>
                  </div>
                  <Toggle on={row.on} onChange={() => patch({ [row.key]: !row.on } as any)} label={row.title} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm font-bold text-stone-900">Page sections</p>
          <p className="text-xs text-stone-500">Everything on your one-page site, top to bottom. Switch off anything you do not want.</p>
          <ul className="mt-3 space-y-2">
            {SITE_SECTIONS.map((s) => {
              const on = form.section_order.includes(s.id);
              return (
                <li key={s.id} className="flex items-start gap-3 rounded-xl border border-stone-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">{s.title}</p>
                    <p className="truncate text-xs text-stone-500">{s.summary}</p>
                  </div>
                  <Toggle on={on} onChange={() => toggleSection(s.id)} label={`${on ? 'Hide' : 'Show'} ${s.title}`} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Live Walkthrough Overlay Demo for paying / setup customers */}
      {showWalkthroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white shadow">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Live Landing Page Walkthrough · {form.business_name || shopName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full customer-facing experience with Google Maps directions, online ordering, about bio, and socials.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device switch */}
                <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700">
                  <button
                    onClick={() => setWalkthroughDevice('phone')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      walkthroughDevice === 'phone' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setWalkthroughDevice('desktop')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      walkthroughDevice === 'desktop' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowWalkthroughModal(false)}
                  className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Live rendered landing page */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex justify-center items-start">
              <div className={`w-full transition-all duration-300 ${walkthroughDevice === 'phone' ? 'max-w-sm' : 'max-w-2xl'}`}>
                <OnePageSiteTemplate
                  shopName={form.business_name || shopName}
                  tagline={form.story ? form.story.slice(0, 70) + '...' : 'Craft fresh dining · Farm to table'}
                  conceptId="dine-in"
                  items={menu.items.map((it, idx) => ({
                    name: it.name,
                    price: it.priceCents,
                    note: it.description || 'Prepared fresh to order.',
                    modifiers: idx % 3,
                  }))}
                  hours={form.hours.map((h) => {
                    const [d, ...t] = h.split(': ');
                    return { day: d, open: t.join(': ') || '11:00 AM – 9:00 PM', closed: false };
                  })}
                  address={form.address || '412 Harbor St, Riverside'}
                  phone={form.phone || '(828) 555-0134'}
                  mapUrl={form.map_url || undefined}
                  logoUrl={form.logo_url}
                  socials={Object.keys(form.socials).length > 0 ? Object.keys(form.socials) : ['Instagram', 'Facebook', 'Google Reviews']}
                  hiring={form.hiring_enabled}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-6 py-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live 0% Commission Direct Ordering Activated</span>
              </div>
              <Link
                to="/templates-logo"
                onClick={() => setShowWalkthroughModal(false)}
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300"
              >
                Customize Logo &amp; Palette in Vibe Studio <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteSettings;
