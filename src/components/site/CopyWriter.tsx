import React, { useState } from 'react';
import { PenLine, Loader2, Check, RotateCcw, AlertTriangle, Save } from 'lucide-react';

import { writeMenuCopy, saveMenuCopy } from '@/lib/copyStore';
import type { CopyLine, CopyRequestItem } from '@/lib/copyStore';

interface Props {
  shopId?: string | null;
  shopName: string;
  concept?: string;
  vibeText?: string;
  templateName?: string;
  items: CopyRequestItem[];
  /** bubble the accepted tagline up so the live preview updates */
  onTagline?: (tagline: string) => void;
  onSaved?: (count: number) => void;
}

/**
 * brand.writeCopy — "Write my descriptions".
 * Sends the parsed menu + the owner's vibe words to the writer, shows every
 * line in an editable review list, and saves only what the owner accepts.
 */
const CopyWriter: React.FC<Props> = ({
  shopId, shopName, concept, vibeText, templateName, items, onTagline, onSaved,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tagline, setTagline] = useState('');
  const [lines, setLines] = useState<CopyLine[]>([]);
  const [rejected, setRejected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState('');

  const keyOf = (l: CopyLine, i: number) => l.id || `${l.name}-${i}`;

  const run = async () => {
    if (!items.length) {
      setError('Upload or paste a menu first — there is nothing to describe yet.');
      return;
    }
    setBusy(true);
    setError('');
    setSavedNote('');
    try {
      const res = await writeMenuCopy({
        shopName,
        concept,
        vibeText,
        templateName,
        items: items.slice(0, 60),
      });
      if (!res.success) {
        setError(res.error || 'The writer came back empty. Try again.');
      } else {
        setTagline(res.tagline || '');
        setLines(res.items || []);
        setRejected({});
        if (res.tagline) onTagline?.(res.tagline);
      }
    } catch (err: any) {
      setError(err.message || 'Could not reach the writer.');
    } finally {
      setBusy(false);
    }
  };

  const edit = (i: number, value: string) =>
    setLines((cur) => cur.map((l, idx) => (idx === i ? { ...l, description: value } : l)));

  const toggle = (k: string) => setRejected((cur) => ({ ...cur, [k]: !cur[k] }));

  const accepted = lines.filter((l, i) => !rejected[keyOf(l, i)] && l.description.trim());

  const save = async () => {
    if (!shopId) {
      setSavedNote('Copy kept for this build — it saves with your menu when you hit save.');
      onTagline?.(tagline);
      onSaved?.(accepted.length);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await saveMenuCopy({
        shopId,
        tagline,
        lines: accepted.map((l) => ({ id: l.id, name: l.name, description: l.description })),
      });
      setSavedNote(
        `Saved ${res.saved} description${res.saved === 1 ? '' : 's'}${res.taglineSaved ? ' and your tagline' : ''}.`
      );
      onTagline?.(tagline);
      onSaved?.(res.saved);
    } catch (err: any) {
      setError(err.message || 'Could not save that copy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <PenLine className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-stone-900">Write my descriptions</h3>
            <p className="text-sm text-stone-600">
              {items.length} item{items.length === 1 ? '' : 's'} + your vibe words go to the writer. You approve every
              line before anything saves.
            </p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">brand.writeCopy</p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={busy || !items.length}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3 text-sm font-extrabold text-white shadow disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
          {busy ? 'Writing…' : lines.length ? 'Write again' : 'Write my descriptions'}
        </button>
      </div>

      {!vibeText && !lines.length && (
        <p className="mt-3 text-xs text-stone-600">
          Tip: describe your vibe above first. The writer copies your words, not generic menu-speak.
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {lines.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-stone-200 bg-white p-3">
            <label className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Shop tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One line about the whole shop"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-violet-500"
            />
          </div>

          <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-stone-200 bg-white p-3">
            {lines.map((l, i) => {
              const k = keyOf(l, i);
              const off = !!rejected[k];
              return (
                <div key={k} className={`rounded-lg border p-2.5 transition ${off ? 'border-stone-200 bg-stone-50 opacity-60' : 'border-stone-200'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-stone-900">
                      {l.name}
                      {l.category && <span className="ml-2 text-[11px] font-semibold text-stone-400">{l.category}</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggle(k)}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        off
                          ? 'border-stone-300 bg-white text-stone-500'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {off ? <RotateCcw className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      {off ? 'Skipped' : 'Keeping'}
                    </button>
                  </div>
                  <textarea
                    value={l.description}
                    onChange={(e) => edit(i, e.target.value)}
                    rows={2}
                    className="mt-1.5 w-full resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 outline-none focus:border-violet-500"
                  />
                  {l.previous && (
                    <p className="mt-1 text-[11px] text-stone-400">Was: {l.previous}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || accepted.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-5 py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Accept {accepted.length} line{accepted.length === 1 ? '' : 's'}
            </button>
            {savedNote && <span className="text-sm font-semibold text-emerald-700">{savedNote}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyWriter;
