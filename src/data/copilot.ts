// ------------------------------------------------------------
// Love Local Operator Copilot — single source of truth.
// Quick actions, skill catalog, live labor roster and the sales
// snapshot the copilot reasons over. Imported by the sidebar,
// the brain and the register. Never duplicate this data.
// ------------------------------------------------------------

export type QuickActionId =
  | 'eighty-six'
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
    id: 'flash-discount',
    label: 'Flash Discount',
    icon: 'Percent',
    command: 'Run 15% happy hour for 2 hours',
    hint: 'Time-boxed price drop, logged for the manager audit trail.',
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

/** What the copilot can actually do — shown as the opening card. */
export const COPILOT_SKILLS: { title: string; body: string }[] = [
  { title: 'Menu & 86ing', body: 'Register buttons, online cart and the public site update together.' },
  { title: 'Floor & tickets', body: 'Split, move and comp checks in plain English, every override logged.' },
  { title: 'Shift & labor sentinel', body: 'Live labor % against sales, plus overtime warnings before the shift.' },
  { title: 'Close handoff', body: 'Net sales, tax, tips, tenders and voids as one clean JSON payload.' },
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
  'Change smash burger price to $12.95',
  'Split table 4 evenly 3 ways',
  'Move table 2 to bar 1',
  'Comp $8 off table 1 — remake',
  'Is anyone close to overtime?',
  'Ping the kitchen printer',
  'Run daily close',
];

export const formatHours = (h: number) => `${h.toFixed(1)} hrs`;
