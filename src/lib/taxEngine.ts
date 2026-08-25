import { googleCloud } from '@/lib/googleCloud';
import { DEFAULT_TAX_RATE } from '@/data/platform';
import {
  DEFAULT_TAX_CLASS,
  TAX_CLASSES,
  STATE_PRESETS,
} from '@/data/taxClasses';
import type { JurisdictionLevel, TaxClassId } from '@/data/taxClasses';

// ============================================================
// Sales tax engine powered by Google Cloud SDK.
// A shop can stack any number of jurisdictions (state, county, city,
// special district) and each one decides per tax class whether it is
// taxable and at what rate. That covers no-sales-tax states, grocery
// exemptions and alcohol-only district taxes without touching code.
// ============================================================

export interface TaxRule {
  taxClass: TaxClassId;
  isTaxable: boolean;
  /** null = use the jurisdiction's own rate */
  rateOverride: number | null;
}

export interface Jurisdiction {
  id: string;
  shopId: string | null;
  name: string;
  level: JurisdictionLevel;
  rate: number; // decimal, e.g. 0.0625
  position: number;
  isActive: boolean;
  rules: TaxRule[];
}

export interface TaxProfile {
  shopId: string | null;
  jurisdictions: Jurisdiction[];
  /** Blended fallback (shops.tax_rate) used only when no jurisdictions exist. */
  fallbackRate: number;
}

export interface TaxableLine {
  amount: number; // cents, qty already applied
  taxClass?: TaxClassId | string | null;
}

export interface JurisdictionTax {
  id: string;
  name: string;
  level: JurisdictionLevel;
  /** effective rate applied to the taxable base for this jurisdiction */
  rate: number;
  taxableBase: number; // cents
  amount: number; // cents
}

export interface TaxResult {
  total: number; // cents of tax
  taxableSubtotal: number; // cents that got taxed by at least one jurisdiction
  exemptSubtotal: number; // cents that got taxed by nothing
  lines: JurisdictionTax[];
  /** true when the shop has no jurisdictions and the blended rate was used */
  usedFallback: boolean;
  /** blended effective rate across the whole ticket (for display) */
  effectiveRate: number;
}

export const EMPTY_TAX_PROFILE: TaxProfile = {
  shopId: null,
  jurisdictions: [],
  fallbackRate: DEFAULT_TAX_RATE,
};

const num = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeClass = (c: any): TaxClassId =>
  (TAX_CLASSES.find((t) => t.id === c)?.id as TaxClassId) || DEFAULT_TAX_CLASS;

/** Look up how a jurisdiction treats one tax class. Default: taxable at its own rate. */
export const ruleFor = (j: Jurisdiction, cls: TaxClassId): TaxRule =>
  j.rules.find((r) => r.taxClass === cls) || { taxClass: cls, isTaxable: true, rateOverride: null };

/** Effective rate a jurisdiction charges on a class (0 when exempt). */
export const rateFor = (j: Jurisdiction, cls: TaxClassId): number => {
  if (cls === 'exempt' || !j.isActive) return 0;
  const rule = ruleFor(j, cls);
  if (!rule.isTaxable) return 0;
  return rule.rateOverride ?? j.rate;
};

/**
 * The whole point: tax is computed per line, per jurisdiction.
 * Nothing here reads a hardcoded rate.
 */
export const computeTax = (lines: TaxableLine[], profile: TaxProfile): TaxResult => {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const active = profile.jurisdictions.filter((j) => j.isActive);

  // No jurisdictions configured yet — fall back to the single blended shop rate,
  // still honouring items marked "never taxed".
  if (active.length === 0) {
    const base = lines.reduce(
      (s, l) => (normalizeClass(l.taxClass) === 'exempt' ? s : s + l.amount),
      0,
    );
    const amount = Math.round(base * profile.fallbackRate);
    return {
      total: amount,
      taxableSubtotal: base,
      exemptSubtotal: subtotal - base,
      lines: base > 0 || profile.fallbackRate > 0
        ? [
            {
              id: 'blended',
              name: 'Sales tax',
              level: 'state',
              rate: profile.fallbackRate,
              taxableBase: base,
              amount,
            },
          ]
        : [],
      usedFallback: true,
      effectiveRate: subtotal > 0 ? amount / subtotal : profile.fallbackRate,
    };
  }

  const out: JurisdictionTax[] = [];
  let total = 0;
  const taxedLine = new Array(lines.length).fill(false);

  active.forEach((j) => {
    let base = 0;
    let weighted = 0;
    lines.forEach((l, i) => {
      const cls = normalizeClass(l.taxClass);
      const rate = rateFor(j, cls);
      if (rate > 0 && l.amount > 0) {
        base += l.amount;
        weighted += l.amount * rate;
        taxedLine[i] = true;
      }
    });
    if (base <= 0) return;
    const amount = Math.round(weighted);
    total += amount;
    out.push({
      id: j.id,
      name: j.name,
      level: j.level,
      rate: base > 0 ? weighted / base : j.rate,
      taxableBase: base,
      amount,
    });
  });

  const taxableSubtotal = lines.reduce((s, l, i) => (taxedLine[i] ? s + l.amount : s), 0);

  return {
    total,
    taxableSubtotal,
    exemptSubtotal: subtotal - taxableSubtotal,
    lines: out,
    usedFallback: false,
    effectiveRate: subtotal > 0 ? total / subtotal : 0,
  };
};

