// ============================================================
// Love Local Eats POS — single source of truth for shared platform data.
// Import from here; never re-declare these lists elsewhere.
// ============================================================

export const BRAND = {
  name: 'Love Local Eats POS',
  shortName: 'Love Local Eats',
  wordmark: { love: 'Love', local: 'Local Eats', kicker: 'POS' },
  tagline: 'Upload your menu. Launch your whole business.',
  subtitle:
    'The no-code restaurant operating system built with heart for independent operators: touchscreen POS, table tabs, kitchen & bar tickets, online ordering, a one-page website, rewards, scheduling and every report your accountant asks for — built automatically from one menu upload.',
  promise: 'Built with heart for independent operators. No corporate contracts, no lock-in.',
  supportPhone: '(888) 555-5683',
  supportEmail: 'hello@lovelocaleatspos.com',
  domain: 'lovelocaleatspos.com',
};



export const PROJECT_ID = '6a7724f7e7b1bd470e4c72fe';
export const CRM_SUBSCRIBE_URL = `https://famous.ai/api/crm/${PROJECT_ID}/subscribe`;
export const SHIPPING_RULES = 'Free shipping on all orders';
export const CART_KEY = 'ecom_cart';

export const STRIPE_ACCOUNT_ID = 'acct_1U29eAHp8n38koou';
export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ';

export const HERO_IMAGE =
  'https://d64gsuwffb70l.cloudfront.net/6a7724f7e7b1bd470e4c72fe_1786193315031_560d8c9d.jpg';

export const formatCents = (cents: number | null | undefined) =>
  `$${(((cents ?? 0) as number) / 100).toFixed(2)}`;

export const formatMoney = (dollars: number) =>
  dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// ---------------- Business types (drives onboarding + copy) ----------------
export interface BusinessType {
  id: string;
  label: string;
  blurb: string;
  accent: string; // tailwind classes
  suggestedCategories: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: 'restaurant', label: 'Restaurant', blurb: 'Dine-in, takeout, tables & tabs', accent: 'from-orange-500 to-red-500', suggestedCategories: ['Starters', 'Entrees', 'Sides', 'Drinks', 'Desserts'] },
  { id: 'food-truck', label: 'Food Truck', blurb: 'LTE failover, battery power, curbside', accent: 'from-amber-500 to-orange-600', suggestedCategories: ['Signature', 'Baskets', 'Sides', 'Drinks'] },
  { id: 'bakery', label: 'Bakery', blurb: 'Cases, pre-orders, cakes by the slice', accent: 'from-rose-400 to-pink-600', suggestedCategories: ['Breads', 'Pastries', 'Cakes', 'Coffee'] },
  { id: 'coffee', label: 'Coffee Shop', blurb: 'Modifiers, milk swaps, subscriptions', accent: 'from-amber-700 to-yellow-700', suggestedCategories: ['Espresso', 'Brew', 'Cold Bar', 'Pastry'] },
  { id: 'ice-cream', label: 'Ice Cream', blurb: 'Scoops, cones, toppings, seasonal', accent: 'from-sky-400 to-indigo-500', suggestedCategories: ['Scoops', 'Cones', 'Sundaes', 'Toppings'] },
  { id: 'cookie', label: 'Cookie Shop', blurb: 'Boxes, dozens, warm-now specials', accent: 'from-amber-500 to-amber-800', suggestedCategories: ['Cookies', 'Boxes', 'Milk & Drinks'] },
  { id: 'smoothie', label: 'Smoothie Bar', blurb: 'Builds, boosts, bowls, sizes', accent: 'from-lime-400 to-emerald-600', suggestedCategories: ['Smoothies', 'Bowls', 'Boosts', 'Juice'] },
  { id: 'beer-wine', label: 'Beer & Wine', blurb: 'Short list, taps, a few mixed drinks', accent: 'from-yellow-600 to-amber-800', suggestedCategories: ['Draft', 'Cans', 'Wine', 'Mixed Drinks'] },
];

