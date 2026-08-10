import React, { useEffect, useState } from 'react';
import { Loader2, Check, Percent, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_TAX_RATE, formatTaxRate } from '@/data/platform';
import { loadShopMenu, saveShopTaxRate } from '@/lib/menuStore';

/**
 * Shop setting for the sales tax rate the POS charges.
 * The value lives on shops.tax_rate — nothing in the app hardcodes a rate.
 */
const TaxRateSetting: React.FC = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [saved, setSaved] = useState<number>(DEFAULT_TAX_RATE);
  const [percent, setPercent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadShopMenu(user?.id || null)
      .then((m) => {
        if (cancelled) return;
        setShopId(m.shopId);
        setShopName(m.shopName);
        setSaved(m.taxRate);
        setPercent((m.taxRate * 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''));
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const save = async () => {
    const parsed = Number(percent);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setStatus('error');
      setMessage('Enter a rate between 0 and 100.');
      return;
    }
    if (!shopId) {
      setStatus('error');
      setMessage('Upload your menu first — that creates the shop this setting belongs to.');
      return;
    }
    setSaving(true);
    setStatus('idle');
    try {
      const rate = parsed / 100;
      await saveShopTaxRate(shopId, rate);
      setSaved(rate);
      setStatus('done');
      setMessage('Saved — the register and receipts use this rate now.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Could not save your tax rate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-stone-900">Sales tax rate</h2>
          <p className="mt-1 text-sm text-stone-600">
            The rate the POS adds to every ticket. Stored on your shop{shopName ? ` (${shopName})` : ''} — change it
            here and the register picks it up.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
          <Percent className="h-3.5 w-3.5" /> Currently {formatTaxRate(saved)}
        </span>
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your setting…
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-stone-700">Rate charged at the register</span>
              <span className="flex items-center rounded-lg border border-stone-300 focus-within:border-amber-500">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.001}
                  value={percent}
                  onChange={(e) => {
                    setPercent(e.target.value);
                    setStatus('idle');
                  }}
                  className="w-32 rounded-l-lg px-3 py-2 text-sm outline-none"
                />
                <span className="px-3 py-2 text-sm font-bold text-stone-500">%</span>
              </span>
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save tax rate'}
            </button>
          </div>

          {!shopId && (
            <p className="mt-3 flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              No shop saved on this account yet — upload a menu and this setting attaches to it. Until then the POS
              uses {formatTaxRate(DEFAULT_TAX_RATE)}.
            </p>
          )}

          {status !== 'idle' && (
            <p className={`mt-3 text-xs font-semibold ${status === 'done' ? 'text-emerald-700' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TaxRateSetting;
