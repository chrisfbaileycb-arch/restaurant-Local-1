// ============================================================
// Vibe-coding layer — single source of truth for:
//   • the one-page website templates a prospect can preview
//   • logo styles / palettes / symbol presets for the logo creator
//   • the agent-skill roadmap (what becomes an ADK back-end skill, in order)
// Import from here. Never re-declare these lists anywhere else.
// ============================================================

// ---------------- Website templates ----------------
// Every template renders the SAME one page: hero + order button, menu
// place cards, a Google link for hours/contact, socials. Only the vibe
// changes — type, color, corner radius, layout of the cards.

export interface SiteTemplate {
  id: string;
  name: string;
  vibe: string;
  who: string;
  /** hero background gradient */
  hero: string;
  /** primary button gradient */
  button: string;
  /** page background */
  surface: string;
  /** heading text color class */
  heading: string;
  /** body text color class */
  body: string;
  /** card background class */
  card: string;
  /** corner radius class used across the template */
  radius: string;
  /** heading font stack class */
  font: string;
  /** menu card grid: 1 or 2 across on mobile preview */
  cardCols: 1 | 2;
  /** words the AI matches when an owner describes their vibe */
  keywords: string[];
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: 'warm-diner',
    name: 'Warm Diner',
    vibe: 'Cozy, hand-written, comfort food',
    who: 'Family restaurants, breakfast houses, BBQ',
    hero: 'from-amber-500 via-orange-500 to-red-500',
    button: 'from-red-600 to-orange-500',
    surface: 'bg-amber-50',
    heading: 'text-stone-900',
    body: 'text-stone-600',
    card: 'bg-white border-amber-200',
    radius: 'rounded-2xl',
    font: 'font-extrabold tracking-tight',
    cardCols: 2,
    keywords: ['cozy', 'warm', 'diner', 'comfort', 'family', 'homestyle', 'bbq', 'southern'],
  },
  {
    id: 'street-bold',
    name: 'Street Bold',
    vibe: 'Loud, high-contrast, graffiti energy',
    who: 'Food trucks, taquerias, wing joints',
    hero: 'from-fuchsia-600 via-rose-500 to-amber-400',
    button: 'from-fuchsia-600 to-rose-500',
    surface: 'bg-slate-950',
    heading: 'text-white',
    body: 'text-slate-300',
    card: 'bg-white/5 border-white/10',
    radius: 'rounded-xl',
    font: 'font-black uppercase tracking-tight',
    cardCols: 2,
    keywords: ['bold', 'loud', 'street', 'truck', 'graffiti', 'punk', 'neon', 'late night'],
  },
  {
    id: 'clean-cafe',
    name: 'Clean Café',
    vibe: 'Airy, minimal, lots of white space',
    who: 'Coffee shops, bakeries, smoothie bars',
    hero: 'from-emerald-400 via-teal-300 to-sky-300',
    button: 'from-emerald-600 to-teal-500',
    surface: 'bg-white',
    heading: 'text-slate-900',
    body: 'text-slate-500',
    card: 'bg-slate-50 border-slate-200',
    radius: 'rounded-3xl',
    font: 'font-semibold tracking-tight',
    cardCols: 1,
    keywords: ['clean', 'minimal', 'airy', 'coffee', 'cafe', 'bakery', 'light', 'simple', 'modern'],
  },
  {
    id: 'coastal',
    name: 'Coastal Catch',
    vibe: 'Salt air, weathered blue, seafood shack',
    who: 'Seafood, fish markets, waterfront bars',
    hero: 'from-sky-600 via-cyan-500 to-teal-400',
    button: 'from-sky-700 to-cyan-500',
    surface: 'bg-sky-50',
    heading: 'text-sky-950',
    body: 'text-slate-600',
    card: 'bg-white border-sky-200',
    radius: 'rounded-2xl',
    font: 'font-extrabold tracking-tight',
    cardCols: 2,
    keywords: ['coastal', 'seafood', 'fish', 'beach', 'ocean', 'nautical', 'shack', 'dock'],
  },
  {
    id: 'night-bar',
    name: 'Night Bar',
    vibe: 'Dark, moody, candle-lit',
    who: 'Beer & wine, cocktail rooms, late kitchens',
    hero: 'from-violet-800 via-indigo-800 to-slate-900',
    button: 'from-amber-400 to-yellow-500',
    surface: 'bg-stone-950',
    heading: 'text-amber-100',
    body: 'text-stone-400',
    card: 'bg-white/5 border-amber-500/20',
    radius: 'rounded-lg',
    font: 'font-bold tracking-wide',
    cardCols: 1,
    keywords: ['dark', 'moody', 'bar', 'wine', 'cocktail', 'night', 'speakeasy', 'candle'],
  },
  {
    id: 'sweet-shop',
    name: 'Sweet Shop',
    vibe: 'Playful pastel, rounded, kid-friendly',
    who: 'Ice cream, cookies, candy, dessert bars',
    hero: 'from-pink-400 via-rose-300 to-violet-300',
    button: 'from-pink-500 to-violet-500',
    surface: 'bg-pink-50',
    heading: 'text-violet-900',
    body: 'text-slate-600',
    card: 'bg-white border-pink-200',
    radius: 'rounded-[28px]',
    font: 'font-extrabold tracking-tight',
    cardCols: 2,
    keywords: ['sweet', 'playful', 'pastel', 'ice cream', 'cookie', 'candy', 'dessert', 'fun', 'kids'],
  },
];

