import { useEffect, useRef, useState } from 'react';
import { INITIAL_INVENTORY, type InventoryItem } from '@/data/inventory';
import { INITIAL_KDS_TICKETS, type KDSTicket, type TicketStatus, type TicketPriority } from '@/data/kds';

// ------------------------------------------------------------
// Shared floor-operations state.
// Module-level store (same pattern as useDeviceHealth) so a command
// typed into the copilot changes the register, the online cart and the
// public menu preview at the same moment — no prop drilling, no
// provider wiring, and it survives a refresh via localStorage.
// ------------------------------------------------------------

const KEY = 'lle_ops_state';

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail: string;
  amount?: number;
}

export interface Promo {
  id: string;
  label: string;
  pct: number;
  scope: string;
  endsAt: number;
}

export interface ClosePayload {
  generatedAt: string;
  [k: string]: any;
}

export interface ShiftNote {
  id: string;
  timestamp: string;
  author: string;
  shiftType: 'morning' | 'night' | 'all-day';
  note: string;
  cashVariance?: number;
  weather?: string;
  tags?: string[];
  aiHandoverSummary?: string;
}

export interface OpsState {
  /** Lowercased item names currently 86'd. */
  eightySixed: string[];
  /** Lowercased item name -> override price in cents. */
  priceOverrides: Record<string, number>;
  promos: Promo[];
  audit: AuditEntry[];
  network: 'wifi' | 'lte';
  lastClose: ClosePayload | null;
  /** Real-time kitchen display tickets */
  kdsTickets: KDSTicket[];
  /** Real-time live inventory */
  inventory: InventoryItem[];
  /** Hardware auto-print switches */
  autoPrintChits: boolean;
  autoPrintReceipts: boolean;
  /** Shift notes & manager handover logbook */
  shiftNotes: ShiftNote[];
}

export const INITIAL_SHIFT_NOTES: ShiftNote[] = [
  {
    id: 'sn-101',
    timestamp: 'Today, 2:30 PM',
    author: 'Sarah M. (Floor Lead)',
    shiftType: 'morning',
    note: 'Heavy lunch rush from 12:15 to 1:45 PM. Ran low on brioche buns; switched burgers to sourdough. Cash drawer balanced exactly +$0.00.',
    cashVariance: 0,
    weather: 'Sunny · 74°F (Patio Full)',
    tags: ['Lunch Rush', 'Brioche Subbed', 'Drawer Balanced'],
    aiHandoverSummary: 'Smooth lunch shift with high patio volume. Sourdough substituted for burgers due to bun velocity. Night prep should focus on bun restock and bar syrups.',
  },
];

const EMPTY: OpsState = {
  eightySixed: [],
  priceOverrides: {},
  promos: [],
  audit: [],
  network: 'wifi',
  lastClose: null,
  kdsTickets: INITIAL_KDS_TICKETS,
  inventory: INITIAL_INVENTORY,
  autoPrintChits: true,
  autoPrintReceipts: true,
  shiftNotes: INITIAL_SHIFT_NOTES,
};

const read = (): OpsState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY,
      ...parsed,
      kdsTickets: parsed.kdsTickets && parsed.kdsTickets.length ? parsed.kdsTickets : INITIAL_KDS_TICKETS,
      inventory: parsed.inventory && parsed.inventory.length ? parsed.inventory : INITIAL_INVENTORY,
      autoPrintChits: parsed.autoPrintChits ?? true,
      autoPrintReceipts: parsed.autoPrintReceipts ?? true,
      shiftNotes: parsed.shiftNotes && parsed.shiftNotes.length ? parsed.shiftNotes : INITIAL_SHIFT_NOTES,
    };
  } catch {
    return EMPTY;
  }
};

let state: OpsState = typeof window === 'undefined' ? EMPTY : read();
const listeners = new Set<() => void>();

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode — memory only */
  }
};

const set = (patch: Partial<OpsState>) => {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
};

export const key = (name: string) => name.trim().toLowerCase();

const logEntry = (action: string, detail: string, amount?: number, actor = 'Copilot'): AuditEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  at: Date.now(),
  actor,
  action,
  detail,
  amount,
});

