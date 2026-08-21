import React, { useMemo, useState } from 'react';
import { Link2, Globe, Type, SlidersHorizontal, Loader2, Check, AlertTriangle, LayoutList, Plus } from 'lucide-react';

import { INTAKE_SOURCES, PLACEMENT_TEMPLATES, MODIFIER_TEMPLATES, suggestPlacement, placementById, applyPlacement } from '@/data/menuIntake';
import type { IntakeSourceKind } from '@/data/menuIntake';
import { ingestMenuUrl, parseMenuText, applyGlobalModifiers, mergeParsedMenus } from '@/lib/menuStore';
import type { ParsedMenu } from '@/lib/menuStore';

interface Props {
  menu: ParsedMenu | null;
  businessType?: string;
  onMenu: (menu: ParsedMenu, sourceLabel: string) => void;
  onAsk?: (q: string) => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'pdf-url': Link2,
  website: Globe,
  'paste-items': Type,
  'paste-modifiers': SlidersHorizontal,
};

/**
 * The bring-your-own-menu panel: a PDF link, your live website, items you've
 * already decided on, and your modifier list — then standard placement.
 * Everything merges into the same parsed menu the rest of the build uses.
 */
const MenuIntakeWizard: React.FC<Props> = ({ menu, businessType, onMenu, onAsk }) => {
  const [tab, setTab] = useState<IntakeSourceKind>('pdf-url');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [placementId, setPlacementId] = useState(suggestPlacement(businessType).id);

  const source = useMemo(() => INTAKE_SOURCES.find((s) => s.id === tab) || INTAKE_SOURCES[1], [tab]);
  const placement = useMemo(() => placementById(placementId), [placementId]);

  const run = async () => {
    const raw = value.trim();
    if (!raw) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      if (tab === 'paste-modifiers') {
        if (!menu) throw new Error('Add your items first, then paste the modifiers that apply to them.');
        const mods = raw.split('\n').map((m) => m.trim()).filter(Boolean);
        onMenu(applyGlobalModifiers(menu, mods), `${mods.length} modifiers`);
        setNote(`Attached ${mods.length} modifiers to every item. Trim per-item on the review list.`);
      } else if (tab === 'paste-items') {
        const parsed = await parseMenuText(raw, 'typed-items.txt');
        onMenu(mergeParsedMenus(menu, parsed), 'typed items');
        setNote(`Added ${parsed.itemCount} items you typed in.`);
      } else {
        const parsed = await ingestMenuUrl(raw, tab === 'pdf-url' ? 'pdf-url' : 'website');
        onMenu(mergeParsedMenus(menu, parsed), tab === 'pdf-url' ? 'PDF link' : 'your website');
        setNote(`Read ${parsed.itemCount} items from that ${tab === 'pdf-url' ? 'PDF' : 'page'}.`);
      }
      setValue('');
    } catch (err: any) {
      setError(err.message || 'That source did not come through.');
    } finally {
      setBusy(false);
    }
  };

  const runPlacement = () => {
    if (!menu) return;
    const res = applyPlacement(menu.categories, placement);
    onMenu({ ...menu, categories: res.ordered }, `${placement.name} placement`);
    setNote(
      res.moved > 0
        ? `Re-ordered ${res.moved} categor${res.moved === 1 ? 'y' : 'ies'} to standard ${placement.name.toLowerCase()} placement.`
        : 'Your categories already match that placement.'
    );
  };

  const addModifierGroup = (options: string[]) => {
    if (!menu) return;
    onMenu(applyGlobalModifiers(menu, options), 'standard modifier group');
    setNote(`Added ${options.length} standard options to every item.`);
  };

  return (
    <div className="space-y-4">
      {/* Sources */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="font-extrabold text-stone-900">Bring what you already have</p>
        <p className="text-sm text-stone-600">
          A PDF link, your current website, items you have already decided on, your modifier list — mix and match. Each
          one merges into the same menu.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {INTAKE_SOURCES.filter((s) => s.id !== 'file').map((s) => {
            const Icon = ICONS[s.id] || Link2;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setTab(s.id);
                  setValue('');
                  setError('');
                  setNote('');
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition ${
                  tab === s.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Icon className="h-4 w-4" /> {s.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-stone-600">
          {source.hint} <span className="font-mono text-[10px] uppercase tracking-wide text-violet-700">{source.tool}</span>
        </p>

        {tab === 'pdf-url' || tab === 'website' ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder={source.placeholder}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            placeholder={source.placeholder}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || !value.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {busy ? 'Reading…' : `Add from ${source.label.toLowerCase()}`}
          </button>
          <button
            type="button"
            onClick={() => onAsk?.('What should I bring for my menu?')}
            className="text-sm font-bold text-violet-700 underline"
          >
            Ask the agent what to bring
          </button>
        </div>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        {note && !error && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Check className="h-4 w-4" /> {note}
          </p>
        )}
      </div>

      {/* Placement + standard modifier groups */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 font-extrabold text-stone-900">
            <LayoutList className="h-4 w-4 text-amber-600" /> Standard menu placement
          </p>
          <p className="text-sm text-stone-600">
            Guests read a menu in a known order and your POS buttons should match. Pick the placement for your concept.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PLACEMENT_TEMPLATES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlacementId(p.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  placementId === p.id ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <p className="text-sm font-extrabold text-stone-900">{p.name}</p>
                <p className="text-[11px] text-stone-500">{p.who}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {placement.order.map((o, i) => (
              <span key={o} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-700">
                {i + 1}. {o}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-600">{placement.note}</p>
          <button
            type="button"
            onClick={runPlacement}
            disabled={!menu}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"
          >
            Apply this placement
          </button>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="flex items-center gap-2 font-extrabold text-stone-900">
            <SlidersHorizontal className="h-4 w-4 text-amber-600" /> Standard modifier groups
          </p>
          <p className="text-sm text-stone-600">
            No list of your own? Start from the groups most shops in your category use, then edit.
          </p>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {MODIFIER_TEMPLATES.map((g) => (
              <div key={g.id} className="rounded-xl border border-stone-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{g.name}</p>
                    <p className="text-[11px] text-stone-500">{g.appliesTo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addModifierGroup(g.options)}
                    disabled={!menu}
                    className="shrink-0 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {g.options.map((o) => (
                    <span key={o} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuIntakeWizard;
