// ============================================================
// Love Local Eats POS — single source of truth for shared platform data.
// Import from here; never re-declare these lists elsewhere.
// ============================================================

export const BRAND = {
  name: 'Love Local Eats POS',
  shortName: 'Love Local Eats',
  wordmark: { love: 'Love', local: 'Local Eats', kicker: 'POS' },
  /** Small all-caps badge that sits above the headline. */
  badge: 'No contracts. No hardware lock-in.',
  /** The name itself is the headline. */
  headline: 'Love Local Eats',
  /** The one line that says what it does. */
  tagline: 'Vibe-Code Your POS & Website with Intelligent Design.',
  subtitle:
    'The no-code restaurant operating system built with heart for independent operators: touchscreen POS, table tabs, kitchen & bar tickets, online ordering, a one-page website, rewards, scheduling, and every report your accountant asks for — built automatically from one simple vibe-coded setup.',
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

/**
 * Fallback sales tax rate, used only until a shop's own setting loads.
 * The real number lives on shops.tax_rate and is edited in the dashboard.
 */
export const DEFAULT_TAX_RATE = 0.0825;

/** 0.0825 -> "8.25%" */
export const formatTaxRate = (rate: number | null | undefined) =>
  `${(((rate ?? DEFAULT_TAX_RATE) as number) * 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}%`;


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
    title: 'One-page website, hosted',
    body: 'A single fast page: order button, menu place cards from your own photos, hours pulled live from Google, contact, a hiring form and your social links. We host it, renew it and keep it up.',
    icon: 'Globe',
    bullets: ['Hosting, domain & SSL included', 'Hours synced from Google Business', 'Photos cross-populate from the POS', 'Contact + employment application'],
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
// Two tiers. Run it on the gear you already own — no dongles, no lock-in.
// The setup fee is split into two Stripe invoices so nobody ever needs a refund:
// a $100 deposit at signup, then the balance only when the operator approves the build.
export interface Plan {
  id: string;
  name: string;
  price: number;
  /** total one-time build fee for this tier (deposit + balance) */
  setup: number;
  /** charged at signup — kickstarts AI menu parsing and the build */
  deposit: number;
  /** charged only on approval / delivery */
  balance: number;
  /** the exact line shown on the pricing card */
  setupDisplay: string;
  per: string;
  blurb: string;
  features: string[];
  cta: string;
  badge?: string;
  /** small savings note under the price */
  saveNote?: string;
  highlight?: boolean;
  hosting: boolean;
}

export const PRICING_HEADLINE = 'One Simple Price. Zero Hardware Lock-In.';
export const PRICING_SUBHEAD =
  'Run it on the gear you already own today — iPad, Android tablet, iPhone, or laptop. No dongles, no proprietary junk.';

/** Every tier starts with the same deposit. Single source of truth. */
export const SETUP_DEPOSIT = 100;

export const PLANS: Plan[] = [
  {
    id: 'pos-web',
    name: 'POS + Website',
    price: 199,
    setup: 299,
    deposit: SETUP_DEPOSIT,
    balance: 199,
    setupDisplay: '$299 Total Setup ($100 to start → $199 upon delivery)',
    per: '/mo per location',
    blurb: 'The Complete Engine: POS, live website, and online ordering built from one vibe-coded setup.',
    hosting: true,
    badge: '★ MOST POPULAR ★',
    features: [
      'POS terminal engine, tap-to-pay & camera card scan',
      'Auto-generated single-page website & custom domain hosting',
      '0% commission online ordering with Google Business sync',
      '24/7 AI Floor Copilot for menu, schedule & live site updates',
    ],
    cta: 'Start my build',
    highlight: true,
  },
  {
    id: 'pos-only',
    name: 'POS Only',
    price: 149,
    setup: 249,
    deposit: SETUP_DEPOSIT,
    balance: 149,
    setupDisplay: '$249 Total Setup ($50 Discount | $100 to start → $149 upon delivery)',
    per: '/mo per location',
    blurb: 'For operators who already have a website and just need a lean, contract-free POS.',
    hosting: false,
    saveNote: 'Save $50/mo vs the Full Engine',
    features: [
      'Complete POS terminal engine & offline failover',
      'All 12 automated financial reports & schedule tools',
      '24/7 AI Floor Copilot',
      'Connects to your existing external website',
    ],
    cta: 'Start my build',
  },
];

export const planById = (id: string) => PLANS.find((p) => p.id === id) || PLANS[0];

/** Legacy alias — the entry-tier total build fee. Prefer plan.setup / plan.deposit. */
export const SETUP_FEE = PLANS[1].setup;
export const HOSTING_DISCOUNT = PLANS[0].price - PLANS[1].price;

// Prepay incentives — pay up front, get months free.
export interface PrepayOption {
  id: string;
  label: string;
  detail: string;
  months: number;
  freeMonths: number;
}

export const PREPAY_OPTIONS: PrepayOption[] = [
  {
    id: 'six',
    label: 'Prepay 6 Months',
    detail: '1 Month Free',
    months: 6,
    freeMonths: 1,
  },
  {
    id: 'year',
    label: 'Prepay 1 Year',
    detail: '2 Months Free',
    months: 12,
    freeMonths: 2,
  },
];

/** 6-month prepay on a $149 plan → "$127/mo effective" style math. */
export const prepayEffective = (monthly: number, o: PrepayOption) =>
  Math.round((monthly * (o.months - o.freeMonths)) / o.months);

export const prepayTotal = (monthly: number, o: PrepayOption) => monthly * (o.months - o.freeMonths);

// How billing actually works — deposit now, balance only on approval, monthly at go-live.
export const BILLING_STEPS = [
  {
    id: 1,
    title: 'Start with a $100 deposit',
    body: 'Start with $100 deposit today → Pay remaining balance only when you approve the build and go live.',
    note: '$100 due today',
  },
  { id: 2, title: 'We build it', body: 'Take a week or take two months — you tell us when you are ready to open.', note: '$0 while you build' },
  { id: 3, title: 'You approve the build', body: 'Walk the POS, the ordering page and the website. Change anything.', note: 'Still $0' },
  {
    id: 4,
    title: 'Balance settles, you go live',
    body: 'The setup balance is invoiced at delivery and the monthly starts the day you take your first real order.',
    note: '$199 or $149 balance',
  },
];

// ============================================================
// Build status tracker — the operator (and the agent console)
// can see exactly where a build sits, milestone by milestone.
// ============================================================

export type BuildStageStatus = 'done' | 'active' | 'pending' | 'bypassed';

export interface BuildStage {
  id: number;
  key: string;
  title: string;
  detail: string;
  /** label shown when the stage is complete vs still running */
  doneLabel: string;
  activeLabel: string;
  /** skipped entirely when the operator picked POS Only */
  websiteOnly?: boolean;
  /** the milestone that triggers the setup balance invoice */
  billing?: boolean;
}

export const BUILD_STAGES: BuildStage[] = [
  {
    id: 1,
    key: 'menu',
    title: 'Menu Parsing & AI Vibe Ingestion',
    detail: 'Your menu photo, PDF or link is parsed into items, prices, sizes and modifiers.',
    doneLabel: 'Completed',
    activeLabel: 'Processing',
  },
  {
    id: 2,
    key: 'stations',
    title: 'POS Station & Terminal Mapping',
    detail: 'Categories routed to kitchen, bar and runner. Tap-to-pay and camera scan armed on every device.',
    doneLabel: 'Ready',
    activeLabel: 'In Progress',
  },
  {
    id: 3,
    key: 'website',
    title: 'Single-Page Website Generation & Google Place Sync',
    detail: 'One-page site built from the POS catalog, with hours, address and phone pulled from Google Business.',
    doneLabel: 'Delivered',
    activeLabel: 'Generating',
    websiteOnly: true,
  },
  {
    id: 4,
    key: 'domain',
    title: 'Custom Domain & Live Ordering Deployment',
    detail: 'Domain pointed, SSL issued and 0% commission online ordering switched on.',
    doneLabel: 'Live',
    activeLabel: 'Pending Approval',
    websiteOnly: true,
  },
  {
    id: 5,
    key: 'balance',
    title: 'Final Balance Settlement & Launch',
    detail: 'The setup balance invoices only after you approve delivery. Then the doors open.',
    doneLabel: 'Settled — live',
    activeLabel: 'Awaiting approval',
    billing: true,
  },
];


// ============================================================
// Zero-hardware checkout: take a card with nothing but the phone
// or tablet already in the operator's hand.
// ============================================================

export interface PayRail {
  id: 'tap' | 'scan' | 'reader' | 'cash';
  name: string;
  short: string;
  how: string;
  /** effective processing rate for this entry method */
  rate: number;
  perTxn: number;
  /** the acquirer least-cost routing picks for this entry method */
  routesTo: string;
  icon: string; // lucide icon name resolved by the consuming component
  tone: string;
  needsHardware: boolean;
}

export const PAY_RAILS: PayRail[] = [
  {
    id: 'tap',
    name: 'Tap to Pay (NFC)',
    short: 'Tap',
    how: 'Guest taps a contactless card, Apple Pay or Google Pay on the back of your phone or tablet. Zero dongles.',
    rate: 2.15,
    perTxn: 0.08,
    routesTo: 'Love Local Direct (interchange+)',
    icon: 'Nfc',
    tone: 'from-violet-500 to-indigo-500',
    needsHardware: false,
  },
  {
    id: 'scan',
    name: 'Camera Card Scan (OCR)',
    short: 'Scan',
    how: 'Non-tap card? Point the camera at it — the number and expiry are read on device, masked and encrypted instantly. No typing.',
    rate: 2.62,
    perTxn: 0.12,
    routesTo: 'Love Local Flat Rate',
    icon: 'ScanLine',
    tone: 'from-fuchsia-500 to-pink-500',
    needsHardware: false,
  },
  {
    id: 'reader',
    name: 'Chip / swipe reader',
    short: 'Reader',
    how: 'A paired Bluetooth reader, if you already own one. Optional — nothing here requires it.',
    rate: 2.2,
    perTxn: 0.08,
    routesTo: 'Love Local Direct (interchange+)',
    icon: 'CreditCard',
    tone: 'from-sky-500 to-cyan-400',
    needsHardware: true,
  },
];

export const ZERO_HARDWARE_POINTS = [
  'Tap to Pay works on any NFC iPhone or Android — the phone is the terminal.',
  'Camera scan never stores a readable frame; the number is masked before it leaves the lens.',
  'Smart interchange optimization picks the cheapest compliant rail per transaction, card-present or scanned.',
  'Both rails queue offline and settle themselves the second data returns.',
];

/** Rate lookup used by the register readout. */
export const railById = (id: PayRail['id']) => PAY_RAILS.find((r) => r.id === id) || PAY_RAILS[0];

/** What this exact sale costs to process on a given rail. */
export const railCost = (rail: PayRail, amountCents: number) =>
  Math.round(amountCents * (rail.rate / 100)) + Math.round(rail.perTxn * 100);


// ---------------- Hosted one-page website ----------------
// Deliberately short. Guests come to look at food and order, not to read.
export interface SiteBlock {
  id: string;
  title: string;
  icon: string;
  body: string;
  source: string; // where the content comes from — the whole point
  bullets: string[];
}

export const SITE_BLOCKS: SiteBlock[] = [
  {
    id: 'order',
    title: 'Order online',
    icon: 'ShoppingBag',
    body: 'The order button is the hero of the page. Guests pick items, choose pickup or delivery hand-off and pay — no commission taken.',
    source: 'Built from your POS menu',
    bullets: ['Same menu as the POS, always', 'Pickup windows & curbside notes', 'Apple Pay / Google Pay', 'Orders print to the kitchen'],
  },
  {
    id: 'cards',
    title: 'Menu place cards',
    icon: 'ImageIcon',
    body: 'Snap a photo of a dish in your owner dashboard and the place card appears on the website automatically. We never touch it.',
    source: 'Owner dashboard → POS → website',
    bullets: ['Photo, description & price', 'Mark a dish sold out from the POS', 'Reorder cards by drag', 'Seasonal specials in one tap'],
  },
  {
    id: 'hours',
    title: 'Hours that match Google',
    icon: 'Clock',
    body: 'We read your Google Business Profile, so the hours on your website are the hours a guest sees on Google Maps. Change them once, in Google.',
    source: 'Google Business Profile sync',
    bullets: ['Re-checks every hour', 'Holiday & special hours included', 'Open / closed badge in real time', 'Address & phone stay in sync too'],
  },
  {
    id: 'contact',
    title: 'Contact & directions',
    icon: 'MapPin',
    body: 'Phone, address, a map pin and a short message form. Everything a guest needs in one thumb-scroll.',
    source: 'Google Business Profile sync',
    bullets: ['Tap-to-call & tap-to-map', 'Message form to your inbox', 'Parking / patio notes', 'Reply from your phone'],
  },
  {
    id: 'hiring',
    title: 'Employment application',
    icon: 'ClipboardList',
    body: 'A "Now hiring" form for line cooks, servers and drivers. Applications land in your dashboard instead of a shoebox by the register.',
    source: 'Built in, toggle on or off',
    bullets: ['Role, availability & experience', 'Applications in your dashboard', 'Turn off when fully staffed', 'Email alert on each apply'],
  },
  {
    id: 'social',
    title: 'Social links',
    icon: 'Share2',
    body: 'Instagram, Facebook, TikTok and Google reviews in the footer, so the people who love you can go follow you.',
    source: 'You paste the links once',
    bullets: ['Instagram / Facebook / TikTok', 'Google review shortcut', 'Share sheet on mobile', 'Open Graph preview image'],
  },
];

// Demo hours shown in the animated website preview (mirrors a Google profile).
export const DEMO_HOURS = [
  { day: 'Mon', hours: 'Closed' },
  { day: 'Tue', hours: '11a – 9p' },
  { day: 'Wed', hours: '11a – 9p' },
  { day: 'Thu', hours: '11a – 9p' },
  { day: 'Fri', hours: '11a – 11p' },
  { day: 'Sat', hours: '10a – 11p' },
  { day: 'Sun', hours: '10a – 8p' },
];

export const SOCIAL_LINKS = ['Instagram', 'Facebook', 'TikTok', 'Google Reviews'];


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

// ============================================================
// Device hub: every piece of hardware we sell can actually be
// paired, tested and fired from the POS. Nothing here is a shell.
// ============================================================

export type DeviceKindId =
  | 'receipt-printer'
  | 'kitchen-printer'
  | 'cash-drawer'
  | 'card-reader'
  | 'phone-swiper'
  | 'card-scan'
  | 'kds'
  | 'handheld'
  | 'kiosk'
  | 'label-printer'
  | 'lte-router'
  | 'scale';

export interface DeviceAction {
  id: string;
  label: string;
  /** what the terminal actually sends to the device */
  command: string;
  /** the line written to the device log when it succeeds */
  result: string;
}

export interface DeviceKind {
  id: DeviceKindId;
  name: string;
  icon: string; // lucide icon name resolved by the consuming component
  connection: string;
  tone: string; // tailwind gradient
  /** shop handles in ecom_products this driver covers (single source of truth) */
  handles: string[];
  blurb: string;
  actions: DeviceAction[];
  offline: string;
}

export const DEVICE_KINDS: DeviceKind[] = [
  {
    id: 'receipt-printer',
    name: 'Guest receipt printer',
    icon: 'Printer',
    connection: 'USB / LAN / Bluetooth',
    tone: 'from-sky-500 to-cyan-400',
    handles: ['vibe-thermal-receipt-printer', 'mini-receipt-printer-bluetooth'],
    blurb: 'ESC/POS driver built in. Prints the guest copy, the merchant copy and the reprint, and kicks the drawer on the same cable.',
    actions: [
      { id: 'test', label: 'Test print', command: 'ESC @ · print test slip', result: 'Test slip printed — 58mm, 32 cols, cut OK' },
      { id: 'receipt', label: 'Print last receipt', command: 'print(receipt #1042)', result: 'Receipt #1042 reprinted with tip line' },
      { id: 'status', label: 'Paper status', command: 'DLE EOT 4', result: 'Paper OK · head temp normal · cover closed' },
    ],
    offline: 'Prints from the local queue whether or not the internet is up.',
  },
  {
    id: 'kitchen-printer',
    name: 'Kitchen / bar ticket printer',
    icon: 'ChefHat',
    connection: 'WiFi / LAN',
    tone: 'from-emerald-500 to-teal-400',
    handles: ['kitchen-ticket-printer-wifi', 'vibe-kitchen-impact-printer'],
    blurb: 'Routed by menu category on upload — food to the line, cocktails to the bar. Impact heads survive steam and grease.',
    actions: [
      { id: 'test', label: 'Fire test ticket', command: 'route(station: Kitchen)', result: 'Ticket T-TEST printed at Kitchen in 0.6s' },
      { id: 'route', label: 'Show routing map', command: 'get(routing)', result: 'Entrees→Kitchen · Sides→Kitchen · Cocktails→Bar · Cans→Runner' },
      { id: 'buzz', label: 'Buzzer test', command: 'buzz(2)', result: 'Buzzer fired twice — line heard it over the hood' },
    ],
    offline: 'Local network only — tickets keep printing with the internet unplugged.',
  },
  {
    id: 'cash-drawer',
    name: 'Cash drawer',
    icon: 'Wallet',
    connection: 'RJ11 through printer / Bluetooth',
    tone: 'from-amber-500 to-orange-500',
    handles: ['vibe-cash-drawer', 'compact-cash-drawer-16'],
    blurb: 'Opens on cash tender, on a manager no-sale, and never on a card sale. Every open is stamped with the employee.',
    actions: [
      { id: 'open', label: 'Open drawer', command: 'kick(pin 2, 120ms)', result: 'Drawer opened · logged as No-Sale by Manager PIN' },
      { id: 'count', label: 'Start drawer count', command: 'count(start)', result: 'Blind count opened — expected $312.40 hidden until submit' },
      { id: 'audit', label: 'Open history', command: 'get(opens today)', result: '11 opens today · 9 cash tenders · 2 no-sales (both approved)' },
    ],
    offline: 'Fires from the terminal itself — no cloud call in the path.',
  },
  {
    id: 'card-reader',
    name: 'Tap & chip reader',
    icon: 'CreditCard',
    connection: 'Bluetooth / USB',
    tone: 'from-violet-500 to-indigo-500',
    handles: ['vibe-tap-chip-reader', 'vibe-pocket-reader', 'tap-only-card-reader'],
    blurb: 'Tap, chip, swipe, Apple Pay and Google Pay, with least-cost routing chosen per transaction before the card ever leaves the reader.',
    actions: [
      { id: 'test', label: 'Run $0.00 test read', command: 'auth(0.00, test)', result: 'Reader armed · test card read · P2PE key verified' },
      { id: 'route', label: 'Check routing', command: 'get(least-cost path)', result: 'This swipe routes Love Local Direct · 2.15% + $0.08' },
      { id: 'batch', label: 'Batch out', command: 'batch(close)', result: 'Batch closed · 148 sales · $3,942.18 funding tomorrow' },
    ],
    offline: 'Store-and-forward: takes the card offline and settles the second data returns.',
  },
  {
    id: 'phone-swiper',
    name: 'Phone plug-in swiper',
    icon: 'Smartphone',
    connection: 'USB-C / Lightning',
    tone: 'from-rose-500 to-red-500',
    handles: ['phone-card-swiper-plugin'],
    blurb: 'No battery, no pairing, no radio. Plugs into the phone in your apron and reads a card when everything else has quit.',
    actions: [
      { id: 'test', label: 'Test swipe', command: 'read(magstripe)', result: 'Track 2 read · encrypted at the head · queued' },
      { id: 'queue', label: 'Show offline queue', command: 'get(queue)', result: '3 swipes held · auto-settles when data returns' },
      { id: 'settle', label: 'Settle queue now', command: 'settle(queue)', result: '3 swipes settled · $61.75 captured · 0 declines' },
    ],
    offline: 'Designed for it — this is the tool you reach for when the WiFi is gone.',
  },
  {
    id: 'card-scan',
    name: 'Camera card scan',
    icon: 'ScanLine',
    connection: 'Phone camera, no hardware',
    tone: 'from-fuchsia-500 to-pink-500',
    handles: ['phone-card-scan-kit'],
    blurb: 'Last resort with nothing plugged in: the camera recognises the number and expiry on device, masks it instantly and encrypts it for the queue.',
    actions: [
      { id: 'scan', label: 'Scan a card', command: 'ocr(card frame)', result: 'Card read •••• 4242 · exp 09/28 · masked before it hit storage' },
      { id: 'rate', label: 'Rate check', command: 'get(keyed rate)', result: 'Keyed/manual rate applies — 2.9% + $0.15 on this one' },
      { id: 'clear', label: 'Wipe scan buffer', command: 'wipe(frames)', result: 'Frame buffer wiped · nothing readable stored on the phone' },
    ],
    offline: 'Works with zero connectivity — the sale queues like any other.',
  },
  {
    id: 'kds',
    name: 'Kitchen display',
    icon: 'Monitor',
    connection: 'WiFi / Ethernet',
    tone: 'from-teal-500 to-emerald-400',
    handles: ['vibe-kitchen-display-22'],
    blurb: 'Big-type ticket rail with timers that turn red at four minutes, and a bump bar that pings the server who owns the table.',
    actions: [
      { id: 'push', label: 'Push a test ticket', command: 'push(T-TEST)', result: 'T-TEST on screen 1 · timer started' },
      { id: 'bump', label: 'Bump oldest', command: 'bump(oldest)', result: 'T-118 bumped · Alexis pinged: “Table 4 is up”' },
      { id: 'recall', label: 'Recall last', command: 'recall()', result: 'T-118 back on the rail with original timestamps' },
    ],
    offline: 'Talks to the terminal over your local network, not the cloud.',
  },
  {
    id: 'handheld',
    name: 'Handheld order pad',
    icon: 'Tablet',
    connection: 'WiFi / LTE',
    tone: 'from-indigo-500 to-blue-500',
    handles: ['vibe-handheld-order-pad', 'vibe-terminal-mini-10'],
    blurb: 'Take the order and the payment at the table or down the line. Falls back to cell data on its own when your WiFi dips.',
    actions: [
      { id: 'pair', label: 'Send test order', command: 'order(test tab)', result: 'Tab “TEST” opened and fired to the Kitchen' },
      { id: 'signal', label: 'Signal check', command: 'get(signal)', result: 'WiFi -58 dBm · LTE backup present · roaming ready' },
      { id: 'tip', label: 'Tip screen test', command: 'show(tip prompt)', result: 'Tip prompt shown · 18 / 20 / 25% + custom' },
    ],
    offline: 'Queues orders locally, then syncs the moment any link returns.',
  },
  {
    id: 'kiosk',
    name: 'Self-order kiosk',
    icon: 'Store',
    connection: 'Ethernet / WiFi',
    tone: 'from-amber-400 to-yellow-500',
    handles: ['vibe-self-order-kiosk'],
    blurb: 'Runs the same menu as the counter, prints its own guest slip and upsells without anyone standing there.',
    actions: [
      { id: 'demo', label: 'Run attract loop', command: 'attract(start)', result: 'Attract screen playing your place-card photos' },
      { id: 'order', label: 'Place test order', command: 'order(kiosk test)', result: 'Kiosk order #K-01 fired · upsell accepted in test' },
      { id: 'lock', label: 'Lock to menu', command: 'kiosk(lock)', result: 'Device locked to ordering — no home screen, no browser' },
    ],
    offline: 'Keeps taking orders and prints slips while the line is down.',
  },
  {
    id: 'lte-router',
    name: 'LTE failover router',
    icon: 'Router',
    connection: 'Ethernet + cellular SIM',
    tone: 'from-lime-500 to-emerald-500',
    handles: ['lte-failover-router'],
    blurb: 'Watches your broadband and swaps the whole shop to cell data in under three seconds. Your gear never even sees the gap.',
    actions: [
      { id: 'test', label: 'Test failover', command: 'failover(simulate)', result: 'Cut broadband · LTE carried the shop in 2.4s · 0 orders lost' },
      { id: 'usage', label: 'Data used', command: 'get(usage)', result: '1.8 GB of 10 GB this cycle · POS traffic is tiny' },
      { id: 'sim', label: 'SIM status', command: 'get(sim)', result: 'SIM active · 4 bars · carrier failover list has 2 backups' },
    ],
    offline: 'This is the thing that keeps you online when the building is not.',
  },
  {
    id: 'label-printer',
    name: 'Label / prep printer',
    icon: 'Tag',
    connection: 'USB / Bluetooth',
    tone: 'from-slate-500 to-slate-700',
    handles: ['receipt-paper-50-roll-case'],
    blurb: 'Sticks the order name on the cup or the takeout bag so nothing goes out the door to the wrong hand.',
    actions: [
      { id: 'test', label: 'Print test label', command: 'label(test)', result: 'Label printed — name, item, modifiers, order #' },
      { id: 'roll', label: 'Roll remaining', command: 'get(media)', result: 'About 340 labels left on this roll' },
    ],
    offline: 'Local print path — no internet required.',
  },
  {
    id: 'scale',
    name: 'Weight scale',
    icon: 'Scale',
    connection: 'USB',
    tone: 'from-orange-500 to-red-500',
    handles: [],
    blurb: 'For anything sold by the pound — candy, coffee beans, hot bar. Price calculates itself into the ticket.',
    actions: [
      { id: 'read', label: 'Read weight', command: 'get(weight)', result: '0.84 lb · $10.08 at $12.00/lb added to the ticket' },
      { id: 'zero', label: 'Tare / zero', command: 'tare()', result: 'Scale zeroed with the container on it' },
    ],
    offline: 'Reads over the cable, calculates on the terminal.',
  },
];

// The always-on promise that sits above the device list.
export const DEVICE_PROMISE = [
  'Every device we sell ships already paired to your account — plug it in and it appears.',
  'Test print, open the drawer and run a $0.00 card read from Settings before you ever open.',
  'Drivers live on the terminal, so printers, drawers and readers fire with the internet unplugged.',
  'Swap a broken printer at 6pm: pair the new one, drag it into the same station, keep serving.',
];

// ---------------- Connectivity failover ladder ----------------
export interface FailoverStage {
  id: string;
  name: string;
  status: string;
  detail: string;
  tone: string;
  canTakePayments: boolean;
  seconds: string;
}

export const FAILOVER_STAGES: FailoverStage[] = [
  {
    id: 'wifi',
    name: 'Shop WiFi',
    status: 'Primary',
    detail: 'Everything syncs live — orders, tickets, online orders and reports.',
    tone: 'from-emerald-500 to-teal-400',
    canTakePayments: true,
    seconds: 'Normal',
  },
  {
    id: 'lte',
    name: 'LTE router failover',
    status: 'Automatic',
    detail: 'Broadband drops and the LTE router carries the whole shop. Nobody on the floor notices.',
    tone: 'from-sky-500 to-cyan-400',
    canTakePayments: true,
    seconds: 'Under 3 seconds',
  },
  {
    id: 'phone',
    name: 'Phone hotspot takeover',
    status: 'One tap',
    detail: 'No router in the truck? Tether the terminal to a staff phone and keep the same tickets and tabs.',
    tone: 'from-violet-500 to-indigo-500',
    canTakePayments: true,
    seconds: 'About 10 seconds',
  },
  {
    id: 'phone-pos',
    name: 'Phone becomes the register',
    status: 'Pivot',
    detail: 'Terminal dead or truck moved? Open Love Local Eats on any phone, sign in, and the same menu, tabs and drawer are right there.',
    tone: 'from-fuchsia-500 to-pink-500',
    canTakePayments: true,
    seconds: 'About 30 seconds',
  },
  {
    id: 'offline',
    name: 'Full offline mode',
    status: 'Last resort',
    detail: 'No WiFi, no cell, nothing. Orders, prints and card reads all queue on the device and settle automatically later.',
    tone: 'from-amber-500 to-orange-600',
    canTakePayments: true,
    seconds: 'Instant',
  },
];

// What a phone can still do with zero bars (the food-truck answer).
export const PHONE_PIVOT_ABILITIES = [
  { id: 'ring', label: 'Ring up the full menu', detail: 'Same items, modifiers and prices as the counter.' },
  { id: 'tap', label: 'Take tap payments', detail: 'Phone tap-to-pay or a Bluetooth reader still authorises offline.' },
  { id: 'swipe', label: 'Swipe with the plug-in reader', detail: 'USB-C swiper needs no radio and no battery.' },
  { id: 'scan', label: 'Scan the card with the camera', detail: 'On-device recognition, masked and encrypted immediately.' },
  { id: 'print', label: 'Print to the Bluetooth printer', detail: 'Guest slips keep printing off the phone.' },
  { id: 'text', label: 'Text the receipt instead', detail: 'No paper? Send it by SMS when data returns.' },
  { id: 'sync', label: 'Sync everything back', detail: 'Every queued order lands in reports with its real timestamp.' },
  { id: 'tabs', label: 'Keep tabs open', detail: 'Tabs move with the account, not the machine.' },
];

// ============================================================
// Equipment health monitoring
// The owner dashboard re-verifies every paired device all day.
// If something critical stops answering, order entry is held.
// ============================================================

export type DeviceSeverity = 'blocking' | 'warn' | 'info';

/** How badly each device going dark hurts service. Single source of truth. */
export const DEVICE_SEVERITY: Record<DeviceKindId, DeviceSeverity> = {
  'kitchen-printer': 'blocking',
  kds: 'blocking',
  'card-reader': 'blocking',
  'receipt-printer': 'warn',
  'cash-drawer': 'warn',
  handheld: 'warn',
  kiosk: 'warn',
  'lte-router': 'warn',
  'phone-swiper': 'info',
  'card-scan': 'info',
  'label-printer': 'info',
  scale: 'info',
};

export const SEVERITY_COPY: Record<
  DeviceSeverity,
  { label: string; short: string; chip: string; explain: string }
> = {
  blocking: {
    label: 'Holds order entry',
    short: 'Critical',
    chip: 'bg-red-100 text-red-800 border-red-200',
    explain: 'Food gets rung with nowhere to cook it, so the register stops taking new orders until this is back.',
  },
  warn: {
    label: 'Warn only',
    short: 'Important',
    chip: 'bg-amber-100 text-amber-900 border-amber-200',
    explain: 'You keep serving. We flag it so it gets fixed before it becomes a problem at the rush.',
  },
  info: {
    label: 'Good to know',
    short: 'Backup',
    chip: 'bg-stone-100 text-stone-700 border-stone-200',
    explain: 'A backup path. Nothing on the floor changes while it is offline.',
  },
};

/** Heartbeat settings — verified periodically from open to close. */
export const HEALTH_CHECK = {
  intervalMs: 45000,
  intervalLabel: 'every 45 seconds',
  staggerMs: 260,
  missesBeforeDown: 1,
  windowLabel: 'Open to close, all day',
  windowHours: '6:00am – 11:00pm, then hourly overnight',
};

export const HEALTH_RULES = [
  `Every paired device is pinged ${HEALTH_CHECK.intervalLabel} from open to close — you never have to remember to check.`,
  'A device that misses its answer is marked Not connected within one heartbeat and an alert opens instantly.',
  'If the kitchen printer, kitchen display or card reader is dark, the register refuses new orders so the line never falls behind.',
  'Tickets already fired, open tabs and taking payment on an existing ticket are never blocked.',
  'The alert clears itself the moment the device answers again — no one has to remember to un-pause anything.',
];

export const BLOCK_REASONS: Partial<Record<DeviceKindId, string>> = {
  'kitchen-printer': 'Tickets would be rung with nothing printing on the line.',
  kds: 'The kitchen screen is dark, so the line would never see the order.',
  'card-reader': 'Cards cannot be authorised, so the ticket could not be closed out.',
};

export const CRITICAL_DEVICES = (Object.keys(DEVICE_SEVERITY) as DeviceKindId[]).filter(
  (id) => DEVICE_SEVERITY[id] === 'blocking',
);
