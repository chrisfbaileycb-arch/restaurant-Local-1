// ============================================================
// Menu intake — the guided walkthrough that happens BEFORE any
// AI touches the menu. Single source of truth for:
//   • what the owner needs to have ready (the disclaimer)
//   • the source types we accept (file, PDF link, website, paste)
//   • standard menu placement templates (category order by concept)
//   • standard modifier group templates
//   • the step-by-step the agent walks them through
// Import from here. Never re-declare these lists anywhere else.
// ============================================================

// ---------------- 1. Read this first (the honest disclaimer) ----------------

export const INTAKE_DISCLAIMER = {
  title: 'Before we start — how menu building actually works',
  body:
    'This is not magic. The agent does about 80% of the typing for you, but you make every final call. ' +
    'You bring the raw menu, we structure it, then you and the agent walk it line by line before anything goes live.',
  points: [
    'Nothing is published until you approve it — you can edit every item, price and modifier.',
    'The AI reads what you give it. A blurry photo of a chalkboard gives blurry results; a PDF or CSV gives near-perfect results.',
    'Prices come in exactly as printed. If your prices are changing, upload the new ones — do not make us guess.',
    'Modifiers are the part people skip. Bring them and your POS buttons are right on day one.',
    'Plan on 10–20 minutes with the agent for a 40-item menu. That is the whole build.',
  ],
};

