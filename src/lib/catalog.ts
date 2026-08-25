/**
 * Catalog data layer — SINGLE SOURCE OF TRUTH for reading hardware products
 * and collections.
 *
 * Every read goes through here and uses Google Cloud Data Store with resilient
 * local fallback caching. Each helper:
 *   1. tries the live Google Cloud Data Store,
 *   2. on error OR empty result falls back to the bundled catalog snapshot,
 *   3. never throws and never console.errors (one single console.warn per page
 *      load, so a demo is never interrupted by a wall of red).
 */

import { googleCloud } from '@/lib/googleCloud';

export interface CatalogProduct {
  id: string;
  handle: string;
  name: string;
  price: number;
  sku?: string;
  product_type?: string;
  description?: string;
  images: string[];
  tags: string[];
  status: string;
  has_variants: boolean;
  inventory_qty: number | null;
  variants?: any[];
  metadata?: Record<string, any>;
}

export interface CatalogCollection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  is_visible: boolean;
}

/* ------------------------------------------------------------------ */
/* Bundled snapshot — mirrors the live catalog so the site still sells  */
/* even if the database is unreachable mid-demo.                        */
/* ------------------------------------------------------------------ */

const IMG = 'https://d64gsuwffb70l.cloudfront.net/6a7724f7e7b1bd470e4c72fe_';

type Row = [handle: string, name: string, price: number, type: string, img: string, sku: string, tags: string[], blurb: string];

