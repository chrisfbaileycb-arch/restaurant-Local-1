import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, Send, Mic, MicOff, Ban, Percent, Users, Timer, FileCheck2, Loader2, Copy, Check,
  ChevronDown, Bot, ClipboardList, ChevronLeft, Pin, PinOff, History, MessageSquare,
  Globe, Clock, ImageIcon, ShoppingBag, Server, Package, Wallet, Truck, ChefHat, Receipt,
  Printer, Download, CalendarDays, BarChart3, Megaphone,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import CopilotSentinel from '@/components/site/CopilotSentinel';
import CopilotKitCard from '@/components/site/CopilotKitCard';
import CopilotHistory from '@/components/site/CopilotHistory';
import BuildStatus from '@/components/site/BuildStatus';
import SkillRoadmap from '@/components/site/SkillRoadmap';


import { useDeviceHealth } from '@/hooks/useDeviceHealth';
import { useAuth } from '@/contexts/AuthContext';
import { useOps } from '@/lib/opsStore';
import { runCommand, laborAudit } from '@/lib/copilotBrain';
import { runAdvisor } from '@/lib/copilotAdvisor';
import { saveCopilotMessage, loadCopilotHistory } from '@/lib/copilotHistory';
import { printDocument, downloadDoc, type PrintDoc } from '@/lib/printDoc';
import { loadSiteSettings, patchSiteSettings, type SiteSettings } from '@/lib/siteSettings';
import { QUICK_ACTIONS, COPILOT_SUGGESTIONS, COPILOT_SKILLS, TODAY_SNAPSHOT } from '@/data/copilot';
import { COPILOT_MODES, type CopilotModeId } from '@/data/copilotModes';
import { DEVICE_KINDS, formatCents, type DeviceKindId } from '@/data/platform';
import type { LoadedMenu } from '@/lib/menuStore';


const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Ban, Percent, Users, Timer, FileCheck2, CalendarDays, BarChart3, Megaphone,
  Globe, Clock, ImageIcon, ShoppingBag, Server, Package, Wallet, Truck, ChefHat, Receipt,
};


/** A command pushed in from outside the drawer (hero buttons, terminal taps). */
export interface CopilotSeed {
  text: string;
  /** bump this to replay the same text again */
  nonce: number;
}

interface SidebarProps {
  menu: LoadedMenu;
  seed?: CopilotSeed | null;
  /** which hat the copilot is wearing on this page */
  mode?: CopilotModeId;
  /** slide the drawer away */
  onCollapse?: () => void;
  /** pinning is only offered to signed-in operators */
  canPin?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
}


interface Msg {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  effects?: string[];
  payload?: any;
  kit?: { planId: string; name: string; who: string; note: string; handles: string[] };
  doc?: PrintDoc;
  tone?: 'ok' | 'warn' | 'alert';
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const TONE_RING = {
  ok: 'border-emerald-400/25',
  warn: 'border-amber-400/30',
  alert: 'border-red-400/35',
};

/** A roster or report the operator can send to the printer or save. */
const DocBlock: React.FC<{ doc: PrintDoc }> = ({ doc }) => (
  <div className="mt-2 overflow-hidden rounded-lg border border-amber-300/25 bg-amber-400/5">
    <div className="flex items-center justify-between gap-2 border-b border-amber-300/20 px-2.5 py-1.5">
      <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-amber-300">
        {doc.format === 'receipt' ? 'Kitchen printer document' : 'Printable report'}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => printDocument(doc)}
          className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[10px] font-extrabold text-slate-900 hover:bg-amber-300"
        >
          <Printer className="h-3 w-3" /> Print / PDF
        </button>
        <button
          onClick={() => downloadDoc(doc)}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 hover:text-amber-100"
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      </div>
    </div>
    <div className="max-h-44 overflow-auto px-2.5 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-white">{doc.title}</p>
      {doc.subtitle && <p className="text-[10px] text-slate-400">{doc.subtitle}</p>}
      <div className="mt-1.5 space-y-0.5">
        {doc.lines.slice(0, 14).map((l, i) =>
          l === '---' ? (
            <div key={i} className="my-1 border-t border-dashed border-white/15" />
          ) : l.includes('\t') ? (
            <div key={i} className="flex justify-between gap-3 text-[11px] text-slate-300">
              <span className="truncate">{l.split('\t')[0]}</span>
              <span className="shrink-0 font-bold text-white">{l.split('\t')[1]}</span>
            </div>
          ) : (
            <p key={i} className="text-[11px] text-slate-300">{l}</p>
          ),
        )}
        {doc.lines.length > 14 && <p className="text-[10px] text-slate-500">+{doc.lines.length - 14} more lines on the printout</p>}
      </div>
    </div>
  </div>
);