export interface IntakeChecklistItem {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

/** What to have on the desk before you click start. */
export const INTAKE_CHECKLIST: IntakeChecklistItem[] = [
  {
    id: 'menu-file',
    label: 'Your current menu',
    detail: 'PDF, photo, spreadsheet, a link to your menu page — whatever you already have.',
    required: true,
  },
  {
    id: 'prices',
    label: 'Final prices (and sizes)',
    detail: 'The prices you will actually charge on day one, including 12oz / 16oz style size steps.',
    required: true,
  },
  {
    id: 'modifiers',
    label: 'Your modifiers & add-ons',
    detail: 'Add bacon +$2, oat milk +$0.75, no onion, temp, spice level. One per line is fine.',
    required: true,
  },
  {
    id: 'new-items',
    label: 'Items you have already decided on',
    detail: 'Anything not printed anywhere yet — new specials, LTOs, catering trays.',
    required: false,
  },
  {
    id: 'website',
    label: 'Your current website (if you have one)',
    detail: 'We read the menu page and pull item names, descriptions and your voice from it.',
    required: false,
  },
  {
    id: 'photos',
    label: 'Food photos',
    detail: 'Phone photos are fine. These become the place cards on your ordering page.',
    required: false,
  },
  {
    id: 'alcohol',
    label: 'Beer / wine list',
    detail: 'Kept separate so we can put it in the right tax class automatically.',
    required: false,
  },
];

// ---------------- 2. Where the menu can come from ----------------

export type IntakeSourceKind = 'file' | 'pdf-url' | 'website' | 'paste-items' | 'paste-modifiers';

export interface IntakeSource {
  id: IntakeSourceKind;
  label: string;
  hint: string;
  placeholder?: string;
  quality: 'best' | 'good' | 'ok';
  /** the ADK tool that handles this source */
  tool: string;
}

export const INTAKE_SOURCES: IntakeSource[] = [
  {
    id: 'file',
    label: 'Upload a file',
    hint: 'PDF, JPG, PNG, CSV or TXT from your computer.',
    quality: 'best',
    tool: 'menu.ingest',
  },
  {
    id: 'pdf-url',
    label: 'Link to a PDF',
    hint: 'Paste the URL of a menu PDF that already lives online.',
    placeholder: 'https://yourshop.com/menu.pdf',
    quality: 'best',
    tool: 'menu.ingestUrl',
  },
  {
    id: 'website',
    label: 'Your current website',
    hint: 'We read your menu page and keep your existing descriptions.',
    placeholder: 'https://yourshop.com/menu',
    quality: 'good',
    tool: 'menu.ingestUrl',
  },
  {
    id: 'paste-items',
    label: 'Type or paste items',
    hint: 'One item per line: name, price, then anything in parentheses.',
    placeholder: 'Smash Burger 11.95 (add bacon +2.00, no onion)\nLoaded Fries 7.95',
    quality: 'best',
    tool: 'menu.ingest',
  },
  {
    id: 'paste-modifiers',
    label: 'Paste your modifiers',
    hint: 'Add-ons and options that apply across the menu. One per line.',
    placeholder: 'Add bacon +2.00\nOat milk +0.75\nNo onion\nExtra sauce +0.50',
    quality: 'good',
    tool: 'menu.modifiers',
  },
];

// ---------------- 3. Standard menu placement templates ----------------
// Guests read a menu in a known order and POS buttons should match it.
// Each template is a canonical category order for a concept.

export interface PlacementTemplate {
  id: string;
  name: string;
  who: string;
  /** canonical order, top to bottom / left to right on the POS grid */
  order: string[];
  /** category names we fold into the canonical ones */
  aliases: Record<string, string[]>;
  note: string;
}

export const PLACEMENT_TEMPLATES: PlacementTemplate[] = [
  {
    id: 'full-service',
    name: 'Full service restaurant',
    who: 'Sit-down, table service, dinner house',
    order: ['Starters', 'Salads', 'Entrees', 'Sandwiches', 'Sides', 'Desserts', 'Non-Alcoholic', 'Beer & Wine'],
    aliases: {
      Starters: ['appetizers', 'apps', 'small plates', 'shareables', 'snacks'],
      Salads: ['salad', 'greens', 'soup & salad', 'soups'],
      Entrees: ['mains', 'plates', 'dinner', 'specialties', 'from the grill'],
      Sandwiches: ['burgers', 'handhelds', 'wraps', 'subs'],
      Sides: ['side', 'extras', 'add ons', 'a la carte'],
      Desserts: ['sweets', 'dessert'],
      'Non-Alcoholic': ['drinks', 'beverages', 'soda', 'tea', 'lemonade'],
      'Beer & Wine': ['beer', 'wine', 'draft', 'cocktails', 'bar'],
    },
    note: 'Starters first, drinks last — the order guests already expect.',
  },
  {
    id: 'counter',
    name: 'Counter service / fast casual',
    who: 'Order at the register, food runs out',
    order: ['Signature', 'Sandwiches', 'Bowls & Plates', 'Sides', 'Kids', 'Drinks', 'Desserts'],
    aliases: {
      Signature: ['featured', 'popular', 'house favorites', 'specials'],
      Sandwiches: ['burgers', 'handhelds', 'tacos', 'wraps'],
      'Bowls & Plates': ['bowls', 'plates', 'entrees', 'mains'],
      Sides: ['side', 'fries', 'extras'],
      Kids: ['kids menu', 'little ones'],
      Drinks: ['beverages', 'fountain', 'canned'],
      Desserts: ['sweets', 'treats'],
    },
    note: 'Best sellers in the first six buttons — that is what the cashier taps all day.',
  },
  {
    id: 'coffee',
    name: 'Coffee & bakery',
    who: 'Cafés, espresso bars, bakeries',
    order: ['Espresso', 'Brewed Coffee', 'Tea & Other', 'Cold Drinks', 'Breakfast', 'Pastry & Bakery', 'Retail Beans'],
    aliases: {
      Espresso: ['lattes', 'espresso drinks', 'hot espresso'],
      'Brewed Coffee': ['drip', 'pour over', 'batch brew', 'coffee'],
      'Tea & Other': ['tea', 'chai', 'matcha', 'hot chocolate'],
      'Cold Drinks': ['iced', 'cold brew', 'smoothies', 'refreshers'],
      Breakfast: ['food', 'sandwiches', 'toast', 'all day'],
      'Pastry & Bakery': ['pastries', 'bakery', 'sweets', 'cookies'],
      'Retail Beans': ['retail', 'whole bean', 'merch', 'bags'],
    },
    note: 'Espresso first — it is 60%+ of tickets in most cafés.',
  },
  {
    id: 'truck',
    name: 'Food truck',
    who: 'Small window menu, fast line',
    order: ['The Menu', 'Combos', 'Sides', 'Drinks'],
    aliases: {
      'The Menu': ['tacos', 'main', 'mains', 'items', 'eats'],
      Combos: ['combo', 'meals', 'plates'],
      Sides: ['side', 'chips', 'extras'],
      Drinks: ['beverages', 'agua fresca', 'soda'],
    },
    note: 'Four buttons max on the window. Everything else becomes a modifier.',
  },
  {
    id: 'bar',
    name: 'Bar & late kitchen',
    who: 'Beer, wine, cocktails, bar food',
    order: ['Draft', 'Bottles & Cans', 'Wine', 'Cocktails', 'N/A', 'Bar Food', 'Late Night'],
    aliases: {
      Draft: ['on tap', 'taps', 'draught'],
      'Bottles & Cans': ['bottles', 'cans', 'packaged'],
      Wine: ['by the glass', 'red', 'white', 'bubbles'],
      Cocktails: ['mixed drinks', 'signature cocktails', 'house cocktails'],
      'N/A': ['non alcoholic', 'zero proof', 'mocktails', 'soda'],
      'Bar Food': ['food', 'snacks', 'shareables', 'apps'],
      'Late Night': ['after 10', 'late menu'],
    },
    note: 'Alcohol categories are auto-flagged for the alcohol tax class.',
  },
  {
    id: 'sweets',
    name: 'Sweets shop',
    who: 'Ice cream, cookies, dessert bars',
    order: ['By the Scoop', 'Signature Treats', 'Boxes & Packs', 'Toppings', 'Drinks', 'Catering'],
    aliases: {
      'By the Scoop': ['scoops', 'cones', 'single serve', 'flavors'],
      'Signature Treats': ['specialty', 'sundaes', 'cookies', 'featured'],
      'Boxes & Packs': ['boxes', 'dozen', 'half dozen', 'party packs', 'pints'],
      Toppings: ['add ons', 'mix ins', 'extras'],
      Drinks: ['beverages', 'shakes', 'milk'],
      Catering: ['orders', 'large orders', 'events'],
    },
    note: 'Packs and boxes sit right under singles — that is where the upsell happens.',
  },
];

export const placementById = (id?: string | null) =>
  PLACEMENT_TEMPLATES.find((p) => p.id === id) || PLACEMENT_TEMPLATES[1];

/** Map a shop's business_type to the placement template we suggest first. */
export const suggestPlacement = (businessType?: string | null): PlacementTemplate => {
  const t = (businessType || '').toLowerCase();
  if (t.includes('truck')) return placementById('truck');
  if (t.includes('coffee') || t.includes('bakery') || t.includes('smoothie')) return placementById('coffee');
  if (t.includes('beer') || t.includes('wine') || t.includes('bar')) return placementById('bar');
  if (t.includes('ice') || t.includes('cookie') || t.includes('candy') || t.includes('dessert'))
    return placementById('sweets');
  if (t.includes('restaurant')) return placementById('full-service');
  return placementById('counter');
};

/** Which canonical bucket a raw category name belongs in (or null if unknown). */
export const bucketFor = (raw: string, tpl: PlacementTemplate): string | null => {
  const name = (raw || '').trim().toLowerCase();
  if (!name) return null;
  const direct = tpl.order.find((o) => o.toLowerCase() === name);
  if (direct) return direct;
  const aliased = tpl.order.find((o) => (tpl.aliases[o] || []).some((a) => name.includes(a)));
  return aliased || null;
};

/**
 * Re-order categories to the standard placement for a concept.
 * Unknown categories keep their relative order and land at the bottom
 * — we never silently drop anything the owner uploaded.
 */
export const applyPlacement = <T extends { name: string }>(
  categories: T[],
  tpl: PlacementTemplate
): { ordered: T[]; moved: number; unmatched: string[] } => {
  const scored = categories.map((c, i) => {
    const bucket = bucketFor(c.name, tpl);
    const rank = bucket ? tpl.order.indexOf(bucket) : tpl.order.length + i;
    return { c, rank, i, bucket };
  });
  const ordered = [...scored].sort((a, b) => a.rank - b.rank || a.i - b.i);
  const moved = ordered.filter((s, idx) => s.i !== idx).length;
  return {
    ordered: ordered.map((s) => s.c),
    moved,
    unmatched: scored.filter((s) => !s.bucket).map((s) => s.c.name),
  };
};

// ---------------- 4. Standard modifier groups ----------------

export interface ModifierGroupTemplate {
  id: string;
  name: string;
  appliesTo: string;
  options: string[];
}

export const MODIFIER_TEMPLATES: ModifierGroupTemplate[] = [
  { id: 'milk', name: 'Milk choice', appliesTo: 'Espresso, coffee, tea', options: ['Whole', 'Oat +0.75', 'Almond +0.75', 'Skim', 'Half & half'] },
  { id: 'size', name: 'Size', appliesTo: 'Drinks, bowls', options: ['12oz', '16oz +0.70', '20oz +1.20'] },
  { id: 'temp', name: 'Cook temp', appliesTo: 'Burgers, steaks', options: ['Rare', 'Medium rare', 'Medium', 'Medium well', 'Well'] },
  { id: 'addons', name: 'Add-ons', appliesTo: 'Sandwiches, burgers', options: ['Bacon +2.00', 'Avocado +1.50', 'Extra cheese +1.00', 'Fried egg +1.50'] },
  { id: 'removals', name: 'Hold / no', appliesTo: 'Everything', options: ['No onion', 'No pickle', 'No sauce', 'Sauce on side'] },
  { id: 'heat', name: 'Spice level', appliesTo: 'Tacos, wings, bowls', options: ['Mild', 'Medium', 'Hot', 'Extra hot'] },
  { id: 'side', name: 'Pick a side', appliesTo: 'Plates, combos', options: ['Fries', 'Chips', 'Side salad +1.00', 'Fruit +1.00'] },
  { id: 'prep', name: 'Prep note', appliesTo: 'Everything', options: ['To go', 'Allergy — see ticket', 'Extra napkins'] },
];

// ---------------- 5. The agent-directed walkthrough ----------------

export interface WalkthroughStep {
  id: string;
  n: number;
  title: string;
  what: string;
  youDo: string;
  agentDoes: string;
  /** the ADK tool the agent calls on this step */
  tool: string;
}

export const MENU_WALKTHROUGH: WalkthroughStep[] = [
  {
    id: 'gather',
    n: 1,
    title: 'Gather your sources',
    what: 'Everything that describes what you sell.',
    youDo: 'Upload a file, paste a PDF link or your website, or type items straight in.',
    agentDoes: 'Tells you which source will give the cleanest read and what is still missing.',
    tool: 'menu.ingest / menu.ingestUrl',
  },
  {
    id: 'structure',
    n: 2,
    title: 'Structure the items',
    what: 'Names, prices, sizes, categories.',
    youDo: 'Confirm prices and fix anything the read got wrong.',
    agentDoes: 'Turns raw text into items with prices in cents and groups them into categories.',
    tool: 'menu.ingest',
  },
  {
    id: 'placement',
    n: 3,
    title: 'Set the placement',
    what: 'The order guests and cashiers see.',
    youDo: 'Pick the placement template that matches your concept, or drag your own order.',
    agentDoes: 'Re-orders your categories to the standard for that concept and flags leftovers.',
    tool: 'menu.placement',
  },
  {
    id: 'modifiers',
    n: 4,
    title: 'Attach modifiers',
    what: 'Add-ons, holds, sizes, temps.',
    youDo: 'Paste your add-on list or accept the standard groups for your concept.',
    agentDoes: 'Builds modifier groups and attaches them to the right items.',
    tool: 'menu.modifiers',
  },
  {
    id: 'tax',
    n: 5,
    title: 'Check tax classes',
    what: 'Prepared food vs alcohol vs grocery vs merch.',
    youDo: 'Glance at anything the agent flags — usually just alcohol and retail bags.',
    agentDoes: 'Guesses a class per item and shows you only the ones it is unsure about.',
    tool: 'menu.taxClass',
  },
  {
    id: 'copy',
    n: 6,
    title: 'Write the descriptions',
    what: 'A tagline and one line per item, in your voice.',
    youDo: 'Describe your vibe once, then approve or edit each line.',
    agentDoes: 'Writes every description from your vibe and item names, then saves what you accept.',
    tool: 'brand.writeCopy',
  },
  {
    id: 'approve',
    n: 7,
    title: 'Approve & publish',
    what: 'Nothing is live until this click.',
    youDo: 'Hit save. Ring a test order on the POS.',
    agentDoes: 'Publishes the menu to POS, ordering and the website at the same time.',
    tool: 'build.orchestrate',
  },
];
