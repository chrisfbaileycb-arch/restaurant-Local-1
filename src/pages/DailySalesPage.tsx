import React, { useEffect, useState } from 'react';
import PageShell from '@/components/site/PageShell';
import CopilotDock from '@/components/site/CopilotDock';
import DailySalesSummary from '@/components/sales/DailySalesSummary';
import { loadShopMenu, DEMO_LOADED_MENU, type LoadedMenu } from '@/lib/menuStore';
import { useAuth } from '@/contexts/AuthContext';

export const DailySalesPage: React.FC = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState<LoadedMenu>(DEMO_LOADED_MENU);

  useEffect(() => {
    loadShopMenu(user?.id || null)
      .then(setMenu)
      .catch(() => setMenu(DEMO_LOADED_MENU));
  }, [user?.id]);

  return (
    <PageShell copilot={false}>
      <CopilotDock mode="close" menu={menu} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DailySalesSummary />
      </div>
    </PageShell>
  );
};

export default DailySalesPage;
