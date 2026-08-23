// ============================================================
// Multi-location group: the single source of truth for every
// store, region, roll-up metric and consolidated report.
// Import from here — never re-declare a location list.
// ============================================================

export type LocationStatus = 'open' | 'closed-today' | 'building' | 'seasonal';

export interface StoreLocation {
  id: string;
  name: string;
  nickname: string;
  concept: string; // matches a BUSINESS_TYPES label
  region: RegionId;
  city: string;
  state: string;
  status: LocationStatus;
  openedYear: number;
  /** yesterday's numbers — what the group dashboard opens on */
  sales: number;
  orders: number;
  laborCost: number;
  compsVoids: number;
  cashVariance: number;
  /** same day last week, used for the trend arrow */
  priorSales: number;
  /** live operational state */
  devicesOnline: number;
  devicesTotal: number;
  staffOnShift: number;
  ticketAvgMinutes: number;
  connectivity: 'wifi' | 'lte' | 'offline';
  /** menu governance */
  menuSource: 'group' | 'local';
  priceTier: 'A' | 'B' | 'C';
  taxRate: number;
  manager: string;
}

export type RegionId = 'north' | 'central' | 'south' | 'mobile';

export interface Region {
  id: RegionId;
  name: string;
  lead: string;
  tone: string; // tailwind gradient
  note: string;
}

export const REGIONS: Region[] = [
  { id: 'north', name: 'North Metro', lead: 'Alexis Rowe', tone: 'from-sky-500 to-cyan-400', note: 'Two cafés and the flagship dining room.' },
  { id: 'central', name: 'Central City', lead: 'Devon Marks', tone: 'from-fuchsia-500 to-pink-500', note: 'Highest volume, longest hours, most staff.' },
  { id: 'south', name: 'South Corridor', lead: 'Priya Shah', tone: 'from-emerald-500 to-teal-400', note: 'Suburban growth market — two stores under a year old.' },
  { id: 'mobile', name: 'Mobile & Events', lead: 'Marco Tovar', tone: 'from-amber-500 to-orange-500', note: 'Trucks and event carts. LTE-first, no fixed broadband.' },
];