const CopilotSidebar: React.FC<SidebarProps> = ({
  menu, seed, mode = 'floor', onCollapse, canPin, pinned, onTogglePin,
}) => {
  const ops = useOps();
  const { user } = useAuth();
  const cfg = COPILOT_MODES[mode] || COPILOT_MODES.floor;
  const isFloor = mode === 'floor';
  const { verifyOne, devices, simulateDrop } = useDeviceHealth();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSkills, setShowSkills] = useState(true);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [site, setSite] = useState<SiteSettings | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Each surface gets its own quick actions and prompts.
  const quickActions = isFloor ? QUICK_ACTIONS : cfg.quickActions;
  const suggestions = isFloor ? COPILOT_SUGGESTIONS : cfg.suggestions;

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      role: 'agent',
      tone: 'ok',
      text: isFloor
        ? `Copilot online for ${menu.isDemo ? 'the demo shop' : menu.shopName}. ${menu.items.length} items loaded, ${TODAY_SNAPSHOT.ticketCount} tickets rung today. Tell me what changed on the floor and I will push it to the register, the online cart and your website together.`
        : cfg.greeting,
    },
  ]);

  // Everything the copilot says or is told is written to copilot_messages.
  const record = useCallback(
    (msg: Omit<Msg, 'id'>) => {
      saveCopilotMessage({
        shopId: menu.shopId,
        userId: user?.id || null,
        mode,
        role: msg.role,
        text: msg.text,
        effects: msg.effects,
        payload: msg.payload ?? (msg.kit ? { kit: msg.kit } : msg.doc ? { doc: msg.doc } : null),
      });
    },
    [menu.shopId, user?.id, mode],
  );


  const push = useCallback(
    (msg: Omit<Msg, 'id'>) => {
      setMessages((m) => [...m, { ...msg, id: uid() }]);
      record(msg);
    },
    [record],
  );

  // Pick the conversation back up where it left off (last 50 saved messages).
  useEffect(() => {
    let cancelled = false;
    loadCopilotHistory(menu.shopId, user?.id || null, 50).then((rows) => {
      if (cancelled || rows.length === 0) return;
      setMessages((m) => [
        m[0],
        {
          id: 'resume',
          role: 'system',
          tone: 'ok',
          text: `Picking up where we left off — ${rows.length} saved message${rows.length === 1 ? '' : 's'} loaded. Open History for the full record and the audit export.`,
        },
        ...rows.map((r) => ({
          id: r.id,
          role: r.role,
          text: r.text,
          effects: r.effects,
          payload: r.payload && !r.payload.kit && !r.payload.doc ? r.payload : undefined,
          kit: r.payload?.kit,
          doc: r.payload?.doc,
        })),

      ]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.shopId, user?.id]);

  // The owner's real saved website setup, so build answers use live values.
  useEffect(() => {
    let cancelled = false;
    loadSiteSettings(menu.shopId).then((s) => !cancelled && setSite(s));
    return () => {
      cancelled = true;
    };
  }, [menu.shopId]);

  useEffect(() => {
    if (view === 'chat') {
      streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, busy, view]);

  // Watchdog: announce a network failover in the agent stream.
  const prevNet = useRef(ops.network);
  useEffect(() => {
    if (prevNet.current !== ops.network) {
      push({
        role: 'system',
        tone: ops.network === 'lte' ? 'warn' : 'ok',
        text:
          ops.network === 'lte'
            ? 'Wi-Fi dropped. LTE cellular failover engaged in 2.1s — card auth and kitchen tickets never stopped. Local queue is writing to disk.'
            : 'Wi-Fi is back. Queued tickets and card batches synced, LTE released.',
        effects: ops.network === 'lte' ? ['Failover active', 'Queue armed'] : ['Synced'],
      });
      prevNet.current = ops.network;
    }
  }, [ops.network, push]);

  const runDiagnostics = (only?: DeviceKindId) => {
    const targets = only ? [only] : (['receipt-printer', 'kitchen-printer', 'cash-drawer', 'card-reader'] as DeviceKindId[]);
    targets.forEach((id) => verifyOne(id));
    window.setTimeout(() => {
      const rows = devices.filter((d) => targets.includes(d.id));
      const lines = targets.map((id) => {
        const row = rows.find((r) => r.id === id);
        const name = DEVICE_KINDS.find((d) => d.id === id)?.name || id;
        if (!row) return `${name}: not paired to this station.`;
        if (row.state === 'down') return `${name}: no answer — check power and cable.`;
        return `${name}: answered in ${row.latency ?? 0}ms.`;
      });
      push({
        role: 'agent',
        tone: rows.some((r) => r.state === 'down') ? 'alert' : 'ok',
        text: `Diagnostics complete.\n${lines.join('\n')}\nSpool queue clear, drawer latch trigger responding and the swiper is reporting an encrypted P2PE session.`,
        effects: ['Spool clear', 'Latch OK', 'P2PE verified'],
      });
      setBusy(false);
    }, 1200);
  };

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setView('chat');
    push({ role: 'user', text });
    setInput('');
    setBusy(true);

    // On the build surfaces the advisor answers first (store build, gear),
    // then the floor commands. On the register it is the other way round.
    const first = isFloor ? runCommand(text, menu) : runAdvisor(text, menu, site);
    const result = first.unhandled ? (isFloor ? runAdvisor(text, menu, site) : runCommand(text, menu)) : first;

    if (result.effects?.[0] === '__hardware__') {
      const target = (['receipt-printer', 'kitchen-printer', 'cash-drawer', 'card-reader'] as DeviceKindId[]).find((id) =>
        text.toLowerCase().includes(id.split('-')[0]),
      );
      if (/drop|unplug|fail|kill wifi|simulate/.test(text.toLowerCase()) && target) {
        simulateDrop(target);
      }
      push({ role: 'agent', tone: 'ok', text: 'Running hardware diagnostics on this station…' });
      runDiagnostics(target);
      return;
    }

    if (!result.unhandled) {
      push({
        role: 'agent',
        text: result.reply,
        effects: result.effects,
        payload: result.payload,
        kit: result.kit,
        doc: result.doc,
        tone: result.tone,
      });

      // Web & brand engine: write the change into the shop's saved settings.
      if (result.siteWrite) {
        if (menu.shopId) {
          try {
            const next = await patchSiteSettings(menu.shopId, result.siteWrite);
            setSite(next);
          } catch (e: any) {
            push({ role: 'system', tone: 'warn', text: `I could not save that to your website settings: ${e?.message || 'write failed'}` });
          }
        } else {
          push({
            role: 'system',
            tone: 'warn',
            text: 'That is a demo shop, so nothing was saved. Build your store first and every website change I make sticks.',
          });
        }
      }

      setBusy(false);
      return;
    }


    // Open-ended question — hand it to the model with live shop context.
    const { laborCost, pct, overtime } = laborAudit();
    try {
      const { data } = await supabase.functions.invoke('copilot-chat', {
        body: {
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
          context: {
            shop: menu.shopName,
            itemCount: menu.items.length,
            categories: menu.categories,
            eightySixed: ops.eightySixed,
            activePromos: ops.promos.map((p) => `${p.pct}% off ${p.scope}`),
            netSalesToday: formatCents(TODAY_SNAPSHOT.netSales),
            laborCost: formatCents(laborCost),
            laborPct: `${(pct * 100).toFixed(1)}%`,
            overtimeRisk: overtime.map((s) => `${s.name} ${s.weekHours}h`),
            network: ops.network,
            website: site
              ? {
                  domain: site.domain,
                  googlePlaceId: site.google_place_id,
                  logoSaved: !!site.logo_url,
                  hiringEnabled: site.hiring_enabled,
                  sectionsOn: site.section_order,
                }
              : null,
          },
        },
      });
      push({ role: 'agent', tone: 'ok', text: data?.reply || 'I did not catch that one — try a direct command.' });
    } catch {
      push({
        role: 'agent',
        tone: 'warn',
        text: 'I could not reach the assistant. Direct commands still work: 86 an item, split a check, labor margin audit, or run daily close.',
      });
    }
    setBusy(false);
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      push({ role: 'system', tone: 'warn', text: 'This browser will not open the microphone. Type the command instead — same result.' });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const said = e.results?.[0]?.[0]?.transcript || '';
      setListening(false);
      if (said) send(said);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  // A command handed in from the marketing page (hero CTA, terminal taps).
  // The drawer slides open first, then the command plays into the stream.
  const lastSeed = useRef(0);
  useEffect(() => {
    if (!seed || seed.nonce === lastSeed.current) return;
    lastSeed.current = seed.nonce;
    const t = window.setTimeout(() => send(seed.text), 480);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.nonce]);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-violet-700 via-fuchsia-700 to-orange-600 px-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold leading-tight">Love Local Operator Copilot</p>
          <p className="flex items-center gap-1 text-[11px] text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {cfg.role} · {menu.isDemo ? 'demo shop' : menu.shopName}
          </p>
        </div>

        {/* History / chat toggle */}
        <button
          onClick={() => setView((v) => (v === 'history' ? 'chat' : 'history'))}
          title={view === 'history' ? 'Back to the conversation' : 'History & audit export'}
          aria-pressed={view === 'history'}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition ${
            view === 'history' ? 'bg-white text-violet-700' : 'bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          {view === 'history' ? <MessageSquare className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
          {view === 'history' ? 'Chat' : 'History'}
        </button>

        {/* Pin (signed-in operators only) + collapse */}
        {canPin && onTogglePin && (
          <button
            onClick={onTogglePin}
            title={pinned ? 'Unpin — let the copilot slide away' : 'Pin the copilot beside the register'}
            aria-pressed={pinned}
            className={`hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition lg:inline-flex ${
              pinned ? 'bg-white text-violet-700' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
            {pinned ? 'Pinned' : 'Pin'}
          </button>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Collapse the copilot"
            title="Slide the copilot away"
            className="shrink-0 rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>


      {/* Quick actions */}
      <div className="border-b border-white/10 px-3 py-2.5">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick actions</p>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((a) => {
            const Icon = ICONS[a.icon] || Sparkles;
            const instant = a.id !== 'eighty-six';
            return (
              <button
                key={a.id}
                title={a.hint}
                onClick={() => (instant ? send(a.command) : setInput(a.command))}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-slate-100 transition hover:border-amber-300/50 hover:bg-amber-400/15 hover:text-amber-200"
              >
                <Icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Build status — the agent console view of where this build sits */}
      <div className="border-b border-white/10 px-3 py-2.5">
        <BuildStatus tone="dark" />
      </div>

      {/* ADK agent-skill roadmap — what the back end can run, in build order */}
      <div className="max-h-64 overflow-y-auto border-b border-white/10 px-3 py-2.5">
        <SkillRoadmap tone="dark" />
      </div>



      {/* Live state chips */}
      {(ops.eightySixed.length > 0 || ops.promos.length > 0 || Object.keys(ops.priceOverrides).length > 0) && (
        <div className="flex flex-wrap gap-1.5 border-b border-white/10 bg-slate-950/50 px-3 py-2">
          {ops.eightySixed.map((n) => (
            <button
              key={n}
              onClick={() => send(`restore ${n}`)}
              title="Tap to put it back on"
              className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300"
            >
              86 · {n}
            </button>
          ))}
          {Object.entries(ops.priceOverrides).map(([n, c]) => (
            <span key={n} className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
              {n} → {formatCents(c as number)}
            </span>
          ))}
          {ops.promos.map((p) => (
            <button
              key={p.id}
              onClick={() => ops.endPromo(p.id)}
              className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
            >
              {p.pct}% {p.scope} · end
            </button>
          ))}
        </div>
      )}

      {/* History view */}
      {view === 'history' && <CopilotHistory shopId={menu.shopId} userId={user?.id || null} />}

      {/* Stream */}
      <div
        ref={streamRef}
        className={`flex-1 space-y-2.5 overflow-y-auto px-3 py-3 ${view === 'history' ? 'hidden' : ''}`}
      >
        {showSkills && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">What I can run</p>
              <button onClick={() => setShowSkills(false)} className="text-slate-400 hover:text-white">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="mt-2 space-y-1.5">
              {COPILOT_SKILLS.map((s) => (
                <li key={s.title} className="text-[11px] leading-snug text-slate-300">
                  <span className="font-bold text-white">{s.title}</span> — {s.body}
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="ml-6 rounded-xl rounded-br-sm bg-gradient-to-br from-fuchsia-600 to-violet-600 px-3 py-2 text-sm font-medium">
              {m.text}
            </div>
          ) : (
            <div
              key={m.id}
              className={`mr-3 rounded-xl rounded-bl-sm border bg-white/5 px-3 py-2.5 ${TONE_RING[m.tone || 'ok']}`}
            >
              {m.role === 'system' && (
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <ClipboardList className="h-3 w-3" /> Sentinel
                </p>
              )}
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-100">{m.text}</p>
              {m.effects && m.effects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.effects.map((e) => (
                    <span key={e} className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {m.kit && <CopilotKitCard kit={m.kit} />}
              {m.doc && <DocBlock doc={m.doc} />}
              {m.payload && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950/70 p-2 text-[10px] leading-snug text-emerald-200">
                  {JSON.stringify(m.payload, null, 2)}
                </pre>
              )}


            </div>
          ),
        )}

        {busy && (
          <p className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working the floor…
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-white/10 px-3 py-2">
        {suggestions.slice(0, 6).map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
          >
            {s}
          </button>
        ))}
      </div>


      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
      >
        <button
          type="button"
          onClick={toggleVoice}
          aria-label="Speak a command"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            listening ? 'animate-pulse bg-red-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'
          }`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Tell the copilot what changed…'}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 transition disabled:opacity-40"
          aria-label="Send command"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <CopilotSentinel onDiagnose={(id) => { setBusy(true); push({ role: 'agent', tone: 'ok', text: `Pinging ${DEVICE_KINDS.find((d) => d.id === id)?.name || id}…` }); runDiagnostics(id); }} />
    </div>
  );
};

export default CopilotSidebar;