export const templateById = (id?: string | null) =>
  SITE_TEMPLATES.find((t) => t.id === id) || SITE_TEMPLATES[0];

/** Score a free-text vibe against every template and return the best match. */
export const matchTemplate = (text: string): { template: SiteTemplate; score: number; hits: string[] } => {
  const t = (text || '').toLowerCase();
  let best = { template: SITE_TEMPLATES[0], score: 0, hits: [] as string[] };
  SITE_TEMPLATES.forEach((tpl) => {
    const hits = tpl.keywords.filter((k) => t.includes(k));
    if (hits.length > best.score) best = { template: tpl, score: hits.length, hits };
  });
  return best;
};

// ---------------- Logo creator presets ----------------

export const LOGO_STYLES = [
  { id: 'modern', label: 'Modern mark', hint: 'Clean geometric emblem + wordmark' },
  { id: 'vintage badge', label: 'Vintage badge', hint: 'Circle badge, established-since feel' },
  { id: 'hand-drawn script', label: 'Hand-drawn', hint: 'Brush script, human and warm' },
  { id: 'bold block type', label: 'Bold type', hint: 'Heavy letters, high contrast' },
  { id: 'minimal line art', label: 'Line art', hint: 'Single-weight outline icon' },
  { id: 'retro neon sign', label: 'Retro neon', hint: 'Diner sign, glow letters' },
];

export const LOGO_PALETTES = [
  { id: 'warm orange and deep charcoal', label: 'Warm orange / charcoal', swatch: 'from-orange-500 to-stone-800' },
  { id: 'cream and forest green', label: 'Cream / forest green', swatch: 'from-emerald-700 to-lime-200' },
  { id: 'deep navy and brass gold', label: 'Navy / brass', swatch: 'from-indigo-900 to-amber-400' },
  { id: 'hot pink and midnight black', label: 'Hot pink / black', swatch: 'from-fuchsia-500 to-slate-900' },
  { id: 'terracotta and sand', label: 'Terracotta / sand', swatch: 'from-orange-700 to-amber-100' },
  { id: 'sky blue and white', label: 'Sky blue / white', swatch: 'from-sky-500 to-slate-100' },
];

export const LOGO_SYMBOLS = [
  'a fork and knife',
  'a coffee cup with steam',
  'a fish',
  'a taco',
  'a slice of pizza',
  'a cookie',
  'an ice cream cone',
  'a chef hat',
  'a wheat stalk',
  'a burger',
  'a flame',
  'no symbol, letters only',
];

// ---------------- Sample pages a prospect can flip through ----------------
// The one page is always the same three jobs. These are the sample shops
// we render it with so an owner can see it before they buy.

export interface SamplePage {
  id: string;
  shop: string;
  concept: string;
  templateId: string;
  tagline: string;
  items: { name: string; price: number; note: string }[];
  socials: string[];
}

