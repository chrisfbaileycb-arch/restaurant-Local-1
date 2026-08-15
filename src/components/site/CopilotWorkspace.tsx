import React, { useState } from 'react';
import { Bot, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import CopilotSidebar from '@/components/site/CopilotSidebar';
import { useOps } from '@/lib/opsStore';
import type { LoadedMenu } from '@/lib/menuStore';

interface Props {
  menu: LoadedMenu;
  collapsed: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * Left rail of the two-column workspace. Fixed 380px on desktop (collapses to a
 * slim spine), slide-over on phones. The page itself keeps the remaining width,
 * so the copilot is always on screen while the operator works.
 */
const CopilotWorkspace: React.FC<Props> = ({ menu, collapsed, onToggle }) => {
  const [openMobile, setOpenMobile] = useState(false);
  const ops = useOps();
  const alerts = ops.eightySixed.length + ops.promos.length + (ops.network === 'lte' ? 1 : 0);

  return (
    <>
      {/* ---------- Desktop rail ---------- */}
      {collapsed ? (
        <div className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center gap-3 border-r border-slate-800 bg-slate-900 py-4 lg:flex">
          <button
            onClick={() => onToggle(false)}
            aria-label="Open the Operator Copilot"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          {alerts > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
              {alerts}
            </span>
          )}
          <span className="mt-2 rotate-180 text-[10px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-rl]">
            Operator Copilot
          </span>
        </div>
      ) : (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[380px] border-r border-slate-800 lg:block">
          <div className="relative h-full">
            <button
              onClick={() => onToggle(true)}
              aria-label="Collapse the copilot"
              className="absolute right-2 top-3 z-10 rounded-lg p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <CopilotSidebar menu={menu} />
          </div>
        </aside>
      )}

      {/* ---------- Mobile launcher + drawer ---------- */}
      <button
        onClick={() => setOpenMobile(true)}
        className="fixed bottom-5 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-extrabold text-white shadow-xl lg:hidden"
      >
        <Bot className="h-4 w-4" /> Copilot
        {alerts > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-extrabold text-slate-900">
            {alerts}
          </span>
        )}
      </button>

      {openMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpenMobile(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[92%] max-w-[380px] flex-col shadow-2xl">
            <button
              onClick={() => setOpenMobile(false)}
              aria-label="Close the copilot"
              className="absolute right-2 top-3 z-20 rounded-lg p-1.5 text-white/80 hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
            <CopilotSidebar menu={menu} />
          </div>
        </div>
      )}
    </>
  );
};

export default CopilotWorkspace;
