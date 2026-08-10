import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, Check, MapPin, AlertTriangle, Landmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatTaxRate } from '@/data/platform';
import {
  JURISDICTION_LEVELS,
  STATE_PRESETS,
  TAX_CLASSES,
  levelDef,
} from '@/data/taxClasses';
import type { JurisdictionLevel, TaxClassId } from '@/data/taxClasses';
import { loadShopMenu } from '@/lib/menuStore';
import {
  combinedRate,
  deleteJurisdiction,
  loadTaxProfile,
  rateFor,
  ruleFor,
  saveClassRule,
  saveJurisdiction,
  seedStateJurisdiction,
} from '@/lib/taxEngine';
import type { TaxProfile } from '@/lib/taxEngine';

const pct = (rate: number) => (rate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') || '0';

/**
 * Stacked sales tax setup: state + county + city + any special district,
 * each one deciding for itself which classes it taxes. This is what makes
 * "no sales tax here", "food is exempt", and "alcohol has an extra tax" work.
 */
const TaxJurisdictions: React.FC = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TaxProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [draft, setDraft] = useState<{ name: string; level: JurisdictionLevel; percent: string }>({
    name: '',
    level: 'county',
    percent: '',
  });
  const [stateCode, setStateCode] = useState('TX');

  const refresh = async (id: string | null, fallback: number) => {
    const next = await loadTaxProfile(id, fallback);
    setProfile(next);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadShopMenu(user?.id || null)
      .then((m) => {
        if (cancelled) return;
        setShopId(m.shopId);
        setProfile(m.taxProfile);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const jurisdictions = profile?.jurisdictions || [];
  const fallbackRate = profile?.fallbackRate ?? 0;

  const combos = useMemo(
    () =>
      profile
        ? TAX_CLASSES.map((c) => ({ cls: c, rate: combinedRate(profile, c.id as TaxClassId) }))
        : [],
    [profile],
  );

  const guard = () => {
    if (!shopId) {
      setError('Upload your menu first — that creates the shop these settings attach to.');
      return false;
    }
    return true;
  };

  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      await refresh(shopId, fallbackRate);
      setNotice(done);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong saving that.');
    } finally {
      setBusy(false);
    }
  };

  const addJurisdiction = () => {
    if (!guard()) return;
    const rate = Number(draft.percent);
    if (!draft.name.trim()) return setError('Give the jurisdiction a name (e.g. "Travis County").');
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return setError('Enter a rate between 0 and 100.');
    run(async () => {
      await saveJurisdiction(shopId as string, {
        name: draft.name.trim(),
        level: draft.level,
        rate: rate / 100,
        position: jurisdictions.length,
      });
      setDraft({ name: '', level: 'county', percent: '' });
    }, 'Added — the register is charging it now.');
  };

  const addState = () => {
    if (!guard()) return;
    run(
      () => seedStateJurisdiction(shopId as string, stateCode),
      'State added with its usual grocery treatment — adjust anything below.',
    );
  };

  const preset = STATE_PRESETS.find((s) => s.code === stateCode);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-stone-900">
            <Landmark className="h-4 w-4 text-amber-600" /> Sales tax jurisdictions
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Stack every authority you collect for — state, county, city and any special district. Each one decides on
            its own which kinds of items it taxes, so a grocery exemption or an extra alcohol tax is a setting, not a
            code change.
          </p>
        </div>
        {profile && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {jurisdictions.length === 0
              ? `Blended fallback ${formatTaxRate(fallbackRate)}`
              : `${jurisdictions.length} jurisdiction${jurisdictions.length === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your tax setup…
        </p>
      ) : (
        <>
          {!shopId && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              No shop saved on this account yet — upload a menu and these settings attach to it.
            </p>
          )}

          {/* Start from a state */}
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-stone-50 p-4">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-stone-700">Start from your state</span>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {STATE_PRESETS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} — {s.rate === 0 ? 'no state sales tax' : `${pct(s.rate)}%`}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={addState}
              disabled={busy || !shopId}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add state rate
            </button>
            {preset && (
              <p className="text-xs text-stone-500">
                {preset.rate === 0
                  ? 'This state charges no statewide sales tax — you may still owe a local rate.'
                  : preset.groceryExempt
                    ? 'Grocery food is normally exempt here, so we set that rule for you.'
                    : 'Grocery food is normally taxable here.'}
              </p>
            )}
          </div>

          {/* Existing jurisdictions */}
          <div className="mt-4 space-y-3">
            {jurisdictions.length === 0 && (
              <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                Nothing added yet — the register falls back to your single blended rate of{' '}
                {formatTaxRate(fallbackRate)} below.
              </p>
            )}

            {jurisdictions.map((j) => (
              <div key={j.id} className="rounded-xl border border-stone-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${levelDef(j.level).tone}`}>
                      {levelDef(j.level).label}
                    </span>
                    <span className="font-bold text-stone-900">{j.name}</span>
                    <span className="text-sm font-semibold text-stone-500">{formatTaxRate(j.rate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                      <input
                        type="checkbox"
                        checked={j.isActive}
                        onChange={(e) =>
                          run(
                            () =>
                              saveJurisdiction(shopId as string, {
                                id: j.id,
                                name: j.name,
                                level: j.level,
                                rate: j.rate,
                                position: j.position,
                                isActive: e.target.checked,
                              }).then(() => undefined),
                            e.target.checked ? 'Collecting again.' : 'Paused — not charged at the register.',
                          )
                        }
                      />
                      Collecting
                    </label>
                    <button
                      onClick={() => run(() => deleteJurisdiction(j.id), 'Removed.')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>

                {/* Per-class rules */}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {TAX_CLASSES.filter((c) => c.id !== 'exempt').map((c) => {
                    const rule = ruleFor(j, c.id as TaxClassId);
                    const effective = rateFor(j, c.id as TaxClassId);
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-stone-800">{c.label}</p>
                          <p className="truncate text-[11px] text-stone-500">
                            {rule.isTaxable ? `Taxed at ${formatTaxRate(effective)}` : 'Exempt here'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.001}
                            placeholder={pct(j.rate)}
                            defaultValue={rule.rateOverride === null ? '' : pct(rule.rateOverride)}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              const num = Number(v);
                              const override = v === '' ? null : Number.isFinite(num) ? num / 100 : null;
                              run(
                                () => saveClassRule(j.id, c.id as TaxClassId, rule.isTaxable, override),
                                'Rate rule saved.',
                              );
                            }}
                            className="w-20 rounded-md border border-stone-300 px-2 py-1 text-xs outline-none focus:border-amber-500"
                            title="Leave blank to use the jurisdiction rate"
                          />
                          <label className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                            <input
                              type="checkbox"
                              checked={rule.isTaxable}
                              onChange={(e) =>
                                run(
                                  () => saveClassRule(j.id, c.id as TaxClassId, e.target.checked, rule.rateOverride),
                                  e.target.checked ? 'Now taxed here.' : 'Marked exempt here.',
                                )
                              }
                            />
                            Tax
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add a local jurisdiction */}
          <div className="mt-4 grid gap-3 rounded-xl border border-stone-200 p-4 sm:grid-cols-[1.4fr_1fr_0.8fr_auto]">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-stone-700">Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Travis County / City meals tax"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-stone-700">Level</span>
              <select
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value as JurisdictionLevel })}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {JURISDICTION_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-stone-700">Rate %</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.001}
                value={draft.percent}
                onChange={(e) => setDraft({ ...draft, percent: e.target.value })}
                placeholder="1.25"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <button
              onClick={addJurisdiction}
              disabled={busy || !shopId}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </button>
            <p className="text-xs text-stone-500 sm:col-span-4">
              {levelDef(draft.level).hint}
            </p>
          </div>

          {/* What a guest actually pays */}
          {jurisdictions.length > 0 && (
            <div className="mt-4 rounded-xl bg-stone-900 p-4 text-white">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">
                <MapPin className="h-3.5 w-3.5" /> Combined rate a guest pays
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {combos.map(({ cls, rate }) => (
                  <div key={cls.id} className="rounded-lg bg-white/10 px-3 py-2">
                    <p className="text-[11px] font-semibold text-stone-300">{cls.short}</p>
                    <p className="text-lg font-extrabold">{formatTaxRate(rate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

export default TaxJurisdictions;