// ---------------- Platform capability pillars ----------------
export interface Feature {
  id: string;
  title: string;
  body: string;
  icon: string; // lucide icon name handled by the consuming component
  bullets: string[];
}

export const FEATURES: Feature[] = [
  {
    id: 'pos',
    title: 'Touchscreen POS that never stops',
    body: 'Your menu becomes a tap-optimised POS layout automatically. If the internet drops, orders queue locally and cell data takes over in under three seconds.',
    icon: 'Monitor',
    bullets: ['Offline-first order queue', 'LTE failover in <3s', 'Runs on terminals, tablets & phones', 'Open tabs, splits & tips'],
  },
  {
    id: 'ordering',
    title: 'Online ordering, built for you',
    body: 'A branded ordering site with photos, modifiers, pickup windows and zero commission per order. Your customers, your data, your margin.',
    icon: 'ShoppingBag',
    bullets: ['0% commission ordering', 'Pickup, curbside & delivery hand-off', 'Upsell prompts at cart', 'Apple Pay & Google Pay'],
  },
  {
    id: 'website',
    title: 'One-page website in minutes',
    body: 'Hours, location, menu, order button, reviews and photos — generated from your menu upload and live on your own domain the same day.',
    icon: 'Globe',
    bullets: ['Auto-built from your menu', 'Custom domain + SSL', 'Google Business sync', 'Mobile-first & fast'],
  },
  {
    id: 'rewards',
    title: 'Rewards people actually use',
    body: 'Points, punch cards or cash back — pick one at signup. Guests join with a phone number at the terminal, no app download.',
    icon: 'Gift',
    bullets: ['Points, punch or % back', 'Phone-number signup at POS', 'Win-back texts & email', 'Birthday and lapsed offers'],
  },
  {
    id: 'team',
    title: 'Scheduling & labor control',
    body: 'Build the week in a drag-free grid, publish to phones, let staff swap shifts, and watch labor cost against live sales all day.',
    icon: 'CalendarDays',
    bullets: ['Clock in/out at the terminal', 'Shift swap requests', 'Labor % vs sales, live', 'Overtime warnings'],
  },
  {
    id: 'reports',
    title: 'Every report, already done',
    body: 'Daily close, weekly sales mix, sales-tax filings, tips, voids, cash variance, monthly P&L inputs and year-end exports — all one tap.',
    icon: 'BarChart3',
    bullets: ['Daily / weekly / monthly / yearly', 'Sales tax by jurisdiction', 'Tip & payroll exports', 'CSV to your accountant'],
  },
  {
    id: 'rates',
    title: 'Lowest-rate card processing',
    body: 'We scan live swipe, chip and keyed rates across processors every week and route each transaction down the cheapest compliant path.',
    icon: 'CreditCard',
    bullets: ['Weekly rate re-shop', 'Least-cost routing per swipe', 'Surcharge / cash discount modes', 'Statement audit included'],
  },
  {
    id: 'gear',
    title: 'Gear & services, recommended',
    body: 'Tell us your concept and square footage and we spec the exact hardware, plus vetted partners for insurance, POS paper, linens and food supply.',
    icon: 'Package',
    bullets: ['Concept-matched hardware kits', 'Partner offers & rebates', 'Ships pre-configured', 'Replace-in-24h coverage'],
  },
];

// ---------------- Launch wizard steps ----------------
export const LAUNCH_STEPS = [
  { id: 1, title: 'Pick your concept', body: 'Restaurant, truck, bakery, coffee, ice cream, cookies or smoothies.' },
  { id: 2, title: 'Upload your menu', body: 'Photo, PDF, CSV or a link. We parse items, prices, sizes and modifiers.' },
  { id: 3, title: 'Confirm the build', body: 'Review the POS grid, ordering menu and your one-page site.' },
  { id: 4, title: 'Go live', body: 'Hardware ships pre-loaded. Rewards, reports and rates switch on automatically.' },
];

// ---------------- Reporting suite ----------------
export interface ReportDef {
  id: string;
  name: string;
  cadence: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  detail: string;
}