export const opsApi = {
  get: (): OpsState => state,

  audit(action: string, detail: string, amount?: number, actor?: string) {
    set({ audit: [logEntry(action, detail, amount, actor), ...state.audit].slice(0, 60) });
  },

  eightySix(name: string) {
    const k = key(name);
    if (state.eightySixed.includes(k)) return;
    const next86 = [...state.eightySixed, k];
    // Also mark inventory items matching this name as 86'd
    const nextInv = state.inventory.map((inv) =>
      inv.name.toLowerCase().includes(k) || (inv.menuItemName && inv.menuItemName.toLowerCase().includes(k))
        ? { ...inv, is86: true }
        : inv
    );
    set({ eightySixed: next86, inventory: nextInv });
    opsApi.audit('86', `${name} pulled from register, online ordering and website`);
  },

  restore(name: string) {
    const k = key(name);
    if (!state.eightySixed.includes(k)) return;
    const next86 = state.eightySixed.filter((n) => n !== k);
    const nextInv = state.inventory.map((inv) =>
      inv.name.toLowerCase().includes(k) || (inv.menuItemName && inv.menuItemName.toLowerCase().includes(k))
        ? { ...inv, is86: false }
        : inv
    );
    set({ eightySixed: next86, inventory: nextInv });
    opsApi.audit('Restored', `${name} back on the register and public menu`);
  },

  setPrice(name: string, cents: number) {
    set({ priceOverrides: { ...state.priceOverrides, [key(name)]: cents } });
    opsApi.audit('Price change', `${name} set to $${(cents / 100).toFixed(2)} everywhere`, cents);
  },

  clearPrice(name: string) {
    const next = { ...state.priceOverrides };
    delete next[key(name)];
    set({ priceOverrides: next });
    opsApi.audit('Price reset', `${name} back to menu price`);
  },

  addPromo(promo: Omit<Promo, 'id'>) {
    const row: Promo = { ...promo, id: `p-${Date.now()}` };
    set({ promos: [row, ...state.promos].slice(0, 6) });
    opsApi.audit('Discount', `${row.label} — ${row.pct}% off ${row.scope}`);
    return row;
  },

  endPromo(id: string) {
    const row = state.promos.find((p) => p.id === id);
    set({ promos: state.promos.filter((p) => p.id !== id) });
    if (row) opsApi.audit('Discount ended', row.label);
  },

  setNetwork(mode: 'wifi' | 'lte') {
    if (state.network === mode) return;
    set({ network: mode });
    opsApi.audit(
      'Network',
      mode === 'lte'
        ? 'Wi-Fi dropped — LTE cellular failover active, tickets still printing'
        : 'Wi-Fi restored — queued tickets synced',
    );
  },

  saveClose(payload: ClosePayload) {
    set({ lastClose: payload });
    opsApi.audit('Daily close', 'Close payload generated and staged for ledger handoff');
  },

  // ---------------- KDS Ticket Operations ----------------
  addKDSTicket(ticket: Omit<KDSTicket, 'id' | 'ticketNumber' | 'createdAt'>) {
    const nextNum = Math.max(100, ...state.kdsTickets.map((t) => t.ticketNumber)) + 1;
    const newTicket: KDSTicket = {
      ...ticket,
      id: `kds-${nextNum}-${Date.now()}`,
      ticketNumber: nextNum,
      createdAt: Date.now(),
      status: ticket.status || 'queued',
    };
    set({ kdsTickets: [newTicket, ...state.kdsTickets] });
    opsApi.audit('KDS Ticket', `Fired ticket #${newTicket.ticketNumber} (${newTicket.locationLabel})`);
    return newTicket;
  },

  updateTicketStatus(ticketId: string, status: TicketStatus) {
    const next = state.kdsTickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status,
            bumpedAt: status === 'completed' ? Date.now() : t.bumpedAt,
          }
        : t
    );
    set({ kdsTickets: next });
    const target = state.kdsTickets.find((t) => t.id === ticketId);
    if (target) {
      opsApi.audit('KDS Status', `Ticket #${target.ticketNumber} moved to ${status.toUpperCase()}`);
    }
  },

  toggleTicketItemDone(ticketId: string, itemId: string) {
    const next = state.kdsTickets.map((t) => {
      if (t.id !== ticketId) return t;
      const nextItems = t.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i));
      const allDone = nextItems.every((i) => i.done);
      return {
        ...t,
        items: nextItems,
        status: allDone && t.status === 'prep' ? ('ready' as TicketStatus) : t.status,
      };
    });
    set({ kdsTickets: next });
  },

  setTicketPriority(ticketId: string, priority: TicketPriority) {
    const next = state.kdsTickets.map((t) => (t.id === ticketId ? { ...t, priority } : t));
    set({ kdsTickets: next });
  },

  recallLastBumpedTicket() {
    const lastBumped = [...state.kdsTickets]
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.bumpedAt || 0) - (a.bumpedAt || 0))[0];

    if (lastBumped) {
      opsApi.updateTicketStatus(lastBumped.id, 'ready');
      opsApi.audit('KDS Recall', `Recalled Ticket #${lastBumped.ticketNumber} back to Expo pass`);
      return lastBumped;
    }
    return null;
  },

  // ---------------- Inventory Operations ----------------
  updateInventoryStock(itemId: string, newQty: number) {
    const next = state.inventory.map((i) => {
      if (i.id !== itemId) return i;
      const isLow = newQty <= i.lowStockThreshold;
      const isOut = newQty <= 0;
      return { ...i, stockQty: Math.max(0, newQty), is86: isOut };
    });
    set({ inventory: next });
    const item = state.inventory.find((i) => i.id === itemId);
    if (item) {
      opsApi.audit('Inventory Adjust', `${item.name} set to ${newQty} ${item.unit}`);
      if (newQty <= 0) {
        opsApi.eightySix(item.name);
      }
    }
  },

  restockInventoryItem(itemId: string, addQty: number) {
    const next = state.inventory.map((i) => {
      if (i.id !== itemId) return i;
      const updated = i.stockQty + addQty;
      return {
        ...i,
        stockQty: updated,
        lastRestocked: 'Just now',
        is86: false,
      };
    });
    set({ inventory: next });
    const item = state.inventory.find((i) => i.id === itemId);
    if (item) {
      opsApi.audit('Restock', `Received +${addQty} ${item.unit} for ${item.name}`);
      opsApi.restore(item.name);
    }
  },

  toggle86InventoryItem(itemId: string) {
    const target = state.inventory.find((i) => i.id === itemId);
    if (!target) return;
    if (target.is86) {
      opsApi.restore(target.name);
    } else {
      opsApi.eightySix(target.name);
    }
  },

  decrementInventoryForItems(orderedItems: Array<{ name: string; qty: number }>) {
    const nextInv = [...state.inventory];
    orderedItems.forEach((ord) => {
      const match = nextInv.find(
        (i) =>
          i.name.toLowerCase().includes(ord.name.toLowerCase()) ||
          (i.menuItemName && i.menuItemName.toLowerCase().includes(ord.name.toLowerCase()))
      );
      if (match) {
        match.stockQty = Math.max(0, match.stockQty - ord.qty);
        if (match.stockQty <= 0) {
          match.is86 = true;
          opsApi.eightySix(match.name);
        }
      }
    });
    set({ inventory: nextInv });
  },

  toggleAutoPrintChits() {
    const next = !state.autoPrintChits;
    set({ autoPrintChits: next });
    opsApi.audit('Hardware Settings', `Kitchen auto-print set to ${next ? 'ON' : 'OFF'}`);
    return next;
  },

  toggleAutoPrintReceipts() {
    const next = !state.autoPrintReceipts;
    set({ autoPrintReceipts: next });
    opsApi.audit('Hardware Settings', `Guest receipt auto-print set to ${next ? 'ON' : 'OFF'}`);
    return next;
  },

  addShiftNote(noteData: Omit<ShiftNote, 'id' | 'timestamp'>) {
    const newNote: ShiftNote = {
      ...noteData,
      id: `sn-${Date.now()}`,
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
    };
    const nextNotes = [newNote, ...state.shiftNotes];
    set({ shiftNotes: nextNotes });
    opsApi.audit('Shift Note', `Added by ${newNote.author} (${newNote.shiftType})`);
    return newNote;
  },

  deleteShiftNote(id: string) {
    const nextNotes = state.shiftNotes.filter((n) => n.id !== id);
    set({ shiftNotes: nextNotes });
    opsApi.audit('Shift Note', `Deleted note #${id}`);
  },

  updateShiftNoteAiSummary(id: string, summary: string) {
    const nextNotes = state.shiftNotes.map((n) => (n.id === id ? { ...n, aiHandoverSummary: summary } : n));
    set({ shiftNotes: nextNotes });
  },

  reset() {
    set({ ...EMPTY });
  },
};

/** Live discount percent applied to the whole ticket right now. */
export const activeDiscountPct = (s: OpsState = state): number => {
  const now = Date.now();
  const live = s.promos.filter((p) => p.endsAt > now);
  return live.reduce((m, p) => Math.max(m, p.pct), 0);
};

/** Subscribe a component to shared floor state. */
export function useOps() {
  const [, force] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const listener = () => mounted.current && force((n) => n + 1);
    listeners.add(listener);
    return () => {
      mounted.current = false;
      listeners.delete(listener);
    };
  }, []);

  return {
    ...state,
    ...opsApi,
    is86: (name: string) => state.eightySixed.includes(key(name)),
    priceFor: (name: string, fallback: number) => state.priceOverrides[key(name)] ?? fallback,
    discountPct: activeDiscountPct(state),
  };
}

