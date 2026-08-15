import React, { useCallback, useEffect, useRef, useState } from 'react';

import CopilotWorkspace, { readPinned } from '@/components/site/CopilotWorkspace';
import type { CopilotSeed } from '@/components/site/CopilotSidebar';
import type { CopilotModeId } from '@/data/copilotModes';
import { useAuth } from '@/contexts/AuthContext';
import { loadShopMenu, DEMO_LOADED_MENU } from '@/lib/menuStore';
import type { LoadedMenu } from '@/lib/menuStore';

/**
 * Drop-in copilot for any page: loads the shop menu, owns the open /
 * pinned / seed state and renders the slide-out drawer with its edge tab.
 *
 * Any component anywhere can open it (and optionally play a command) with:
 *   window.dispatchEvent(new CustomEvent('lle:copilot', { detail: { command: '…' } }))
 */
const CopilotDock: React.FC<{ mode: CopilotModeId; menu?: LoadedMenu }> = ({ mode, menu }) => {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<LoadedMenu>(menu || DEMO_LOADED_MENU);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [seed, setSeed] = useState<CopilotSeed | null>(null);
  const seedCount = useRef(0);

  useEffect(() => {
    if (menu) {
      setLoaded(menu);
      return;
    }
    let cancelled = false;
    loadShopMenu(user?.id || null)
      .then((m) => !cancelled && setLoaded(m))
      .catch(() => !cancelled && setLoaded(DEMO_LOADED_MENU));
    return () => {
      cancelled = true;
    };
  }, [menu, user?.id]);

  // A signed-in operator who pinned it last shift gets it docked again.
  useEffect(() => {
    if (user && readPinned()) {
      setPinned(true);
      setOpen(true);
    }
  }, [user]);

  const openWith = useCallback((command?: string) => {
    setOpen(true);
    if (command) {
      seedCount.current += 1;
      setSeed({ text: command, nonce: seedCount.current });
    }
  }, []);

  // Global open event — buttons anywhere on the page can call the copilot.
  useEffect(() => {
    const handler = (e: Event) => openWith((e as CustomEvent)?.detail?.command);
    window.addEventListener('lle:copilot', handler as EventListener);
    return () => window.removeEventListener('lle:copilot', handler as EventListener);
  }, [openWith]);

  // While pinned on a wide screen, push the page over so the drawer sits
  // beside the work instead of on top of it.
  useEffect(() => {
    const apply = () => {
      const wide = window.matchMedia('(min-width: 1024px)').matches;
      document.body.style.paddingLeft = pinned && open && wide ? '380px' : '';
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.body.style.paddingLeft = '';
    };
  }, [pinned, open]);

  return (
    <CopilotWorkspace
      menu={loaded}
      mode={mode}
      open={open}
      onOpenChange={setOpen}
      pinned={pinned}
      onPinnedChange={setPinned}
      canPin={!!user}
      seed={seed}
      nudge
    />
  );
};

/** Fire from any button: opens the dock and optionally runs a command. */
export const askCopilot = (command?: string) =>
  window.dispatchEvent(new CustomEvent('lle:copilot', { detail: { command } }));

export default CopilotDock;
