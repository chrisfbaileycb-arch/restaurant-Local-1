// Love Local Eats POS Service Worker — Offline & Background Sync Engine
const CACHE_NAME = 'vibe-pos-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/placeholder.svg',
];

const DB_NAME = 'vibe_pos_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'queued_orders';

// Open IndexedDB in Service Worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Read all pending orders from IndexedDB
async function getPendingOrders() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const orders = (req.result || []).filter((o) => o.status === 'queued' || o.status === 'failed');
        resolve(orders);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[SW] Could not read IndexedDB orders:', err);
    return [];
  }
}

// Remove or mark synced in IndexedDB
async function markOrdersSynced(ids) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[SW] Could not delete synced orders from IndexedDB:', err);
  }
}

// Execute batch sync to server
async function syncOfflineOrders() {
  const pending = await getPendingOrders();
  if (!pending.length) {
    return { count: 0 };
  }

  try {
    const res = await fetch('/api/pos/orders/batch-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: pending }),
    });

    if (!res.ok) {
      throw new Error(`Sync failed with status: ${res.status}`);
    }

    const data = await res.json();
    const syncedIds = pending.map((o) => o.id);
    await markOrdersSynced(syncedIds);

    // Notify all active browser window clients
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage({
        type: 'POS_SYNC_SUCCESS',
        count: syncedIds.length,
        syncedIds,
        timestamp: Date.now(),
      });
    }

    return { count: syncedIds.length };
  } catch (err) {
    console.warn('[SW] Background sync attempt failed (will retry):', err);
    throw err;
  }
}

// Install Event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: claim clients and purge outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Background Sync Event (Standard W3C Background Sync API)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pos-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Message Event: manual or app-triggered sync requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Fetch event: Network-first for dynamic API, cache fallback for navigation / static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension / internal requests
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API calls: Network only with graceful offline JSON fallback for specific routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // SPA navigation fallback: serve index.html from cache if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/index.html') || await cache.match('/');
        return cached || new Response('Offline - Love Local Eats POS', { headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }

  // Assets: Stale-while-revalidate / cache-first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
