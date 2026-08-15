import React, { useEffect, useRef, useState } from 'react';
import { Globe, MapPin, Upload, Save, Check, Loader2, Link2, Briefcase, ImageIcon, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { loadShopMenu } from '@/lib/menuStore';
import { askCopilot } from '@/components/site/CopilotDock';
import {
  loadSiteSettings, saveSiteSettings, uploadShopMedia, emptySiteSettings,
  SITE_SECTIONS, SOCIAL_FIELDS, missingSitePieces, type SiteSettings,
} from '@/lib/siteSettings';

/** Dashboard → Website: the real, saved setup the copilot reads and writes. */
const WebsiteSettings: React.FC = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('your shop');
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'logo' | 'dish' | null>(null);
  const [dishes, setDishes] = useState<string[]>([]);
  const logoInput = useRef<HTMLInputElement>(null);
  const dishInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadShopMenu(user?.id || null).then(async (menu) => {
      if (cancelled) return;
      setShopName(menu.isDemo ? 'your shop' : menu.shopName);
      setShopId(menu.shopId);
      if (menu.shopId) {
        const s = await loadSiteSettings(menu.shopId);
        if (!cancelled) setForm(s || emptySiteSettings(menu.shopId));
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

  const upload = async (file: File | undefined, kind: 'logo' | 'dish') => {
    if (!file || !shopId) return;
    setUploading(kind);
    setError('');
    try {
      const url = await uploadShopMedia(file, shopId, kind);
      if (kind === 'logo') patch({ logo_url: url });
      else setDishes((d) => [url, ...d].slice(0, 8));
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
          Upload a menu in the setup wizard first — then your domain, Google listing, logo and sections all save here.
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <h2 className="font-bold text-stone-900">Website &amp; hosting for {shopName}</h2>
          <p className="text-sm text-stone-600">
            {gaps.length ? `Still needed: ${gaps.join(', ')}.` : 'Everything is saved — this site is ready to publish.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => askCopilot('Build my website page')}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-400"
          >
            Ask the copilot
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save website settings'}
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Domain + Google */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <Globe className="h-4 w-4 text-amber-600" /> Domain name
            </label>
            <input
              value={form.domain || ''}
              onChange={(e) => patch({ domain: e.target.value })}
              placeholder="yourshop.com"
              className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
            <p className="mt-1 text-xs text-stone-500">We register or transfer it, run the SSL and renew it for you.</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <MapPin className="h-4 w-4 text-amber-600" /> Google Business listing
            </label>
            <input
              value={form.google_place_id || ''}
              onChange={(e) => patch({ google_place_id: e.target.value })}
              placeholder="Place ID or your Google profile link"
              className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
            <p className="mt-1 text-xs text-stone-500">Hours, address and phone sync from here every hour — no double entry.</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-stone-200 p-4">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-stone-900">Hiring form</p>
              <p className="text-xs text-stone-500">Applications land in your dashboard instead of your inbox.</p>
            </div>
            <button
              onClick={() => patch({ hiring_enabled: !form.hiring_enabled })}
              role="switch"
              aria-checked={form.hiring_enabled}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.hiring_enabled ? 'bg-emerald-600' : 'bg-stone-300'}`}
            >
              <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.hiring_enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />

            </button>
          </div>
        </div>

        {/* Logo + photos */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <ImageIcon className="h-4 w-4 text-amber-600" /> Logo &amp; dish photos
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
            <input ref={dishInput} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0], 'dish')} />
            <button
              onClick={() => dishInput.current?.click()}
              disabled={uploading === 'dish'}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-stone-400 disabled:opacity-50"
            >
              {uploading === 'dish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload a dish photo
            </button>
            {dishes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {dishes.map((d) => (
                  <img key={d} src={d} alt="Dish" className="h-16 w-16 rounded-lg border border-stone-200 object-cover" />
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-stone-500">Photos upload straight to your shop storage and appear on the place cards.</p>
          </div>
        </div>

        {/* Socials */}
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Link2 className="h-4 w-4 text-amber-600" /> Social links
          </p>
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">{f.label}</label>
              <input
                value={(form.socials as any)?.[f.key] || ''}
                onChange={(e) => patch({ socials: { ...form.socials, [f.key]: e.target.value } })}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm font-bold text-stone-900">Page sections</p>
          <p className="text-xs text-stone-500">Everything on your one-page site. Switch off anything you do not want.</p>
          <ul className="mt-3 space-y-2">
            {SITE_SECTIONS.map((s) => {
              const on = form.section_order.includes(s.id);
              return (
                <li key={s.id} className="flex items-start gap-3 rounded-xl border border-stone-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">{s.title}</p>
                    <p className="truncate text-xs text-stone-500">{s.summary}</p>
                  </div>
                  <button
                    onClick={() => toggleSection(s.id)}
                    role="switch"
                    aria-checked={on}
                    aria-label={`${on ? 'Hide' : 'Show'} ${s.title}`}
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-emerald-600' : 'bg-stone-300'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
