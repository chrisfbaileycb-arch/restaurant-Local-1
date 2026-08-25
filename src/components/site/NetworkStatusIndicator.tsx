import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff, CheckCircle2, Database } from 'lucide-react';
import { subscribeOfflineQueue, QueuedPOSOrder } from '@/lib/offlineQueue';

export const NetworkStatusIndicator: React.FC<{
  className?: string;
  showWhenOnline?: boolean;
}> = ({ className = '', showWhenOnline = false }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Subscribe to queued offline orders count
    const unsubscribeQueue = subscribeOfflineQueue((orders: QueuedPOSOrder[]) => {
      const pending = orders.filter((o) => o.status === 'queued' || o.status === 'failed').length;
      setQueuedCount(pending);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeQueue();
    };
  }, []);

  // When fully online and not just reconnected, only render if showWhenOnline is true
  if (isOnline && !justReconnected && !showWhenOnline) {
    return null;
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {!isOnline ? (
        <div
          id="global-network-offline-badge"
          className="flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-xs transition-all animate-in fade-in"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          <WifiOff className="h-3.5 w-3.5 text-amber-700" />
          <span className="hidden sm:inline">Offline Mode</span>
          <span className="sm:hidden">Offline</span>
          {queuedCount > 0 && (
            <span className="ml-0.5 rounded-md bg-amber-200/90 px-1.5 py-0.2 text-[10px] font-black text-amber-950">
              {queuedCount}
            </span>
          )}
        </div>
      ) : justReconnected ? (
        <div
          id="global-network-reconnected-badge"
          className="flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 shadow-xs transition-all animate-in fade-in"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Back Online</span>
        </div>
      ) : (
        <div
          id="global-network-online-badge"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <Wifi className="h-3.5 w-3.5 text-emerald-600" />
          <span>Online</span>
        </div>
      )}

      {/* Hover Info Tooltip */}
      {showTooltip && !isOnline && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-amber-200 bg-white p-3 text-xs shadow-xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <CloudOff className="h-4 w-4 text-amber-600" />
            <span>Working Offline</span>
          </div>
          <p className="mt-1 text-stone-600">
            Internet disconnected. POS orders, carts, and local data are being saved safely to IndexedDB.
          </p>
          {queuedCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5 border-t border-amber-100 pt-2 font-semibold text-amber-800">
              <Database className="h-3.5 w-3.5" />
              <span>{queuedCount} order(s) pending cloud sync</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