export const SAMPLE_PAGES: SamplePage[] = [
  {
    id: 'riverside',
    shop: 'Riverside Fish Co.',
    concept: 'Seafood shack',
    templateId: 'coastal',
    tagline: 'Off the boat, on your plate, same day.',
    items: [
      { name: 'Fried Fish Basket', price: 1495, note: 'Cod, slaw, hush puppies' },
      { name: 'Shrimp Po Boy', price: 1395, note: 'Remoulade, pickles' },
      { name: 'Crab Cake Plate', price: 1895, note: 'Two cakes, rice, greens' },
      { name: 'Key Lime Pie', price: 695, note: 'Made this morning' },
    ],
    socials: ['Instagram', 'Facebook', 'Google Reviews'],
  },
  {
    id: 'vega',
    shop: 'Vega Street Tacos',
    concept: 'Food truck',
    templateId: 'street-bold',
    tagline: 'Find the truck. Follow the smoke.',
    items: [
      { name: 'Al Pastor (3)', price: 1150, note: 'Pineapple, onion, cilantro' },
      { name: 'Birria Quesa', price: 1350, note: 'With consommé' },
      { name: 'Elote Cup', price: 550, note: 'Chili, lime, cotija' },
      { name: 'Horchata', price: 425, note: '20oz, cinnamon' },
    ],
    socials: ['Instagram', 'TikTok', 'Google Reviews'],
  },
  {
    id: 'northbend',
    shop: 'North Bend Coffee',
    concept: 'Coffee shop',
    templateId: 'clean-cafe',
    tagline: 'Small batch. Big mornings.',
    items: [
      { name: 'Cortado', price: 425, note: 'House espresso' },
      { name: 'Maple Latte', price: 575, note: 'Real maple, 12oz' },
      { name: 'Butter Croissant', price: 425, note: 'Baked at 5am' },
      { name: 'Breakfast Sandwich', price: 875, note: 'Egg, cheddar, jam' },
    ],
    socials: ['Instagram', 'Facebook'],
  },
  {
    id: 'warmbatch',
    shop: 'Warm Batch Cookies',
    concept: 'Cookie shop',
    templateId: 'sweet-shop',
    tagline: 'Still warm when you get there.',
    items: [
      { name: 'Half Dozen Box', price: 1800, note: 'Pick any six' },
      { name: 'Brown Butter Chip', price: 375, note: 'Sea salt finish' },
      { name: 'Birthday Cake', price: 375, note: 'Sprinkles, always' },
      { name: 'Cold Milk', price: 250, note: '12oz bottle' },
    ],
    socials: ['Instagram', 'TikTok', 'Facebook'],
  },
];

// ---------------- The one page, described once ----------------
// Used by the template preview so the copy never drifts from reality.

export const PAGE_JOBS = [
  {
    id: 'order',
    title: 'Order (the whole point)',
    body: 'Menu and photos come straight from the POS catalog. Guests tap, pay, kitchen prints. 0% commission.',
    source: 'POS menu',
  },
  {
    id: 'google',
    title: 'Hours, address & phone',
    body: 'One button to your Google Business listing. We never re-type hours — Google is the single source.',
    source: 'Google Business link',
  },
  {
    id: 'social',
    title: 'Social links',
    body: 'Instagram, Facebook, TikTok and reviews. Paste them once at signup and they live in the footer.',
    source: 'Pasted once',
  },
];

// ---------------- Agent skill roadmap (ADK back-end order) ----------------
// This is the build order for the back-end skills the copilot calls.
// Status drives the sidebar checklist on the POS page.

export type SkillStatus = 'live' | 'building' | 'next' | 'planned';

export interface AgentSkill {
  id: string;
  /** the ADK tool name this becomes on the back end */
  tool: string;
  name: string;
  what: string;
  /** what the operator literally says */
  says: string;
  surface: 'POS' | 'Website' | 'Back office' | 'Growth';
  status: SkillStatus;
  /** ids this skill depends on */
  needs: string[];
}

