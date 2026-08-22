import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Sparkles, Wand2, Smartphone, Monitor, ArrowRight, Check } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import LogoCreator from '@/components/site/LogoCreator';
import OnePageSiteTemplate from '@/components/website/OnePageSiteTemplate';
import { runCopilotWorkflow } from '@/components/copilot/OperatorCopilot';
import type { SiteMenuItem } from '@/components/website/MenuCardGrid';
import {
  SITE_TEMPLATES,
  conceptPreset,
  matchTemplate,
  sampleById,
  templateById,
} from '@/data/vibe';
import { BUSINESS_TYPES } from '@/data/platform';


/**
 * /templates-logo — the studio where an operator tunes the generated
 * one-page site: concept theme, template, palette, vibe description and
 * the logo mark, with a live customer-facing preview beside it.
 */
const TemplatesAndLogo: React.FC = () => {
  const [conceptId, setConceptId] = useState(BUSINESS_TYPES[0].id);
  const preset = conceptPreset(conceptId);
  const sample = sampleById(preset.samplePageId);

  const [templateId, setTemplateId] = useState<string>(preset.templateId);
  const [shopName, setShopName] = useState(sample.shop);
  const [tagline, setTagline] = useState(sample.tagline);
  const [vibe, setVibe] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  const [matched, setMatched] = useState<string>('');

  const pickConcept = (id: string) => {
    const p = conceptPreset(id);
    const s = sampleById(p.samplePageId);
    setConceptId(id);
    setTemplateId(p.templateId);
    setShopName(s.shop);
    setTagline(s.tagline);
    setMatched('');
  };

  const applyVibe = () => {
    const res = matchTemplate(vibe);
    if (res.score > 0) {
      setTemplateId(res.template.id);
      setMatched(`Matched “${res.template.name}” on: ${res.hits.join(', ')}`);
    } else {
      setMatched('No strong match yet — add a few more describing words.');
    }
  };

  const items: SiteMenuItem[] = useMemo(
    () =>
      sample.items.map((i, idx) => ({
        name: i.name,
        price: i.price,
        note: i.note,
        modifiers: [3, 2, 4, 0][idx % 4],
      })),
    [sample],
  );

  const template = templateById(templateId);

  return (
    <PageShell copilot={false}>
      <section className="border-b border-fuchsia-100 bg-gradient-to-br from-violet-950 via-fuchsia-900 to-orange-800 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Palette className="h-3.5 w-3.5" /> Templates &amp; logo studio
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
            Your menu builds the page. You just pick the vibe.
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Every concept gets the same one page — order header, live ordering grid, photo place cards,
            Google-synced hours, contact, hiring and socials. The theme engine changes the type, the color
            and the layout to match what you actually sell.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => runCopilotWorkflow('build-ingest')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-violet-900 shadow-lg transition hover:scale-105"
            >
              <Sparkles className="h-4 w-4" /> Run the build flow
            </button>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Upload my real menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Controls */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-extrabold text-stone-900">1. Pick your concept</h2>
              <p className="text-sm text-stone-600">
                The theme engine presets the template, the order-button wording and the nav tabs.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {BUSINESS_TYPES.map((b) => {
                  const active = b.id === conceptId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => pickConcept(b.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-fuchsia-500 bg-fuchsia-50 shadow'
                          : 'border-stone-200 hover:border-fuchsia-300'
                      }`}
                    >
                      <span className={`block h-1.5 w-10 rounded-full bg-gradient-to-r ${b.accent}`} />
                      <span className="mt-2 block text-sm font-extrabold text-stone-900">{b.label}</span>
                      <span className="block text-[11px] text-stone-500">{b.blurb}</span>
                      {active && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-fuchsia-700">
                          <Check className="h-3 w-3" /> {conceptPreset(b.id).cta}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                <strong className="text-stone-900">Layout focus:</strong> {preset.focus}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-extrabold text-stone-900">2. Describe the vibe</h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="dark and moody like a wine bar…"
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                />
                <button
                  onClick={applyVibe}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-extrabold text-white"
                >
                  <Wand2 className="h-4 w-4" /> Match a template
                </button>
              </div>
              {matched && <p className="mt-2 text-xs font-bold text-fuchsia-700">{matched}</p>}

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {SITE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      templateId === t.id ? 'border-fuchsia-500 shadow' : 'border-stone-200 hover:border-fuchsia-300'
                    }`}
                  >
                    <span className={`block h-10 bg-gradient-to-r ${t.hero}`} />
                    <span className="block p-2">
                      <span className="block text-xs font-extrabold text-stone-900">{t.name}</span>
                      <span className="block text-[11px] text-stone-500">{t.vibe}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-extrabold text-stone-900">3. Name it</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Business name"
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                />
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="One-line tagline"
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <LogoCreator
              shopName={shopName}
              concept={conceptId}
              vibe={vibe}
              savedUrl={logoUrl}
              onLogo={(url) => setLogoUrl(url)}
            />
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Live customer preview
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setDevice('phone')}
                  className={`rounded-lg p-1.5 ${device === 'phone' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
                  aria-label="Phone preview"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevice('desktop')}
                  className={`rounded-lg p-1.5 ${device === 'desktop' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
                  aria-label="Wide preview"
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className={`overflow-hidden rounded-2xl border border-stone-200 shadow-xl ${
                device === 'phone' ? 'mx-auto max-w-[380px]' : ''
              }`}
            >
              <OnePageSiteTemplate
                shopName={shopName}
                tagline={tagline}
                conceptId={conceptId}
                templateId={templateId}
                items={items}
                logoUrl={logoUrl}
                socials={sample.socials}
                hiring={preset.tabs.includes('Hiring')}
              />
            </div>

            <p className="mt-3 text-center text-[11px] text-stone-500">
              Template: <strong>{template.name}</strong> · this is the real component we host, not a picture.
            </p>
          </aside>
        </div>
      </section>
    </PageShell>

  );
};

export default TemplatesAndLogo;
