// ============================================================
// Operator Copilot — execution workflows.
//
// These are the hardwired action chains the copilot actually RUNS
// (not chat answers): build & ingestion, daily closeout, floor pings
// and hardware diagnostics.
//
// Everything references the shared platform data so a step can never
// drift from the real device drivers, reports or build stages.
// ============================================================

import {
  BUILD_STAGES,
  DEMO_TICKETS,
  DEVICE_KINDS,
  REPORTS,
  formatCents,
  type DeviceKindId,
} from '@/data/platform';
import { BUSINESS_TYPES } from '@/data/platform';
import type { CopilotModeId } from '@/data/copilotModes';

export type WorkflowStepState = 'idle' | 'running' | 'done' | 'flag';

export interface WorkflowStep {
  id: string;
  /** what the copilot says it is doing */
  label: string;
  /** the literal call it makes on the back end / device */
  command: string;
  /** what comes back when it finishes */
  output: string;
  /** how long the step takes to simulate, ms */
  ms: number;
  /** true when the result needs a human eye (renders amber) */
  flag?: boolean;
}

export interface CopilotWorkflow {
  id: string;
  /** which copilot hat this belongs to */
  mode: CopilotModeId;
  title: string;
  /** one line the operator understands */
  purpose: string;
  /** what the operator literally says to start it */
  trigger: string;
  /** words that fire this workflow from free text */
  keywords: string[];
  icon: string; // lucide icon name resolved by the component
  tone: string; // tailwind gradient
  /** deep link to the page this workflow belongs to, if any */
  href?: string;
  steps: WorkflowStep[];
  /** the line the copilot ends on */
  closing: string;
}

// ---------------- 1. Build & ingestion flow ----------------
// Concept → menu upload → parse verification → vibe review → deploy.
// Mirrors BUILD_STAGES so the tracker and the copilot never disagree.

const CONCEPT_LIST = BUSINESS_TYPES.map((b) => b.label).join(', ');

const BUILD_FLOW: CopilotWorkflow = {
  id: 'build-ingest',
  mode: 'website',
  title: 'Build & ingestion flow',
  purpose: 'Takes you from “here is my menu” to a live register and website.',
  trigger: 'Build my whole store',
  keywords: ['build', 'ingest', 'upload menu', 'set up', 'launch', 'go live', 'whole store'],
  icon: 'Rocket',
  tone: 'from-fuchsia-600 to-orange-500',
  href: '/onboarding',
  steps: [
    {
      id: 'concept',
      label: 'Confirm the concept',
      command: 'build.orchestrate(step: concept)',
      output: `Concept set. Layout, tax classes and station routing preset for your type (${CONCEPT_LIST}).`,
      ms: 700,
    },
    {
      id: 'upload',
      label: 'Read the menu you gave me',
      command: 'menu.ingest(photo | pdf | csv | url)',
      output: '54 items across 6 categories read. Sizes and prices captured with each.',
      ms: 1200,
    },
    {
      id: 'verify',
      label: 'Verify the parse',
      command: 'menu.placement(standard) + menu.modifiers(attach)',
      output: '3 items need a human: two prices were smudged and one has no category. Everything else is clean.',
      ms: 1100,
      flag: true,
    },
    {
      id: 'vibe',
      label: 'Review the brand vibe',
      command: 'vibe.matchTemplate(description)',
      output: 'Template matched, palette and type locked, logo mark drafted for approval.',
      ms: 900,
    },
    {
      id: 'deploy',
      label: 'Deploy the page and the register',
      command: `site.build() → ${BUILD_STAGES[3].title}`,
      output: 'Register grid live, one-page site published, 0% commission ordering switched on.',
      ms: 1000,
    },
  ],
  closing: 'Your store is built. Approve the three flagged items and you can ring a real ticket.',
};

// ---------------- 2. Daily shift & closeout ----------------

const CLOSE_REPORTS = REPORTS.filter((r) => r.cadence === 'Daily').map((r) => r.name);

const CLOSEOUT_FLOW: CopilotWorkflow = {
  id: 'shift-closeout',
  mode: 'floor',
  title: 'Daily shift closeout',
  purpose: 'Runs the Z, counts the drawer with you and flags anything strange.',
  trigger: 'Close out the day',
  keywords: ['close', 'closeout', 'z report', 'end of day', 'drawer', 'count', 'settle'],
  icon: 'ClipboardCheck',
  tone: 'from-violet-600 to-indigo-500',
  href: '/dashboard',
  steps: [
    {
      id: 'z',
      label: 'Run the Z / daily close',
      command: 'report.run(z-close)',
      output: `Gross ${formatCents(468030)} · net ${formatCents(432180)} · 216 tickets · avg ${formatCents(2167)}.`,
      ms: 1100,
    },
    {
      id: 'tender',
      label: 'Split it by tender',
      command: 'report.run(payments)',
      output: `Card ${formatCents(371450)} · cash ${formatCents(72580)} · tap 61% of card volume.`,
      ms: 800,
    },
    {
      id: 'drawer',
      label: 'Tally the cash drawer',
      command: 'drawer.blindCount()',
      output: `Counted ${formatCents(72190)} against ${formatCents(72580)} expected — ${formatCents(390)} short. Two no-sales at 8:14pm sit next to it.`,
      ms: 1000,
      flag: true,
    },
    {
      id: 'voids',
      label: 'Check discounts, voids and comps',
      command: 'report.run(discount)',
      output: '9 discounts, 2 voids, 1 comp. One void was rung after the ticket printed — Marco, 7:52pm.',
      ms: 900,
      flag: true,
    },
    {
      id: 'tips',
      label: 'Post tips and file the reports',
      command: `report.run(${CLOSE_REPORTS.length} daily reports)`,
      output: `${CLOSE_REPORTS.join(' · ')} filed to the dashboard and emailed to you.`,
      ms: 800,
    },
  ],
  closing: 'Day is closed. Two things want your eyes: the short drawer and the late void.',
};

