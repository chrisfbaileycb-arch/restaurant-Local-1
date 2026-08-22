import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Upload, FileText, Check, Loader2, Monitor, Globe, ShoppingBag, Gift, ArrowRight, ArrowLeft, Sparkles,
  AlertTriangle, Database, Bot, Package,
} from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import SignupForm from '@/components/site/SignupForm';
import CopilotDock, { askCopilot } from '@/components/site/CopilotDock';
import SitePreview from '@/components/site/SitePreview';
import VibeStudio from '@/components/site/VibeStudio';
import MenuIntakeGuide from '@/components/site/MenuIntakeGuide';
import MenuIntakeWizard from '@/components/site/MenuIntakeWizard';
import { BUSINESS_TYPES, REWARD_PROGRAMS, LAUNCH_STEPS, formatCents, PLANS, HOSTING_DISCOUNT } from '@/data/platform';
import { SITE_TEMPLATES } from '@/data/vibe';

import { useAuth } from '@/contexts/AuthContext';
import { parseMenuFile, parseMenuText, saveParsedMenu, loadShopMenu } from '@/lib/menuStore';
import { loadVibeBrief, saveVibeBrief, emptyBrief } from '@/lib/vibeStore';
import type { ParsedMenu } from '@/lib/menuStore';



const SAMPLE_MENU_TEXT = `NORTH BEND COFFEE & KITCHEN
BREAKFAST
Breakfast Burrito 10.50 (add avocado +1.50, no cheese, extra salsa)
Avocado Toast 9.25
Yogurt Parfait 6.50
LUNCH
Smash Burger 11.95 (add bacon +2.00, sub side salad)
Chicken Sandwich 12.75 (spicy, add pickles)
Loaded Fries 7.95 (add queso +1.25)
House Salad 8.50
ESPRESSO
Latte 12oz 4.75 / 16oz 5.45 (oat milk +0.75, extra shot +1.00)
Cappuccino 4.95
Cold Brew 5.25 (sweet cream +0.75)
Drip Coffee 2.95
SWEETS
Warm Chocolate Chip Cookie 3.75 (box of 6 +16.00)
Cinnamon Roll 4.95
Brownie 3.95
BEER & WINE
Draft IPA 16oz 7.00
Lager Can 6.00
House Red 9.00
Ranch Water 8.50`;

