import { googleCloud } from '@/lib/googleCloud';
import type { AuditEntry } from '@/lib/opsStore';

// ------------------------------------------------------------
// Copilot conversation persistence: every message the owner sends and
// every answer the copilot gives is written to copilot_messages via Google Cloud, so an
// owner can look back at what changed and when.
// ------------------------------------------------------------

export interface StoredMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  effects?: string[];
  payload?: any;
  mode?: string;
  created_at?: string;
}

interface SaveArgs {
  shopId?: string | null;
  userId?: string | null;
  mode: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  effects?: string[];
  payload?: any;
}

/** Fire-and-forget write. Never blocks or breaks the conversation. */
export const saveCopilotMessage = async ({
  shopId, userId, mode, role, text, effects, payload,
}: SaveArgs): Promise<void> => {
  try {
    await googleCloud.from('copilot_messages').insert({
      shop_id: shopId || null,
      user_id: userId || null,
      role,
      text: text || '',
      effects: effects || [],
      payload: payload ?? null,
      mode,
    });
  } catch {
    /* offline / demo — the drawer keeps working */
  }
};

/** Last N messages for this shop (or this device's anonymous session). */
export const loadCopilotHistory = async (
  shopId?: string | null,
  userId?: string | null,
  limit = 50,
): Promise<StoredMessage[]> => {
  if (!shopId && !userId) return [];
  try {
    let q = googleCloud
      .from('copilot_messages')
      .select('id, role, text, effects, payload, mode, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    q = shopId ? q.eq('shop_id', shopId) : q.eq('user_id', userId as string);
    const { data } = await q;
    return ((data || []) as any[])
      .map((r) => ({
        id: r.id,
        role: (r.role || 'agent') as StoredMessage['role'],
        text: r.text || '',
        effects: Array.isArray(r.effects) ? r.effects : [],
        payload: r.payload ?? undefined,
        mode: r.mode || 'floor',
        created_at: r.created_at,
      }))
      .reverse();
  } catch {
    return [];
  }
};

/** Full conversation log for the History view, newest first. */
export const loadCopilotLog = async (
  shopId?: string | null,
  userId?: string | null,
  limit = 250,
): Promise<StoredMessage[]> => {
  const rows = await loadCopilotHistory(shopId, userId, limit);
  return [...rows].reverse();
};

export const isoDay = (value: string | number | Date | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const csvCell = (v: any) => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;

export const downloadCsv = (name: string, rows: (string | number)[][]) => {
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Only the entries an accountant or a manager actually reviews. */
const AUDIT_ACTIONS = /^(86|restored|price change|price reset|comp|void|discount|discount ended|daily close)/i;

export const isManagerAudit = (e: AuditEntry) => AUDIT_ACTIONS.test(e.action);

/** CSV of the manager audit trail: 86s, comps, voids, price changes. */
export const exportAuditCsv = (entries: AuditEntry[], from?: string, to?: string) => {
  const filtered = entries
    .filter(isManagerAudit)
    .filter((e) => {
      const day = isoDay(e.at);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    })
    .sort((a, b) => b.at - a.at);

  const rows: (string | number)[][] = [
    ['Timestamp', 'Date', 'Action', 'Detail', 'Amount (USD)', 'Actor'],
    ...filtered.map((e) => [
      new Date(e.at).toISOString(),
      isoDay(e.at),
      e.action,
      e.detail,
      e.amount ? (e.amount / 100).toFixed(2) : '',
      e.actor,
    ]),
  ];
  downloadCsv(`manager-audit-trail-${new Date().toISOString().slice(0, 10)}`, rows);
  return filtered.length;
};

/** CSV of the copilot conversation itself. */
export const exportConversationCsv = (messages: StoredMessage[], from?: string, to?: string) => {
  const filtered = messages.filter((m) => {
    const day = isoDay(m.created_at);
    if (from && day && day < from) return false;
    if (to && day && day > to) return false;
    return true;
  });
  const rows: (string | number)[][] = [
    ['Timestamp', 'Who', 'Surface', 'Message', 'Changes applied'],
    ...filtered.map((m) => [
      m.created_at || '',
      m.role === 'user' ? 'Operator' : m.role === 'system' ? 'Sentinel' : 'Copilot',
      m.mode || '',
      m.text,
      (m.effects || []).join(' · '),
    ]),
  ];
  downloadCsv(`copilot-conversation-${new Date().toISOString().slice(0, 10)}`, rows);
  return filtered.length;
};
