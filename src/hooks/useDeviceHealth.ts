import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEVICE_KINDS,
  DEVICE_SEVERITY,
  HEALTH_CHECK,
  BLOCK_REASONS,
  type DeviceKindId,
  type DeviceSeverity,
} from '@/data/platform';

// ------------------------------------------------------------
// Equipment health runtime.
// One shared module-level store so the alert raised on the owner
// dashboard is literally the same alert that locks the register.
// ------------------------------------------------------------

export type HealthState = 'connected' | 'checking' | 'down';

export interface DeviceHealth {
  id: DeviceKindId;
  name: string;
  severity: DeviceSeverity;
  state: HealthState;
  lastGood: number | null;
  latency: number | null;
  missed: number;
}

export interface HealthAlert {
  id: string;
  device: DeviceKindId;
  name: string;
  severity: DeviceSeverity;
  opened: number;
  resolved: number | null;
  acknowledged: boolean;
  reason: string;
}

interface Store {
  health: Record<string, DeviceHealth>;
  alerts: HealthAlert[];
  lastSweep: number | null;
  sweeping: boolean;
}

const PAIR_KEY = 'lle_paired_devices';
const DEFAULT_PAIRED: DeviceKindId[] = ['receipt-printer', 'cash-drawer', 'card-reader'];

export const readPairedDevices = (): DeviceKindId[] => {
  try {
    const raw = localStorage.getItem(PAIR_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return parsed as DeviceKindId[];
  } catch {
    /* ignore */
  }
  return DEFAULT_PAIRED;
};

const nameOf = (id: DeviceKindId) => DEVICE_KINDS.find((d) => d.id === id)?.name || id;

/** Devices the operator has manually knocked offline (drill / real unplug). */
const forcedDown = new Set<DeviceKindId>();

let store: Store = { health: {}, alerts: [], lastSweep: null, sweeping: false };
const listeners = new Set<() => void>();
let timer: number | null = null;

const emit = () => listeners.forEach((l) => l());

const setStore = (patch: Partial<Store>) => {
  store = { ...store, ...patch };
  emit();
};

const ensureRows = () => {
  const paired = readPairedDevices();
  const next: Record<string, DeviceHealth> = {};
  paired.forEach((id) => {
    next[id] =
      store.health[id] ||
      ({
        id,
        name: nameOf(id),
        severity: DEVICE_SEVERITY[id] || 'info',
        state: 'connected',
        lastGood: Date.now(),
        latency: 24,
        missed: 0,
      } as DeviceHealth);
  });
  store = { ...store, health: next };
};

const openAlert = (id: DeviceKindId) => {
  const already = store.alerts.find((a) => a.device === id && !a.resolved);
  if (already) return;
  const alert: HealthAlert = {
    id: `${id}-${Date.now()}`,
    device: id,
    name: nameOf(id),
    severity: DEVICE_SEVERITY[id] || 'info',
    opened: Date.now(),
    resolved: null,
    acknowledged: false,
    reason:
      BLOCK_REASONS[id] ||
      'Stopped answering the connection check. Service continues, but get it back before the rush.',
  };
  store = { ...store, alerts: [alert, ...store.alerts].slice(0, 20) };
};

const resolveAlert = (id: DeviceKindId) => {
  store = {
    ...store,
    alerts: store.alerts.map((a) => (a.device === id && !a.resolved ? { ...a, resolved: Date.now() } : a)),
  };
};

/** Ping one device. Answers unless it has been knocked offline. */
const ping = (id: DeviceKindId) => {
  const row = store.health[id];
  if (!row) return;
  store = { ...store, health: { ...store.health, [id]: { ...row, state: 'checking' } } };
  emit();

  window.setTimeout(() => {
    const cur = store.health[id];
    if (!cur) return;
    const answered = !forcedDown.has(id);
    if (answered) {
      const wasDown = cur.state === 'down';
      store = {
        ...store,
        health: {
          ...store.health,
          [id]: {
            ...cur,
            state: 'connected',
            lastGood: Date.now(),
            latency: 14 + Math.round(Math.random() * 40),
            missed: 0,
          },
        },
      };
      if (wasDown) resolveAlert(id);
    } else {
      const missed = cur.missed + 1;
      const down = missed >= HEALTH_CHECK.missesBeforeDown;
      store = {
        ...store,
        health: { ...store.health, [id]: { ...cur, state: down ? 'down' : 'checking', latency: null, missed } },
      };
      if (down) openAlert(id);
    }
    emit();
  }, 260 + Math.random() * 320);
};

const sweep = () => {
  ensureRows();
  const ids = Object.keys(store.health) as DeviceKindId[];
  setStore({ sweeping: true });
  ids.forEach((id, i) => window.setTimeout(() => ping(id), i * HEALTH_CHECK.staggerMs));
  window.setTimeout(
    () => setStore({ sweeping: false, lastSweep: Date.now() }),
    ids.length * HEALTH_CHECK.staggerMs + 700,
  );
};

const start = () => {
  if (timer !== null) return;
  ensureRows();
  setStore({ lastSweep: Date.now() });
  sweep();
  timer = window.setInterval(sweep, HEALTH_CHECK.intervalMs);
};

export interface DeviceHealthApi {
  devices: DeviceHealth[];
  alerts: HealthAlert[];
  openAlerts: HealthAlert[];
  lastSweep: number | null;
  sweeping: boolean;
  ordersBlocked: boolean;
  blockingDevices: DeviceHealth[];
  downCount: number;
  connectedCount: number;
  verifyAll: () => void;
  verifyOne: (id: DeviceKindId) => void;
  simulateDrop: (id: DeviceKindId) => void;
  reconnect: (id: DeviceKindId) => void;
  acknowledge: (alertId: string) => void;
  isForcedDown: (id: DeviceKindId) => boolean;
}

/** Subscribe any component to the shared heartbeat. */
export function useDeviceHealth(): DeviceHealthApi {
  const [, force] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const listener = () => mounted.current && force((n) => n + 1);
    listeners.add(listener);
    start();
    return () => {
      mounted.current = false;
      listeners.delete(listener);
    };
  }, []);

  const verifyAll = useCallback(() => sweep(), []);
  const verifyOne = useCallback((id: DeviceKindId) => {
    ensureRows();
    ping(id);
  }, []);

  const simulateDrop = useCallback((id: DeviceKindId) => {
    forcedDown.add(id);
    ensureRows();
    ping(id);
  }, []);

  const reconnect = useCallback((id: DeviceKindId) => {
    forcedDown.delete(id);
    ensureRows();
    ping(id);
  }, []);

  const acknowledge = useCallback((alertId: string) => {
    store = {
      ...store,
      alerts: store.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    };
    emit();
  }, []);

  const devices = Object.values(store.health);
  const openAlerts = store.alerts.filter((a) => !a.resolved);
  const blockingDevices = devices.filter((d) => d.severity === 'blocking' && d.state === 'down');

  return {
    devices,
    alerts: store.alerts,
    openAlerts,
    lastSweep: store.lastSweep,
    sweeping: store.sweeping,
    ordersBlocked: blockingDevices.length > 0,
    blockingDevices,
    downCount: devices.filter((d) => d.state === 'down').length,
    connectedCount: devices.filter((d) => d.state === 'connected').length,
    verifyAll,
    verifyOne,
    simulateDrop,
    reconnect,
    acknowledge,
    isForcedDown: (id: DeviceKindId) => forcedDown.has(id),
  };
}

/** "12s ago" style helper shared by the monitor and the register banner. */
export const sinceLabel = (ts: number | null): string => {
  if (!ts) return 'never';
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};
