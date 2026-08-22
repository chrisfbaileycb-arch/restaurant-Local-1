import React from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CopilotDock from '@/components/site/CopilotDock';
import OperatorCopilot from '@/components/copilot/OperatorCopilot';
import type { CopilotModeId } from '@/data/copilotModes';

/**
 * Every page gets:
 *  • the sidebar build agent (CopilotDock) unless it mounts its own —
 *    POS, Onboarding, Dashboard, StarterKit and Templates pass `copilot={false}`
 *  • the floating Operator Copilot trigger, on EVERY screen, which runs the
 *    hardwired execution workflows (build & ingestion, closeout, floor pings,
 *    hardware self-test). Pass `workflows={false}` to suppress it.
 */
const PageShell: React.FC<{
  children: React.ReactNode;
  copilot?: CopilotModeId | false;
  workflows?: CopilotModeId | false;
}> = ({ children, copilot = 'website', workflows }) => {
  const workflowMode: CopilotModeId | false =
    workflows === undefined ? (copilot === false ? 'floor' : copilot) : workflows;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-white to-fuchsia-50/50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {copilot !== false && <CopilotDock mode={copilot} />}
      {workflowMode !== false && <OperatorCopilot mode={workflowMode} />}
    </div>
  );
};

export default PageShell;
