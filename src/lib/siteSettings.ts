import { supabase } from '@/lib/supabase';
import { SITE_BLOCKS } from '@/data/platform';

// ------------------------------------------------------------
// The owner's real, saved website setup: domain, Google listing,
// logo, socials, hiring form and which sections are on.
// One source of truth for the Dashboard → Website tab AND for the
// copilot's "build my website page" answer.
// ------------------------------------------------------------

export interface SiteSocials {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  yelp?: string;
}

export interface SiteSettings {
  shop_id: string;
  domain: string | null;
  google_place_id: string | null;
  logo_url: string | null;
  socials: SiteSocials;
  hiring_enabled: boolean;
  /** Section ids, in render order. Anything missing is switched OFF. */
  section_order: string[];
  updated_at?: string;
}

/** Every section the one-page site can render, straight from the platform data. */
export const SITE_SECTIONS = SITE_BLOCKS.map((b) => ({
  id: b.id,
  title: b.title,
  source: b.source,
  summary: b.body.split('.')[0] + '.',
}));

export const ALL_SECTION_IDS = SITE_SECTIONS.map((s) => s.id);

export const SOCIAL_FIELDS: { key: keyof SiteSocials; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/yourshop' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourshop' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@yourshop' },
  { key: 'yelp', label: 'Yelp', placeholder: 'yelp.com/biz/yourshop' },
];

export const emptySiteSettings = (shopId: string): SiteSettings => ({
  shop_id: shopId,
  domain: null,
  google_place_id: null,
  logo_url: null,
  socials: {},
  hiring_enabled: false,
  section_order: ALL_SECTION_IDS,
});

const normalize = (row: any, shopId: string): SiteSettings => ({
  shop_id: shopId,
  domain: row?.domain ?? null,
  google_place_id: row?.google_place_id ?? null,
  logo_url: row?.logo_url ?? null,
  socials: (row?.socials && typeof row.socials === 'object' ? row.socials : {}) as SiteSocials,
  hiring_enabled: !!row?.hiring_enabled,
  section_order: Array.isArray(row?.section_order) && row.section_order.length
    ? row.section_order.filter((id: string) => ALL_SECTION_IDS.includes(id))
    : ALL_SECTION_IDS,
  updated_at: row?.updated_at,
});

/** Read the saved website setup (returns defaults when nothing is saved yet). */
export const loadSiteSettings = async (shopId?: string | null): Promise<SiteSettings | null> => {
  if (!shopId) return null;
  const { data } = await supabase
    .from('shop_site_settings')
    .select('*')
    .eq('shop_id', shopId)
    .limit(1);
  return normalize(data?.[0], shopId);
};

/** Create or update the saved website setup. */
export const saveSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const payload = {
    shop_id: settings.shop_id,
    domain: settings.domain?.trim() || null,
    google_place_id: settings.google_place_id?.trim() || null,
    logo_url: settings.logo_url || null,
    socials: settings.socials || {},
    hiring_enabled: !!settings.hiring_enabled,
    section_order: settings.section_order || ALL_SECTION_IDS,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('shop_site_settings').upsert(payload, { onConflict: 'shop_id' });
  if (error) throw new Error(error.message || 'Could not save your website settings');
  return { ...settings, ...payload } as SiteSettings;
};

/** Patch a couple of fields without clobbering the rest (used by the copilot). */
export const patchSiteSettings = async (
  shopId: string,
  patch: Partial<Omit<SiteSettings, 'shop_id'>>,
): Promise<SiteSettings> => {
  const current = (await loadSiteSettings(shopId)) || emptySiteSettings(shopId);
  return saveSiteSettings({ ...current, ...patch, shop_id: shopId });
};

export const SHOP_MEDIA_BUCKET = 'shop-media';

/** Upload a logo or dish photo and return its public URL. */
export const uploadShopMedia = async (
  file: File,
  shopId: string,
  kind: 'logo' | 'dish' = 'dish',
): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${shopId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage
    .from(SHOP_MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });
  if (error) throw new Error(error.message || 'Upload failed');
  const { data } = supabase.storage.from(SHOP_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/** What is still missing before the site can go live. */
export const missingSitePieces = (s: SiteSettings | null): string[] => {
  if (!s) return ['a saved shop', 'your domain', 'your Google Business listing', 'a logo'];
  const gaps: string[] = [];
  if (!s.domain) gaps.push('your domain name');
  if (!s.google_place_id) gaps.push('your Google Business listing');
  if (!s.logo_url) gaps.push('your logo');
  if (!Object.values(s.socials || {}).some(Boolean)) gaps.push('at least one social link');
  return gaps;
};