/** Combined rate a single class pays across every active jurisdiction. */
export const combinedRate = (profile: TaxProfile, cls: TaxClassId): number => {
  const active = profile.jurisdictions.filter((j) => j.isActive);
  if (active.length === 0) return cls === 'exempt' ? 0 : profile.fallbackRate;
  return active.reduce((s, j) => s + rateFor(j, cls), 0);
};

// ---------------- Persistence ----------------

const mapRow = (row: any, rules: any[]): Jurisdiction => ({
  id: row.id,
  shopId: row.shop_id ?? null,
  name: row.name,
  level: (row.level || 'state') as JurisdictionLevel,
  rate: num(row.rate),
  position: num(row.position),
  isActive: row.is_active !== false,
  rules: rules
    .filter((r) => r.jurisdiction_id === row.id)
    .map((r) => ({
      taxClass: normalizeClass(r.tax_class),
      isTaxable: r.is_taxable !== false,
      rateOverride: r.rate_override === null || r.rate_override === undefined ? null : num(r.rate_override),
    })),
});

/** Read every jurisdiction (and its class rules) for a shop. */
export const loadTaxProfile = async (
  shopId: string | null,
  fallbackRate = DEFAULT_TAX_RATE,
): Promise<TaxProfile> => {
  if (!shopId) return { ...EMPTY_TAX_PROFILE, fallbackRate };

  const { data: rows } = await googleCloud
    .from('tax_jurisdictions')
    .select('*')
    .eq('shop_id', shopId)
    .order('position');

  if (!rows || rows.length === 0) return { shopId, jurisdictions: [], fallbackRate };

  const { data: rules } = await googleCloud
    .from('tax_class_rules')
    .select('*')
    .in('jurisdiction_id', rows.map((r: any) => r.id));

  return {
    shopId,
    fallbackRate,
    jurisdictions: rows.map((r: any) => mapRow(r, rules || [])),
  };
};

export interface JurisdictionInput {
  id?: string;
  name: string;
  level: JurisdictionLevel;
  rate: number;
  position?: number;
  isActive?: boolean;
}

/** Create or update one jurisdiction row. */
export const saveJurisdiction = async (shopId: string, input: JurisdictionInput): Promise<string> => {
  const payload = {
    shop_id: shopId,
    name: input.name.trim() || 'Jurisdiction',
    level: input.level,
    rate: Math.max(0, Math.min(input.rate, 1)),
    position: input.position ?? 0,
    is_active: input.isActive !== false,
  };
  if (input.id) {
    const { error } = await googleCloud.from('tax_jurisdictions').update(payload).eq('id', input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }
  const { data, error } = await googleCloud.from('tax_jurisdictions').insert(payload).select('id').single();
  if (error || !data) throw new Error(error?.message || 'Could not add that jurisdiction');
  return data.id as string;
};

export const deleteJurisdiction = async (id: string): Promise<void> => {
  const { error } = await googleCloud.from('tax_jurisdictions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

/** Set (upsert) how one jurisdiction treats one tax class. */
export const saveClassRule = async (
  jurisdictionId: string,
  cls: TaxClassId,
  isTaxable: boolean,
  rateOverride: number | null = null,
): Promise<void> => {
  const { error } = await googleCloud
    .from('tax_class_rules')
    .upsert(
      {
        jurisdiction_id: jurisdictionId,
        tax_class: cls,
        is_taxable: isTaxable,
        rate_override: rateOverride,
      },
      { onConflict: 'jurisdiction_id,tax_class' },
    );
  if (error) throw new Error(error.message);
};

/** Save the tax class on a single menu item. */
export const saveItemTaxClass = async (itemId: string, cls: TaxClassId): Promise<void> => {
  const { error } = await googleCloud.from('menu_items').update({ tax_class: cls }).eq('id', itemId);
  if (error) throw new Error(error.message);
};

/**
 * Seed a shop from a state preset: creates the state jurisdiction and, when
 * that state exempts grocery food, writes the grocery exemption rule too.
 */
export const seedStateJurisdiction = async (shopId: string, stateCode: string): Promise<void> => {
  const preset = STATE_PRESETS.find((s) => s.code === stateCode);
  if (!preset) return;
  const id = await saveJurisdiction(shopId, {
    name: `${preset.name} state tax`,
    level: 'state',
    rate: preset.rate,
    position: 0,
  });
  if (preset.groceryExempt) await saveClassRule(id, 'grocery', false, null);
};
