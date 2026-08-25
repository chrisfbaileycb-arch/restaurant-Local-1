/**
 * Service Worker & IndexedDB Offline Queue Manager for Love Local Eats POS
 * 
 * Provides:
 * 1. Resilient offline transaction queueing in IndexedDB with localStorage fallback.
 * 2. W3C Background Sync registration via navigator.serviceWorker.ready.sync.register('sync-pos-orders').
 * 3. Automatic auto-sync on browser `online` network reconnection.
 * 4. Reactive hooks and event listeners for real-time queue status and syncing indicators.
 */

import { opsApi } from '@/lib/opsStore';

export interface QueuedPOSOrder {
  id: string;
  ticketNumber?: number;
  items: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
    category?: string;
    taxClass?: string;
    description?: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  tenderMethod: string;
  station: string;
  tableLabel: string;
  serverName: string;
  specialInstructions?: string;
  createdAt: number;
  status: 'queued' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

const DB_NAME = 'vibe_pos_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'queued_orders';
const FALLBACK_KEY = 'vibe_pos_offline_fallback_queue';

// IndexedDB Helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Memory & fallback cache
let cachedOrders: QueuedPOSOrder[] = [];
const queueListeners = new Set<(orders: QueuedPOSOrder[]) => void>();

function notifyListeners(orders: QueuedPOSOrder[]) {
  cachedOrders = orders;
  queueListeners.forEach((fn) => fn(orders));
}

// Read all queued orders from IndexedDB or localStorage
export async function getQueuedOrders(): Promise<QueuedPOSOrder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []).sort((a: QueuedPOSOrder, b: QueuedPOSOrder) => b.createdAt - a.createdAt);
        notifyListeners(list);
        resolve(list);
      };
      req.onerror = () => {
        const fallback = getFallbackOrders();
        notifyListeners(fallback);
        resolve(fallback);
      };
    });
  } catch {
    const fallback = getFallbackOrders();
    notifyListeners(fallback);
    return fallback;
  }
}

function getFallbackOrders(): QueuedPOSOrder[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackOrders(orders: QueuedPOSOrder[]) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Could not save fallback orders to localStorage:', err);
  }
}

/**
 * Enqueue a new POS order into IndexedDB & register Service Worker background sync
 */
export async function enqueueOfflineOrder(order: Omit<QueuedPOSOrder, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<QueuedPOSOrder> {
  const queuedOrder: QueuedPOSOrder = {
    ...order,
    id: `pos-off-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: 'queued',
    retryCount: 0,
  };

  // 1. Store in IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(queuedOrder);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for offline order:', err);
    const list = getFallbackOrders();
    list.unshift(queuedOrder);
    saveFallbackOrders(list);
  }

  // Refresh active list
  const current = await getQueuedOrders();
  notifyListeners(current);

  opsApi.audit(
    'Offline Order Queued',
    `Order #${queuedOrder.id.slice(-6).toUpperCase()} ($${(queuedOrder.total / 100).toFixed(2)}) stored in local Service Worker queue`,
    queuedOrder.total,
    order.serverName || 'Register'
  );

  // 2. Register Background Sync with Service Worker if supported
  requestServiceWorkerSync();

  return queuedOrder;
}

/**
 * Request Background Sync tag or message to Service Worker
 */
export async function requestServiceWorkerSync() {
  if (typeof window === 'undefined') return;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      // W3C Background Sync API
      if ('sync' in reg && typeof (reg as any).sync?.register === 'function') {
        await (reg as any).sync.register('sync-pos-orders');
      } else if (reg.active) {
        reg.active.postMessage({ type: 'TRIGGER_SYNC' });
      }
    }
  } catch (err) {
    console.warn('Background sync registration notice:', err);
  }
}

/**
 * Flush and sync all queued orders to Google Cloud backend
 */
export async function syncQueuedOrders(): Promise<{ syncedCount: number; errors: number }> {
  const list = await getQueuedOrders();
  const pending = list.filter((o) => o.status === 'queued' || o.status === 'failed');

  if (pending.length === 0) {
    return { syncedCount: 0, errors: 0 };
  }

  // Mark status as 'syncing'
  const inFlight = pending.map((o) => ({ ...o, status: 'syncing' as const }));
  notifyListeners(inFlight);

  try {
    const res = await fetch('/api/pos/orders/batch-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: pending }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const syncedIds: string[] = data.syncedIds || pending.map((o) => o.id);

    // Remove synced orders from IndexedDB
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      syncedIds.forEach((id) => store.delete(id));
      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
      });
    } catch {
      const remaining = getFallbackOrders().filter((o) => !syncedIds.includes(o.id));
      saveFallbackOrders(remaining);
    }

    const updated = await getQueuedOrders();
    notifyListeners(updated);

    opsApi.audit(
      'Cloud Auto-Sync Complete',
      `✓ Successfully synced ${syncedIds.length} offline order(s) to Google Cloud backend`
    );

    return { syncedCount: syncedIds.length, errors: 0 };
  } catch (err: any) {
    console.warn('Order sync failed (will retry automatically):', err);
    // Mark as failed and bump retry count
    const failedList = pending.map((o) => ({
      ...o,
      status: 'failed' as const,
      retryCount: o.retryCount + 1,
      error: err?.message || 'Network error',
    }));

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      failedList.forEach((o) => store.put(o));
    } catch {
      saveFallbackOrders(failedList);
    }

    notifyListeners(failedList);
    return { syncedCount: 0, errors: pending.length };
  }
}

/**
 * Remove a single order from the queue (e.g. manually discarded)
 */
export async function removeQueuedOrder(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch {
    const list = getFallbackOrders().filter((o) => o.id !== id);
    saveFallbackOrders(list);
  }

  const updated = await getQueuedOrders();
  notifyListeners(updated);
}

/**
 * Initialize Service Worker & Background Sync listeners
 */
export function initOfflineSyncService(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.info('[POS SW] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[POS SW] Service Worker registration failed:', err);
      });

    // Listen for messages from SW
    const onSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'POS_SYNC_SUCCESS') {
        getQueuedOrders();
      }
    };
    navigator.serviceWorker.addEventListener('message', onSWMessage);
  }

  // Auto-sync whenever internet connectivity is restored
  const onOnline = () => {
    console.info('[POS Sync] Internet connection detected. Running auto-sync...');
    syncQueuedOrders();
  };

  window.addEventListener('online', onOnline);

  // Initial read of queued orders
  getQueuedOrders();

  // Return cleanup
  return () => {
    window.removeEventListener('online', onOnline);
  };
}

/**
 * Subscribe to offline queue changes in React
 */
export function subscribeOfflineQueue(listener: (orders: QueuedPOSOrder[]) => void): () => void {
  queueListeners.add(listener);
  // Send current cached value immediately
  getQueuedOrders().then((list) => listener(list));
  return () => {
    queueListeners.delete(listener);
  };
}
