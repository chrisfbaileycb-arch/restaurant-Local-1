import React, { useEffect, useState } from 'react';
import { Bot, ChevronRight } from 'lucide-react';

import CopilotSidebar, { type CopilotSeed } from '@/components/site/CopilotSidebar';
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
}

/**
 * Collapsible slide-out drawer for the Operator Copilot.
 *
 * Public landing page: collapsed by default, so the hero stays full width.
 * A floating edge trigger slides the panel in over the page.
 * Signed-in operators can PIN it, which docks it beside the live register
 * instead of floating over the content.
 */
const CopilotWorkspace: React.FC<Props> = ({
  menu, open, onOpenChange, pinned, onPinnedChange, canPin, seed,
}) => {
  const ops = useOps();
  // Mount once, then keep it mounted so the conversation history and any
  // in-flight command survive a collapse.
  const [mounted, setMounted] = useState(open);
  const alerts = ops.eightySixed.length + ops.promos.length + (ops.network === 'lte' ? 1 : 0);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

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

  const panel = (
    <CopilotSidebar
      menu={menu}
      seed={seed}
      onCollapse={() => onOpenChange(false)}
      canPin={canPin}
      pinned={pinned}
      onTogglePin={togglePin}
    />
  );

  return (
    <>
      {/* ---------- Floating edge trigger (collapsed state) ---------- */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          aria-expanded={false}
          aria-label="Open the Operator Copilot demo"
          className="group fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-r-2xl bg-gradient-to-r from-violet-700 via-fuchsia-700 to-orange-600 py-3 pl-3 pr-4 text-white shadow-2xl ring-1 ring-white/20 transition hover:pr-5 md:inline-flex"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <Bot className="h-5 w-5" />
          <span className="text-sm font-extrabold tracking-tight">Operator Copilot Demo</span>
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          {alerts > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
              {alerts}
            </span>
          )}
        </button>
      )}

      {/* Mobile launcher */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          aria-label="Open the Operator Copilot demo"
          className="fixed bottom-5 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-3 text-sm font-extrabold text-white shadow-xl md:hidden"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Bot className="h-4 w-4" /> Copilot Demo
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
        {mounted && panel}
      </aside>

    </>
  );
};

export default CopilotWorkspace;