export const LOCATIONS: StoreLocation[] = [
  {
    id: 'lle-001', name: 'Love Local — Riverside', nickname: 'Riverside', concept: 'Restaurant', region: 'north',
    city: 'Riverside', state: 'TX', status: 'open', openedYear: 2019,
    sales: 8420, orders: 311, laborCost: 2104, compsVoids: 118, cashVariance: -4.25, priorSales: 7980,
    devicesOnline: 11, devicesTotal: 11, staffOnShift: 9, ticketAvgMinutes: 7.4, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'A', taxRate: 0.0825, manager: 'Alexis Rowe',
  },
  {
    id: 'lle-002', name: 'North Bend Coffee', nickname: 'North Bend', concept: 'Coffee Shop', region: 'north',
    city: 'North Bend', state: 'TX', status: 'open', openedYear: 2021,
    sales: 3180, orders: 402, laborCost: 690, compsVoids: 26, cashVariance: 0, priorSales: 3040,
    devicesOnline: 6, devicesTotal: 6, staffOnShift: 4, ticketAvgMinutes: 2.1, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'B', taxRate: 0.0825, manager: 'Hannah Kirk',
  },
  {
    id: 'lle-003', name: 'Warm Batch Cookies — Depot', nickname: 'Depot', concept: 'Cookie Shop', region: 'north',
    city: 'Riverside', state: 'TX', status: 'open', openedYear: 2022,
    sales: 2240, orders: 268, laborCost: 452, compsVoids: 14, cashVariance: 2.10, priorSales: 2390,
    devicesOnline: 4, devicesTotal: 5, staffOnShift: 3, ticketAvgMinutes: 1.8, connectivity: 'wifi',
    menuSource: 'local', priceTier: 'B', taxRate: 0.0825, manager: 'Dre Coleman',
  },
  {
    id: 'lle-004', name: 'Love Local — Market Square', nickname: 'Market Sq', concept: 'Restaurant', region: 'central',
    city: 'Austin', state: 'TX', status: 'open', openedYear: 2018,
    sales: 11960, orders: 438, laborCost: 3110, compsVoids: 244, cashVariance: -11.80, priorSales: 10480,
    devicesOnline: 13, devicesTotal: 14, staffOnShift: 14, ticketAvgMinutes: 9.2, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'A', taxRate: 0.0825, manager: 'Devon Marks',
  },
  {
    id: 'lle-005', name: 'Second Street Bakery', nickname: '2nd Street', concept: 'Bakery', region: 'central',
    city: 'Austin', state: 'TX', status: 'open', openedYear: 2020,
    sales: 4610, orders: 349, laborCost: 1020, compsVoids: 41, cashVariance: 1.35, priorSales: 4720,
    devicesOnline: 7, devicesTotal: 7, staffOnShift: 5, ticketAvgMinutes: 3.0, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'A', taxRate: 0.0825, manager: 'June Kwon',
  },
  {
    id: 'lle-006', name: 'Cold Front Ice Cream', nickname: 'Cold Front', concept: 'Ice Cream', region: 'central',
    city: 'Austin', state: 'TX', status: 'seasonal', openedYear: 2023,
    sales: 1870, orders: 231, laborCost: 421, compsVoids: 9, cashVariance: 0, priorSales: 1510,
    devicesOnline: 4, devicesTotal: 4, staffOnShift: 3, ticketAvgMinutes: 2.4, connectivity: 'wifi',
    menuSource: 'local', priceTier: 'C', taxRate: 0.0825, manager: 'Sam Ellis',
  },
  {
    id: 'lle-007', name: 'Love Local — Southgate', nickname: 'Southgate', concept: 'Restaurant', region: 'south',
    city: 'San Marcos', state: 'TX', status: 'open', openedYear: 2024,
    sales: 6140, orders: 254, laborCost: 1780, compsVoids: 162, cashVariance: -6.40, priorSales: 5210,
    devicesOnline: 9, devicesTotal: 10, staffOnShift: 8, ticketAvgMinutes: 8.8, connectivity: 'lte',
    menuSource: 'group', priceTier: 'B', taxRate: 0.0825, manager: 'Priya Shah',
  },
  {
    id: 'lle-008', name: 'Greenline Smoothie Bar', nickname: 'Greenline', concept: 'Smoothie Bar', region: 'south',
    city: 'Kyle', state: 'TX', status: 'open', openedYear: 2024,
    sales: 2020, orders: 186, laborCost: 498, compsVoids: 11, cashVariance: 0, priorSales: 1640,
    devicesOnline: 5, devicesTotal: 5, staffOnShift: 3, ticketAvgMinutes: 3.4, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'C', taxRate: 0.0775, manager: 'Tasha Bell',
  },
  {
    id: 'lle-009', name: 'Southgate Tap Room', nickname: 'Tap Room', concept: 'Beer & Wine', region: 'south',
    city: 'San Marcos', state: 'TX', status: 'building', openedYear: 2026,
    sales: 0, orders: 0, laborCost: 0, compsVoids: 0, cashVariance: 0, priorSales: 0,
    devicesOnline: 3, devicesTotal: 8, staffOnShift: 0, ticketAvgMinutes: 0, connectivity: 'wifi',
    menuSource: 'group', priceTier: 'B', taxRate: 0.0825, manager: 'Priya Shah',
  },
  {
    id: 'lle-010', name: 'Vega Street Tacos — Truck 1', nickname: 'Truck 1', concept: 'Food Truck', region: 'mobile',
    city: 'Austin', state: 'TX', status: 'open', openedYear: 2022,
    sales: 2960, orders: 204, laborCost: 540, compsVoids: 18, cashVariance: -2.00, priorSales: 2610,
    devicesOnline: 4, devicesTotal: 4, staffOnShift: 3, ticketAvgMinutes: 4.1, connectivity: 'lte',
    menuSource: 'group', priceTier: 'C', taxRate: 0.0825, manager: 'Marisol Vega',
  },
  {
    id: 'lle-011', name: 'Vega Street Tacos — Truck 2', nickname: 'Truck 2', concept: 'Food Truck', region: 'mobile',
    city: 'Round Rock', state: 'TX', status: 'open', openedYear: 2025,
    sales: 2140, orders: 158, laborCost: 402, compsVoids: 22, cashVariance: 0, priorSales: 1920,
    devicesOnline: 3, devicesTotal: 4, staffOnShift: 2, ticketAvgMinutes: 4.6, connectivity: 'offline',
    menuSource: 'group', priceTier: 'C', taxRate: 0.0825, manager: 'Marisol Vega',
  },
  {
    id: 'lle-012', name: 'Event Cart — Convention', nickname: 'Event Cart', concept: 'Food Truck', region: 'mobile',
    city: 'Austin', state: 'TX', status: 'closed-today', openedYear: 2025,
    sales: 0, orders: 0, laborCost: 0, compsVoids: 0, cashVariance: 0, priorSales: 1180,
    devicesOnline: 2, devicesTotal: 3, staffOnShift: 0, ticketAvgMinutes: 0, connectivity: 'lte',
    menuSource: 'group', priceTier: 'C', taxRate: 0.0825, manager: 'Marco Tovar',
  },
];