const ROWS: Row[] = [
  ['vibe-terminal-15-countertop', 'Vibe Terminal 15" Countertop POS', 112900, 'Terminals', '1787377813771_fc273298.jpg', 'VT-15-CTR', ['featured', 'terminal', 'counter'], 'The full-size countertop station: 15" tap-optimised touchscreen on a brushed swivel stand.'],
  ['vibe-terminal-mini-10', 'Vibe Terminal Mini 10"', 79900, 'Terminals', '1787372145590_b087d828.jpg', 'LLE-TERM-10', ['featured', 'terminals', 'counter'], '10" all-in-one counter terminal with a tilt stand and a built-in reader.'],
  ['vibe-handheld-order-pad', 'Vibe Handheld Order Pad', 49900, 'Terminals', '1787372146076_0e75e2cc.jpg', 'LLE-HAND-6', ['featured', 'terminals', 'mobile'], 'Rugged 6" handheld with a built-in reader. Take the order and the payment at the table.'],
  ['vibe-tab-10-budget-touchscreen', 'Vibe Tab 10" Budget Touchscreen', 14900, 'Terminals', '1787372148347_53afdd09.jpg', 'LLE-TAB-10', ['featured', 'budget', 'terminals', 'counter', 'unbranded'], 'Commercial-grade 10" touchscreen station with zero recurring software fees.'],
  ['vibe-self-order-kiosk', 'Vibe Self-Order Kiosk', 249900, 'Kiosks', '1787372147415_f2f7735b.jpg', 'LLE-KIOSK-15', ['kiosk', 'counter'], '15" floor or counter kiosk running the same menu as the register.'],
  ['vibe-tap-chip-reader', 'Vibe Tap & Chip Reader', 24900, 'Card Readers', '1787372123528_f67f0044.jpg', 'LLE-RDR-TAP', ['featured', 'payments'], 'Countertop reader for tap, chip, swipe and wallet payments. P2PE encrypted at the head.'],
  ['vibe-pocket-reader', 'Vibe Pocket Reader (Bluetooth)', 8900, 'Card Readers', '1787372125901_3584e05a.jpg', 'LLE-RDR-PKT', ['payments', 'mobile'], 'Palm-sized Bluetooth reader for tableside and curbside.'],
  ['tap-only-card-reader', 'Tap-Only Card Reader', 4900, 'Card Readers', '1787372126425_293de144.jpg', 'LLE-RDR-TAPONLY', ['featured', 'budget', 'payments'], 'The cheapest way to take a real card. Contactless only, pairs in seconds.'],
  ['phone-card-swiper-plugin', 'Phone Plug-In Card Swiper', 2900, 'Card Readers', '1787372144403_2b7be0dd.jpg', 'LLE-SWIPE-PLUG', ['budget', 'payments', 'mobile'], 'No battery, no pairing, no radio. Plugs into USB-C or Lightning.'],
  ['vibe-thermal-receipt-printer', 'Vibe Thermal Receipt Printer', 27900, 'Printers', '1787372118486_4692d9d0.jpg', 'LLE-RCPT-80', ['featured', 'printers', 'counter'], '80mm ESC/POS thermal printer for guest receipts. USB, LAN and Bluetooth on board.'],
  ['vibe-kitchen-impact-printer', 'Vibe Kitchen Impact Printer', 32900, 'Printers', '1787372122795_29a24d9a.jpg', 'LLE-KIT-IMPACT', ['kitchen', 'printers'], 'Two-colour impact printer built for heat, steam and grease.'],
  ['kitchen-ticket-printer-wifi', 'Kitchen Ticket Printer (WiFi)', 14900, 'Printers', '1787372120224_c70d7051.jpg', 'LLE-KIT-WIFI', ['featured', 'kitchen', 'printers'], 'Wired or wireless kitchen printer with a loud buzzer and auto-cut.'],
  ['mini-receipt-printer-bluetooth', 'Mini Receipt Printer (Bluetooth)', 9900, 'Printers', '1787372118349_b1ead339.jpg', 'LLE-RCPT-MINI', ['featured', 'budget', 'printers', 'mobile'], '58mm battery-powered pocket printer that pairs to a phone.'],
  ['vibe-kitchen-display-22', 'Vibe Kitchen Display 22"', 89900, 'Kitchen Display', '1787372142864_3b1f797c.jpg', 'LLE-KDS-22', ['featured', 'kitchen'], '22" splash-resistant kitchen display with a bump bar and four-minute red timers.'],
  ['vibe-cash-drawer', 'Vibe Cash Drawer (Standard)', 15900, 'Cash Drawers', '1787372121916_8239c96e.jpg', 'LLE-DRWR-16', ['featured', 'counter'], 'Full-size 16" steel drawer with a five-bill, eight-coin till and a media slot.'],
  ['compact-cash-drawer-16', 'Vibe Cash Drawer (Compact 16")', 6900, 'Cash Drawers', '1787372122036_5f98617c.jpg', 'LLE-DRWR-CMP', ['budget', 'counter'], 'Slim locking drawer for tight counters. Same kick port, half the footprint.'],
  ['lte-failover-router', 'LTE Failover Router', 34900, 'Networking', '1787372150041_f1e100fe.jpg', 'LLE-LTE-RTR', ['featured', 'networking'], 'Watches your broadband and carries the whole shop on cell data in under three seconds.'],
  ['battery-power-pack', 'Battery Power Pack', 42900, 'Accessories', '1787377848254_186e7795.jpg', 'PWR-PACK-1', ['food-truck', 'power'], 'Runs a terminal, a printer and a router through a full market day with no generator.'],
  ['countertop-weight-scale', 'Countertop Weight Scale', 22900, 'Accessories', '1787372142864_3b1f797c.jpg', 'LLE-SCALE-30', ['counter', 'retail'], 'NTEP-legal 30lb scale for anything sold by the pound.'],
  ['handheld-barcode-scanner', 'Barcode & QR Scanner', 7900, 'Accessories', '1787372147415_f2f7735b.jpg', 'LLE-SCAN-2D', ['counter', 'retail'], '2D scanner for packaged retail, gift cards and pickup order QR codes.'],
  ['truck-window-tablet-mount', 'Heavy-Duty Tablet Mount', 5900, 'Accessories', '1787372150489_6b65f9e2.jpg', 'LLE-MNT-TRUCK', ['budget', 'mobile'], 'Vibration-rated arm mount for a truck window or a cart rail.'],
  ['countertop-tablet-stand', 'Countertop Tablet Stand', 3900, 'Accessories', '1787372150489_6b65f9e2.jpg', 'LLE-STAND-CTR', ['budget', 'counter'], 'Weighted swivel stand that turns any tablet into a counter station.'],
  ['food-truck-phone-mount', 'Food Truck Phone Mount', 2900, 'Accessories', '1787377831072_15189493.jpg', 'MNT-PHONE-FT', ['budget', 'food-truck', 'mount'], 'Clamp-on gooseneck mount that holds the phone already in your pocket.'],
  ['phone-card-scan-kit', 'Phone Card Scan Kit', 1900, 'Accessories', '1787372143433_77a0112b.jpg', 'LLE-SCAN-KIT', ['budget', 'payments', 'mobile'], 'A phone grip and glare shield that makes camera card scanning fast and accurate.'],
  ['receipt-paper-50-roll-case', 'Receipt Paper — 50 Roll Case', 4900, 'Supplies', '1787372122036_5f98617c.jpg', 'LLE-PAPER-50', ['budget', 'supplies'], 'Case of fifty 80mm BPA-free thermal rolls. Ships free.'],
  ['counter-service-starter-bundle', 'Counter Service Starter Bundle', 179900, 'Starter Kits', '1787377882303_347064ed.jpg', 'KIT-COUNTER-SVC', ['featured', 'bundle', 'restaurant'], 'The opening-day counter: 15" terminal, thermal printer, locking cash drawer and reader.'],
  ['food-truck-launch-kit', 'Food Truck Launch Kit', 154900, 'Starter Kits', '1787377862465_ddfd607c.jpg', 'KIT-FT-LAUNCH', ['featured', 'bundle', 'food-truck'], 'Everything a truck opens with: handheld, reader, Bluetooth printer and mount.'],
  ['byo-tablet-counter-kit', 'Bring-Your-Own-Tablet Counter Kit', 27900, 'Starter Kits', '1787372150489_6b65f9e2.jpg', 'LLE-KIT-BYO', ['featured', 'budget', 'bundle', 'counter'], 'Bring your own iPad or Android tablet — this kit adds the stand, drawer and reader.'],
  ['phone-pos-starter-kit', 'Phone POS Starter Kit (Food Truck)', 15900, 'Starter Kits', '1787372143433_77a0112b.jpg', 'LLE-KIT-PHONE', ['featured', 'budget', 'bundle', 'mobile'], 'Everything a truck or a cart needs and nothing it does not.'],
  ['done-for-you-launch-package', 'Done-For-You Launch Package', 49900, 'Services', '1787377898421_e90d02cf.jpg', 'SVC-DFY-LAUNCH', ['service', 'launch'], 'We do the whole build with you: menu parsed and priced, stations routed, tax set up.'],
  ['processing-rate-audit', 'Processing Fee Audit', 9900, 'Services', '1787372145590_b087d828.jpg', 'LLE-SVC-AUDIT', ['services', 'payments'], "Send us last month's merchant statement. We read every line and show the real rate."],
];

