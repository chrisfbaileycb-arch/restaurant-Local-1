// ------------------------------------------------------------
// Copilot modes — the copilot changes hats depending on the page
// it is mounted on. One source of truth for greetings, quick
// actions and suggested prompts per surface.
//
// floor    → the register / marketing demo (86s, splits, close)
// website  → building the hosted one-page site & online ordering
// equipment→ picking hardware and building a kit to a budget
// ------------------------------------------------------------

import type { QuickAction } from '@/data/copilot';

export type CopilotModeId = 'floor' | 'website' | 'equipment';

export interface CopilotMode {
  id: CopilotModeId;
  /** Label on the edge tab so an operator knows what help is behind it. */
  tabLabel: string;
  /** Small line under the copilot name in the header. */
  role: string;
  /** First message in the stream. */
  greeting: string;
  quickActions: QuickAction[];
  suggestions: string[];
  /** Bubble that pops next to the tab the first time you land on the page. */
  nudge: string;
}

const WEBSITE_ACTIONS: QuickAction[] = [
  {
    id: 'site-plan',
    label: 'Build my page',
    icon: 'Globe',
    command: 'Build my website page',
    hint: 'Lays out the exact one-page site we host for you.',
  },
  {
    id: 'site-hours',
    label: 'Hours from Google',
    icon: 'Clock',
    command: 'How do my hours stay right?',
    hint: 'Google Business Profile sync, checked hourly.',
  },
  {
    id: 'site-photos',
    label: 'Menu photos',
    icon: 'ImageIcon',
    command: 'How do menu photos work?',
    hint: 'Snap once — POS button, ordering page and website all update.',
  },
  {
    id: 'site-ordering',
    label: 'Online ordering',
    icon: 'ShoppingBag',
    command: 'Set up online ordering',
    hint: '0% commission ordering wired to the same menu.',
  },
  {
    id: 'site-domain',
    label: 'Domain & hosting',
    icon: 'Server',
    command: 'What about my domain and hosting?',
    hint: 'Domain, SSL, renewals and uptime are ours.',
  },
];

const EQUIPMENT_ACTIONS: QuickAction[] = [
  {
    id: 'gear-recommend',
    label: 'Spec my kit',
    icon: 'Package',
    command: 'Recommend equipment for my shop',
    hint: 'Tell me your concept and I will spec the gear.',
  },
  {
    id: 'gear-budget',
    label: 'Cheapest way to open',
    icon: 'Wallet',
    command: 'What is the cheapest way to open?',
    hint: 'Phone-only start, add gear when business is good.',
  },
  {
    id: 'gear-truck',
    label: 'Food truck kit',
    icon: 'Truck',
    command: 'Recommend equipment for a food truck',
    hint: 'LTE failover, battery power, window mount.',
  },
  {
    id: 'gear-kitchen',
    label: 'Do I need a kitchen printer?',
    icon: 'ChefHat',
    command: 'Do I need a kitchen printer?',
    hint: 'When a ticket printer beats shouting down the line.',
  },
  {
    id: 'gear-cost',
    label: 'What will it cost?',
    icon: 'Receipt',
    command: 'What will this cost me monthly?',
    hint: 'Setup fee, software and hardware, all in.',
  },
];

export const COPILOT_MODES: Record<CopilotModeId, CopilotMode> = {
  floor: {
    id: 'floor',
    tabLabel: 'Operator Copilot',
    role: 'Watching the floor',
    greeting:
      'Copilot online. Tell me what changed on the floor and I will push it to the register, the online cart and your website together.',
    quickActions: [],
    suggestions: [],
    nudge: 'Need a hand on the register? I am right here.',
  },
  website: {
    id: 'website',
    tabLabel: 'Copilot · Build my store',
    role: 'Helping you build the store',
    greeting:
      'I am your build copilot. I can lay out your one-page website, wire up online ordering, sync your hours from Google and tell you exactly what I still need from you. Ask me anything while you set this up.',
    quickActions: WEBSITE_ACTIONS,
    suggestions: [
      'Build my website page',
      'Set up online ordering',
      'How do menu photos work?',
      'What about my domain and hosting?',
      'What do you still need from me?',
      'Recommend equipment for my shop',
    ],
    nudge: 'Setting up your store? Ask me and I will walk it with you.',
  },
  equipment: {
    id: 'equipment',
    tabLabel: 'Copilot · Pick my gear',
    role: 'Speccing your hardware',
    greeting:
      'I can spec your hardware. Tell me your concept — truck, coffee, bakery, restaurant — and roughly what you want to spend, and I will build the kit and tell you what you can skip.',
    quickActions: EQUIPMENT_ACTIONS,
    suggestions: [
      'Recommend equipment for a coffee shop',
      'What is the cheapest way to open?',
      'Recommend equipment for a food truck',
      'Do I need a kitchen printer?',
      'What will this cost me monthly?',
      'What happens if the internet goes out?',
    ],
    nudge: 'Not sure what gear you need? I will spec it for you.',
  },
};
