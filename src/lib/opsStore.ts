import { useEffect, useRef, useState } from 'react';

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

export interface OpsState {
  /** Lowercased item names currently 86'd. */
  eightySixed: string[];
  /** Lowercased item name -> override price in cents. */
  priceOverrides: Record<string, number>;
  promos: Promo[];
  audit: AuditEntry[];
  network: 'wifi' | 'lte';
  lastClose: ClosePayload | null;
}

const EMPTY: OpsState = {
  eightySixed: [],
  priceOverrides: {},
  promos: [],
  audit: [],
  network: 'wifi',
  lastClose: null,
};

const read = (): OpsState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
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
    set({ eightySixed: [...state.eightySixed, k] });
    opsApi.audit('86', `${name} pulled from register, online ordering and website`);
  },

  restore(name: string) {
    const k = key(name);
    if (!state.eightySixed.includes(k)) return;
    set({ eightySixed: state.eightySixed.filter((n) => n !== k) });
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
