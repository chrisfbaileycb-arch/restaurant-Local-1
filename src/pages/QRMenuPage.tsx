import React, { useEffect, useState } from 'react';
import PageShell from '@/components/site/PageShell';
import CopilotDock from '@/components/site/CopilotDock';
import QRMenuGenerator from '@/components/qr/QRMenuGenerator';
import { loadShopMenu, DEMO_LOADED_MENU, type LoadedMenu } from '@/lib/menuStore';
import { useAuth } from '@/contexts/AuthContext';

export const QRMenuPage: React.FC = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState<LoadedMenu>(DEMO_LOADED_MENU);

  useEffect(() => {
    loadShopMenu(user?.id || null)
      .then(setMenu)
      .catch(() => setMenu(DEMO_LOADED_MENU));
  }, [user?.id]);

  return (
    <PageShell copilot={false}>
      <CopilotDock mode="build" menu={menu} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <QRMenuGenerator
          shopName={menu.shopName}
          menuItems={menu.items.map((i) => ({ name: i.name, category: i.category }))}
        />
      </div>
    </PageShell>
  );
};

export default QRMenuPage;