export const FALLBACK_PRODUCTS: CatalogProduct[] = ROWS.map(([handle, name, price, product_type, img, sku, tags, blurb]) => ({
  id: `local-${handle}`,
  handle,
  name,
  price,
  sku,
  product_type,
  description: blurb,
  images: [IMG + img],
  tags,
  status: 'active',
  has_variants: false,
  inventory_qty: null,
  variants: [],
  metadata: {},
}));

const COLLECTION_ROWS: Array<[handle: string, title: string, handles: string[]]> = [
  ['accessories', 'Accessories & Supplies', ['food-truck-phone-mount', 'battery-power-pack', 'phone-card-scan-kit', 'countertop-tablet-stand', 'receipt-paper-50-roll-case', 'truck-window-tablet-mount', 'handheld-barcode-scanner', 'lte-failover-router', 'countertop-weight-scale']],
  ['budget-starter', 'Budget Starter', ['food-truck-phone-mount', 'phone-card-scan-kit', 'phone-card-swiper-plugin', 'countertop-tablet-stand', 'receipt-paper-50-roll-case', 'tap-only-card-reader', 'mini-receipt-printer-bluetooth', 'truck-window-tablet-mount', 'compact-cash-drawer-16', 'vibe-tab-10-budget-touchscreen', 'phone-pos-starter-kit', 'byo-tablet-counter-kit']],
  ['card-readers', 'Card Readers', ['phone-card-swiper-plugin', 'tap-only-card-reader', 'vibe-pocket-reader', 'vibe-tap-chip-reader']],
  ['cash-drawers', 'Cash Drawers', ['compact-cash-drawer-16', 'vibe-cash-drawer']],
  ['printers-kitchen', 'Printers & Kitchen', ['mini-receipt-printer-bluetooth', 'vibe-thermal-receipt-printer', 'kitchen-ticket-printer-wifi', 'vibe-kitchen-impact-printer', 'vibe-kitchen-display-22']],
  ['starter-kits', 'Starter Kits', ['done-for-you-launch-package', 'counter-service-starter-bundle', 'food-truck-launch-kit', 'phone-pos-starter-kit', 'byo-tablet-counter-kit']],
  ['terminals', 'Terminals & Tablets', ['vibe-terminal-15-countertop', 'vibe-tab-10-budget-touchscreen', 'vibe-handheld-order-pad', 'vibe-terminal-mini-10', 'vibe-self-order-kiosk']],
];