const Onboarding: React.FC = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [type, setType] = useState(params.get('type') || '');
  const [shopName, setShopName] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [menu, setMenu] = useState<ParsedMenu | null>(null);
  const [reward, setReward] = useState('punch');
  const [saving, setSaving] = useState(false);
  const [savedShopId, setSavedShopId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [wantsSite, setWantsSite] = useState(true); // website hosting on by default


  // ---- Vibe brief: the words, the matched template, logo and tagline ----
  const [vibeText, setVibeText] = useState('');
  const [templateId, setTemplateId] = useState(SITE_TEMPLATES[0].id);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoStyle, setLogoStyle] = useState('');
  const [logoSymbol, setLogoSymbol] = useState('');
  const [tagline, setTagline] = useState('');



  useEffect(() => {
    const t = params.get('type');
    if (t) {
      setType(t);
      setStep(2);
    }
  }, [params]);

  // Hydrate the previews from an already-saved menu when the owner comes back.
  useEffect(() => {
    let cancelled = false;
    loadShopMenu(user?.id || null).then((loaded) => {
      if (cancelled || loaded.isDemo) return;
      setMenu((current) => {
        if (current) return current;
        const categories = loaded.categories.map((name) => ({
          name,
          items: loaded.items
            .filter((i) => i.category === name)
            .map((i) => ({ name: i.name, description: '', price: i.price, sizes: [], modifiers: i.mods || [] })),
        }));
        return { shop_name: loaded.shopName, business_type: null, categories, itemCount: loaded.items.length };
      });
      setShopName((n) => n || loaded.shopName);
      setSavedShopId((id) => id || loaded.shopId);
      setFileName((f) => f || 'saved menu');
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Pull back any saved vibe brief for this shop.
  useEffect(() => {
    if (!savedShopId) return;
    let cancelled = false;
    loadVibeBrief(savedShopId).then((b) => {
      if (cancelled || !b) return;
      if (b.vibe_text) setVibeText(b.vibe_text);
      if (b.template_id) setTemplateId(b.template_id);
      if (b.logo_url) setLogoUrl(b.logo_url);
    });
    return () => {
      cancelled = true;
    };
  }, [savedShopId]);


  const concept = useMemo(() => BUSINESS_TYPES.find((b) => b.id === type), [type]);
  const allItems = useMemo(
    () => (menu?.categories || []).flatMap((c) => c.items.map((i) => ({ ...i, category: c.name }))),
    [menu]
  );

  const applyResult = (result: ParsedMenu) => {
    setMenu(result);
    if (!shopName && result.shop_name) setShopName(result.shop_name);
    if (!type && result.business_type) setType(result.business_type);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParseError('');
    setMenu(null);
    setSavedShopId(null);
    setParsing(true);
    try {
      applyResult(await parseMenuFile(file));
    } catch (err: any) {
      setParseError(err.message || 'We could not read that menu. Try a clearer photo or a CSV.');
    } finally {
      setParsing(false);
    }
  };

  const handleSample = async () => {
    setFileName('sample-menu.txt');
    setParseError('');
    setMenu(null);
    setSavedShopId(null);
    setParsing(true);
    try {
      applyResult(await parseMenuText(SAMPLE_MENU_TEXT, 'sample-menu.txt'));
    } catch (err: any) {
      setParseError(err.message || 'Menu parsing failed.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!menu) return;
    setSaving(true);
    setSaveError('');
    try {
      const id = await saveParsedMenu({
        ownerId: user?.id || null,
        ownerEmail: user?.email || null,
        shopName: shopName || menu.shop_name || 'My Shop',
        businessType: type || menu.business_type || 'restaurant',
        rewardProgram: reward,
        fileName,
        menu,
      });
      setSavedShopId(id);

      // Persist the vibe brief (template, logo, the owner's own words) too.
      if (id) {
        try {
          await saveVibeBrief({
            ...emptyBrief(id),
            vibe_text: vibeText.trim() || null,
            template_id: templateId,
            logo_url: logoUrl,
            logo_prompt: logoPrompt || null,
            tagline: tagline.trim() || null,
            concept: type || menu.business_type || 'restaurant',
            style: logoStyle || null,
            symbol: logoSymbol || null,
          });

        } catch {
          /* the menu is saved either way — the brief can be re-saved later */
        }
      }

      setStep(4);
    } catch (err: any) {
      setSaveError(err.message || 'Could not save your menu. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <PageShell copilot={false}>

      {/* Build copilot: helps lay out the site, wire ordering and pick gear */}
      <CopilotDock mode="website" />

      <div className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-br from-fuchsia-50 via-white to-amber-50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 animate-blob rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
            <Sparkles className="h-3.5 w-3.5 animate-wiggle" /> No-code launch wizard
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Build your <span className="text-gradient-vibe">whole store</span>
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Four steps. Your real menu becomes a POS layout, an ordering site, a one-page website and a rewards program.
          </p>

          {/* Copilot help right where the work happens */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => askCopilot('Build my website page')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow"
            >
              <Bot className="h-4 w-4" /> Help me build this
            </button>
            <button
              onClick={() => askCopilot('What do you still need from me?')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              What do you need from me?
            </button>
            <button
              onClick={() => askCopilot(type ? `Recommend equipment for a ${type.replace('-', ' ')}` : 'Recommend equipment for my shop')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              <Package className="h-4 w-4" /> Pick my equipment
            </button>
          </div>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${(step / LAUNCH_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {LAUNCH_STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  step === s.id
                    ? 'border-transparent bg-gradient-to-br from-fuchsia-600 to-orange-500 text-white shadow-lg'
                    : step > s.id
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  {step > s.id ? <Check className="h-3.5 w-3.5 animate-pop-in" /> : <span>Step {s.id}</span>}
                </span>
                <span className="mt-1 block text-sm font-extrabold">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* STEP 1 */}
        {step === 1 && (
          <section>
            <h2 className="text-2xl font-extrabold text-stone-900">What are you opening?</h2>
            <p className="mt-2 text-stone-600">This sets your POS layout, modifiers and website copy.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BUSINESS_TYPES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setType(b.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    type === b.id ? 'border-stone-900 bg-white shadow-lg' : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div className={`mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${b.accent}`} />
                  <p className="font-bold text-stone-900">{b.label}</p>
                  <p className="mt-1 text-sm text-stone-500">{b.blurb}</p>
                  {type === b.id && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 max-w-md">
              <label className="mb-1 block text-sm font-semibold text-stone-800">Shop name</label>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. North Bend Coffee"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!type}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
            >
              Continue <ArrowRight className="h-4 w-4 animate-bob-x" />
            </button>

          </section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <section>
            <h2 className="text-2xl font-extrabold text-stone-900">Build your menu — with the agent</h2>
            <p className="mt-2 text-stone-600">
              Read the walkthrough first, get your sources together, then upload. The agent does the typing; you approve
              every price, modifier and description before anything goes live.
            </p>

            {/* Read this first — the honest workflow + what to bring */}
            <div className="mt-6">
              <MenuIntakeGuide onAsk={(q) => askCopilot(q)} onReady={() => askCopilot('Walk me through building my menu')} />
            </div>


            <label className="group mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-gradient-to-br from-fuchsia-50/60 via-white to-amber-50/60 p-12 text-center transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-lg">
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.csv,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <span className="flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white shadow-lg">
                <Upload className="h-8 w-8" />
              </span>
              <p className="mt-4 font-extrabold text-slate-900">Drop your menu here or click to browse</p>
              <p className="mt-1 text-sm text-slate-500">JPG, PNG, PDF, CSV or TXT · photos work best</p>
            </label>


            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSample}
                disabled={parsing}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                Use a sample menu instead
              </button>
              {fileName && (
                <span className="inline-flex items-center gap-2 text-sm text-stone-600">
                  <FileText className="h-4 w-4" /> {fileName}
                </span>
              )}
            </div>

            {parsing && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <div>
                  <p className="font-semibold text-stone-900">Reading your menu…</p>
                  <p className="text-sm text-stone-500">Detecting categories, prices, sizes and modifiers.</p>
                </div>
              </div>
            )}

            {parseError && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">We couldn&apos;t read that file</p>
                  <p className="text-sm">{parseError}</p>
                </div>
              </div>
            )}

            {menu && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="flex items-center gap-2 font-bold text-emerald-900">
                  <Check className="h-5 w-5" /> Found {menu.itemCount} items across {menu.categories.length} categories
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {menu.categories.map((c) => (
                    <span key={c.name} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-800">
                      {c.name} · {c.items.length}
                    </span>
                  ))}
                </div>
                <div className="mt-4 max-h-56 overflow-y-auto rounded-xl bg-white p-3">
                  {allItems.slice(0, 40).map((i, idx) => (
                    <div key={`${i.name}-${idx}`} className="flex items-center justify-between border-b border-stone-100 py-1.5 text-sm last:border-0">
                      <span className="font-medium text-stone-800">
                        {i.name}
                        {i.modifiers && i.modifiers.length > 0 && (
                          <span className="ml-2 text-xs text-stone-400">{i.modifiers.length} modifiers</span>
                        )}
                      </span>
                      <span className="text-stone-600">{formatCents(i.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bring your own sources + standard placement (agent-directed) */}
            <div className="mt-6">
              <MenuIntakeWizard
                menu={menu}
                businessType={type || menu?.business_type || ''}
                onMenu={(next, label) => {
                  setMenu(next);
                  setFileName((f) => (f ? `${f} + ${label}` : label));
                  if (!shopName && next.shop_name) setShopName(next.shop_name);
                }}
                onAsk={(q) => askCopilot(q)}
              />
            </div>


            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!menu}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-6 py-3 font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
              >
                Review my build <ArrowRight className="h-4 w-4 animate-bob-x" />
              </button>

            </div>
          </section>
        )}

        {/* STEP 3 */}
        {step === 3 && menu && (
          <section>
            <h2 className="text-2xl font-extrabold text-stone-900">Here&apos;s what we built</h2>
            <p className="mt-2 text-stone-600">
              Everything below came from <strong>{fileName || 'your upload'}</strong>. Save it and every screen — POS,
              ordering, website — uses this menu.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* POS preview */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-stone-900"><Monitor className="h-4 w-4 text-amber-600" /> POS layout</p>
                <div className="mt-4 grid grid-cols-3 gap-1.5">
                  {allItems.slice(0, 12).map((m, i) => (
                    <div key={`${m.name}-${i}`} className="rounded-lg bg-stone-900 p-2">
                      <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-white">{m.name}</p>
                      <p className="text-[9px] text-amber-400">{formatCents(m.price)}</p>
                    </div>
                  ))}
                </div>
                <Link to="/pos" className="mt-4 block rounded-lg bg-stone-100 py-2 text-center text-sm font-semibold text-stone-800 hover:bg-stone-200">
                  Open live POS
                </Link>
              </div>

              {/* Ordering preview */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-stone-900"><ShoppingBag className="h-4 w-4 text-amber-600" /> Online ordering</p>
                <div className="mt-4 space-y-2">
                  {allItems.slice(0, 5).map((m, i) => (
                    <div key={`${m.name}-ord-${i}`} className="flex items-center justify-between rounded-lg border border-stone-200 p-2 text-xs">
                      <span className="font-semibold text-stone-800">{m.name}</span>
                      <span className="text-stone-500">{formatCents(m.price)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-emerald-700">0% commission · Apple Pay · pickup windows</p>
              </div>

              {/* Website preview — the real one page, in the picked template */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-stone-900"><Globe className="h-4 w-4 text-amber-600" /> One-page website</p>
                <div className="mt-4">
                  <SitePreview
                    templateId={templateId}
                    shopName={shopName || menu.shop_name || 'Your Shop'}
                    tagline={vibeText.trim() || concept?.blurb}
                    logoUrl={logoUrl}
                    items={allItems.slice(0, 4).map((i) => ({ name: i.name, price: i.price }))}
                    socials={['Instagram', 'Facebook', 'Google Reviews']}
                    compact
                  />
                </div>
                <p className="mt-3 text-xs text-stone-500">Hosting, domain + SSL included on the ${PLANS[0].price} plan</p>
              </div>
            </div>

            {/* Vibe + logo + copy studio */}
            <div className="mt-6">
              <VibeStudio
                shopName={shopName || menu.shop_name || 'Your Shop'}
                concept={concept?.label || 'restaurant'}
                items={allItems.slice(0, 4).map((i) => ({ name: i.name, price: i.price }))}
                shopId={savedShopId}
                menuItems={allItems.map((i) => ({
                  name: i.name,
                  category: i.category,
                  price: i.price,
                  description: i.description || '',
                }))}
                initialVibe={vibeText}
                initialTemplateId={templateId}
                initialLogo={logoUrl}
                initialTagline={tagline}
                savedNote={savedShopId ? 'Saved to your shop.' : 'Saved once you save the menu.'}
                onSave={(patch) => {
                  if (patch.vibe_text !== undefined) setVibeText(patch.vibe_text || '');
                  if (patch.template_id) setTemplateId(patch.template_id);
                  if (patch.logo_url) setLogoUrl(patch.logo_url);
                  if (patch.logo_prompt !== undefined) setLogoPrompt(patch.logo_prompt || '');
                  if (patch.style) setLogoStyle(patch.style);
                  if (patch.symbol) setLogoSymbol(patch.symbol);
                  if (patch.tagline !== undefined) setTagline(patch.tagline || '');
                }}
              />
            </div>



            {/* Website hosting choice */}
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/60 p-6">
              <p className="flex items-center gap-2 font-bold text-stone-900">
                <Globe className="h-4 w-4 text-rose-600" /> Do you want us to host your website?
              </p>
              <p className="mt-1 text-sm text-stone-600">
                One page with your ordering menu, photo place cards, Google-synced hours, contact, a hiring form and
                social links. Already have a site you like? Skip it and save ${HOSTING_DISCOUNT} a month.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setWantsSite(p.hosting)}
                    className={`rounded-xl border p-4 text-left transition ${
                      wantsSite === p.hosting ? 'border-rose-500 bg-white shadow-md ring-2 ring-rose-200' : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-stone-900">{p.name}</span>
                      <span className="text-xl font-extrabold text-rose-600">${p.price}<span className="text-xs font-semibold text-stone-500">/mo</span></span>
                    </div>
                    <p className="mt-1 text-xs text-stone-600">{p.blurb}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-stone-600">
                ${PLANS[0].deposit} deposit today → ${wantsSite ? PLANS[0].balance : PLANS[1].balance} balance only when
                you approve the build. Your ${wantsSite ? PLANS[0].price : PLANS[1].price}/mo does not start until you go
                live.
              </p>


            </div>


            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
              <p className="flex items-center gap-2 font-bold text-stone-900"><Gift className="h-4 w-4 text-amber-600" /> Pick your rewards program</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {REWARD_PROGRAMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReward(r.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      reward === r.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <p className="font-bold text-stone-900">{r.name}</p>
                    <p className="mt-1 text-xs text-stone-600">{r.rule}</p>
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <p className="mt-4 text-sm text-stone-500">
                Not signed in — we&apos;ll save this build to this browser.{' '}
                <Link to="/login" className="font-semibold text-amber-700 underline">Create an account</Link> to attach it to your shop.
              </p>
            )}
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.03] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                {saving ? 'Saving your menu…' : 'Save menu & go live'}
              </button>

            </div>
          </section>
        )}

        {step === 3 && !menu && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <p className="font-semibold text-stone-900">Upload a menu first</p>
            <button onClick={() => setStep(2)} className="mt-4 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              Go to upload
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900">You&apos;re live</h2>
              {savedShopId ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-bold">Menu saved to your store</p>
                  <p className="mt-1">
                    {menu?.itemCount || 0} items across {menu?.categories.length || 0} categories are now powering your
                    POS and ordering pages.
                  </p>
                  <Link to="/pos" className="mt-2 inline-flex items-center gap-1 font-bold underline">
                    Ring a test order <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="mt-2 text-stone-600">Tell us where to send your build link and we publish everything.</p>
              )}
              <ul className="mt-6 space-y-2 text-sm text-stone-700">
                {[
                  'POS layout published to every station and phone',
                  wantsSite
                    ? 'One-page website hosted by us — ordering, Google hours, contact, hiring form & socials'
                    : 'Order link ready to drop on the website you already have',
                  `${REWARD_PROGRAMS.find((r) => r.id === reward)?.name} rewards switched on`,
                  'Reports, sales tax and payroll exports enabled',
                  `$${PLANS[0].deposit} deposit today — the $${wantsSite ? PLANS[0].balance : PLANS[1].balance} balance is charged only when you approve delivery, then $${wantsSite ? PLANS[0].price : PLANS[1].price}/mo at go-live`,


                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
                <p className="font-bold text-stone-900">Need the hardware too?</p>
                <p className="mt-1 text-sm text-stone-600">
                  We recommend the {concept?.label || 'counter service'} kit for your concept — or start with the
                  budget setup and add gear later. Food trucks can run on a phone for about $159.
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Link to="/starter" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800">
                    Cheapest way to open <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
                    See recommended gear <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="h-fit rounded-3xl bg-stone-900 p-6">
              <SignupForm
                source="waitlist"
                tags={['launch-request', type || 'restaurant']}
                cta="Publish my store"
                dark
                heading="Send me my build link"
                sub="No card required to publish your ordering site."
              />
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default Onboarding;
