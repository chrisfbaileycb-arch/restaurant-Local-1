// ------------------------------------------------------------
// Love Local Operator Copilot — single source of truth.
// Quick actions, skill catalog, live labor roster and the sales
// snapshot the copilot reasons over. Imported by the sidebar,
// the brain and the register. Never duplicate this data.
// ------------------------------------------------------------

export type QuickActionId =
  | 'eighty-six'
  | 'margin-reprice'
  | 'build-schedule'
  | 'z-report'
  | 'food-cost-variance'
  | 'flash-discount'
  | 'split-check'
  | 'labor-audit'
  | 'daily-close';


export interface QuickAction {
  id: QuickActionId;
  label: string;
  icon: string;
  /** Pre-filled command dropped into the composer when tapped. */
  command: string;
  hint: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'eighty-six',
    label: '86 Menu Item',
    icon: 'Ban',
    command: '86 the ',
    hint: 'Pulls it from the register, online cart and public menu at once.',
  },
  {
    id: 'margin-reprice',
    label: 'Food Cost Reprice',
    icon: 'Percent',
    command: 'Food cost is up 18% — reprice to hold a 68% margin',
    hint: 'Recalculates plate cost and repricing across POS, cart and website.',
  },
  {
    id: 'build-schedule',
    label: 'Build The Week',
    icon: 'CalendarDays',
    command: 'Build next week: 2 line cooks, 1 prep, 2 cashiers, under 180 hours',
    hint: 'Weekly shifts to a labor budget, with overtime warnings and a printable roster.',
  },
  {
    id: 'z-report',
    label: 'Z-Report',
    icon: 'FileCheck2',
    command: 'Run the Z-report',
    hint: 'Drawer-count close, ready for the printer or the bookkeeper.',
  },
  {
    id: 'food-cost-variance',
    label: 'Food Cost Variance',
    icon: 'BarChart3',
    command: 'Food cost variance report',
    hint: 'Theoretical vs actual cost, waste by item, printable.',
  },
  {
    id: 'split-check',
    label: 'Split Check',
    icon: 'Users',
    command: 'Split table 4 evenly 3 ways',
    hint: 'Even, by seat, or move a tab to the bar.',
  },
  {
    id: 'labor-audit',
    label: 'Labor Margin Audit',
    icon: 'Timer',
    command: 'Labor margin audit',
    hint: 'Live sales vs clock-ins, with overtime risk flags.',
  },
  {
    id: 'daily-close',
    label: 'Daily Close Handoff',
    icon: 'FileCheck2',
    command: 'Run daily close',
    hint: 'Builds the standardized JSON payload for your ledger.',
  },
];


/** The four 24/7 skill engines an active subscription turns on. */
export const COPILOT_SKILLS: { title: string; body: string }[] = [
  { title: 'Menu & margin ops', body: '1-command 86ing, food-cost repricing to a target margin, modifier tree synced to POS, cart and site.' },
  { title: 'Schedule & labor', body: 'Build the week to a labor budget, overtime warnings, printable kitchen roster.' },
  { title: 'Reports & audits', body: 'Z-report, food cost variance, PMIX velocity and hourly labor — printed or exported.' },
  { title: 'Web & brand', body: 'Hours, banners, photos and hero copy written straight into your saved website settings.' },
];


// ---------------- Live labor roster ----------------

export interface StaffShift {
  id: string;
  name: string;
  role: string;
  /** Hours already worked this pay week. */
  weekHours: number;
  /** Hours on today's clock-in. */
  todayHours: number;
  rate: number; // cents / hour
  clockedIn: boolean;
}

export const STAFF_ROSTER: StaffShift[] = [
  { id: 's1', name: 'Marcus',  role: 'Line cook',  weekHours: 37.5, todayHours: 6.5, rate: 1900, clockedIn: true },
  { id: 's2', name: 'Dani',    role: 'Counter',    weekHours: 28.0, todayHours: 5.0, rate: 1650, clockedIn: true },
  { id: 's3', name: 'Rey',     role: 'Prep',       weekHours: 22.5, todayHours: 4.0, rate: 1600, clockedIn: true },
  { id: 's4', name: 'Amara',   role: 'Shift lead', weekHours: 33.0, todayHours: 7.0, rate: 2200, clockedIn: true },
  { id: 's5', name: 'Tovah',   role: 'Dish',       weekHours: 16.0, todayHours: 0.0, rate: 1500, clockedIn: false },
];