// ---------------- Derived roll-ups ----------------

export const laborPct = (l: StoreLocation) => (l.sales > 0 ? (l.laborCost / l.sales) * 100 : 0);
export const avgTicket = (l: StoreLocation) => (l.orders > 0 ? l.sales / l.orders : 0);
export const salesDelta = (l: StoreLocation) =>
  l.priorSales > 0 ? ((l.sales - l.priorSales) / l.priorSales) * 100 : 0;

export interface Rollup {
  sales: number;
  orders: number;
  labor: number;
  laborPct: number;
  avgTicket: number;
  comps: number;
  variance: number;
  devicesOnline: number;
  devicesTotal: number;
  staff: number;
  priorSales: number;
  delta: number;
  count: number;
}

export const rollup = (list: StoreLocation[]): Rollup => {
  const sales = list.reduce((s, l) => s + l.sales, 0);
  const orders = list.reduce((s, l) => s + l.orders, 0);
  const labor = list.reduce((s, l) => s + l.laborCost, 0);
  const priorSales = list.reduce((s, l) => s + l.priorSales, 0);
  return {
    sales,
    orders,
    labor,
    laborPct: sales > 0 ? (labor / sales) * 100 : 0,
    avgTicket: orders > 0 ? sales / orders : 0,
    comps: list.reduce((s, l) => s + l.compsVoids, 0),
    variance: list.reduce((s, l) => s + l.cashVariance, 0),
    devicesOnline: list.reduce((s, l) => s + l.devicesOnline, 0),
    devicesTotal: list.reduce((s, l) => s + l.devicesTotal, 0),
    staff: list.reduce((s, l) => s + l.staffOnShift, 0),
    priorSales,
    delta: priorSales > 0 ? ((sales - priorSales) / priorSales) * 100 : 0,
    count: list.length,
  };
};

export const byRegion = (id: RegionId) => LOCATIONS.filter((l) => l.region === id);
export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id) || LOCATIONS[0];

