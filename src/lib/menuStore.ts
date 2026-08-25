import { googleCloud } from '@/lib/googleCloud';
import { DEMO_MENU, MENU_CATEGORIES } from '@/data/menu';
import { DEFAULT_TAX_RATE } from '@/data/platform';
import { DEFAULT_TAX_CLASS, TAX_CLASSES } from '@/data/taxClasses';
import type { TaxClassId } from '@/data/taxClasses';
import { loadTaxProfile, EMPTY_TAX_PROFILE } from '@/lib/taxEngine';
import type { TaxProfile } from '@/lib/taxEngine';
import type { MenuItem } from '@/data/menu';

export const ACTIVE_SHOP_KEY = 'vibe_active_shop_id';


export interface ParsedItem {
  name: string;
  description?: string;
  price: number; // cents
  sizes?: { name: string; price: number }[];
  modifiers?: string[];
}

export interface ParsedCategory {
  name: string;
  items: ParsedItem[];
}

export interface ParsedMenu {
  shop_name?: string | null;
  business_type?: string | null;
  categories: ParsedCategory[];
  itemCount: number;
}

export interface LoadedMenu {
  shopId: string | null;
  shopName: string;
  isDemo: boolean;
  categories: string[];
  items: MenuItem[];
  /** Blended fallback rate from shops.tax_rate — used only when no jurisdictions exist. */
  taxRate: number;
  /** Every state / county / city / special district this shop collects for. */
  taxProfile: TaxProfile;
}

export const DEMO_LOADED_MENU: LoadedMenu = {
  shopId: null,
  shopName: 'Demo Shop',
  isDemo: true,
  categories: MENU_CATEGORIES,
  items: DEMO_MENU,
  taxRate: DEFAULT_TAX_RATE,
  taxProfile: EMPTY_TAX_PROFILE,
};

/** Words that almost always mean "this is alcohol" on an uploaded menu. */
const ALCOHOL_HINTS = /\b(beer|wine|ale|ipa|lager|stout|cider|seltzer|cocktail|margarita|mimosa|whiskey|bourbon|vodka|tequila|rum|gin|sangria|prosecco|champagne|liquor|spirits|draft|draught|pilsner|rosé|rose wine|shot)\b/i;

/** Best-guess tax class for an item that has never been classified. */
export const guessTaxClass = (name: string, category?: string): TaxClassId => {
  const hay = `${category || ''} ${name || ''}`;
  if (ALCOHOL_HINTS.test(hay)) return 'alcohol';
  if (/\b(gift card|gratuity|donation|deposit)\b/i.test(hay)) return 'exempt';
  if (/\b(merch|shirt|tee|hoodie|mug|hat|sticker|tote|bag of beans|whole bean|retail)\b/i.test(hay)) return 'merch';
  if (/\b(grocery|packaged|by the pound|bulk|loaf|dozen eggs|pantry)\b/i.test(hay)) return 'grocery';
  return DEFAULT_TAX_CLASS;
};

const normalizeClass = (value: any, name: string, category?: string): TaxClassId =>
  (TAX_CLASSES.find((t) => t.id === value)?.id as TaxClassId) || guessTaxClass(name, category);



/** Convert a File into the payload the parse-menu edge function expects. */
export const fileToParsePayload = (
  file: File
): Promise<{ imageDataUrl?: string; text?: string; fileName: string }> =>
  new Promise((resolve, reject) => {
    const isText = /\.(csv|txt|tsv)$/i.test(file.name) || file.type.startsWith('text/');
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const result = reader.result as string;
      if (isText) resolve({ text: result, fileName: file.name });
      else resolve({ imageDataUrl: result, fileName: file.name });
    };
    if (isText) reader.readAsText(file);
    else reader.readAsDataURL(file);
  });

/** Send an upload to the AI parser and return structured menu JSON. */
export const parseMenuFile = async (file: File): Promise<ParsedMenu & { error?: string | null }> => {
  const payload = await fileToParsePayload(file);
  const { data, error } = await googleCloud.functions.invoke('parse-menu', { body: payload });
  if (error) throw new Error(error.message || 'Menu parsing failed');
  if (!data?.success) throw new Error(data?.error || 'No menu items were detected in that file.');
  return data as ParsedMenu;
};