export const REPORTS: ReportDef[] = [
  { id: 'z-close', name: 'Z / Daily Close', cadence: 'Daily', detail: 'Gross sales, net sales, payments by type, cash variance, voids, comps, drawer count.' },
  { id: 'tips', name: 'Tip & Gratuity Sheet', cadence: 'Daily', detail: 'Tips by employee, pooled tip split, credit tips owed in cash.' },
  { id: 'hourly', name: 'Hourly Sales & Labor', cadence: 'Daily', detail: 'Sales per hour vs hours worked and labor % with overtime flags.' },
  { id: 'mix', name: 'Product Mix (PMIX)', cadence: 'Weekly', detail: 'Units and dollars by item, category and modifier. Dead-item alerts.' },
  { id: 'discount', name: 'Discounts & Voids', cadence: 'Weekly', detail: 'Every discount, void and refund with the employee who rang it.' },
  { id: 'salestax', name: 'Sales Tax Filing Report', cadence: 'Monthly', detail: 'Taxable vs exempt sales, tax collected by jurisdiction, ready for state e-file.' },
  { id: 'pnl', name: 'P&L Input Pack', cadence: 'Monthly', detail: 'Revenue, COGS estimate, labor, processing fees and comps for your bookkeeper.' },
  { id: 'labor', name: 'Payroll Export', cadence: 'Weekly', detail: 'Hours, breaks, overtime and tips exported to payroll in CSV.' },
  { id: 'rewards', name: 'Loyalty Performance', cadence: 'Monthly', detail: 'Enrollment rate, repeat visit lift, reward redemption cost.' },
  { id: 'annual', name: 'Year-End Summary', cadence: 'Yearly', detail: '1099-K reconciliation, annual sales by month, processing fees paid.' },
  { id: 'cash', name: 'Cash Audit Trail', cadence: 'Daily', detail: 'Paid-ins, paid-outs, no-sales and drawer opens by employee.' },
  { id: 'fees', name: 'Processing Fee Analysis', cadence: 'Monthly', detail: 'Effective rate, interchange downgrades and savings from least-cost routing.' },
];

// ---------------- Rewards program presets ----------------
export const REWARD_PROGRAMS = [
  { id: 'points', name: 'Points', rule: '1 point per $1 · 100 points = $10 off', best: 'Restaurants & bakeries' },
  { id: 'punch', name: 'Punch Card', rule: 'Buy 9 drinks, 10th is free', best: 'Coffee, smoothie & ice cream' },
  { id: 'cashback', name: 'Cash Back', rule: '5% back as store credit', best: 'Food trucks & cookie shops' },
  { id: 'tiers', name: 'VIP Tiers', rule: 'Silver at $150, Gold at $400 spend', best: 'High-frequency regulars' },
];

// ---------------- Processing rate shopper ----------------
export interface Processor {
  id: string;
  name: string;
  swipeRate: number; // percent
  perTxn: number; // dollars
  monthly: number; // dollars
  note: string;
  routing: boolean;
}

export const PROCESSORS: Processor[] = [
  { id: 'lle-direct', name: 'Love Local Direct (interchange+)', swipeRate: 2.15, perTxn: 0.08, monthly: 0, note: 'Least-cost routing on every swipe', routing: true },
  { id: 'lle-flat', name: 'Love Local Flat Rate', swipeRate: 2.45, perTxn: 0.1, monthly: 0, note: 'Simple predictable pricing', routing: true },
  { id: 'northline', name: 'Northline Merchant', swipeRate: 2.6, perTxn: 0.1, monthly: 9.95, note: 'Regional acquirer, next-day funding', routing: false },
  { id: 'harborpay', name: 'HarborPay', swipeRate: 2.69, perTxn: 0.09, monthly: 14.95, note: 'Includes chargeback defense', routing: false },
  { id: 'legacy-flat', name: 'Legacy Flat 2.9%', swipeRate: 2.9, perTxn: 0.3, monthly: 0, note: 'Typical online-first processor pricing', routing: false },
];



export const calcProcessingCost = (p: Processor, monthlyVolume: number, avgTicket: number) => {
  const txns = avgTicket > 0 ? monthlyVolume / avgTicket : 0;
  return monthlyVolume * (p.swipeRate / 100) + txns * p.perTxn + p.monthly;
};

