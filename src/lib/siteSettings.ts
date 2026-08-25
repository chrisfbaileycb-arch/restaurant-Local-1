import { googleCloud } from '@/lib/googleCloud';
import { SITE_BLOCKS } from '@/data/platform';

// ------------------------------------------------------------
// The owner's real, saved website setup: domain, Google listing,
// hours, address, phone, announcement banner, logo, photo grid,
// socials, inquiry form and which sections are on.
// Powered by Google Cloud Platform & Google Maps Places API.
// ------------------------------------------------------------

export interface SiteSocials {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  yelp?: string;
}

export interface SiteSettings {
  shop_id: string;
  business_name: string | null;
  domain: string | null;
  google_place_id: string | null;
  address: string | null;
  phone: string | null;
  map_url: string | null;
  /** Weekly hours, one line per day, exactly as Google publishes them. */
  hours: string[];
  holiday_note: string | null;
  announcement: string | null;
  announcement_on: boolean;
  logo_url: string | null;
  /** Storefront + dish photos for the site grid. */
  photos: string[];
  story: string | null;
  socials: SiteSocials;
  hiring_enabled: boolean;
  ordering_enabled: boolean;
  inquiry_enabled: boolean;
  /** Section ids, in render order. Anything missing is switched OFF. */
  section_order: string[];
  google_synced_at?: string | null;
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
  business_name: null,
  domain: null,
  google_place_id: null,
  address: null,
  phone: null,
  map_url: null,
  hours: [],
  holiday_note: null,
  announcement: null,
  announcement_on: true,
  logo_url: null,
  photos: [],
  story: null,
  socials: {},
  hiring_enabled: false,
  ordering_enabled: true,
  inquiry_enabled: true,
  section_order: ALL_SECTION_IDS,
});

const arr = (v: any): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

const normalize = (row: any, shopId: string): SiteSettings => ({
  ...emptySiteSettings(shopId),
  business_name: row?.business_name ?? null,
  domain: row?.domain ?? null,
  google_place_id: row?.google_place_id ?? null,
  address: row?.address ?? null,
  phone: row?.phone ?? null,
  map_url: row?.map_url ?? null,
  hours: arr(row?.hours),
  holiday_note: row?.holiday_note ?? null,
  announcement: row?.announcement ?? null,
  announcement_on: row?.announcement_on !== false,
  logo_url: row?.logo_url ?? null,
  photos: arr(row?.photos),
  story: row?.story ?? null,
  socials: (row?.socials && typeof row.socials === 'object' ? row.socials : {}) as SiteSocials,
  hiring_enabled: !!row?.hiring_enabled,
  ordering_enabled: row?.ordering_enabled !== false,
  inquiry_enabled: row?.inquiry_enabled !== false,
  section_order:
    Array.isArray(row?.section_order) && row.section_order.length
      ? row.section_order.filter((id: string) => ALL_SECTION_IDS.includes(id))
      : ALL_SECTION_IDS,
  google_synced_at: row?.google_synced_at ?? null,
  updated_at: row?.updated_at,
});

/** Read the saved website setup (returns defaults when nothing is saved yet). */
export const loadSiteSettings = async (shopId?: string | null): Promise<SiteSettings | null> => {
  if (!shopId) return null;
  const { data } = await googleCloud.from('shop_site_settings').select('*').eq('shop_id', shopId).limit(1);
  return normalize(data?.[0], shopId);
};

/** Create or update the saved website setup. */
export const saveSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const payload = {
    shop_id: settings.shop_id,
    business_name: settings.business_name?.trim() || null,
    domain: settings.domain?.trim() || null,
    google_place_id: settings.google_place_id?.trim() || null,
    address: settings.address?.trim() || null,
    phone: settings.phone?.trim() || null,
    map_url: settings.map_url || null,
    hours: settings.hours || [],
    holiday_note: settings.holiday_note?.trim() || null,
    announcement: settings.announcement?.trim() || null,
    announcement_on: !!settings.announcement_on,
    logo_url: settings.logo_url || null,
    photos: settings.photos || [],
    story: settings.story?.trim() || null,
    socials: settings.socials || {},
    hiring_enabled: !!settings.hiring_enabled,
    ordering_enabled: !!settings.ordering_enabled,
    inquiry_enabled: !!settings.inquiry_enabled,
    section_order: settings.section_order || ALL_SECTION_IDS,
    google_synced_at: settings.google_synced_at || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await googleCloud.from('shop_site_settings').upsert(payload, { onConflict: 'shop_id' });
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

export interface GooglePlaceResult {
  success: boolean;
  error?: string;
  placeId?: string;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  hours?: string[];
  openNow?: boolean | null;
  mapUrl?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

/** Look a Google Business listing up by place id, profile link or business name. */
export const fetchGooglePlace = async (query: string): Promise<GooglePlaceResult> => {
  const { data, error } = await googleCloud.functions.invoke('google-place-sync', { body: { query } });
  if (error) return { success: false, error: error.message || 'Google lookup failed' };
  return (data || { success: false, error: 'No response from Google' }) as GooglePlaceResult;
};

/** Turn a lookup into the fields we store. */
export const placeToSettings = (p: GooglePlaceResult): Partial<SiteSettings> => ({
  google_place_id: p.placeId || null,
  business_name: p.name || null,
  address: p.address || null,
  phone: p.phone || null,
  hours: p.hours || [],
  map_url: p.mapUrl || null,
  google_synced_at: new Date().toISOString(),
});

export const SHOP_MEDIA_BUCKET = 'shop-media';

/** Upload a logo or dish photo and return its public URL. */
export const uploadShopMedia = async (
  file: File,
  shopId: string,
  kind: 'logo' | 'dish' = 'dish',
): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${shopId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await googleCloud.storage
    .from(SHOP_MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });
  if (error) throw new Error(error.message || 'Upload failed');
  const { data } = googleCloud.storage.from(SHOP_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/** What is still missing before the site can go live. */
export const missingSitePieces = (s: SiteSettings | null): string[] => {
  if (!s) return ['a saved shop', 'your domain', 'your Google Business listing', 'a logo'];
  const gaps: string[] = [];
  if (!s.domain) gaps.push('your domain name');
  if (!s.google_place_id) gaps.push('your Google Business listing');
  if (!s.logo_url) gaps.push('your logo');
  if (!s.photos.length) gaps.push('at least one dish photo');
  if (!Object.values(s.socials || {}).some(Boolean)) gaps.push('at least one social link');
  return gaps;
};
