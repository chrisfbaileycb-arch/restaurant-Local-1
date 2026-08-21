import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, Check, Bot } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import CopilotDock, { askCopilot } from '@/components/site/CopilotDock';
import SitePreview from '@/components/site/SitePreview';
import LogoCreator from '@/components/site/LogoCreator';
import SkillRoadmap from '@/components/site/SkillRoadmap';
import Reveal from '@/components/site/Reveal';

import { SITE_TEMPLATES, SAMPLE_PAGES, PAGE_JOBS, matchTemplate, templateById } from '@/data/vibe';

/**
 * Public "see it before you buy it" page:
 *   1. the one page explained (order → Google → socials)
 *   2. vibe matcher + template gallery with a live preview
 *   3. four sample shops rendered in their own template
 *   4. the logo creator
 *   5. the agent-skill roadmap, so operators see what is coming
 */
const Templates: React.FC = () => {
  const [vibe, setVibe] = useState('');
  const [templateId, setTemplateId] = useState(SITE_TEMPLATES[0].id);
  const [shopName, setShopName] = useState('Your Shop');
  const [logo, setLogo] = useState<string | null>(null);
  const [matchNote, setMatchNote] = useState('');

  const template = useMemo(() => templateById(templateId), [templateId]);
  const demoItems = SAMPLE_PAGES[0].items;

  const runMatch = () => {
    if (!vibe.trim()) return;
    const res = matchTemplate(vibe);
    setTemplateId(res.template.id);
    setMatchNote(
      res.score > 0
        ? `Matched ${res.template.name} from: ${res.hits.join(', ')}`
        : `No obvious keyword — starting you on ${res.template.name}. Pick another below any time.`,
    );
  };

  return (
    <PageShell>
      <CopilotDock mode="build" />

      {/* Hero */}
      <section className="border-b border-orange-100 bg-gradient-to-b from-amber-50 to-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
              <Sparkles className="h-3.5 w-3.5" /> Vibe studio
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-900">
              Describe your vibe. <span className="text-gradient-vibe">See your page.</span>
            </h1>
            <p className="mt-3 text-stone-600">
              Your website is one page and it has three jobs: take the order, point at your Google listing for hours
              and contact, and link your socials. Menu and photos come from the POS. Pick the look here, make a logo,
              and that is the whole build.
            </p>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PAGE_JOBS.map((j) => (
              <div key={j.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="flex items-center gap-1.5 text-sm font-extrabold text-stone-900">
                  <Check className="h-4 w-4 text-emerald-600" /> {j.title}
                </p>
                <p className="mt-1 text-xs text-stone-600">{j.body}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">{j.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe matcher + gallery */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-extrabold text-stone-900">Tell us the vibe</h2>
            <p className="text-sm text-stone-600">
              Plain English works. &ldquo;Cozy family breakfast spot.&rdquo; &ldquo;Dark moody wine bar.&rdquo;
              &ldquo;Loud taco truck.&rdquo;
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-[220px_1fr_auto]">
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Business name"
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
              <input
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runMatch()}
                placeholder="warm family seafood shack, weathered blue, big portions"
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
              <button
                onClick={runMatch}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow"
              >
                Match my vibe
              </button>
            </div>
            {matchNote && <p className="mt-2 text-xs font-semibold text-emerald-700">{matchNote}</p>}

            <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {SITE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTemplateId(t.id); setMatchNote(''); }}
                  className={`rounded-xl border p-2 text-left transition ${
                    templateId === t.id ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span className={`block h-8 w-full rounded-lg bg-gradient-to-br ${t.hero}`} />
                  <p className="mt-1.5 text-[11px] font-extrabold text-stone-900">{t.name}</p>
                  <p className="text-[10px] leading-tight text-stone-500">{t.vibe}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Live preview</p>
              <SitePreview
                template={template}
                shopName={shopName || 'Your Shop'}
                tagline={vibe.trim() || template.vibe}
                logoUrl={logo}
                items={demoItems}
                socials={['Instagram', 'Facebook', 'Google Reviews']}
              />
              <p className="mt-2 text-[11px] text-stone-500">Best for {template.who.toLowerCase()}.</p>
            </div>

            <LogoCreator
              shopName={shopName}
              concept="restaurant"
              vibe={vibe}
              savedUrl={logo}
              onLogo={(url) => setLogo(url)}
            />
          </div>
        </div>
      </section>

      {/* Sample pages */}
      <section className="bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">Sample pages</h2>
          <p className="mt-1 text-sm text-stone-600">
            Four real concepts, same one page, four different vibes. This is exactly what a guest sees on their phone.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_PAGES.map((s) => (
              <div key={s.id}>
                <SitePreview
                  templateId={s.templateId}
                  shopName={s.shop}
                  tagline={s.tagline}
                  items={s.items}
                  socials={s.socials}
                  compact
                />
                <p className="mt-2 text-xs font-bold text-stone-900">{s.shop}</p>
                <p className="text-[11px] text-stone-500">
                  {s.concept} · {templateById(s.templateId).name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent skill roadmap */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Layers className="h-3.5 w-3.5" /> Agent skills
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900">
                What the copilot can run — and what is next
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Every skill below is a back-end agent tool. Live ones already run on your floor. Building and next-up
                ones are in the queue in dependency order, so nothing ships half-wired.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => askCopilot('Build my website page')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-2.5 text-sm font-extrabold text-white shadow"
                >
                  <Bot className="h-4 w-4" /> Ask the copilot
                </button>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-extrabold text-white"
                >
                  Start my build <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <SkillRoadmap tone="light" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Templates;