// ---------------- Software plans ----------------
export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    per: '/mo + processing',
    blurb: 'One terminal, one menu, everything essential.',
    features: ['1 POS station', 'Online ordering site', 'One-page website', 'Punch-card rewards', 'Daily & weekly reports'],
    cta: 'Start free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    per: '/mo per location',
    blurb: 'The full operating system for a growing shop.',
    features: ['Unlimited stations & phones', 'LTE failover + offline queue', 'Points, tiers & cash back', 'Scheduling + labor vs sales', 'Sales tax & P&L reporting', 'Least-cost card routing'],
    cta: 'Most popular',
    highlight: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 149,
    per: '/mo per location',
    blurb: 'Multi-location, catering and franchise ready.',
    features: ['Everything in Pro', 'Multi-location dashboards', 'Kiosk & KDS licenses', 'Catering & pre-orders', 'API + accounting sync', 'Dedicated launch manager'],
    cta: 'Talk to us',
  },
];

// ---------------- Affiliate / partner services ----------------
export const PARTNER_SERVICES = [
  { id: 'insurance', name: 'Line Cook Insurance', category: 'Insurance', offer: 'General liability from $41/mo', payout: 'Love Local Eats members save 12%' },
  { id: 'supply', name: 'Prime Route Food Supply', category: 'Food & Paper', offer: 'Weekly delivery, locked pricing', payout: '$250 first-order credit' },
  { id: 'linens', name: 'FreshFold Linen Co.', category: 'Linens', offer: 'Aprons & towels, 2x weekly', payout: 'First month free' },
  { id: 'payroll', name: 'ShiftPay Payroll', category: 'Payroll', offer: 'Tipped-wage payroll, auto-filed', payout: '3 months free with a Love Local Eats export' },
  { id: 'hood', name: 'CleanHood Services', category: 'Compliance', offer: 'Hood & grease trap on schedule', payout: '15% off annual plan' },
  { id: 'signage', name: 'Streetside Signs', category: 'Branding', offer: 'Menu boards & window vinyl', payout: 'Free design with menu upload' },
  { id: 'lending', name: 'Countertop Capital', category: 'Funding', offer: 'Equipment financing, 0% for 6mo', payout: 'Pre-approved for Love Local Eats shops' },
  { id: 'delivery', name: 'LocalDash Couriers', category: 'Delivery', offer: 'Flat $5.99 courier hand-off', payout: 'No commission on your orders' },
];



// ---------------- Social proof ----------------
export const TESTIMONIALS = [
  { name: 'Marisol Vega', shop: 'Vega Street Tacos · Food Truck', quote: 'We uploaded a photo of our window menu on Sunday and were taking tap payments Tuesday. When the park WiFi died we never even noticed — it flipped to cell data mid-order.' },
  { name: 'Dre Coleman', shop: 'Warm Batch Cookies · 2 locations', quote: 'The rate audit alone cut $237 a month in fees. Punch cards brought back regulars we thought we lost.' },
  { name: 'Hannah Kirk', shop: 'North Bend Coffee', quote: 'I am not technical at all. I never wrote a line of anything and I have a website, online ordering and my sales tax report ready every month.' },
];

export const STATS = [
  { value: '11 min', label: 'Average menu-to-POS build time' },
  { value: '0%', label: 'Commission on your online orders' },
  { value: '$2,180', label: 'Average yearly processing savings' },
  { value: '<3 sec', label: 'Failover to cell data' },
];

// ---------------- Demo reporting data (dashboard) ----------------
export const SALES_TREND = [
  { day: 'Mon', sales: 1840, labor: 402, orders: 96 },
  { day: 'Tue', sales: 2110, labor: 431, orders: 108 },
  { day: 'Wed', sales: 2460, labor: 458, orders: 121 },
  { day: 'Thu', sales: 2890, labor: 502, orders: 139 },
  { day: 'Fri', sales: 4120, labor: 688, orders: 198 },
  { day: 'Sat', sales: 4680, labor: 731, orders: 216 },
  { day: 'Sun', sales: 3240, labor: 559, orders: 158 },
];

