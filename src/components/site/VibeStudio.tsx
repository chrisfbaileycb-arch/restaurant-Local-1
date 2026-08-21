import React, { useMemo, useState } from 'react';
import { Sparkles, Wand2, Check, Loader2 } from 'lucide-react';

import SitePreview from '@/components/site/SitePreview';
import LogoCreator from '@/components/site/LogoCreator';
import CopyWriter from '@/components/site/CopyWriter';
import { SITE_TEMPLATES, matchTemplate, templateById, PAGE_JOBS } from '@/data/vibe';
import type { PreviewItem } from '@/components/site/SitePreview';
import type { CopyRequestItem } from '@/lib/copyStore';

interface Props {
  shopName: string;
  concept?: string;
  items: PreviewItem[];
  socials?: string[];
  /** the shop these edits belong to — enables saving copy straight to menu_items */
  shopId?: string | null;
  /** the full parsed menu, used by the copy writer */
  menuItems?: CopyRequestItem[];
  /** initial saved values */
  initialVibe?: string | null;
  initialTemplateId?: string | null;
  initialLogo?: string | null;
  initialTagline?: string | null;
  /** persist — the parent decides where it goes (onboarding vs dashboard) */
  onSave?: (patch: { vibe_text?: string; template_id?: string; logo_url?: string; logo_prompt?: string; style?: string; symbol?: string; tagline?: string }) => void;
  saving?: boolean;
  savedNote?: string;
}

/**
 * The vibe-coding studio: describe the feel in plain English, we match a
 * template, you can override it, then generate a logo — all previewing the
 * real one page (order → Google → socials) as you go.
 */
const VibeStudio: React.FC<Props> = ({
  shopName, concept = 'restaurant', items, socials = ['Instagram', 'Facebook', 'Google Reviews'],
  shopId, menuItems = [], initialVibe, initialTemplateId, initialLogo, initialTagline, onSave, saving, savedNote,
}) => {
  const [vibe, setVibe] = useState(initialVibe || '');
  const [templateId, setTemplateId] = useState(initialTemplateId || SITE_TEMPLATES[0].id);
  const [logo, setLogo] = useState<string | null>(initialLogo || null);
  const [tagline, setTagline] = useState(initialTagline || '');
  const [matched, setMatched] = useState<{ hits: string[]; name: string } | null>(null);

  const template = useMemo(() => templateById(templateId), [templateId]);

  const runMatch = () => {
    if (!vibe.trim()) return;
    const res = matchTemplate(vibe);
    setTemplateId(res.template.id);
    setMatched({ hits: res.hits, name: res.template.name });
    onSave?.({ vibe_text: vibe.trim(), template_id: res.template.id });
  };

  const pick = (id: string) => {
    setTemplateId(id);
    setMatched(null);
    onSave?.({ template_id: id, vibe_text: vibe.trim() || undefined });
  };

  return (
    <div className="space-y-6">
      {/* 1. Describe the vibe */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-stone-900">Describe your vibe</h3>
            <p className="text-sm text-stone-600">
              Plain English. &ldquo;Cozy breakfast place, lots of wood.&rdquo; &ldquo;Dark and moody like a wine bar.&rdquo;
              &ldquo;Loud taco truck.&rdquo; We match a template and you can override it.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runMatch()}
            placeholder="e.g. warm family seafood shack, weathered blue, big portions"
            className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={runMatch}
            disabled={!vibe.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow disabled:opacity-40"
          >
            <Wand2 className="h-4 w-4" /> Match my vibe
          </button>
        </div>

        {matched && (
          <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" /> Matched <span className="font-extrabold">{matched.name}</span>
            {matched.hits.length > 0 && <span className="text-stone-500">from: {matched.hits.join(', ')}</span>}
          </p>
        )}

        {/* 2. Template gallery */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Templates</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {SITE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t.id)}
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
          <p className="mt-2 text-[11px] text-stone-500">
            Best for {template.who.toLowerCase()} · every template renders the same one page.
          </p>
        </div>
      </div>

      {/* 3. Preview + what is on the page */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div>
          <SitePreview
            template={template}
            shopName={shopName || 'Your Shop'}
            tagline={tagline.trim() || vibe.trim() || template.vibe}
            logoUrl={logo}
            items={items}
            socials={socials}
          />
          {saving && (
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-stone-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </p>
          )}
          {!saving && savedNote && <p className="mt-2 text-[11px] font-semibold text-emerald-700">{savedNote}</p>}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">The whole page — three jobs</p>
            <ul className="mt-2 space-y-2">
              {PAGE_JOBS.map((j) => (
                <li key={j.id} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    <span className="text-sm font-bold text-stone-900">{j.title}</span>
                    <span className="block text-xs text-stone-600">{j.body}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600">{j.source}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* brand.writeCopy — descriptions + tagline in the owner's voice */}
          <CopyWriter
            shopId={shopId}
            shopName={shopName || 'Your Shop'}
            concept={concept}
            vibeText={vibe}
            templateName={template.name}
            items={menuItems}
            onTagline={(t) => {
              setTagline(t);
              onSave?.({ tagline: t });
            }}
          />

          <LogoCreator
            shopName={shopName}
            concept={concept}
            vibe={vibe}
            savedUrl={logo}
            onLogo={(url, prompt, style, symbol) => {
              setLogo(url);
              onSave?.({ logo_url: url, logo_prompt: prompt, style, symbol });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VibeStudio;
