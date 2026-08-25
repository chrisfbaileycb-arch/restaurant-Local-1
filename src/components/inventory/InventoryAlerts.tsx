import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Sparkles,
  Plus,
  Minus,
  RotateCcw,
  Ban,
  CheckCircle2,
  TrendingDown,
  ShoppingCart,
  FileText,
  DollarSign,
  Loader2,
  ArrowUpRight,
  Truck,
  Layers,
  Search,
} from 'lucide-react';
import { useOps } from '@/lib/opsStore';
import { askGeminiInventory, type GeminiInventoryAssistResponse } from '@/lib/geminiApi';
import confetti from 'canvas-confetti';

export const InventoryAlerts: React.FC = () => {
  const ops = useOps();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<GeminiInventoryAssistResponse | null>(null);
  const [restockModalItem, setRestockModalItem] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);

  const categories = ['all', 'Proteins', 'Bakery', 'Produce', 'Beverages', 'Pantry & Oils', 'Dairy'];

  const filteredItems = ops.inventory.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.menuItemName && item.menuItemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockItems = ops.inventory.filter((i) => i.stockQty <= i.lowStockThreshold && !i.is86);
  const eightySixedItems = ops.inventory.filter((i) => i.is86 || i.stockQty <= 0);

  const handleAskAI = async () => {
    setAiLoading(true);
    try {
      const res = await askGeminiInventory(ops.inventory, ops.eightySixed);
      setAiData(res);
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Inventory AI Assist Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyRestock = () => {
    if (!restockModalItem) return;
    ops.restockInventoryItem(restockModalItem.id, Number(restockQty));
    setRestockModalItem(null);
    confetti({ particleCount: 20, spread: 40 });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with KPIs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
              <Package className="h-3.5 w-3.5 text-amber-600" />
              Live Inventory &amp; 86'd Control
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Stock Alerts &amp; Kitchen Depletion
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Orders placed on POS and QR menus automatically deplete stock. 86ing an item immediately disables it across all ordering channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAskAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? 'Gemini Analyzing Stock…' : 'AI Restock & Specials Advisor'}
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tracked Ingredients</span>
            <p className="mt-1 text-xl font-black text-slate-900">{ops.inventory.length}</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-600" /> Low Stock Alerts
            </span>
            <p className="mt-1 text-xl font-black text-amber-900">{lowStockItems.length} items</p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1">
              <Ban className="h-3 w-3 text-red-600" /> Currently 86'd
            </span>
            <p className="mt-1 text-xl font-black text-red-900">{eightySixedItems.length} items</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Register Sync
            </span>
            <p className="mt-1 text-xl font-black text-emerald-900">Instant Real-Time</p>
          </div>
        </div>
      </div>

      {/* Gemini AI Inventory Analysis Card */}
      {aiData && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-500/10 via-amber-50 to-white p-6 shadow-md">
          <div className="flex items-center justify-between border-b border-orange-200/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-900">
              <Sparkles className="h-4 w-4 text-orange-600" />
              Gemini AI Stock Optimization &amp; Waste Reduction
            </div>
            <button onClick={() => setAiData(null)} className="text-xs text-slate-500 hover:text-slate-900">
              Dismiss
            </button>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Waste Reduction Special Recommendation */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Recommended Perishable Special
              </div>
              <h4 className="mt-2 text-base font-black text-slate-900">
                {aiData.dailySpecialSuggestion.title}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {aiData.dailySpecialSuggestion.description}
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs">
                <span className="font-bold text-amber-900">Suggested Price: {aiData.dailySpecialSuggestion.suggestedPrice}</span>
                <span className="font-medium text-amber-800 text-[11px]">{aiData.dailySpecialSuggestion.reasoning}</span>
              </div>
            </div>

            {/* Smart Purchase Order Draft */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-700">
                <Truck className="h-3.5 w-3.5 text-slate-600" />
                Draft Supplier Restock Order (PO)
              </div>
              <div className="mt-3 space-y-2">
                {aiData.purchaseOrderRecommendations.map((po, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="font-bold text-slate-800">
                      {po.item} (Qty: {po.qty})
                    </span>
                    <span className="font-mono font-semibold text-slate-600">{po.estimatedCost}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    aiData.purchaseOrderRecommendations
                      .map((po) => `${po.item} - Qty: ${po.qty} (${po.estimatedCost})`)
                      .join('\n')
                  );
                  confetti({ particleCount: 20 });
                }}
                className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-xs font-black text-white hover:bg-slate-800"
              >
                Copy Supplier Order Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items or suppliers…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isLow = item.stockQty <= item.lowStockThreshold && !item.is86;
          const isOut = item.is86 || item.stockQty <= 0;
          const pct = Math.min(100, Math.round((item.stockQty / (item.lowStockThreshold * 2.5)) * 100));

          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 bg-white p-5 shadow-sm transition-all ${
                isOut
                  ? 'border-red-300 bg-red-50/30'
                  : isLow
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{item.name}</h4>
                  <p className="text-[11px] font-medium text-slate-500">
                    {item.supplier} · {item.category}
                  </p>
                </div>

                {isOut ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    <Ban className="h-3 w-3" /> 86'd
                  </span>
                ) : isLow ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    <AlertTriangle className="h-3 w-3" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                    In Stock
                  </span>
                )}
              </div>

              {/* Stock Bar Gauge */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>
                    {item.stockQty} {item.unit}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Threshold: {item.lowStockThreshold} {item.unit}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Stock Quick Adjustment & 86 Button */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => ops.updateInventoryStock(item.id, item.stockQty - 1)}
                    disabled={item.stockQty <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-800">{item.stockQty}</span>
                  <button
                    onClick={() => ops.updateInventoryStock(item.id, item.stockQty + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRestockModalItem(item)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Restock
                  </button>

                  <button
                    onClick={() => ops.toggle86InventoryItem(item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                      item.is86
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {item.is86 ? 'Restore' : '86 Item'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Restock {restockModalItem.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Supplier: {restockModalItem.supplier} · Current: {restockModalItem.stockQty} {restockModalItem.unit}
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quantity to Add ({restockModalItem.unit}):
              </label>
              <div className="mt-2 flex items-center gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRestockQty(preset)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold ${
                      restockQty === preset
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setRestockModalItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRestock}
                className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-black text-white hover:bg-orange-500"
              >
                Confirm Restock (+{restockQty} {restockModalItem.unit})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
