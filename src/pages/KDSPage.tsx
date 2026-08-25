import React from 'react';
import PageShell from '@/components/site/PageShell';
import CopilotDock from '@/components/site/CopilotDock';
import KitchenDisplaySystem from '@/components/kds/KitchenDisplaySystem';
import { DEMO_LOADED_MENU } from '@/lib/menuStore';

export const KDSPage: React.FC = () => {
  return (
    <PageShell copilot={false}>
      <CopilotDock mode="floor" menu={DEMO_LOADED_MENU} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <KitchenDisplaySystem />
      </div>
    </PageShell>
  );
};

export default KDSPage;