/** Anything at or above this is an overtime warning before the next shift. */
export const OVERTIME_THRESHOLD = 36;
export const OVERTIME_LIMIT = 40;

/** Healthy labor cost band for a small food business. */
export const LABOR_TARGET = { good: 0.25, warn: 0.32 };

// ---------------- Sales snapshot ----------------
// Stand-in for the live day the copilot reports against until a
// real service day is running on the account.

export interface SalesSnapshot {
  netSales: number;      // cents
  grossSales: number;    // cents
  taxCollected: number;  // cents
  tips: number;          // cents
  cashTenders: number;   // cents
  cardTenders: number;   // cents
  voids: number;         // cents
  comps: number;         // cents
  ticketCount: number;
  coverCount: number;
  hourStarted: string;
}

export const TODAY_SNAPSHOT: SalesSnapshot = {
  netSales: 418750,      // $4,187.50
  grossSales: 452100,    // $4,521.00
  taxCollected: 33350,   // $333.50
  tips: 61200,           // $612.00
  cashTenders: 89450,    // $894.50
  cardTenders: 361650,   // $3,616.50
  voids: 4200,           // $42.00
  comps: 2850,           // $28.50
  ticketCount: 168,
  coverCount: 214,
  hourStarted: '6:30 AM',
};


// ---------------- Floor tables ----------------

export interface FloorTable {
  id: string;
  label: string;
  seats: number;
  open: number; // cents on the tab
}

export const FLOOR_TABLES: FloorTable[] = [
  { id: 't1', label: 'Table 1', seats: 2, open: 3450 },
  { id: 't2', label: 'Table 2', seats: 4, open: 8720 },
  { id: 't3', label: 'Table 3', seats: 4, open: 0 },
  { id: 't4', label: 'Table 4', seats: 6, open: 14265 },
  { id: 'b1', label: 'Bar 1', seats: 1, open: 1875 },
  { id: 'b2', label: 'Bar 2', seats: 1, open: 0 },
  { id: 'p1', label: 'Patio 1', seats: 4, open: 5240 },
];

// ---------------- Sentinel channels ----------------
// The bottom status bar. Device rows come from the shared health
// heartbeat; these are the labels and the copy for each state.

export const SENTINEL_CHANNELS: {
  id: 'network' | 'receipt-printer' | 'kitchen-printer' | 'cash-drawer' | 'card-reader';
  label: string;
  icon: string;
}[] = [
  { id: 'network', label: 'Network', icon: 'Signal' },
  { id: 'receipt-printer', label: 'Guest printer', icon: 'Printer' },
  { id: 'kitchen-printer', label: 'Kitchen spool', icon: 'ChefHat' },
  { id: 'cash-drawer', label: 'Drawer', icon: 'Archive' },
  { id: 'card-reader', label: 'Card swiper', icon: 'CreditCard' },
];

/** Suggested prompts rotated under the composer. */
export const COPILOT_SUGGESTIONS = [
  '86 the breakfast burrito',
  'Bacon cost jumped 18% — reprice to 68% margin',
  'Build next week: 2 line cooks, 1 prep, 2 cashiers, under 180 hours',
  'Print the kitchen roster',
  'Run the Z-report',
  'Food cost variance report',
  'Show hourly labor percentage',
  'Post a banner about our Friday fish fry',
];

export const formatHours = (h: number) => `${h.toFixed(1)} hrs`;

// ---------------- Menu & margin engine ----------------
// Plate cost as a share of menu price, by category keyword. Real shops
// override these per item; this is the starting basis the copilot
// reprices against until item-level costs are entered.

export const FOOD_COST_TARGET = 0.3; // 30% plate cost = 70% margin
export const MARGIN_FLOOR = 0.55;

export const COST_BASIS: { match: RegExp; ratio: number; label: string }[] = [
  { match: /(steak|ribeye|brisket|salmon|shrimp|crab|lobster)/i, ratio: 0.42, label: 'Center-of-plate protein' },
  { match: /(burger|sandwich|wrap|taco|burrito|melt|hoagie)/i, ratio: 0.33, label: 'Handhelds' },
  { match: /(breakfast|egg|bacon|omelet|hash|biscuit|pancake|waffle)/i, ratio: 0.31, label: 'Breakfast' },
  { match: /(salad|bowl|veg|greens)/i, ratio: 0.28, label: 'Produce-led' },
  { match: /(side|fries|chips|toast|extra)/i, ratio: 0.22, label: 'Sides' },
  { match: /(coffee|espresso|latte|tea|soda|juice|drink|beverage)/i, ratio: 0.18, label: 'Beverage' },
  { match: /(beer|wine|cocktail|seltzer)/i, ratio: 0.24, label: 'Alcohol' },
  { match: /(cookie|pie|cake|pastry|dessert|cobbler|donut)/i, ratio: 0.26, label: 'Bakery' },
];

