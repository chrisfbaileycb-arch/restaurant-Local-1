import { useCallback, useEffect, useState } from 'react';
import {
  DEVICE_KINDS,
  DEVICE_SEVERITY,
  HEALTH_CHECK,
  type DeviceKindId,
} from '@/data/platform';

// ------------------------------------------------------------
// Station health store.
//
// One module-level store shared by every screen, so the alert raised on the
// owner dashboard is the same alert that holds order entry inside the POS.
// A heartbeat re-verifies each paired device all day long.
// ------------------------------------------------------------

export type HealthState = 'online' | 'checking' | 'offline';

export interface DeviceHealth {
  state: HealthState;
  lastGood: number | null; // epoch ms of last successful answer
  latencyMs: number | null;
  misses: number;
}

export interface HealthAlert {
  id: string;
  device: DeviceKindId;
  name: string;
  severity: 'blocking' | 'warn' | 'info';
  message: string;
  at: number;
  acknowledged: boolean;
  resolved: boolean;
}

interface Store {
  health: Record<string, DeviceHealth>;
  alerts: HealthAlert[];
  sweeping: boolean;
  lastSweep: number | null;
  /** devices the owner has manually "unplugged" in the demo */
  downed: DeviceKindId[];
  monitorOn: boolean;
}

const PAIR_KEY = 'lle_paired_devices';
const DEFAULT_PAIRED: DeviceKindId[] = ['receipt-printer', 'cash-drawer', 'card-reader'];

const readPaired = (): DeviceKindId[] => {
  try {
    const raw = localStorage.getItem(PAIR_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return parsed as DeviceKindId[];
  } catch {
    /* ignore */
  }
  return DEFAULT_PAIRED;
};

const listeners = new Set<() => void>();

let store: Store = {
  health: {},
  alerts: [],
  sweeping: false,
  lastSweep: null,
  downed: [],
  monitorOn: true,
};

const emit = () => listeners.forEach((l) => l());

const set = (patch: Partial<Store>) => {
  store = { ...store, ...patch };
  emit();
};

const nameOf = (id: DeviceKindId) => DEVICE_KINDS.find((d) => d.id === id)?.name || id;

const raiseAlert = (id: DeviceKindId) => {
  const severity = DEVICE_SEVERITY[id] || 'info';
  const open = store.alerts.find((a) => a.device === id && !a.resolved);
  if (open) return;
  const alert: HealthAlert = {
    id: `${id}-${Date.now()}`,
    device: id,
    name: nameOf(id),
    severity,
    message:
      severity === 'blocking'
        ? `${nameOf(id)} stopped answering — order entry is held on every station.`
        : `${nameOf(id)} stopped answering.`,
    at: Date.now(),
    acknowledged: false,
    resolved: false,
  };
  set({ alerts: [alert, ...store.alerts].slice(0, 20) });
};

const resolveAlert = (id: DeviceKindId) => {
  if (!store.alerts.some((a) => a.device === id && !a.resolved)) return;
  set({
    alerts: store.alerts.map((a) => (a.device === id && !a.resolved ? { ...a, resolved: true } : a)),
  });
};

/** Ping one device. Devices the owner has unplugged never answer. */
const check = (id: DeviceKindId) => {
  const prev = store.health[id] || { state: 'online' as HealthState, lastGood: Date.now(), latencyMs: 12, misses: 0 };
  const down = store.downed.includes(id);

  if (down) {
    const misses = prev.misses + 1;
    const state: HealthState = misses >= 1 ? 'offline' : 'checking';
    set({ health: { ...store.health, [id]: { ...prev, state, misses, latencyMs: null } } });
    if (state === 'offline') raiseAlert(id);
    return;
  }

  set({
    health: {
      ...store.health,
      [id]: {
        state: 'online',
        lastGood: Date.now(),
        latencyMs: 8 + Math.floor(Math.random() * 40),
        misses: 0,
      },
    },
  });
  resolveAlert(id);
};

const sweep = () => {
  const paired = readPaired();
  if (paired.length === 0) {
    set({ sweeping: false, lastSweep: Date.now() });
    return;
  }
  set({ sweeping: true });
  paired.forEach((id, i) => {
    window.setTimeout(() => {
      check(id);
      if (i === paired.length - 1) set({ sweeping: false, lastSweep: Date.now() });
    }, HEALTH_CHECK.sweepStagger * i);
  });
};

// Heartbeat — one interval for the whole app, not one per component.
let timer: number | null = null;
const startHeartbeat = () => {
  if (timer !== null) return;
  sweep();
  timer = window.setInterval(() => {
    if (store.monitorOn) sweep();
  }, HEALTH_CHECK.intervalSeconds * 1000);
};

export function useDeviceHealth() {
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    startHeartbeat();
    return () => {
      listeners.delete(l);
    };
  }, []);

  const paired = readPaired();

  const statusFor = useCallback((id: DeviceKindId): DeviceHealth => {
    return store.health[id] || { state: 'online', lastGood: null, latencyMs: null, misses: 0 };
  }, []);

  const verifyNow = useCallback(() => sweep(), []);

  const verifyOne = useCallback((id: DeviceKindId) => {
    set({ health: { ...store.health, [id]: { ...statusFor(id), state: 'checking' } } });
    window.setTimeout(() => check(id), 500);
  }, [statusFor]);

  /** Demo control: yank a cable / kill the printer. */
  const unplug = useCallback((id: DeviceKindId) => {
    set({ downed: [...store.downed, id] });
    check(id);
  }, []);

  const reconnect = useCallback((id: DeviceKindId) => {
    set({ downed: store.downed.filter((d) => d !== id) });
    window.setTimeout(() => check(id), 400);
  }, []);

  const toggleDevice = useCallback(
    (id: DeviceKindId) => (store.downed.includes(id) ? reconnect(id) : unplug(id)),
    [unplug, reconnect],
  );

  const acknowledge = useCallback((alertId: string) => {
    set({ alerts: store.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)) });
  }, []);

  const setMonitorOn = useCallback((on: boolean) => {
    set({ monitorOn: on });
    if (on) sweep();
  }, []);

  const offlineDevices = paired.filter((id) => statusFor(id).state === 'offline');
  const blockingDevices = offlineDevices.filter((id) => (DEVICE_SEVERITY[id] || 'info') === 'blocking');
  const warnDevices = offlineDevices.filter((id) => (DEVICE_SEVERITY[id] || 'info') === 'warn');
  const openAlerts = store.alerts.filter((a) => !a.resolved);

  return {
    paired,
    health: store.health,
    statusFor,
    alerts: store.alerts,
    openAlerts,
    sweeping: store.sweeping,
    lastSweep: store.lastSweep,
    downed: store.downed,
    monitorOn: store.monitorOn,
    setMonitorOn,
    verifyNow,
    verifyOne,
    unplug,
    reconnect,
    toggleDevice,
    acknowledge,
    offlineDevices,
    blockingDevices,
    warnDevices,
    /** the whole point: new orders are held while a critical device is dark */
    ordersBlocked: blockingDevices.length > 0,
    nameOf,
  };
}

export { nameOf as deviceName };