/** Parse plain text (used for the "sample menu" shortcut and pasted menus). */
export const parseMenuText = async (text: string, fileName = 'menu.txt') => {
  const { data, error } = await googleCloud.functions.invoke('parse-menu', { body: { text, fileName } });
  if (error) throw new Error(error.message || 'Menu parsing failed');
  if (!data?.success) throw new Error(data?.error || 'No menu items were detected.');
  return data as ParsedMenu;
};

/**
 * menu.ingestUrl — read a menu PDF link or a live website menu page.
 * Returns the same ParsedMenu shape as an upload.
 */
export const ingestMenuUrl = async (url: string, kind: 'pdf-url' | 'website' = 'website') => {
  const { data, error } = await googleCloud.functions.invoke('ingest-url', { body: { url, kind } });
  if (error) throw new Error(error.message || 'Could not read that link');
  if (!data?.success) throw new Error(data?.error || 'No menu items were found at that link.');
  return data as ParsedMenu;
};

/** Merge a pasted global modifier list onto every item that has none of its own. */
export const applyGlobalModifiers = (menu: ParsedMenu, modifiers: string[]): ParsedMenu => {
  const clean = modifiers.map((m) => m.trim()).filter(Boolean).slice(0, 40);
  if (clean.length === 0) return menu;
  return {
    ...menu,
    categories: menu.categories.map((c) => ({
      ...c,
      items: c.items.map((i) => ({
        ...i,
        modifiers: Array.from(new Set([...(i.modifiers || []), ...clean])),
      })),
    })),
  };
};

/** Combine two parsed menus (e.g. a PDF plus items the owner typed in). */
export const mergeParsedMenus = (base: ParsedMenu | null, add: ParsedMenu): ParsedMenu => {
  if (!base) return add;
  const categories = [...base.categories.map((c) => ({ ...c, items: [...c.items] }))];
  add.categories.forEach((c) => {
    const hit = categories.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
    if (hit) {
      c.items.forEach((i) => {
        if (!hit.items.some((e) => e.name.toLowerCase() === i.name.toLowerCase())) hit.items.push(i);
      });
    } else {
      categories.push({ ...c, items: [...c.items] });
    }
  });
  return {
    shop_name: base.shop_name || add.shop_name || null,
    business_type: base.business_type || add.business_type || null,
    categories,
    itemCount: categories.reduce((s, c) => s + c.items.length, 0),
  };
};


interface SaveArgs {
  ownerId?: string | null;
  ownerEmail?: string | null;
  shopName: string;
  businessType: string;
  rewardProgram?: string;
  fileName?: string;
  menu: ParsedMenu;
}

/** Create (or refresh) a shop and replace its saved menu with the parsed result. */
export const saveParsedMenu = async ({
  ownerId,
  ownerEmail,
  shopName,
  businessType,
  rewardProgram = 'punch',
  fileName,
  menu,
}: SaveArgs): Promise<string> => {
  let shopId: string | null = null;

  if (ownerId) {
    const { data } = await googleCloud.from('shops').select('id').eq('owner_id', ownerId).limit(1);
    shopId = data?.[0]?.id ?? null;
  }
  if (!shopId) {
    const stored = localStorage.getItem(ACTIVE_SHOP_KEY);
    if (stored) {
      const { data } = await googleCloud.from('shops').select('id').eq('id', stored).limit(1);
      shopId = data?.[0]?.id ?? null;
    }
  }

  const shopPayload = {
    owner_id: ownerId || null,
    owner_email: ownerEmail || null,
    name: shopName || 'My Shop',
    business_type: businessType || 'restaurant',
    reward_program: rewardProgram,
    source_file_name: fileName || null,
    is_published: true,
    updated_at: new Date().toISOString(),
  };

  if (shopId) {
    await googleCloud.from('shops').update(shopPayload).eq('id', shopId);
    await googleCloud.from('menu_items').delete().eq('shop_id', shopId);
    await googleCloud.from('menu_categories').delete().eq('shop_id', shopId);
  } else {
    const { data, error } = await googleCloud.from('shops').insert(shopPayload).select('id').single();
    if (error || !data) throw new Error(error?.message || 'Could not create your shop');
    shopId = data.id;
  }

  const catRows = menu.categories.map((c, i) => ({ shop_id: shopId, name: c.name, position: i }));
  const { data: savedCats } = await googleCloud.from('menu_categories').insert(catRows).select('id, name, position');

  const itemRows: any[] = [];
  menu.categories.forEach((c, ci) => {
    const match = savedCats?.find((s: any) => s.name === c.name && s.position === ci);
    c.items.forEach((it, ii) => {
      itemRows.push({
        shop_id: shopId,
        category_id: match?.id || null,
        name: it.name,
        description: it.description || null,
        price: it.price || 0,
        sizes: it.sizes || [],
        modifiers: it.modifiers || [],
        position: ii,
      });
    });
  });
  if (itemRows.length) await googleCloud.from('menu_items').insert(itemRows);

  localStorage.setItem(ACTIVE_SHOP_KEY, shopId as string);
  return shopId as string;
};

