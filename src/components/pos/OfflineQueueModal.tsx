import React, { useState } from 'react';
import {
  CloudOff, Cloud, RefreshCw, Trash2, Clock, CheckCircle2, AlertCircle, X, ShieldCheck, Database, Loader2, DollarSign
} from 'lucide-react';
import { QueuedPOSOrder, syncQueuedOrders, removeQueuedOrder } from '@/lib/offlineQueue';
import { formatCents } from '@/data/platform';

interface OfflineQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: QueuedPOSOrder[];
  isOnline: boolean;
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({
  isOpen,
  onClose,
  orders,
  isOnline,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncQueuedOrders();
      if (res.syncedCount > 0) {
        setSyncResult(`Successfully synced ${res.syncedCount} order(s) to cloud database!`);
      } else if (res.errors > 0) {
        setSyncResult(`Sync failed for ${res.errors} order(s). Check connection.`);
      } else {
        setSyncResult('No pending orders to sync.');
      }
    } catch (err: any) {
      setSyncResult(`Sync error: ${err?.message || 'Network unreachable'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this offline transaction from the queue?')) {
      await removeQueuedOrder(id);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'queued' || o.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-2.5 ${orders.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
              {orders.length > 0 ? <Database className="h-6 w-6" /> : <Cloud className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Service Worker Offline Queue
              </h2>
              <p className="text-xs text-stone-500">
                {orders.length === 0
                  ? 'All local register orders are synced with the cloud.'
                  : `${orders.length} transaction(s) stored locally in IndexedDB & Service Worker.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Network & Background Sync Status Banner */}
        <div className="border-b border-stone-100 bg-stone-50 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isOnline ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
                {isOnline ? 'Internet Connection Active' : 'Offline / Cellular Mode'}
              </span>
              <span className="inline-flex items-center gap-1 text-stone-600">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                W3C Background Sync Enabled
              </span>
            </div>

            {orders.length > 0 && (
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 font-bold text-white shadow-xs transition hover:bg-stone-800 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {syncing ? 'Syncing...' : 'Sync Pending Now'}
              </button>
            )}
          </div>

          {syncResult && (
            <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-xs font-semibold text-blue-900">
              {syncResult}
            </div>
          )}
        </div>

        {/* Orders List Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="mt-3 font-bold text-stone-900">Queue is Clear</h3>
              <p className="mt-1 max-w-sm text-xs text-stone-500">
                During network drops, orders taken at this station will automatically queue here and sync the moment connectivity returns.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-stone-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        #{ord.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {ord.tableLabel || 'Register 1'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Server: {ord.serverName || 'Staff'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'queued'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'syncing'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ord.status === 'syncing' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                        {ord.status === 'queued' && <Clock className="h-2.5 w-2.5" />}
                        {ord.status === 'failed' && <AlertCircle className="h-2.5 w-2.5" />}
                        {ord.status}
                      </span>
                      <span className="font-mono text-sm font-black text-stone-900">
                        {formatCents(ord.total)}
                      </span>
                    </div>
                  </div>

                  {/* Item breakdown */}
                  <div className="space-y-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-600">
                        <span>
                          <span className="font-bold text-stone-800">{item.qty}x</span> {item.name}
                        </span>
                        <span className="font-mono">{formatCents(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between border-t border-stone-50 pt-2 text-[11px] text-stone-400">
                    <div className="flex items-center gap-2">
                      <span>Tender: <strong className="text-stone-700">{ord.tenderMethod}</strong></span>
                      <span>·</span>
                      <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      {ord.retryCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-red-500">Retries: {ord.retryCount}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(ord.id)}
                      className="inline-flex items-center gap-1 text-stone-400 hover:text-red-600"
                      title="Discard transaction"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 p-4">
          <p className="text-[11px] text-stone-500">
            Powered by Web Service Worker &amp; IndexedDB Persistent Ledger
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