// ---------------- 3. Real-time table & server pings ----------------

const readyTicket = DEMO_TICKETS[1];
const lateTicket = DEMO_TICKETS[3];

const FLOOR_PING_FLOW: CopilotWorkflow = {
  id: 'floor-pings',
  mode: 'floor',
  title: 'Table & server pings',
  purpose: 'Watches the pass and the dining room and pokes the right person.',
  trigger: 'Watch my floor',
  keywords: ['ping', 'floor', 'table', 'server', 'pass', 'ready', 'runner', 'expo'],
  icon: 'BellRing',
  tone: 'from-emerald-600 to-teal-500',
  href: '/pos',
  steps: [
    {
      id: 'watch',
      label: 'Attach to the ticket rail',
      command: 'floor.watch(stations: Kitchen, Bar)',
      output: `${DEMO_TICKETS.length} live tickets on the rail. Timers armed, red at 4 minutes.`,
      ms: 700,
    },
    {
      id: 'ready',
      label: 'Ticket bumped at the pass',
      command: `kds.bump(${readyTicket.id})`,
      output: `${readyTicket.table} is up: sent to ${readyTicket.server}'s phone — ticket ${readyTicket.id}.`,
      ms: 900,
    },
    {
      id: 'late',
      label: 'Window timer went red',
      command: `floor.escalate(${lateTicket.id})`,
      output: `${lateTicket.id} has sat ${lateTicket.minutes} minutes in the window. ${lateTicket.server} pinged twice, expo notified.`,
      ms: 900,
      flag: true,
    },
    {
      id: 'idle',
      label: 'Sweep for forgotten tables',
      command: 'floor.idleTables(minutes: 15)',
      output: 'Patio 5 has been seated 18 minutes with no order rung. Nearest server pinged.',
      ms: 800,
      flag: true,
    },
    {
      id: 'tabs',
      label: 'Check open tabs before close',
      command: 'floor.openTabs()',
      output: '2 tabs still open with pre-auth held. Neither is over an hour old.',
      ms: 700,
    },
  ],
  closing: 'I will keep watching. You only hear from me when something needs a person.',
};

// ---------------- 4. Device & hardware diagnostics ----------------
// Pulls the real driver commands off DEVICE_KINDS so the self-test
// matches what the hardware page says the device does.

const driver = (id: DeviceKindId) => DEVICE_KINDS.find((d) => d.id === id);
const step = (kind: DeviceKindId, actionId: string, label: string, ms: number, flag = false): WorkflowStep => {
  const d = driver(kind);
  const a = d?.actions.find((x) => x.id === actionId) || d?.actions[0];
  return {
    id: `${kind}-${actionId}`,
    label,
    command: a?.command || 'device.verify()',
    output: a?.result || 'Device answered.',
    ms,
    flag,
  };
};

const DEVICE_FLOW: CopilotWorkflow = {
  id: 'device-diagnostics',
  mode: 'equipment',
  title: 'Hardware self-test',
  purpose: 'Prints, kicks the drawer, reads a card and proves failover before you open.',
  trigger: 'Run a hardware self-test',
  keywords: ['device', 'printer', 'drawer', 'reader', 'pair', 'diagnostic', 'self test', 'failover', 'hardware'],
  icon: 'Stethoscope',
  tone: 'from-sky-600 to-cyan-500',
  href: '/devices',
  steps: [
    step('receipt-printer', 'test', 'ESC/POS print test on the guest printer', 900),
    step('kitchen-printer', 'test', 'Fire a test ticket to the line', 900),
    step('cash-drawer', 'open', 'Kick the drawer', 700),
    step('card-reader', 'test', 'Run a $0.00 card read', 1000),
    step('card-scan', 'scan', 'Pair the zero-hardware camera scan', 900),
    step('lte-router', 'test', 'Cut the broadband and prove LTE failover', 1200),
  ],
  closing: 'Every station answered. Anything that had not, I would have held order entry rather than let you find out at the rush.',
};

export const COPILOT_WORKFLOWS: CopilotWorkflow[] = [
  BUILD_FLOW,
  CLOSEOUT_FLOW,
  FLOOR_PING_FLOW,
  DEVICE_FLOW,
];

export const workflowById = (id: string) => COPILOT_WORKFLOWS.find((w) => w.id === id);

/** Workflows offered on a given surface, best match first. */
export const workflowsForMode = (mode: CopilotModeId) => [
  ...COPILOT_WORKFLOWS.filter((w) => w.mode === mode),
  ...COPILOT_WORKFLOWS.filter((w) => w.mode !== mode),
];

/** Match free text an operator typed to a workflow. */
export const matchWorkflow = (text: string): CopilotWorkflow | null => {
  const t = (text || '').toLowerCase().trim();
  if (!t) return null;
  let best: { w: CopilotWorkflow; hits: number } | null = null;
  COPILOT_WORKFLOWS.forEach((w) => {
    const hits = w.keywords.filter((k) => t.includes(k)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { w, hits };
  });
  return best ? best.w : null;
};

export const totalRunMs = (w: CopilotWorkflow) => w.steps.reduce((s, st) => s + st.ms, 0);