/** Ingredients whose price moves get typed in most often. */
export const SUPPLY_LINES = ['bacon', 'eggs', 'beef', 'chicken', 'cheese', 'produce', 'coffee', 'flour', 'oil', 'avocado'];

// ---------------- Hourly sales & labor ----------------

export interface HourBand {
  hour: string;
  sales: number;   // cents
  laborHours: number;
  covers: number;
}

export const HOURLY_BANDS: HourBand[] = [
  { hour: '6a', sales: 18450, laborHours: 3.0, covers: 14 },
  { hour: '7a', sales: 41200, laborHours: 4.0, covers: 31 },
  { hour: '8a', sales: 52800, laborHours: 4.0, covers: 38 },
  { hour: '9a', sales: 36150, laborHours: 3.5, covers: 24 },
  { hour: '10a', sales: 24900, laborHours: 3.0, covers: 17 },
  { hour: '11a', sales: 39750, laborHours: 4.5, covers: 26 },
  { hour: '12p', sales: 78400, laborHours: 6.0, covers: 42 },
  { hour: '1p', sales: 64300, laborHours: 6.0, covers: 34 },
  { hour: '2p', sales: 33800, laborHours: 4.0, covers: 19 },
  { hour: '3p', sales: 29000, laborHours: 3.5, covers: 15 },
];

// ---------------- Product mix (PMIX) ----------------

export interface PmixRow {
  name: string;
  category: string;
  sold: number;
  price: number;  // cents
  cost: number;   // cents, plate cost
  wasted: number; // units thrown / remade
}

export const PMIX_ROWS: PmixRow[] = [
  { name: 'Breakfast Burrito', category: 'Breakfast', sold: 38, price: 1095, cost: 352, wasted: 1 },
  { name: 'Smash Burger', category: 'Sandwiches', sold: 34, price: 1295, cost: 441, wasted: 2 },
  { name: 'Bacon Egg Biscuit', category: 'Breakfast', sold: 29, price: 795, cost: 268, wasted: 0 },
  { name: 'Chicken Caesar Wrap', category: 'Sandwiches', sold: 22, price: 1150, cost: 356, wasted: 1 },
  { name: 'House Salad', category: 'Salads', sold: 18, price: 950, cost: 247, wasted: 3 },
  { name: 'Cold Brew', category: 'Drinks', sold: 61, price: 545, cost: 92, wasted: 0 },
  { name: 'Latte', category: 'Drinks', sold: 54, price: 495, cost: 86, wasted: 1 },
  { name: 'Loaded Fries', category: 'Sides', sold: 26, price: 695, cost: 158, wasted: 2 },
  { name: 'Peach Cobbler', category: 'Bakery', sold: 15, price: 650, cost: 176, wasted: 4 },
];

// ---------------- Weekly schedule builder ----------------

export interface StationNeed {
  role: string;
  /** default heads per shift when the owner does not say */
  heads: number;
  /** hours a single shift covers */
  shiftHours: number;
}

export const STATION_NEEDS: StationNeed[] = [
  { role: 'Line cook', heads: 2, shiftHours: 8 },
  { role: 'Prep', heads: 1, shiftHours: 6 },
  { role: 'Cashier', heads: 2, shiftHours: 7 },
  { role: 'Dish', heads: 1, shiftHours: 5 },
];

/** Relative volume by day — Friday and Saturday carry the week. */
export const DAY_WEIGHTS: { day: string; weight: number }[] = [
  { day: 'Mon', weight: 0.78 },
  { day: 'Tue', weight: 0.8 },
  { day: 'Wed', weight: 0.88 },
  { day: 'Thu', weight: 0.95 },
  { day: 'Fri', weight: 1.25 },
  { day: 'Sat', weight: 1.3 },
  { day: 'Sun', weight: 1.04 },
];

/** Default weekly labor ceiling when the owner does not name one. */
export const DEFAULT_WEEK_HOUR_BUDGET = 180;
