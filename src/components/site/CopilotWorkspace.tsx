import React, { useEffect, useState } from 'react';
import { Bot, ChevronRight, X } from 'lucide-react';

import CopilotSidebar, { type CopilotSeed } from '@/components/site/CopilotSidebar';
import { COPILOT_MODES, type CopilotModeId } from '@/data/copilotModes';
import { useOps } from '@/lib/opsStore';
import type { LoadedMenu } from '@/lib/menuStore';

const PIN_KEY = 'lle_copilot_pinned';

export const readPinned = (): boolean => {
  try {
    return localStorage.getItem(PIN_KEY) === '1';
  } catch {
    return false;
  }
};

interface Props {
  menu: LoadedMenu;
  /** drawer visible? */
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** locked side-by-side with the register (signed-in operators) */
  pinned: boolean;
  onPinnedChange: (next: boolean) => void;
  /** only signed-in operators get the pin toggle */
  canPin?: boolean;
  /** a command pushed in from the page (hero CTA, terminal taps) */
  seed?: CopilotSeed | null;
  /** which hat the copilot wears here: floor / website / equipment */
  mode?: CopilotModeId;
  /** short bubble shown beside the tab the first time you land on a page */
  nudge?: boolean;
  /**
   * How the collapsed copilot advertises itself:
   * 'tab'  — tall edge tab on work pages (POS, onboarding, gear)
   * 'pill' — sleek floating pill on the marketing landing page
   */
  trigger?: 'tab' | 'pill';
}

/**
 * Collapsible slide-out drawer for the Operator Copilot.
 *
 * Collapsed by default so the page stays full width. A tall, obvious
 * tab on the left edge — arrow, label and a live green dot — slides the
 * panel in over the page. Signed-in operators can PIN it, which docks it
 * beside the work instead of floating over it.
 */
const CopilotWorkspace: React.FC<Props> = ({
  menu, open, onOpenChange, pinned, onPinnedChange, canPin, seed, mode = 'floor', nudge, trigger = 'tab',
}) => {

  const ops = useOps();
  const cfg = COPILOT_MODES[mode] || COPILOT_MODES.floor;
  // Mount once, then keep it mounted so the conversation history and any
  // in-flight command survive a collapse.
  const [mounted, setMounted] = useState(open);
  const [showNudge, setShowNudge] = useState(false);
  const alerts = ops.eightySixed.length + ops.promos.length + (ops.network === 'lte' ? 1 : 0);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Little "I'm over here" bubble so nobody misses the tab.
  useEffect(() => {
    if (!nudge || open) return;
    const show = window.setTimeout(() => setShowNudge(true), 900);
    const hide = window.setTimeout(() => setShowNudge(false), 11000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [nudge, open]);

  // Esc closes the floating drawer (never the pinned dock).
  useEffect(() => {
    if (!open || pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pinned, onOpenChange]);

  const togglePin = () => {
    const next = !pinned;
    onPinnedChange(next);
    try {
      localStorage.setItem(PIN_KEY, next ? '1' : '0');
    } catch {
      /* private mode — pin just won't persist */
    }
    if (next) onOpenChange(true);
  };

  const openIt = () => {
    setShowNudge(false);
    onOpenChange(true);
  };

  return (
    <>
      {/* ---------- Floating trigger pill (landing page) ---------- */}
      {!open && trigger === 'pill' && (
        <div className="fixed bottom-5 right-5 z-[45] flex flex-col items-end gap-2">
          {showNudge && (
            <div className="animate-pop-in relative max-w-[230px] rounded-2xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10">
              {cfg.nudge}
              <button
                onClick={() => setShowNudge(false)}
                aria-label="Dismiss"
                className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-700 p-0.5 text-white/80 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <button
            onClick={openIt}
            aria-expanded={false}
            aria-label="Open the Operator Copilot demo"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 py-3.5 pl-4 pr-5 text-sm font-extrabold text-white shadow-2xl ring-1 ring-white/25 transition hover:scale-[1.04]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <Bot className="h-5 w-5" />

            Operator Copilot Demo
            {alerts > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
                {alerts}
              </span>
            )}
            <ChevronRight className="h-4 w-4 animate-bob-x" />
          </button>
        </div>
      )}

      {/* ---------- Edge tab (collapsed state, work pages) ---------- */}
      {!open && trigger === 'tab' && (
        <div className="fixed left-0 top-1/2 z-[45] hidden -translate-y-1/2 items-center gap-2 md:flex">
          <button
            onClick={openIt}
            aria-expanded={false}
            aria-label={`Open the copilot — ${cfg.tabLabel}`}
            title={cfg.nudge}
            className="group relative flex items-center gap-2 rounded-r-2xl bg-gradient-to-b from-violet-700 via-fuchsia-700 to-orange-600 py-4 pl-2.5 pr-2 text-white shadow-2xl ring-1 ring-white/25 transition hover:pr-3.5"
          >
            <span className="flex flex-col items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <Bot className="h-5 w-5" />
              {/* Vertical label so the tab stays skinny but readable */}
              <span
                className="text-[11px] font-extrabold uppercase tracking-[0.2em]"
                style={{ writingMode: 'vertical-rl' }}
              >
                {cfg.tabLabel}
              </span>
              <ChevronRight className="h-4 w-4 animate-bob-x" />
              {alerts > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
                  {alerts}
                </span>
              )}
            </span>
          </button>

          {showNudge && (
            <div className="animate-pop-in relative max-w-[220px] rounded-2xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10">
              {cfg.nudge}
              <button
                onClick={() => setShowNudge(false)}
                aria-label="Dismiss"
                className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-700 p-0.5 text-white/80 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile launcher for the edge-tab pages (the pill already floats) */}
      {!open && trigger === 'tab' && (
        <button
          onClick={openIt}
          aria-label={`Open the copilot — ${cfg.tabLabel}`}
          className="fixed bottom-5 left-4 z-[45] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-3 text-sm font-extrabold text-white shadow-xl md:hidden"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Bot className="h-4 w-4" /> Copilot
          {alerts > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
              {alerts}
            </span>
          )}
        </button>
      )}


      {/* ---------- Scrim (floating mode only) ---------- */}
      {/* Sits above the sticky header (z-50) so the drawer reads as an overlay. */}
      {!pinned && (
        <div
          onClick={() => onOpenChange(false)}
          aria-hidden
          className={`fixed inset-0 z-[55] bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      )}

      {/* ---------- The drawer itself ---------- */}
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[60] w-[92%] max-w-[380px] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${pinned ? 'lg:shadow-none' : ''}`}
      >
        {mounted && (
          <CopilotSidebar
            menu={menu}
            seed={seed}
            mode={mode}
            onCollapse={() => onOpenChange(false)}
            canPin={canPin}
            pinned={pinned}
            onTogglePin={togglePin}
          />
        )}
      </aside>
    </>
  );
};

export default CopilotWorkspace;