export const FALLBACK_COLLECTIONS: CatalogCollection[] = COLLECTION_ROWS.map(([handle, title]) => ({
  id: `local-col-${handle}`,
  handle,
  title,
  description: `${title} that pair with the Love Local Eats register.`,
  is_visible: true,
}));

const FALLBACK_MEMBERS: Record<string, string[]> = Object.fromEntries(
  COLLECTION_ROWS.map(([handle, , handles]) => [handle, handles]),
);

/* ------------------------------------------------------------------ */
/* Fail-soft plumbing                                                   */
/* ------------------------------------------------------------------ */

export type CatalogSource = 'live' | 'offline';

let warned = false;
let lastSource: CatalogSource = 'live';

/** Where the most recent read came from — components can surface an "offline catalog" chip. */
export const catalogSource = (): CatalogSource => lastSource;

const note = (what: string, detail?: string) => {
  lastSource = 'offline';
  if (warned) return;
  warned = true;
  // console.warn (never console.error) — a catalog hiccup must not look like a crash.
  console.warn(
    `[catalog] Live catalog unavailable (${what}${detail ? `: ${detail}` : ''}). ` +
      'Serving the bundled catalog snapshot so the storefront stays usable.',
  );
};

/** Runs a Google Cloud Data Store query builder, swallowing any error/rejection. */
async function attempt<T>(label: string, run: () => any): Promise<T[] | null> {
  try {
    const res = await run();
    if (res?.error) {
      note(label, res.error.message);
      return null;
    }
    const rows = (res?.data ?? []) as T[];
    if (!rows || rows.length === 0) return null;
    return rows;
  } catch (e: any) {
    note(label, e?.message);
    return null;
  }
}

