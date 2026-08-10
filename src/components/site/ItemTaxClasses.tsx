import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Check, AlertTriangle, Tags } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCents, formatTaxRate } from '@/data/platform';
import { TAX_CLASSES, taxClass as taxClassDef } from '@/data/taxClasses';
import type { TaxClassId } from '@/data/taxClasses';
import { loadShopMenu } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';
import { combinedRate, saveItemTaxClass } from '@/lib/taxEngine';

/**
 * Per-item tax treatment. This is the "vendor exemption" layer: alcohol,
 * grocery food, merch and never-taxed items each get their own class, and
 * the jurisdictions decide what that class costs.
 */
const ItemTaxClasses: React.FC = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState<LoadedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TaxClassId>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadShopMenu(user?.id || null)
      .then((m) => !cancelled && setMenu(m))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const items = useMemo(() => {
    const all = menu?.items || [];
    return filter === 'all' ? all : all.filter((i) => (i.taxClass || 'prepared_food') === filter);
  }, [menu, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    (menu?.items || []).forEach((i) => {
      const c = i.taxClass || 'prepared_food';
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [menu]);

  const setClass = async (itemId: string, cls: TaxClassId) => {
    if (!menu) return;
    // Optimistic — the register reads the same field on its next load.
    setMenu({ ...menu, items: menu.items.map((i) => (i.id === itemId ? { ...i, taxClass: cls } : i)) });
    setError('');
    setNotice('');
    if (menu.isDemo || !menu.shopId) {
      setNotice('Demo menu — upload your own menu to save these permanently.');
      return;
    }
    setSavingId(itemId);
    try {
      await saveItemTaxClass(itemId, cls);
      setNotice('Saved — the register uses it on the next ticket.');
    } catch (e: any) {
      setError(e?.message || 'Could not save that item.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-stone-900">
            <Tags className="h-4 w-4 text-amber-600" /> What each item is taxed as
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            We classify your menu automatically on upload — beer and wine become alcohol, gift cards become
            non-taxable. Change any item here and every jurisdiction rule follows it.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your menu…
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                filter === 'all' ? 'bg-stone-900 text-white' : 'border border-stone-300 text-stone-700'
              }`}
            >
              All items ({menu?.items.length || 0})
            </button>
            {TAX_CLASSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  filter === c.id ? 'bg-stone-900 text-white' : 'border border-stone-300 text-stone-700'
                }`}
              >
                {c.short} ({counts[c.id] || 0})
                {menu && (
                  <span className="ml-1 font-semibold text-stone-400">
                    {formatTaxRate(combinedRate(menu.taxProfile, c.id))}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {items.length === 0 && (
              <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                Nothing in this class yet.
              </p>
            )}
            {items.map((i) => {
              const cls = (i.taxClass || 'prepared_food') as TaxClassId;
              return (
                <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{i.name}</p>
                    <p className="text-xs text-stone-500">
                      {i.category} · {formatCents(i.price)}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${taxClassDef(cls).tone}`}>
                    {taxClassDef(cls).short}
                  </span>
                  <select
                    value={cls}
                    onChange={(e) => setClass(i.id, e.target.value as TaxClassId)}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-amber-500"
                  >
                    {TAX_CLASSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {savingId === i.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />}
                </div>
              );
            })}
          </div>

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

export default ItemTaxClasses;
