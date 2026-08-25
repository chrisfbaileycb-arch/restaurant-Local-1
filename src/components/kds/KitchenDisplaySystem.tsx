import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Plus,
  ArrowRight,
  Utensils,
  Wine,
  Check,
  Zap,
  Filter,
  Layers,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { useOps } from '@/lib/opsStore';
import { askGeminiKDS, type GeminiKDSAnalysisResponse } from '@/lib/geminiApi';
import type { KDSTicket, StationId, TicketStatus } from '@/data/kds';
import confetti from 'canvas-confetti';

export const KitchenDisplaySystem: React.FC = () => {
  const ops = useOps();
  const [stationFilter, setStationFilter] = useState<StationId>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<GeminiKDSAnalysisResponse | null>(null);

  // Update clock every second for live timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synth Chime for Kitchen Alerts
  const playKitchenChime = (type: 'order' | 'ready' | 'rush' = 'order') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'order') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'ready') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch {
      /* Audio context blocked or unsupported */
    }
  };

  const handleRunAIAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const activeTickets = ops.kdsTickets.filter((t) => t.status !== 'completed');
      const res = await askGeminiKDS(activeTickets, ['grill', 'fryer', 'bar', 'expo']);
      setAiAnalysis(res);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('KDS AI Analysis Error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCreateSampleTicket = () => {
    const sampleTables = ['Table 3', 'Table 7', 'Bar Seat 5', 'Patio 2', 'Takeout #48'];
    const sampleItems = [
      {
        id: `item-${Date.now()}-1`,
        name: 'Double Smash Burger',
        qty: 1,
        modifiers: ['Extra Sharp Cheddar', 'Grilled Onions'],
        station: 'grill' as const,
        done: false,
      },
      {
        id: `item-${Date.now()}-2`,
        name: 'Truffle Parmesan Fries',
        qty: 1,
        modifiers: ['Extra Crispy'],
        station: 'fryer' as const,
        done: false,
      },
      {
        id: `item-${Date.now()}-3`,
        name: 'Craft Draft IPA',
        qty: 1,
        station: 'bar' as const,
        done: false,
      },
    ];

    ops.addKDSTicket({
      orderSource: 'Dine-In',
      locationLabel: sampleTables[Math.floor(Math.random() * sampleTables.length)],
      serverName: 'Emma R.',
      status: 'queued',
      priority: Math.random() > 0.7 ? 'rush' : 'normal',
      items: sampleItems,
      specialInstructions: 'VIP Guest · Rush appetizer prep',
    });

    playKitchenChime('order');
  };

  const formatElapsed = (createdAt: number) => {
    const totalSecs = Math.max(0, Math.floor((now - createdAt) / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getTimerUrgency = (createdAt: number) => {
    const mins = (now - createdAt) / (1000 * 60);
    if (mins >= 15) return { bg: 'bg-red-500 text-white animate-pulse', border: 'border-red-500 ring-2 ring-red-500/30' };
    if (mins >= 8) return { bg: 'bg-amber-500 text-white', border: 'border-amber-400' };
    return { bg: 'bg-emerald-600 text-white', border: 'border-emerald-300' };
  };

  // Filter tickets by station
  const matchesStation = (ticket: KDSTicket) => {
    if (stationFilter === 'all') return true;
    return ticket.items.some((i) => i.station === stationFilter);
  };

  const queuedTickets = ops.kdsTickets.filter((t) => t.status === 'queued' && matchesStation(t));
  const prepTickets = ops.kdsTickets.filter((t) => t.status === 'prep' && matchesStation(t));
  const readyTickets = ops.kdsTickets.filter((t) => t.status === 'ready' && matchesStation(t));
  const completedTickets = ops.kdsTickets.filter((t) => t.status === 'completed' && matchesStation(t)).slice(0, 5);

  const totalActive = queuedTickets.length + prepTickets.length + readyTickets.length;

  return (
    <div className="space-y-6">
      {/* Top KDS Control Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Real-Time Kitchen Display System (KDS)
                </h2>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs font-semibold text-slate-400">
                {totalActive} Active Order Tickets · Station Pacing &amp; Line Expediting
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAIAnalysis}
              disabled={aiAnalyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
            >
              {aiAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {aiAnalyzing ? 'AI Expediting…' : 'Gemini Expo Triage'}
            </button>

            <button
              onClick={handleCreateSampleTicket}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-500"
            >
              <Plus className="h-4 w-4" /> New Test Ticket
            </button>

            <button
              onClick={() => {
                const recalled = ops.recallLastBumpedTicket();
                if (recalled) playKitchenChime('order');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Recall Last
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                soundEnabled
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? 'Chime On' : 'Muted'}
            </button>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Station Filter:
          </span>
          {[
            { id: 'all' as StationId, label: 'All Stations', count: ops.kdsTickets.filter((t) => t.status !== 'completed').length },
            { id: 'grill' as StationId, label: 'Grill & Flat Top', count: ops.kdsTickets.filter((t) => t.status !== 'completed' && t.items.some((i) => i.station === 'grill')).length },
            { id: 'fryer' as StationId, label: 'Fryer & Sauté', count: ops.kdsTickets.filter((t) => t.status !== 'completed' && t.items.some((i) => i.station === 'fryer')).length },
            { id: 'bar' as StationId, label: 'Bar & Beverages', count: ops.kdsTickets.filter((t) => t.status !== 'completed' && t.items.some((i) => i.station === 'bar')).length },
            { id: 'expo' as StationId, label: 'Expo Pass', count: readyTickets.length },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStationFilter(st.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                stationFilter === st.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {st.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  stationFilter === st.id ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {st.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI Bottleneck Triage Box (If Active) */}
      {aiAnalysis && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900 to-fuchsia-950/30 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
            <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Gemini AI Kitchen Expediter Insight · Status: {aiAnalysis.status} (Avg {aiAnalysis.averageTicketTime})
            </div>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-300">
                <span className="font-black text-amber-400">Bottleneck Scan:</span> {aiAnalysis.bottlenecks}
              </p>
            </div>
            <div className="space-y-1">
              {aiAnalysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-200">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4-Column Real-Time KDS Board */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Column 1: Queued / Incoming */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/30 px-3 py-2 text-sky-300">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-400" /> 1. Queued / Incoming
            </span>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-200">
              {queuedTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {queuedTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-semibold text-slate-400">
                No incoming tickets queued
              </div>
            ) : (
              queuedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  elapsedStr={formatElapsed(ticket.createdAt)}
                  urgency={getTimerUrgency(ticket.createdAt)}
                  onStartPrep={() => {
                    ops.updateTicketStatus(ticket.id, 'prep');
                    playKitchenChime('order');
                  }}
                  onMarkReady={() => {
                    ops.updateTicketStatus(ticket.id, 'ready');
                    playKitchenChime('ready');
                  }}
                  onBump={() => {
                    ops.updateTicketStatus(ticket.id, 'completed');
                    playKitchenChime('ready');
                  }}
                  onToggleItem={(itemId) => ops.toggleTicketItemDone(ticket.id, itemId)}
                  onTogglePriority={() =>
                    ops.setTicketPriority(ticket.id, ticket.priority === 'rush' ? 'normal' : 'rush')
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Preparation / Cooking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-amber-300">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400" /> 2. Preparing / In Progress
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">
              {prepTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {prepTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-semibold text-slate-400">
                No active cooking tickets
              </div>
            ) : (
              prepTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  elapsedStr={formatElapsed(ticket.createdAt)}
                  urgency={getTimerUrgency(ticket.createdAt)}
                  onStartPrep={() => ops.updateTicketStatus(ticket.id, 'prep')}
                  onMarkReady={() => {
                    ops.updateTicketStatus(ticket.id, 'ready');
                    playKitchenChime('ready');
                  }}
                  onBump={() => {
                    ops.updateTicketStatus(ticket.id, 'completed');
                    playKitchenChime('ready');
                  }}
                  onToggleItem={(itemId) => ops.toggleTicketItemDone(ticket.id, itemId)}
                  onTogglePriority={() =>
                    ops.setTicketPriority(ticket.id, ticket.priority === 'rush' ? 'normal' : 'rush')
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup / Pass */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-emerald-300">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 3. Ready for Pass / Expo
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-200">
              {readyTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-semibold text-slate-400">
                Expo pass is clear
              </div>
            ) : (
              readyTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  elapsedStr={formatElapsed(ticket.createdAt)}
                  urgency={getTimerUrgency(ticket.createdAt)}
                  onStartPrep={() => ops.updateTicketStatus(ticket.id, 'prep')}
                  onMarkReady={() => ops.updateTicketStatus(ticket.id, 'ready')}
                  onBump={() => {
                    ops.updateTicketStatus(ticket.id, 'completed');
                    playKitchenChime('ready');
                  }}
                  onToggleItem={(itemId) => ops.toggleTicketItemDone(ticket.id, itemId)}
                  onTogglePriority={() =>
                    ops.setTicketPriority(ticket.id, ticket.priority === 'rush' ? 'normal' : 'rush')
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: Fulfilled History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Check className="h-4 w-4 text-slate-500" /> 4. Fulfilled / Bumped
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
              {completedTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-semibold text-slate-400">
                No fulfilled history yet
              </div>
            ) : (
              completedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm opacity-75"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Ticket #{ticket.ticketNumber} ({ticket.locationLabel})</span>
                    <button
                      onClick={() => {
                        ops.updateTicketStatus(ticket.id, 'ready');
                        playKitchenChime('order');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-700 hover:bg-slate-200"
                    >
                      <RotateCcw className="h-3 w-3" /> Recall
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 truncate">
                    {ticket.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TicketCardProps {
  ticket: KDSTicket;
  elapsedStr: string;
  urgency: { bg: string; border: string };
  onStartPrep: () => void;
  onMarkReady: () => void;
  onBump: () => void;
  onToggleItem: (itemId: string) => void;
  onTogglePriority: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  elapsedStr,
  urgency,
  onStartPrep,
  onMarkReady,
  onBump,
  onToggleItem,
  onTogglePriority,
}) => {
  return (
    <div
      className={`rounded-2xl border-2 bg-white p-4 shadow-md transition-all ${
        ticket.priority === 'rush' ? 'border-red-500 ring-2 ring-red-500/20' : urgency.border
      }`}
    >
      {/* Card Header: Ticket #, Table, Timer */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">
              #{ticket.ticketNumber}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-800">
              {ticket.locationLabel}
            </span>
            {ticket.priority === 'rush' && (
              <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                RUSH
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            {ticket.orderSource} · {ticket.serverName}
          </p>
        </div>

        {/* Live Elapsed Timer */}
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black shadow-sm ${urgency.bg}`}>
          <Clock className="h-3.5 w-3.5" />
          <span>{elapsedStr}</span>
        </div>
      </div>

      {/* Special Allergy / Chef Instructions */}
      {ticket.specialInstructions && (
        <div className="mt-2.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900">
          ⚠️ {ticket.specialInstructions}
        </div>
      )}

      {/* Items Checklist for Line Cooks */}
      <div className="mt-3 space-y-2">
        {ticket.items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className={`group flex cursor-pointer items-start justify-between gap-2 rounded-xl p-2 transition ${
              item.done ? 'bg-slate-100 text-slate-400 line-through' : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                  item.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {item.done && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs font-black text-slate-900">
                  {item.qty}x {item.name}
                </span>
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {item.modifiers.map((mod, mi) => (
                      <span
                        key={mi}
                        className="rounded bg-orange-100/80 px-1.5 py-0.2 text-[10px] font-bold text-orange-900"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              {item.station}
            </span>
          </div>
        ))}
      </div>

      {/* Bump Bar Action Buttons */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        {ticket.status === 'queued' && (
          <button
            onClick={onStartPrep}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-amber-600"
          >
            <Flame className="h-3.5 w-3.5" /> Start Cooking
          </button>
        )}

        {ticket.status === 'prep' && (
          <button
            onClick={onMarkReady}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Ready for Expo
          </button>
        )}

        {ticket.status === 'ready' && (
          <button
            onClick={onBump}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-slate-800"
          >
            <Check className="h-3.5 w-3.5" /> Bump (Served)
          </button>
        )}

        <button
          onClick={onTogglePriority}
          title="Toggle RUSH priority"
          className={`rounded-xl border p-2 text-xs font-bold transition ${
            ticket.priority === 'rush'
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default KitchenDisplaySystem;