const normalize = (p: any): CatalogProduct => ({
  id: p.id,
  handle: p.handle,
  name: p.name,
  price: p.price ?? 0,
  sku: p.sku ?? undefined,
  product_type: p.product_type ?? undefined,
  description: p.description ?? undefined,
  images: Array.isArray(p.images) ? p.images : [],
  tags: Array.isArray(p.tags) ? p.tags : [],
  status: p.status ?? 'active',
  has_variants: !!p.has_variants,
  inventory_qty: p.inventory_qty ?? null,
  variants: p.variants ?? [],
  metadata: p.metadata ?? {},
});

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export async function fetchCollections(): Promise<CatalogCollection[]> {
  const rows = await attempt<any>('collections', () =>
    googleCloud.from('ecom_collections').select('id, title, handle, description, is_visible').eq('is_visible', true).order('title'),
  );
  if (!rows) return FALLBACK_COLLECTIONS;
  lastSource = 'live';
  return rows.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description ?? undefined,
    is_visible: c.is_visible !== false,
  }));
}

export async function fetchActiveProducts(): Promise<CatalogProduct[]> {
  const rows = await attempt<any>('products', () =>
    googleCloud.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('status', 'active'),
  );
  if (!rows) return FALLBACK_PRODUCTS;
  lastSource = 'live';
  return rows.map(normalize);
}

export async function fetchProductsByHandles(handles: string[]): Promise<CatalogProduct[]> {
  if (handles.length === 0) return [];
  const rows = await attempt<any>('products-by-handle', () =>
    googleCloud.from('ecom_products').select('*, variants:ecom_product_variants(*)').in('handle', handles),
  );
  if (!rows) return FALLBACK_PRODUCTS.filter((p) => handles.includes(p.handle));
  lastSource = 'live';
  return rows.map(normalize);
}

export async function fetchProductByHandle(handle: string): Promise<CatalogProduct | null> {
  const rows = await attempt<any>('product', () =>
    googleCloud.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('handle', handle).limit(1),
  );
  if (rows && rows[0]) {
    lastSource = 'live';
    const product = normalize(rows[0]);
    // Fallback: if the embedded join came back empty for a variant product, fetch them directly.
    if (product.has_variants && (!product.variants || product.variants.length === 0)) {
      const vrows = await attempt<any>('variants', () =>
        googleCloud.from('ecom_product_variants').select('*').eq('product_id', product.id).order('position'),
      );
      product.variants = vrows || [];
    }
    return product;
  }
  return FALLBACK_PRODUCTS.find((p) => p.handle === handle) || null;
}

export async function fetchCollectionByHandle(
  handle: string,
): Promise<{ collection: CatalogCollection | null; products: CatalogProduct[] }> {
  const colRows = await attempt<any>('collection', () =>
    googleCloud.from('ecom_collections').select('*').eq('handle', handle).limit(1),
  );

  if (colRows && colRows[0]) {
    const col = colRows[0];
    const linkRows = await attempt<any>('collection-links', () =>
      googleCloud.from('ecom_product_collections').select('product_id, position').eq('collection_id', col.id).order('position'),
    );
    if (linkRows) {
      const ids = linkRows.map((l: any) => l.product_id);
      const prodRows = await attempt<any>('collection-products', () =>
        googleCloud.from('ecom_products').select('*, variants:ecom_product_variants(*)').in('id', ids).eq('status', 'active'),
      );
      if (prodRows) {
        const byId = new Map(prodRows.map((p: any) => [p.id, normalize(p)]));
        return {
          collection: { id: col.id, handle: col.handle, title: col.title, description: col.description, is_visible: col.is_visible !== false },
          products: ids.map((id: string) => byId.get(id)).filter(Boolean) as CatalogProduct[],
        };
      }
    }
    return {
      collection: { id: col.id, handle: col.handle, title: col.title, description: col.description, is_visible: col.is_visible !== false },
      products: [],
    };
  }

  const local = FALLBACK_COLLECTIONS.find((c) => c.handle === handle) || null;
  if (!local) return { collection: null, products: [] };
  const members = FALLBACK_MEMBERS[handle] || [];
  return {
    collection: local,
    products: members.map((h) => FALLBACK_PRODUCTS.find((p) => p.handle === h)).filter(Boolean) as CatalogProduct[],
  };
}
