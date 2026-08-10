import React, { useEffect, useState } from 'react';
import { Loader2, Check, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PAYROLL_TAXES, PAYROLL_META_KEY } from '@/data/taxClasses';
import { loadShopMenu } from '@/lib/menuStore';

const pct = (rate: number) => (rate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') || '0';

/**
 * Employer payroll taxes — unemployment (FUTA/SUTA), the FICA match and any
 * local wage tax. These never touch a ticket; they are applied when payroll
 * runs, so they live beside the sales tax setup but stay clearly separate.
 */
const PayrollTaxSetting: React.FC = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadShopMenu(user?.id || null)
      .then(async (m) => {
        if (cancelled) return;
        setShopId(m.shopId);
        let saved: Record<string, number> = {};
        if (m.shopId) {
          const { data } = await supabase.from('shops').select('metadata').eq('id', m.shopId).limit(1);
          saved = (data?.[0]?.metadata?.[PAYROLL_META_KEY] as Record<string, number>) || {};
        }
        const next: Record<string, string> = {};
        PAYROLL_TAXES.forEach((t) => {
          const v = Number(saved?.[t.id]);
          next[t.id] = pct(Number.isFinite(v) ? v : t.defaultRate);
        });
        if (!cancelled) setRates(next);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const save = async () => {
    if (!shopId) {
      setError('Upload your menu first — that creates the shop these settings attach to.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload: Record<string, number> = {};
      PAYROLL_TAXES.forEach((t) => {
        const v = Number(rates[t.id]);
        payload[t.id] = Number.isFinite(v) && v >= 0 ? v / 100 : t.defaultRate;
      });
      const { data } = await supabase.from('shops').select('metadata').eq('id', shopId).limit(1);
      const metadata = { ...(data?.[0]?.metadata || {}), [PAYROLL_META_KEY]: payload };
      const { error: err } = await supabase
        .from('shops')
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('id', shopId);
      if (err) throw new Error(err.message);
      setNotice('Saved — your payroll export uses these rates.');
    } catch (e: any) {
      setError(e?.message || 'Could not save your payroll rates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-stone-900">
            <Users className="h-4 w-4 text-amber-600" /> Payroll & unemployment taxes
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Unemployment wage tax and the rest of the employer side are never charged to a guest — they are calculated
            when payroll runs. Your SUTA rate is assigned by your state and is different for every shop, so set it here
            and the payroll export does the math.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your rates…
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PAYROLL_TAXES.map((t) => (
              <div key={t.id} className="rounded-xl border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-800">{t.label}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">{t.hint}</p>
                    <p className="mt-1 text-[11px] font-semibold text-stone-400">
                      {t.paidBy === 'employer' ? 'Employer pays' : 'Withheld from employee'}
                      {t.wageBase ? ` · first $${t.wageBase.toLocaleString()} of wages` : ' · all wages'}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center rounded-lg border border-stone-300 focus-within:border-amber-500">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.001}
                      value={rates[t.id] ?? ''}
                      onChange={(e) => {
                        setRates({ ...rates, [t.id]: e.target.value });
                        setNotice('');
                      }}
                      className="w-20 rounded-l-lg px-2 py-1.5 text-sm outline-none"
                    />
                    <span className="px-2 py-1.5 text-xs font-bold text-stone-500">%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save payroll rates'}
          </button>

          {(error || notice) && (
            <p className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${error ? 'text-red-600' : 'text-emerald-700'}`}>
              {error ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {error || notice}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PayrollTaxSetting;
