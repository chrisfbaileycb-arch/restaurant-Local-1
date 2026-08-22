import React from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CopilotDock from '@/components/site/CopilotDock';
import type { CopilotModeId } from '@/data/copilotModes';

/**
 * Every page gets the sidebar build agent by default.
 * Pages that mount their own CopilotDock (POS, Onboarding, Dashboard,
 * StarterKit, Templates) pass `copilot={false}` so there is only ever one.
 */
const PageShell: React.FC<{
  children: React.ReactNode;
  copilot?: CopilotModeId | false;
}> = ({ children, copilot = 'website' }) => (
  <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-white to-fuchsia-50/50">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    {copilot !== false && <CopilotDock mode={copilot} />}
  </div>
);

export default PageShell;