export const SKILL_STATUS_META: Record<SkillStatus, { label: string; chip: string; dot: string }> = {
  live: { label: 'Live', chip: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  building: { label: 'Building', chip: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500' },
  next: { label: 'Next up', chip: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  planned: { label: 'Planned', chip: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
};

export const AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'menu-ingest',
    tool: 'menu.ingest',
    name: 'Menu ingestion',
    what: 'Parse a photo, PDF, CSV or link into items, prices, sizes, modifiers and tax classes.',
    says: '"Here is my menu."',
    surface: 'POS',
    status: 'live',
    needs: [],
  },
  {
    id: 'menu-ingest-url',
    tool: 'menu.ingestUrl',
    name: 'PDF & website intake',
    what: 'Fetch a menu PDF link or the owner\'s current website menu page and structure it.',
    says: '"My menu is on my website."',
    surface: 'POS',
    status: 'live',
    needs: ['menu-ingest'],
  },
  {
    id: 'menu-placement',
    tool: 'menu.placement',
    name: 'Standard placement',
    what: 'Re-order categories to the standard placement for the concept and flag leftovers.',
    says: '"Put my menu in the normal order."',
    surface: 'POS',
    status: 'live',
    needs: ['menu-ingest'],
  },
  {
    id: 'menu-modifiers',
    tool: 'menu.modifiers',
    name: 'Modifier builder',
    what: 'Take a pasted add-on list or a standard group and attach it to the right items.',
    says: '"Add oat milk to every espresso drink."',
    surface: 'POS',
    status: 'building',
    needs: ['menu-ingest'],
  },

  {
    id: 'floor-ops',
    tool: 'floor.splitCheck / floor.comp',
    name: 'Floor operations',
    what: 'Split checks, comp a ticket, run a flash discount, close the drawer.',
    says: '"Split table 4 three ways."',
    surface: 'POS',
    status: 'live',
    needs: ['menu-ingest'],
  },
  {
    id: 'device-health',
    tool: 'device.verify',
    name: 'Hardware sentinel',
    what: 'Heartbeat every paired device; hold order entry when a critical station goes dark.',
    says: '"Why is the kitchen printer down?"',
    surface: 'POS',
    status: 'live',
    needs: [],
  },
  {
    id: 'reports',
    tool: 'report.run',
    name: 'Reports & audits',
    what: 'Z-close, PMIX, food-cost variance, hourly labor, sales tax by jurisdiction.',
    says: '"Run daily close."',
    surface: 'Back office',
    status: 'live',
    needs: ['floor-ops'],
  },
  {
    id: 'schedule',
    tool: 'labor.buildSchedule',
    name: 'Schedule & labor',
    what: 'Build the week to an hour budget, flag overtime, publish the roster.',
    says: '"Build next week under 210 hours."',
    surface: 'Back office',
    status: 'live',
    needs: ['reports'],
  },
  {
    id: 'site-build',
    tool: 'site.build',
    name: 'Website builder',
    what: 'Generate the one page from the POS catalog, Google link and socials.',
    says: '"Build my website page."',
    surface: 'Website',
    status: 'live',
    needs: ['menu-ingest'],
  },
  {
    id: 'vibe-template',
    tool: 'vibe.matchTemplate',
    name: 'Vibe → template match',
    what: 'Read a plain-English vibe description and pick + tune the page template.',
    says: '"Dark and moody like a wine bar."',
    surface: 'Website',
    status: 'building',
    needs: ['site-build'],
  },
  {
    id: 'logo-gen',
    tool: 'brand.generateLogo',
    name: 'Logo creator',
    what: 'Generate a logo mark from the concept, style, palette and symbol, then save it to the shop.',
    says: '"Make me a logo."',
    surface: 'Website',
    status: 'building',
    needs: ['vibe-template'],
  },
  {
    id: 'photo-gen',
    tool: 'brand.dishPhoto',
    name: 'Dish photo cleanup',
    what: 'Crop, light-correct and background-clean an owner photo into a usable place card.',
    says: '"Fix this photo of the burger."',
    surface: 'Website',
    status: 'next',
    needs: ['logo-gen'],
  },
  {
    id: 'copy-gen',
    tool: 'brand.writeCopy',
    name: 'Menu & page copy',
    what: 'Write item descriptions and the one-line tagline in the owner\'s own voice, then save what they accept.',
    says: '"Write descriptions for my tacos."',
    surface: 'Website',
    status: 'live',
    needs: ['vibe-template'],
  },

  {
    id: 'google-sync',
    tool: 'google.sync',
    name: 'Google listing sync',
    what: 'Pull name, address, phone, hours and rating; push the ordering link back.',
    says: '"Connect my Google listing."',
    surface: 'Website',
    status: 'next',
    needs: ['site-build'],
  },
  {
    id: 'inventory',
    tool: 'inventory.count',
    name: 'Inventory & pars',
    what: 'Depletion from PMIX, par levels, low-stock alerts and a printable order guide.',
    says: '"What do I order Tuesday?"',
    surface: 'Back office',
    status: 'planned',
    needs: ['reports'],
  },
  {
    id: 'marketing',
    tool: 'growth.campaign',
    name: 'Win-back campaigns',
    what: 'Segment lapsed guests, draft the SMS/email, schedule it, report the lift.',
    says: '"Text everyone who has not been in for 60 days."',
    surface: 'Growth',
    status: 'planned',
    needs: ['reports'],
  },
  {
    id: 'reviews',
    tool: 'growth.reviews',
    name: 'Review responder',
    what: 'Draft replies to Google reviews in the owner\'s voice and flag the ones that need a human.',
    says: '"Answer my new reviews."',
    surface: 'Growth',
    status: 'planned',
    needs: ['google-sync'],
  },
  {
    id: 'onboard-agent',
    tool: 'build.orchestrate',
    name: 'Build orchestrator',
    what: 'The agent that runs the whole build: ingest → template → logo → site → domain → go live.',
    says: '"Just build the whole thing."',
    surface: 'Back office',
    status: 'planned',
    needs: ['logo-gen', 'copy-gen', 'google-sync'],
  },
];

export const SKILL_SURFACES = ['POS', 'Website', 'Back office', 'Growth'] as const;

export const skillsByStatus = (status: SkillStatus) => AGENT_SKILLS.filter((s) => s.status === status);

/** The ordered roadmap: everything not already live, in dependency order. */
export const SKILL_ROADMAP = AGENT_SKILLS.filter((s) => s.status !== 'live');