export const STATUS_COPY: Record<LocationStatus, { label: string; chip: string }> = {
  open: { label: 'Open', chip: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'closed-today': { label: 'Closed today', chip: 'bg-slate-100 text-slate-600 border-slate-200' },
  building: { label: 'In build', chip: 'bg-violet-100 text-violet-800 border-violet-200' },
  seasonal: { label: 'Seasonal', chip: 'bg-amber-100 text-amber-900 border-amber-200' },
};

export const CONNECTIVITY_COPY: Record<StoreLocation['connectivity'], { label: string; chip: string }> = {
  wifi: { label: 'WiFi', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lte: { label: 'LTE failover', chip: 'bg-sky-50 text-sky-700 border-sky-200' },
  offline: { label: 'Offline queue', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
};

// ---------------- Reporting structures ----------------
// How numbers are allowed to combine. This is the part a
// multi-unit operator (and their accountant) actually asks about.

export interface ReportingLevel {
  id: 'store' | 'region' | 'brand' | 'entity' | 'group';
  name: string;
  scope: string;
  whoSees: string;
  rolls: string;
  examples: string[];
}

export const REPORTING_LEVELS: ReportingLevel[] = [
  {
    id: 'store',
    name: 'Store',
    scope: 'One address, one drawer, one tax jurisdiction.',
    whoSees: 'Store manager and above',
    rolls: 'Feeds its region and the group total.',
    examples: ['Z / daily close', 'Hourly sales & labor', 'Cash audit trail'],
  },
  {
    id: 'region',
    name: 'Region',
    scope: 'A cluster of stores under one area lead.',
    whoSees: 'Regional lead and above',
    rolls: 'Sums its stores; never mixes brands.',
    examples: ['Region sales vs plan', 'Labor % league table', 'Comp & void outliers'],
  },
  {
    id: 'brand',
    name: 'Brand / concept',
    scope: 'Every store running the same concept and menu.',
    whoSees: 'Brand owner and above',
    rolls: 'Cuts across regions for menu decisions.',
    examples: ['Product mix by brand', 'Price-tier performance', 'Dead-item alerts'],
  },
  {
    id: 'entity',
    name: 'Legal entity',
    scope: 'The LLC or corp that actually files and gets funded.',
    whoSees: 'Owner, bookkeeper, accountant',
    rolls: 'Groups stores by EIN, not by geography.',
    examples: ['Sales tax filing by jurisdiction', 'P&L input pack', '1099-K reconciliation'],
  },
  {
    id: 'group',
    name: 'Group',
    scope: 'Everything you own, in one number.',
    whoSees: 'Owner / investor view only',
    rolls: 'Top of the tree. Nothing rolls above it.',
    examples: ['Group P&L roll-up', 'Portfolio unit economics', 'New-store ramp curve'],
  },
];

export interface GroupReport {
  id: string;
  name: string;
  level: ReportingLevel['id'];
  cadence: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  detail: string;
}

/** Group-level reports layered ON TOP of the 12 per-store reports in REPORTS. */
export const GROUP_REPORTS: GroupReport[] = [
  { id: 'g-daily', name: 'Group daily flash', level: 'group', cadence: 'Daily', detail: 'Every store closed out, side by side, with variance and comp outliers flagged before you read them.' },
  { id: 'g-league', name: 'Store league table', level: 'region', cadence: 'Weekly', detail: 'Rank by sales, labor %, average ticket and ticket time. The bottom two are auto-annotated with why.' },
  { id: 'g-pmix', name: 'Cross-brand product mix', level: 'brand', cadence: 'Weekly', detail: 'One item measured across every store that carries it, so a menu cut is made on real units.' },
  { id: 'g-labor', name: 'Consolidated labor & overtime', level: 'region', cadence: 'Weekly', detail: 'Hours, OT exposure and split-shift flags for the whole group, exported in one payroll file.' },
  { id: 'g-tax', name: 'Multi-jurisdiction sales tax', level: 'entity', cadence: 'Monthly', detail: 'Taxable vs exempt per store, grouped by filing jurisdiction and entity, formatted for state e-file.' },
  { id: 'g-pnl', name: 'Consolidated P&L input pack', level: 'entity', cadence: 'Monthly', detail: 'Revenue, COGS estimate, labor, fees and comps per store and combined, with intercompany kept separate.' },
  { id: 'g-fees', name: 'Portfolio fee analysis', level: 'group', cadence: 'Monthly', detail: 'Effective processing rate per store and blended, plus what least-cost routing saved across the group.' },
  { id: 'g-ramp', name: 'New-store ramp curve', level: 'group', cadence: 'Monthly', detail: 'Weeks-since-open vs sales for every store you have ever opened, so you can underwrite the next one.' },
  { id: 'g-cash', name: 'Group cash variance & exceptions', level: 'group', cadence: 'Daily', detail: 'Every drawer short, no-sale and manager override in the portfolio on one page, by employee.' },
  { id: 'g-year', name: 'Portfolio year-end pack', level: 'entity', cadence: 'Yearly', detail: 'Annual sales by store and month, fees paid, 1099-K reconciliation per entity, one zip to the CPA.' },
];

/** What a multi-unit owner gets that a single-store owner does not. */
export const MULTI_CAPABILITIES = [
  { id: 'switch', title: 'One login, every store', body: 'Switch stores from the header without signing out. Staff only ever see the store they clocked into.' },
  { id: 'menu', title: 'Publish a menu everywhere at once', body: 'Edit the group menu, choose which stores take it, and keep local prices per price tier.' },
  { id: 'price', title: 'Price tiers, not price chaos', body: 'Tier A downtown, C at the truck. Same item, same recipe, three prices, one product mix report.' },
  { id: 'staff', title: 'Staff who work two stores', body: 'One employee record, hours from both stores, one payroll line, overtime caught across the group.' },
  { id: 'permissions', title: 'Scoped permissions by level', body: 'Store manager sees a store. Regional sees a region. Only the owner sees the group P&L.' },
  { id: 'clone', title: 'Clone a store in minutes', body: 'New address inherits menu, routing, roles and reports. Hardware ships pre-paired to that store ID.' },
  { id: 'health', title: 'Fleet-wide equipment health', body: 'All 76 paired devices heartbeat into one board. A dark kitchen printer names the store instantly.' },
  { id: 'alerts', title: 'Exceptions come to you', body: 'Cash short, comp spike, labor over plan or a store still open past close — surfaced, not searched for.' },
];
