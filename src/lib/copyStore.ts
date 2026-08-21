import { supabase } from '@/lib/supabase';

// ------------------------------------------------------------
// brand.writeCopy — front-end side of the copy skill.
// Sends parsed menu items + the saved vibe words to the writer,
// then saves whatever the owner accepts back to menu_items and
// the shop_vibe_briefs tagline.
// ------------------------------------------------------------

export interface CopyRequestItem {
  id?: string | null;
  name: string;
  category?: string | null;
  price?: number;
  description?: string;
}

export interface CopyLine {
  id: string | null;
  name: string;
  category: string | null;
  /** what was there before we wrote */
  previous: string;
  /** what the writer produced (editable in the review list) */
  description: string;
}

export interface CopyResult {
  success: boolean;
  tagline: string;
  items: CopyLine[];
  written: number;
  error?: string | null;
}

/** Ask the writer for a tagline + one line per item, in the owner's voice. */
export const writeMenuCopy = async (args: {
  shopName: string;
  concept?: string;
  vibeText?: string;
  templateName?: string;
  items: CopyRequestItem[];
}): Promise<CopyResult> => {
  const { data, error } = await supabase.functions.invoke('write-copy', { body: args });
  if (error) return { success: false, tagline: '', items: [], written: 0, error: error.message };
  return (data || { success: false, tagline: '', items: [], written: 0, error: 'No response from the writer' }) as CopyResult;
};

/**
 * Save accepted copy. Item rows are matched by id when we have one
 * (menu already saved) and by name when we don't.
 */
export const saveMenuCopy = async (args: {
  shopId: string;
  tagline?: string | null;
  lines: { id?: string | null; name: string; description: string }[];
}): Promise<{ saved: number; taglineSaved: boolean }> => {
  const { shopId, tagline, lines } = args;
  let saved = 0;

  const accepted = lines.filter((l) => l.description && l.description.trim());

  for (const line of accepted) {
    const patch = { description: line.description.trim() };
    const query = supabase.from('menu_items').update(patch).eq('shop_id', shopId);
    const { error } = line.id ? await query.eq('id', line.id) : await query.eq('name', line.name);
    if (!error) saved += 1;
  }

  let taglineSaved = false;
  if (tagline && tagline.trim()) {
    const { error } = await supabase
      .from('shop_vibe_briefs')
      .upsert({ shop_id: shopId, tagline: tagline.trim(), updated_at: new Date().toISOString() }, { onConflict: 'shop_id' });
    taglineSaved = !error;
  }

  return { saved, taglineSaved };
};