/** Read the shop's saved tax rate, falling back to the platform default. */
const readTaxRate = (shop: any): number => {
  const raw = Number(shop?.tax_rate);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_TAX_RATE;
};

/** Load the signed-in owner's menu (or the last shop built on this device). */
export const loadShopMenu = async (ownerId?: string | null): Promise<LoadedMenu> => {
  let shop: any = null;

  if (ownerId) {
    const { data } = await googleCloud
      .from('shops')
      .select('*')
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })
      .limit(1);
    shop = data?.[0] || null;
  }
  if (!shop) {
    const stored = localStorage.getItem(ACTIVE_SHOP_KEY);
    if (stored) {
      const { data } = await googleCloud.from('shops').select('*').eq('id', stored).limit(1);
      shop = data?.[0] || null;
    }
  }
  if (!shop) return DEMO_LOADED_MENU;

  const taxRate = readTaxRate(shop);
  // Jurisdictions (state / county / city / special) come from the shop's own setup.
  const taxProfile = await loadTaxProfile(shop.id, taxRate);

  const { data: cats } = await googleCloud
    .from('menu_categories')
    .select('id, name, position')
    .eq('shop_id', shop.id)
    .order('position');
  const { data: rows } = await googleCloud
    .from('menu_items')
    .select('id, name, price, category_id, modifiers, description, tax_class')
    .eq('shop_id', shop.id)
    .order('position');

  // No saved items yet, but the shop's own tax setup still applies.
  if (!rows || rows.length === 0) {
    return { ...DEMO_LOADED_MENU, shopId: shop.id, taxRate, taxProfile };
  }

  const catName = (id: string | null) => cats?.find((c: any) => c.id === id)?.name || 'Menu';
  const items: MenuItem[] = rows.map((r: any) => {
    const category = catName(r.category_id);
    return {
      id: r.id,
      name: r.name,
      price: r.price,
      category,
      mods: Array.isArray(r.modifiers) ? r.modifiers : [],
      taxClass: normalizeClass(r.tax_class, r.name, category),
    };
  });

  const ordered = (cats || []).map((c: any) => c.name).filter((n: string) => items.some((i) => i.category === n));
  const extras = Array.from(new Set(items.map((i) => i.category))).filter((n) => !ordered.includes(n));

  return {
    shopId: shop.id,
    shopName: shop.name,
    isDemo: false,
    categories: [...ordered, ...extras],
    items,
    taxRate,
    taxProfile,
  };
};


/** Read just the tax setting for a shop (used by the settings panel). */
export const loadShopTaxRate = async (shopId: string): Promise<number> => {
  const { data } = await googleCloud.from('shops').select('tax_rate').eq('id', shopId).limit(1);
  return readTaxRate(data?.[0]);
};

/** Save the shop's sales tax rate (stored as a decimal, e.g. 0.0825). */
export const saveShopTaxRate = async (shopId: string, rate: number): Promise<void> => {
  const safe = Number.isFinite(rate) && rate >= 0 ? Math.min(rate, 1) : DEFAULT_TAX_RATE;
  const { error } = await googleCloud
    .from('shops')
    .update({ tax_rate: safe, updated_at: new Date().toISOString() })
    .eq('id', shopId);
  if (error) throw new Error(error.message || 'Could not save your tax rate');
};
