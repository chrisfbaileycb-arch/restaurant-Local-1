// ============================================================
// Sales tax reference data — single source of truth.
// Nothing in the app hardcodes a rate; these are labels, levels
// and starter presets an owner picks from. Real rates live in the
// tax_jurisdictions / tax_class_rules tables per shop.
// ============================================================

export type TaxClassId = 'prepared_food' | 'grocery' | 'alcohol' | 'merch' | 'exempt';

export interface TaxClass {
  id: TaxClassId;
  label: string;
  short: string;
  hint: string;
  examples: string;
  tone: string; // tailwind chip classes
}

/**
 * Every menu item carries one of these. Each jurisdiction decides,
 * separately, whether it taxes that class and at what rate — which is
 * how "food is taxed here but not there" and "alcohol has its own
 * liquor-by-the-drink tax" both work without code changes.
 */
export const TAX_CLASSES: TaxClass[] = [
  {
    id: 'prepared_food',
    label: 'Prepared food & drink',
    short: 'Prepared',
    hint: 'Made-to-order food, hot food, dine-in and anything served ready to eat.',
    examples: 'Burgers, tacos, lattes, soft serve',
    tone: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'grocery',
    label: 'Grocery / packaged food',
    short: 'Grocery',
    hint: 'Cold, packaged or bulk food sold to take home. Exempt in many states.',
    examples: 'Bagged beans, bottled drinks, loaf of bread',
    tone: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    short: 'Alcohol',
    hint: 'Beer, wine and spirits. Often carries an extra local or liquor-by-the-drink tax.',
    examples: 'Draft IPA, house red, ranch water',
    tone: 'bg-violet-100 text-violet-900 border-violet-200',
  },
  {
    id: 'merch',
    label: 'Retail merchandise',
    short: 'Merch',
    hint: 'General goods taxed at the ordinary retail rate.',
    examples: 'T-shirts, mugs, bags of merch',
    tone: 'bg-sky-100 text-sky-900 border-sky-200',
  },
  {
    id: 'exempt',
    label: 'Never taxed',
    short: 'No tax',
    hint: 'Nothing is ever charged on this item, in any jurisdiction.',
    examples: 'Gift cards, deposits, donations',
    tone: 'bg-stone-100 text-stone-700 border-stone-200',
  },
];

export const DEFAULT_TAX_CLASS: TaxClassId = 'prepared_food';

export const taxClass = (id: string | null | undefined): TaxClass =>
  TAX_CLASSES.find((c) => c.id === id) || TAX_CLASSES[0];

// ---------------- Jurisdiction levels ----------------
export type JurisdictionLevel = 'state' | 'county' | 'city' | 'special';

export interface LevelDef {
  id: JurisdictionLevel;
  label: string;
  hint: string;
  tone: string;
}

export const JURISDICTION_LEVELS: LevelDef[] = [
  { id: 'state', label: 'State', hint: 'Your state department of revenue rate.', tone: 'bg-stone-900 text-white' },
  { id: 'county', label: 'County', hint: 'County or parish add-on.', tone: 'bg-stone-700 text-white' },
  { id: 'city', label: 'City / municipal', hint: 'City, town or transit district add-on.', tone: 'bg-stone-500 text-white' },
  {
    id: 'special',
    label: 'Special district',
    hint: 'Meals tax, liquor-by-the-drink, tourism or stadium district — usually only on some classes.',
    tone: 'bg-violet-600 text-white',
  },
];

export const levelDef = (id: string | null | undefined): LevelDef =>
  JURISDICTION_LEVELS.find((l) => l.id === id) || JURISDICTION_LEVELS[0];

// ---------------- US state starter rates ----------------
// Base state sales tax only (local add-ons are entered separately as their
// own jurisdictions). `groceryExempt` marks states that commonly exempt
// unprepared grocery food. Five states charge no state sales tax at all.
export interface StatePreset {
  code: string;
  name: string;
  rate: number; // decimal, e.g. 0.0625
  groceryExempt: boolean;
}