export const CATEGORY_MIX = [
  { name: 'Entrees', value: 41 },
  { name: 'Drinks', value: 23 },
  { name: 'Sides', value: 17 },
  { name: 'Desserts', value: 11 },
  { name: 'Beer & Wine', value: 8 },
];

export const TAX_JURISDICTIONS = [
  { name: 'State', rate: 6.25, taxable: 18420 },
  { name: 'County', rate: 1.0, taxable: 18420 },
  { name: 'City', rate: 0.75, taxable: 18420 },
];

export const SHIFTS = [
  { name: 'Alexis R.', role: 'Shift Lead', days: ['9–5', '9–5', 'OFF', '11–7', '11–7', '7–3', 'OFF'], rate: 21 },
  { name: 'Devon M.', role: 'Barista', days: ['6–2', '6–2', '6–2', 'OFF', 'OFF', '6–2', '6–2'], rate: 17 },
  { name: 'Priya S.', role: 'Line Cook', days: ['OFF', '10–6', '10–6', '10–6', '12–8', '12–8', 'OFF'], rate: 19.5 },
  { name: 'Marco T.', role: 'Cashier', days: ['2–10', 'OFF', '2–10', '2–10', '4–11', '4–11', '10–6'], rate: 16 },
  { name: 'June K.', role: 'Baker', days: ['4–12', '4–12', '4–12', '4–12', 'OFF', 'OFF', '4–12'], rate: 20 },
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------- Budget / no-sticker-shock starter plans ----------------
// Each plan references product handles that live in ecom_products (single source of truth).
export interface StarterPlan {
  id: string;
  name: string;
  who: string;
  handles: string[];
  note: string;
}

export const STARTER_PLANS: StarterPlan[] = [
  {
    id: 'phone',
    name: 'Phone Only',
    who: 'Food trucks, farmers markets, pop-ups, carts',
    handles: ['phone-pos-starter-kit'],
    note: 'Use the phone already in your pocket. Mount, tap reader and receipt printer — nothing else to buy.',
  },
  {
    id: 'tablet',
    name: 'One Tablet Counter',
    who: 'Coffee, cookie, smoothie & ice cream shops',
    handles: [
      'vibe-tab-10-budget-touchscreen',
      'countertop-tablet-stand',
      'tap-only-card-reader',
      'mini-receipt-printer-bluetooth',
    ],
    note: 'A real touchscreen station for the price of a month of most POS contracts.',
  },
  {
    id: 'counter-kitchen',
    name: 'Counter + Kitchen',
    who: 'Bakeries, quick-service restaurants with a line',
    handles: ['vibe-tab-10-budget-touchscreen', 'byo-tablet-counter-kit', 'kitchen-ticket-printer-wifi'],
    note: 'Adds a locking cash drawer and a ticket printer on the line so nothing gets shouted twice.',
  },
];

export const BUDGET_TAG = 'budget';

// ============================================================
// Service floor: roles, tabs and ticket routing
// (the "who sees what" layer that keeps a busy floor honest)
// ============================================================

export interface StaffRole {
  id: string;
  name: string;
  icon: string; // lucide icon name, resolved by the consuming component
  tone: string; // tailwind gradient
  sees: string;
  can: string[];
}

export const STAFF_ROLES: StaffRole[] = [
  {
    id: 'server',
    name: 'Server / Waiter',
    icon: 'ConciergeBell',
    tone: 'from-fuchsia-500 to-pink-500',
    sees: 'Their tables, every open tab and a buzz the second food is up.',
    can: ['Open & name a tab', 'Fire a course', 'Split or merge checks', 'Take payment tableside'],
  },
  {
    id: 'bar',
    name: 'Bar',
    icon: 'Beer',
    tone: 'from-amber-500 to-orange-500',
    sees: 'Drink tickets only, with cocktails queued ahead of grab-and-go cans.',
    can: ['Pour queue by prep time', 'Mark drinks ready', '86 an item instantly', 'Log spills & comps'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: 'ChefHat',
    tone: 'from-emerald-500 to-teal-500',
    sees: 'Food tickets on a big-type screen or printed on the line — never drinks.',
    can: ['Bump tickets', 'Ticket timers & late flags', '86 a menu item', 'Recall the last ticket'],
  },
  {
    id: 'manager',
    name: 'Owner / Manager',
    icon: 'ShieldCheck',
    tone: 'from-violet-500 to-indigo-500',
    sees: 'Everything, everywhere — plus who voided what and when.',
    can: ['Approve voids & comps', 'Set role permissions', 'Live labor vs sales', 'Close the day'],
  },
];

// A shift can change daily, so staff pick a role at clock-in rather than
// having a separate login per job. These are the guardrails on that.
export const ROLE_RULES = [
  'One login per person, role chosen at clock-in — cover the bar tonight, wait tables tomorrow.',
  'A PIN pad at the terminal switches users in about a second between orders.',
  'Managers approve voids, comps and drawer opens with their own PIN, and it lands in the audit trail.',
  'Every ticket, void and payment is stamped with the employee and the role they were working.',
];

export interface ServicePillar {
  id: string;
  title: string;
  problem: string;
  fix: string;
  icon: string;
  bullets: string[];
}

export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: 'tabs',
    title: 'Open tabs that count themselves',
    problem: 'Bottles stacked under the table and "how many did you have?" at the end of the night.',
    fix: 'Every round is rung the moment it is ordered, so the tab is always right and nothing walks out unpaid.',
    icon: 'ReceiptText',
    bullets: ['Tab per table, seat or name', 'Pre-auth a card to hold a tab', 'Split by seat or evenly', 'Transfer a tab to another server'],
  },
  {
    id: 'routing',
    title: 'Tickets go where the work happens',
    problem: 'One printer for everything, so the bar reads food and the kitchen reads drinks.',
    fix: 'Each menu category is mapped to a station on upload — food to the line, cocktails to the bar, cans straight to the runner.',
    icon: 'Split',
    bullets: ['Category to station mapping', 'Cocktails queued by prep time', 'Course firing (apps then mains)', 'Second station for a truck or patio'],
  },
  {
    id: 'ready',
    title: 'Nobody guesses when food is up',
    problem: 'Fries sit in the window for half an hour because the runner never got told.',
    fix: 'The moment the line bumps a ticket, the server who owns that table gets a ping on their phone with the table number.',
    icon: 'BellRing',
    bullets: ['Ready ping to the owning server', 'Window timer turns red at 4 min', 'Runner view for whoever is free', 'Guest text for pickup orders'],
  },
  {
    id: 'multi',
    title: 'Many shops, one clean account',
    problem: 'A second truck or a second store means a second system and double the paperwork.',
    fix: 'Each location keeps its own menu, staff and drawer, while you see them side by side and staff only ever see their own.',
    icon: 'Building2',
    bullets: ['Location-scoped data & staff', 'Shared menu with local prices', 'Roll-up sales across shops', 'Add a location in minutes'],
  },
];

// Demo ticket board (used by the animated service-floor showcase)
export interface DemoTicket {
  id: string;
  table: string;
  station: 'Kitchen' | 'Bar';
  items: string[];
  minutes: number;
  server: string;
}

export const DEMO_TICKETS: DemoTicket[] = [
  { id: 'T-118', table: 'Table 4', station: 'Kitchen', items: ['2 × Basket of Fries', '1 × Fish Sandwich'], minutes: 6, server: 'Alexis' },
  { id: 'T-119', table: 'Table 4', station: 'Bar', items: ['3 × Bottled Beer'], minutes: 1, server: 'Alexis' },
  { id: 'T-120', table: 'Patio 2', station: 'Bar', items: ['2 × Caipirinha'], minutes: 5, server: 'Devon' },
  { id: 'T-121', table: 'Table 9', station: 'Kitchen', items: ['1 × Shrimp Plate', '1 × Side Rice'], minutes: 11, server: 'Marco' },
];
