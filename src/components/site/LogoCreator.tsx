import React, { useState } from 'react';
import { Wand2, Loader2, Download, Check, RefreshCw, ImageIcon } from 'lucide-react';

import { LOGO_STYLES, LOGO_PALETTES, LOGO_SYMBOLS } from '@/data/vibe';
import { generateLogo } from '@/lib/vibeStore';

interface Props {
  shopName: string;
  concept?: string;
  vibe?: string;
  /** fired when a logo is generated so the parent can save it to the shop */
  onLogo?: (url: string, prompt: string, style: string, symbol: string) => void;
  savedUrl?: string | null;
}

/**
 * Logo creator — the prospect describes the vibe, picks a style, a palette
 * and a symbol, and the AI gateway draws the mark. Saved onto the shop's
 * vibe brief and reused as the website + POS logo.
 */
const LogoCreator: React.FC<Props> = ({ shopName, concept = 'restaurant', vibe = '', onLogo, savedUrl }) => {
  const [style, setStyle] = useState(LOGO_STYLES[0].id);
  const [palette, setPalette] = useState(LOGO_PALETTES[0].id);
  const [symbol, setSymbol] = useState(LOGO_SYMBOLS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState<string | null>(savedUrl || null);

  const run = async () => {
    if (!shopName.trim()) {
      setError('Type your business name first — it goes in the mark.');
      return;
    }
    setBusy(true);
    setError('');
    const res = await generateLogo({ name: shopName.trim(), concept, vibe, style, palette, symbol });
    setBusy(false);
    if (!res.success || !res.imageUrl) {
      setError(res.error || 'The logo service did not answer. Try again in a moment.');
      return;
    }
    setUrl(res.imageUrl);
    onLogo?.(res.imageUrl, res.prompt || '', style, symbol);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
          <Wand2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-extrabold text-stone-900">Logo creator</h3>
          <p className="text-sm text-stone-600">
            No designer, no Fiverr. Pick a look and we draw a mark for {shopName || 'your shop'} — it lands on the
            website, the receipts and the POS.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_200px]">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Style</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LOGO_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.hint}
                  onClick={() => setStyle(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    style === s.id ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Colors</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LOGO_PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPalette(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold transition ${
                    palette === p.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${p.swatch}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Symbol</p>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              {LOGO_SYMBOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3 text-sm font-extrabold text-white shadow disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : url ? <RefreshCw className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
            {busy ? 'Drawing your mark…' : url ? 'Try another' : 'Create my logo'}
          </button>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 p-3">
          {url ? (
            <>
              <img src={url} alt="Generated logo" className="h-40 w-40 rounded-xl object-contain" />
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <Check className="h-3 w-3" /> Saved to your brand
              </p>
              <a
                href={url}
                download={`${shopName || 'logo'}.png`}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-800"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            </>
          ) : (
            <div className="text-center text-stone-400">
              <ImageIcon className="mx-auto h-8 w-8" />
              <p className="mt-2 text-[11px] font-semibold">Your logo appears here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoCreator;