export const STATE_PRESETS: StatePreset[] = [
  { code: 'AL', name: 'Alabama', rate: 0.04, groceryExempt: false },
  { code: 'AK', name: 'Alaska', rate: 0, groceryExempt: true },
  { code: 'AZ', name: 'Arizona', rate: 0.056, groceryExempt: true },
  { code: 'AR', name: 'Arkansas', rate: 0.065, groceryExempt: false },
  { code: 'CA', name: 'California', rate: 0.0725, groceryExempt: true },
  { code: 'CO', name: 'Colorado', rate: 0.029, groceryExempt: true },
  { code: 'CT', name: 'Connecticut', rate: 0.0635, groceryExempt: true },
  { code: 'DE', name: 'Delaware', rate: 0, groceryExempt: true },
  { code: 'DC', name: 'District of Columbia', rate: 0.06, groceryExempt: true },
  { code: 'FL', name: 'Florida', rate: 0.06, groceryExempt: true },
  { code: 'GA', name: 'Georgia', rate: 0.04, groceryExempt: true },
  { code: 'HI', name: 'Hawaii', rate: 0.04, groceryExempt: false },
  { code: 'ID', name: 'Idaho', rate: 0.06, groceryExempt: false },
  { code: 'IL', name: 'Illinois', rate: 0.0625, groceryExempt: true },
  { code: 'IN', name: 'Indiana', rate: 0.07, groceryExempt: true },
  { code: 'IA', name: 'Iowa', rate: 0.06, groceryExempt: true },
  { code: 'KS', name: 'Kansas', rate: 0.065, groceryExempt: true },
  { code: 'KY', name: 'Kentucky', rate: 0.06, groceryExempt: true },
  { code: 'LA', name: 'Louisiana', rate: 0.0445, groceryExempt: true },
  { code: 'ME', name: 'Maine', rate: 0.055, groceryExempt: true },
  { code: 'MD', name: 'Maryland', rate: 0.06, groceryExempt: true },
  { code: 'MA', name: 'Massachusetts', rate: 0.0625, groceryExempt: true },
  { code: 'MI', name: 'Michigan', rate: 0.06, groceryExempt: true },
  { code: 'MN', name: 'Minnesota', rate: 0.06875, groceryExempt: true },
  { code: 'MS', name: 'Mississippi', rate: 0.07, groceryExempt: false },
  { code: 'MO', name: 'Missouri', rate: 0.04225, groceryExempt: false },
  { code: 'MT', name: 'Montana', rate: 0, groceryExempt: true },
  { code: 'NE', name: 'Nebraska', rate: 0.055, groceryExempt: true },
  { code: 'NV', name: 'Nevada', rate: 0.0685, groceryExempt: true },
  { code: 'NH', name: 'New Hampshire', rate: 0, groceryExempt: true },
  { code: 'NJ', name: 'New Jersey', rate: 0.06625, groceryExempt: true },
  { code: 'NM', name: 'New Mexico', rate: 0.04875, groceryExempt: true },
  { code: 'NY', name: 'New York', rate: 0.04, groceryExempt: true },
  { code: 'NC', name: 'North Carolina', rate: 0.0475, groceryExempt: true },
  { code: 'ND', name: 'North Dakota', rate: 0.05, groceryExempt: true },
  { code: 'OH', name: 'Ohio', rate: 0.0575, groceryExempt: true },
  { code: 'OK', name: 'Oklahoma', rate: 0.045, groceryExempt: true },
  { code: 'OR', name: 'Oregon', rate: 0, groceryExempt: true },
  { code: 'PA', name: 'Pennsylvania', rate: 0.06, groceryExempt: true },
  { code: 'RI', name: 'Rhode Island', rate: 0.07, groceryExempt: true },
  { code: 'SC', name: 'South Carolina', rate: 0.06, groceryExempt: true },
  { code: 'SD', name: 'South Dakota', rate: 0.042, groceryExempt: false },
  { code: 'TN', name: 'Tennessee', rate: 0.07, groceryExempt: false },
  { code: 'TX', name: 'Texas', rate: 0.0625, groceryExempt: true },
  { code: 'UT', name: 'Utah', rate: 0.061, groceryExempt: false },
  { code: 'VT', name: 'Vermont', rate: 0.06, groceryExempt: true },
  { code: 'VA', name: 'Virginia', rate: 0.053, groceryExempt: false },
  { code: 'WA', name: 'Washington', rate: 0.065, groceryExempt: true },
  { code: 'WV', name: 'West Virginia', rate: 0.06, groceryExempt: true },
  { code: 'WI', name: 'Wisconsin', rate: 0.05, groceryExempt: true },
  { code: 'WY', name: 'Wyoming', rate: 0.04, groceryExempt: true },
];

/** States with no statewide sales tax at all — the "some states don't have it" case. */
export const NO_SALES_TAX_STATES = STATE_PRESETS.filter((s) => s.rate === 0).map((s) => s.code);

// ---------------- Employer payroll taxes ----------------
// These are never charged on a ticket. They are calculated when payroll runs,
// so the register stays clean and the owner still has the numbers on file.
export interface PayrollTaxDef {
  id: string;
  label: string;
  hint: string;
  defaultRate: number; // decimal
  wageBase: number | null; // dollars of wages the rate applies to, null = all wages
  paidBy: 'employer' | 'employee';
}

export const PAYROLL_TAXES: PayrollTaxDef[] = [
  { id: 'futa', label: 'Federal unemployment (FUTA)', hint: 'Employer-paid, first $7,000 of each employee’s wages.', defaultRate: 0.006, wageBase: 7000, paidBy: 'employer' },
  { id: 'suta', label: 'State unemployment (SUTA)', hint: 'Your experience rate from the state — varies per shop.', defaultRate: 0.027, wageBase: 12000, paidBy: 'employer' },
  { id: 'social_security', label: 'Social Security', hint: 'Employer match on wages up to the annual cap.', defaultRate: 0.062, wageBase: 168600, paidBy: 'employer' },
  { id: 'medicare', label: 'Medicare', hint: 'Employer match, no wage cap.', defaultRate: 0.0145, wageBase: null, paidBy: 'employer' },
  { id: 'local_wage', label: 'Local / municipal wage tax', hint: 'City or school-district wage tax where one exists — set 0 if none.', defaultRate: 0, wageBase: null, paidBy: 'employee' },
];

export const PAYROLL_META_KEY = 'payroll_taxes';
