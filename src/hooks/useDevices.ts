import { useCallback, useEffect, useState } from 'react';
import { DEVICE_KINDS, type DeviceKind, type DeviceKindId } from '@/data/platform';

// ------------------------------------------------------------
// Device runtime.
// Pairing state + the action log persist in localStorage so a device
// you pair on the marketing page is still paired inside the POS demo.
// ------------------------------------------------------------

export type DeviceStatus = 'unpaired' | 'pairing' | 'ready' | 'busy';

export interface LogLine {
  id: string;
  device: string;
  command: string;
  text: string;
  at: string;
  ok: boolean;
}

const PAIR_KEY = 'lle_paired_devices';
const MAX_LOG = 14;

const readPaired = (): DeviceKindId[] => {
  try {
    const raw = localStorage.getItem(PAIR_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return parsed as DeviceKindId[];
  } catch {
    /* ignore */
  }
  // Sensible default: the gear almost every shop opens with is already paired.
  return ['receipt-printer', 'cash-drawer', 'card-reader'];
};

const stamp = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const findDevice = (id: DeviceKindId): DeviceKind | undefined =>
  DEVICE_KINDS.find((d) => d.id === id);

export function useDevices() {
  const [paired, setPaired] = useState<DeviceKindId[]>(() => readPaired());
  const [busy, setBusy] = useState<DeviceKindId | null>(null);
  const [pairing, setPairing] = useState<DeviceKindId | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(PAIR_KEY, JSON.stringify(paired));
    } catch {
      /* ignore */
    }
  }, [paired]);

  const push = useCallback((device: string, command: string, text: string, ok = true) => {
    setLog((l) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, device, command, text, at: stamp(), ok },
      ...l,
    ].slice(0, MAX_LOG));
  }, []);

  const isPaired = useCallback((id: DeviceKindId) => paired.includes(id), [paired]);

  const statusOf = useCallback(
    (id: DeviceKindId): DeviceStatus => {
      if (pairing === id) return 'pairing';
      if (busy === id) return 'busy';
      return paired.includes(id) ? 'ready' : 'unpaired';
    },
    [paired, pairing, busy],
  );

  const pair = useCallback(
    (id: DeviceKindId) => {
      const device = findDevice(id);
      if (!device) return;
      if (paired.includes(id)) {
        setPaired((p) => p.filter((d) => d !== id));
        push(device.name, 'unpair()', 'Removed from this station. Nothing else changed.', false);
        return;
      }
      setPairing(id);
      push(device.name, 'discover()', `Scanning ${device.connection}…`);
      window.setTimeout(() => {
        setPairing((cur) => (cur === id ? null : cur));
        setPaired((p) => (p.includes(id) ? p : [...p, id]));
        push(device.name, 'pair(auto)', 'Paired and assigned to Station 1 · driver loaded on the terminal');
      }, 900);
    },
    [paired, push],
  );

  const run = useCallback(
    (id: DeviceKindId, actionId: string) => {
      const device = findDevice(id);
      if (!device) return;
      const action = device.actions.find((a) => a.id === actionId);
      if (!action) return;
      if (!paired.includes(id)) {
        push(device.name, action.command, 'Not paired yet — tap Pair first, then run it again.', false);
        return;
      }
      setBusy(id);
      push(device.name, action.command, 'Sent to device…');
      window.setTimeout(() => {
        setBusy((cur) => (cur === id ? null : cur));
        push(device.name, action.command, action.result);
      }, 650);
    },
    [paired, push],
  );

  const testAll = useCallback(() => {
    const list = DEVICE_KINDS.filter((d) => paired.includes(d.id));
    if (list.length === 0) {
      push('Station 1', 'selftest()', 'Nothing paired yet — pair a device to run the self test.', false);
      return;
    }
    push('Station 1', 'selftest()', `Running self test on ${list.length} device${list.length > 1 ? 's' : ''}…`);
    list.forEach((d, i) => {
      window.setTimeout(() => {
        push(d.name, d.actions[0].command, d.actions[0].result);
      }, 400 * (i + 1));
    });
  }, [paired, push]);

  const clearLog = useCallback(() => setLog([]), []);

  return { paired, isPaired, statusOf, pair, run, testAll, log, push, clearLog };
}
