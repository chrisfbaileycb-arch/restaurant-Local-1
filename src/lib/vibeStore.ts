import { supabase } from '@/lib/supabase';
import { templateById, type SiteTemplate } from '@/data/vibe';

// ------------------------------------------------------------
// The owner's saved vibe brief: the words they used, the template
// that matched, and the logo we generated for them.
// One source of truth for the onboarding vibe step, the dashboard
// website tab and the copilot's brand skills.
// ------------------------------------------------------------

export interface VibeBrief {
  shop_id: string;
  vibe_text: string | null;
  template_id: string | null;
  logo_url: string | null;
  logo_prompt: string | null;
  tagline: string | null;
  concept: string | null;
  symbol: string | null;
  style: string | null;
  updated_at?: string;
}

export const emptyBrief = (shopId: string): VibeBrief => ({
  shop_id: shopId,
  vibe_text: null,
  template_id: null,
  logo_url: null,
  logo_prompt: null,
  tagline: null,
  concept: null,
  symbol: null,
  style: null,
});

export const loadVibeBrief = async (shopId?: string | null): Promise<VibeBrief | null> => {
  if (!shopId) return null;
  const { data } = await supabase.from('shop_vibe_briefs').select('*').eq('shop_id', shopId).limit(1);
  return { ...emptyBrief(shopId), ...(data?.[0] || {}) } as VibeBrief;
};

export const saveVibeBrief = async (brief: VibeBrief): Promise<VibeBrief> => {
  const payload = { ...brief, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('shop_vibe_briefs').upsert(payload, { onConflict: 'shop_id' });
  if (error) throw new Error(error.message || 'Could not save your vibe brief');
  return payload;
};

export interface LogoRequest {
  name: string;
  concept: string;
  vibe?: string;
  style?: string;
  palette?: string;
  symbol?: string;
}

export interface LogoResult {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}

/** Ask the AI gateway for a logo mark built from the vibe brief. */
export const generateLogo = async (req: LogoRequest): Promise<LogoResult> => {
  const { data, error } = await supabase.functions.invoke('generate-logo', { body: req });
  if (error) return { success: false, error: error.message || 'Logo generation failed' };
  return (data || { success: false, error: 'No response from the logo service' }) as LogoResult;
};

/** The template object for a saved brief (always returns something). */
export const briefTemplate = (brief: VibeBrief | null): SiteTemplate => templateById(brief?.template_id);
