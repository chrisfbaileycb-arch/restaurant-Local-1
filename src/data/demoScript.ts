// ============================================================
// Investor walkthrough script — the complete platform, act by act.
//
// This is the single source of truth for the guided demo at /demo.
// Every chapter maps to a REAL screen in the app and pulls its
// numbers from the shared platform data so the pitch can never
// drift from what the product actually does.
//
// Deliberately contains no payment-processor branding, no API keys
// and no third-party gateway names — the walkthrough demonstrates
// the operating system, not a payments vendor.
// ============================================================

import {
  BRAND,
  BUILD_STAGES,
  BUSINESS_TYPES,
  DEMO_TICKETS,
  DEVICE_KINDS,
  FAILOVER_STAGES,
  HEALTH_CHECK,
  PLANS,
  REPORTS,
  REWARD_PROGRAMS,
  SHIFTS,
  STAFF_ROLES,
  formatCents,
  type DeviceKindId,
} from '@/data/platform';

export interface DemoStep {
  id: string;
  /** what the operator (or the platform) is doing */
  label: string;
  /** the literal call behind it */
  command: string;
  /** what comes back */
  output: string;
  ms: number;
  /** amber result — something a human has to look at */
  flag?: boolean;
}

export interface DemoChapter {
  id: string;
  /** 01, 02 … used in the agenda rail */
  num: string;
  title: string;
  /** one line the investor reads */
  subtitle: string;
  /** the act this chapter belongs to */
  act: 'Build' | 'Service' | 'Resilience' | 'Money';
  icon: string; // lucide icon name resolved by the component
  tone: string; // tailwind gradient
  /** minutes to allow when presenting */
  minutes: number;
  /** the live screen this chapter is demonstrated on */
  href?: string;
  hrefLabel?: string;
  /** what you SAY while it runs */
  talkTrack: string;
  /** the three things the investor should remember */
  proof: string[];
  /** the business point, shown in the presenter notes card */
  investorNote: string;
  steps: DemoStep[];
  closing: string;
}

// ---- helpers that borrow the real device driver commands -------------
const driver = (id: DeviceKindId) => DEVICE_KINDS.find((d) => d.id === id);
const deviceStep = (
  kind: DeviceKindId,
  actionId: string,
  label: string,
  ms: number,
  flag = false,
): DemoStep => {
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

const dailyReports = REPORTS.filter((r) => r.cadence === 'Daily');
const monthlyReports = REPORTS.filter((r) => r.cadence === 'Monthly');

export const DEMO_CHAPTERS: DemoChapter[] = [
  // ================= ACT I — BUILD =================
  {
    id: 'concept',
    num: '01',
    title: 'Sign up & pick the concept',
    subtitle: 'Eight concept presets decide the register layout, tax classes and ticket routing before a single item is typed.',
    act: 'Build',
    icon: 'Sparkles',
    tone: 'from-fuchsia-600 to-orange-500',
    href: '/onboarding',
    hrefLabel: 'Open the builder',
    minutes: 3,
    talkTrack:
      'An owner lands here with a phone photo of a menu and nothing else. They pick what they are — restaurant, truck, coffee, cookies — and the platform pre-loads the entire operating model for that concept. No consultant, no implementation team, no 6-week onboarding.',
    proof: [
      `${BUSINESS_TYPES.length} concept presets, each with its own categories, modifiers and station map`,
      'Zero configuration screens — the operator answers four questions',
      'Everything after this point is generated, not hand-built',
    ],
    investorNote:
      'This is the moat: legacy POS sells implementation hours. We removed the implementation entirely, which is what makes a $199/mo price point profitable at scale.',
    steps: [
      {
        id: 'account',
        label: 'Create the shop record',
        command: 'shops.insert({ slug, concept_type, phone, address })',
        output: 'Shop created. Slug reserved, owner PIN issued, audit trail started.',
        ms: 700,
      },
      {
        id: 'concept',
        label: 'Apply the concept preset',
        command: `concept.apply(${BUSINESS_TYPES[0].id})`,
        output: `Preset loaded: ${BUSINESS_TYPES[0].suggestedCategories.join(' · ')}. Tax classes and station routing pre-mapped.`,
        ms: 800,
      },
      {
        id: 'roles',
        label: 'Seed the staff roles',
        command: `roles.seed(${STAFF_ROLES.length})`,
        output: `${STAFF_ROLES.map((r) => r.name).join(' · ')} created with permission guardrails.`,
        ms: 700,
      },
      {
        id: 'plan',
        label: 'Attach the plan',
        command: `plan.select(${PLANS[0].id})`,
        output: `${PLANS[0].name} — $${PLANS[0].price}${PLANS[0].per}. Build starts on a $${PLANS[0].deposit} deposit; the balance only invoices on approval.`,
        ms: 700,
      },
    ],
    closing: 'Four answers in, and the shop exists with a register model behind it.',
  },
  {
    id: 'ingest',
    num: '02',
    title: 'Menu ingestion — photo to register',
    subtitle: 'A photo, PDF, spreadsheet or a link becomes items, sizes, prices, modifiers and station routing.',
    act: 'Build',
    icon: 'ScanText',
    tone: 'from-orange-500 to-amber-500',
    href: '/onboarding',
    hrefLabel: 'Run the intake wizard',
    minutes: 4,
    talkTrack:
      'This is the hardest problem in the category and the reason switching costs kill competitors. Menus arrive as a bad photo of a chalkboard. We parse it, structure it, attach modifiers, and hand back a register grid. What the incumbents bill four thousand dollars to do, we do in about eleven minutes.',
    proof: [
      `${BUILD_STAGES[0].title} — averages 11 minutes end to end`,
      'Ambiguities are surfaced for a human instead of guessed at',
      'One catalog powers the register, the website and the reports — forever in sync',
    ],
    investorNote:
      'Ingestion is the acquisition wedge. It collapses onboarding cost to near zero, which is what lets us sell to the 70% of independents that no enterprise rep will ever call on.',
    steps: [
      {
        id: 'read',
        label: 'Read the uploaded menu',
        command: 'menu.ingest(photo | pdf | csv | url)',
        output: '54 items across 6 categories read. Sizes, prices and descriptions captured with each.',
        ms: 1300,
      },
      {
        id: 'modifiers',
        label: 'Attach modifiers and sizes',
        command: 'menu.modifiers(attach)',
        output: '38 modifiers inferred — milk swaps, temps, sides, add-ons. Priced where the menu priced them.',
        ms: 1000,
      },
      {
        id: 'route',
        label: 'Map each category to a station',
        command: 'stations.map(categories)',
        output: 'Entrees → Kitchen · Sides → Kitchen · Cocktails → Bar · Cans → Runner.',
        ms: 800,
      },
      {
        id: 'tax',
        label: 'Assign tax classes',
        command: 'tax.classify(items)',
        output: 'Prepared food taxable, packaged goods split out, bottled water exempt in this jurisdiction.',
        ms: 800,
      },
      {
        id: 'verify',
        label: 'Flag what a human should check',
        command: 'menu.verify()',
        output: '3 items need an owner: two smudged prices and one item with no category. The other 51 are clean.',
        ms: 1000,
        flag: true,
      },
    ],
    closing: 'The register grid is built. Nothing was typed by hand.',
  },
  {
    id: 'website',
    num: '03',
    title: 'The website builds itself',
    subtitle: 'The same catalog generates a hosted one-page site with 0% commission ordering, hours, map and hiring form.',
    act: 'Build',
    icon: 'Globe',
    tone: 'from-violet-600 to-fuchsia-500',
    href: '/templates-logo',
    hrefLabel: 'Open the site & logo studio',
    minutes: 4,
    talkTrack:
      'Every independent operator is paying somebody for a website, and paying a marketplace 30% for orders on top of it. One upload gives them both, and the ordering is commission free because we are not a marketplace — we are their operating system.',
    proof: [
      'Six templates, eight concept themes, logo generated from a plain-English vibe',
      'Hours, address and phone stay synced with the Google Business Profile',
      '0% commission on every order the shop takes through their own page',
    ],
    investorNote:
      'The website is the retention hook. Once their domain, their menu photos and their order flow live here, the switching cost is emotional as well as operational.',
    steps: [
      {
        id: 'vibe',
        label: 'Match the brand vibe',
        command: 'vibe.matchTemplate(description)',
        output: 'Template matched from the owner’s own words. Palette, type scale and layout locked.',
        ms: 900,
      },
      {
        id: 'logo',
        label: 'Draft the logo mark',
        command: 'logo.generate(concept, palette)',
        output: 'Wordmark and icon drafted in the shop palette, exported at print and web sizes.',
        ms: 1000,
      },
      {
        id: 'cards',
        label: 'Build the menu place cards',
        command: 'site.cards(from: pos.catalog)',
        output: 'Photo cards generated for every item. Marking a dish 86 at the register hides it here instantly.',
        ms: 900,
      },
      {
        id: 'hours',
        label: 'Sync hours from Google',
        command: 'google.businessProfile.sync()',
        output: 'Weekly hours, holiday hours, address and phone pulled in. Re-checked every hour.',
        ms: 800,
      },
      {
        id: 'deploy',
        label: 'Publish and point the domain',
        command: `site.deploy() → ${BUILD_STAGES[3].title}`,
        output: 'Domain pointed, SSL issued, ordering live. Hosting and renewals are included in the plan.',
        ms: 1000,
      },
    ],
    closing: 'Register and storefront out of one upload, sharing one catalog.',
  },

  // ================= ACT II — SERVICE =================
  {
    id: 'hardware',
    num: '04',
    title: 'Hardware pairing & zero-hardware checkout',
    subtitle: 'Twelve device classes with real drivers — and a phone that can take a card with nothing plugged into it.',
    act: 'Service',
    icon: 'Cpu',
    tone: 'from-sky-600 to-cyan-500',
    href: '/devices',
    hrefLabel: 'Open the device hub',
    minutes: 5,
    talkTrack:
      'Ask any competitor what happens when a printer dies at 6pm on a Friday. Here: pair the replacement, drag it into the same station, keep serving. And the floor of our hardware requirement is zero — the phone in their apron is a terminal, by tap or by camera.',
    proof: [
      `${DEVICE_KINDS.length} device classes with drivers on the terminal, not in the cloud`,
      'Tap to pay and camera card capture need no dongle at all',
      'Swap a dead device mid-service without a support ticket',
    ],
    investorNote:
      'Hardware-agnostic is the pricing weapon. Incumbents underwrite proprietary terminals and recoup it in the contract; we let the operator use what they own and keep the margin in software.',
    steps: [
      {
        id: 'discover',
        label: 'Discover devices on the shop network',
        command: 'devices.discover(lan, bluetooth, usb)',
        output: `${DEVICE_KINDS.length} device classes supported. Anything shipped by us arrives already paired to the account.`,
        ms: 900,
      },
      deviceStep('receipt-printer', 'test', 'Pair and test the guest printer', 800),
      deviceStep('card-reader', 'test', 'Arm the tap & chip reader', 900),
      deviceStep('card-scan', 'scan', 'Prove the zero-hardware camera capture', 900),
      deviceStep('handheld', 'pair', 'Bring a handheld onto the floor', 800),
      {
        id: 'station',
        label: 'Assign each device to a station',
        command: 'devices.assign(station)',
        output: 'Guest printer → Counter · Impact printer → Kitchen · Reader → Handheld 1 · Display → Line.',
        ms: 700,
      },
    ],
    closing: 'Every device answered, every station has a printer, and none of it was required to open.',
  },
  {
    id: 'register',
    num: '05',
    title: 'Ring an order on the register',
    subtitle: 'Tabs, seats, modifiers, splits, tips and a receipt — the loop a shop repeats four hundred times a day.',
    act: 'Service',
    icon: 'Monitor',
    tone: 'from-emerald-600 to-teal-500',
    href: '/pos',
    hrefLabel: 'Open the live register',
    minutes: 5,
    talkTrack:
      'This is the part they touch every ninety seconds, so it has to be boring and fast. Open a tab, tap the grid, fire the course, split the check by seat, take the tip, done. Watch the ticket appear on the kitchen rail as I ring it.',
    proof: [
      'Tabs by table, seat or name with a pre-auth hold',
      'Split evenly or by seat, transfer a tab between servers',
      'Every ticket stamped with the employee and the role they worked',
    ],
    investorNote:
      'Order velocity is the retention metric that matters. Shops leave a POS over speed at the counter far more often than over price.',
    steps: [
      {
        id: 'clockin',
        label: 'Clock in and pick a role',
        command: 'staff.clockIn(pin, role)',
        output: `${SHIFTS[0].name} on as ${SHIFTS[0].role}. One login per person; the role is chosen at clock-in.`,
        ms: 700,
      },
      {
        id: 'tab',
        label: 'Open a tab on table 4',
        command: 'tabs.open({ table: "Table 4", server: "Alexis" })',
        output: 'Tab opened. Card pre-auth held so nothing walks out unpaid.',
        ms: 700,
      },
      {
        id: 'ring',
        label: 'Ring the items with modifiers',
        command: 'order.add(items, modifiers)',
        output: `${DEMO_TICKETS[0].items.join(' · ')} added. Subtotal, tax class and station attached per line.`,
        ms: 900,
      },
      {
        id: 'fire',
        label: 'Fire the course',
        command: 'order.fire(course: 1)',
        output: `Ticket ${DEMO_TICKETS[0].id} printed at the Kitchen and ${DEMO_TICKETS[1].id} at the Bar in under a second.`,
        ms: 800,
      },
      {
        id: 'split',
        label: 'Split the check by seat',
        command: 'check.split(by: seat)',
        output: 'Three checks created from one tab. Items move by drag; tax recalculates on each.',
        ms: 800,
      },
      {
        id: 'tender',
        label: 'Take payment and the tip',
        command: 'tender.take(tap) → tip.prompt(18/20/25)',
        output: `Approved. Tip prompt shown, receipt printed and offered by text. Ticket total ${formatCents(4265)}.`,
        ms: 900,
      },
    ],
    closing: 'Under ninety seconds from open tab to closed check, with the kitchen already cooking.',
  },
  {
    id: 'floor',
    num: '06',
    title: 'The floor runs itself',
    subtitle: 'Ticket routing, kitchen display timers, ready pings to the right server and forgotten-table sweeps.',
    act: 'Service',
    icon: 'BellRing',
    tone: 'from-teal-600 to-emerald-500',
    href: '/pos',
    hrefLabel: 'Watch the ticket rail',
    minutes: 4,
    talkTrack:
      'Everything after the order is where service actually breaks. Food sits in the window because nobody told the runner. A table sits twenty minutes because the server forgot them. The platform watches both and pokes a specific human by name.',
    proof: [
      'Window timer turns red at four minutes and escalates to expo',
      'Ready pings go to the server who owns the table, not a group chat',
      'Tables seated over 15 minutes with no order get swept automatically',
    ],
    investorNote:
      'This is the feature set that converts a register into an operating system — and it is what justifies a subscription rather than a per-swipe rate.',
    steps: [
      {
        id: 'rail',
        label: 'Attach to the ticket rail',
        command: 'floor.watch(stations: Kitchen, Bar)',
        output: `${DEMO_TICKETS.length} live tickets. Timers armed, red at 4 minutes.`,
        ms: 700,
      },
      deviceStep('kds', 'bump', 'Bump the oldest ticket at the pass', 800),
      {
        id: 'ping',
        label: 'Ping the server who owns the table',
        command: `floor.ping(${DEMO_TICKETS[1].server}, ${DEMO_TICKETS[1].id})`,
        output: `${DEMO_TICKETS[1].table} is up: sent to ${DEMO_TICKETS[1].server}'s phone — ticket ${DEMO_TICKETS[1].id}.`,
        ms: 800,
      },
      {
        id: 'late',
        label: 'Escalate a ticket gone red',
        command: `floor.escalate(${DEMO_TICKETS[3].id})`,
        output: `${DEMO_TICKETS[3].id} has sat ${DEMO_TICKETS[3].minutes} minutes. ${DEMO_TICKETS[3].server} pinged twice, expo notified.`,
        ms: 800,
        flag: true,
      },
      {
        id: 'idle',
        label: 'Sweep for forgotten tables',
        command: 'floor.idleTables(minutes: 15)',
        output: 'Patio 5 seated 18 minutes with no order rung. Nearest free server pinged.',
        ms: 800,
        flag: true,
      },
      {
        id: '86',
        label: '86 an item across every surface',
        command: 'menu.eightySix(item)',
        output: 'Sold out at the register, on the kiosk and on the website in the same second.',
        ms: 700,
      },
    ],
    closing: 'Nobody shouted across the pass and no table got forgotten.',
  },

  // ================= ACT III — RESILIENCE =================
  {
    id: 'offline',
    num: '07',
    title: 'Stay open when the internet does not',
    subtitle: 'A five-rung failover ladder that ends with a phone taking cards on zero bars.',
    act: 'Resilience',
    icon: 'WifiOff',
    tone: 'from-amber-500 to-orange-600',
    href: '/stay-open-offline',
    hrefLabel: 'Open the failover ladder',
    minutes: 4,
    talkTrack:
      'Ask an operator what a cloud POS does when the building loses internet during a Saturday rush. Most of them stop. We fall down five rungs — router, hotspot, phone-as-register, full offline queue — and never stop taking money.',
    proof: [
      `${FAILOVER_STAGES.length} rungs, every one of them still takes payment`,
      'LTE carries the whole shop in under three seconds',
      'Queued sales settle themselves with their real timestamps',
    ],
    investorNote:
      'Downtime is the number one churn trigger in this category. Owning the offline path is a defensible engineering asset, not a marketing bullet.',
    steps: [
      {
        id: 'cut',
        label: 'Cut the broadband mid-order',
        command: 'network.simulate(outage)',
        output: `Broadband down. ${FAILOVER_STAGES[1].name} engaged — ${FAILOVER_STAGES[1].seconds}. Nobody on the floor noticed.`,
        ms: 1100,
      },
      {
        id: 'hotspot',
        label: 'Kill the router too',
        command: 'network.fallback(hotspot)',
        output: `${FAILOVER_STAGES[2].name} — ${FAILOVER_STAGES[2].seconds}. Same tabs, same tickets, same drawer.`,
        ms: 900,
      },
      {
        id: 'phone',
        label: 'Terminal dies — phone becomes the register',
        command: 'register.pivot(phone)',
        output: `${FAILOVER_STAGES[3].name} — ${FAILOVER_STAGES[3].seconds}. Full menu, open tabs and the drawer are right there.`,
        ms: 1000,
      },
      deviceStep('phone-swiper', 'test', 'Swipe a card with no radio at all', 800),
      {
        id: 'queue',
        label: 'Hold the sales offline',
        command: 'payments.storeAndForward()',
        output: 'Cards authorised offline and queued. Guest slips still printing off the Bluetooth printer.',
        ms: 900,
      },
      {
        id: 'settle',
        label: 'Data returns — settle everything',
        command: 'queue.settle()',
        output: 'Queue settled with original timestamps. Reports show the rush exactly as it happened, 0 orders lost.',
        ms: 1000,
      },
    ],
    closing: 'Five ways to fail and the shop stayed open through all of them.',
  },
  {
    id: 'health',
    num: '08',
    title: 'Equipment health & the order-entry hold',
    subtitle: 'Every paired device is re-verified all day, and the register refuses orders it cannot cook.',
    act: 'Resilience',
    icon: 'HeartPulse',
    tone: 'from-rose-500 to-red-500',
    href: '/devices',
    hrefLabel: 'See the health monitor',
    minutes: 3,
    talkTrack:
      'Here is the detail nobody else ships. If the kitchen printer stops answering, we do not let the register keep taking food orders that have nowhere to cook. It holds new entry, keeps every open ticket and tab alive, and clears itself the moment the printer answers again.',
    proof: [
      `Heartbeat ${HEALTH_CHECK.intervalLabel}, ${HEALTH_CHECK.windowLabel.toLowerCase()}`,
      'Three device classes are treated as blocking; the rest only warn',
      'Open tabs and payment on existing tickets are never blocked',
    ],
    investorNote:
      'Operational trust compounds. Shops that never got burned by a silent hardware failure do not shop the market at renewal.',
    steps: [
      {
        id: 'beat',
        label: 'Heartbeat every paired device',
        command: `health.ping(all, ${HEALTH_CHECK.intervalMs}ms)`,
        output: `All stations answered. Verified ${HEALTH_CHECK.intervalLabel} from open to close.`,
        ms: 800,
      },
      {
        id: 'down',
        label: 'Kitchen printer stops answering',
        command: 'health.miss(kitchen-printer)',
        output: 'Marked Not connected within one heartbeat. Alert opened on the owner dashboard.',
        ms: 900,
        flag: true,
      },
      {
        id: 'hold',
        label: 'Hold new order entry',
        command: 'register.hold(reason: blocking-device)',
        output: 'New food orders held. Open tabs, fired tickets and taking payment all keep working.',
        ms: 800,
        flag: true,
      },
      deviceStep('kitchen-printer', 'test', 'Swap the printer and re-test the station', 900),
      {
        id: 'clear',
        label: 'Clear the hold automatically',
        command: 'health.recover(kitchen-printer)',
        output: 'Device answered. Hold released on its own — nobody had to remember to un-pause anything.',
        ms: 700,
      },
    ],
    closing: 'The failure was caught by the platform, not by a guest waiting on food.',
  },

  // ================= ACT IV — MONEY =================
  {
    id: 'closeout',
    num: '09',
    title: 'Close the day',
    subtitle: 'Z report, tender split, blind drawer count and every anomaly surfaced before the owner goes home.',
    act: 'Money',
    icon: 'ClipboardCheck',
    tone: 'from-violet-600 to-indigo-500',
    href: '/dashboard',
    hrefLabel: 'Open the owner dashboard',
    minutes: 4,
    talkTrack:
      'Closing is where owners lose an hour a night and where theft hides. The copilot runs the Z, splits it by tender, walks a blind drawer count, and then tells them the two things that are actually strange — a short drawer and a void rung after the ticket printed.',
    proof: [
      `${dailyReports.length} daily reports filed automatically at close`,
      'Blind count — the expected number stays hidden until submit',
      'Every void, comp and no-sale stamped with the employee',
    ],
    investorNote:
      'Loss prevention is the ROI line an owner repeats to their accountant. It is also the stickiest reason a multi-unit operator standardises on one platform.',
    steps: [
      {
        id: 'z',
        label: 'Run the Z / daily close',
        command: 'report.run(z-close)',
        output: `Gross ${formatCents(468030)} · net ${formatCents(432180)} · 216 tickets · avg ${formatCents(2167)}.`,
        ms: 1000,
      },
      {
        id: 'tender',
        label: 'Split by tender',
        command: 'report.run(payments)',
        output: `Card ${formatCents(371450)} · cash ${formatCents(72580)} · tap 61% of card volume.`,
        ms: 800,
      },
      deviceStep('cash-drawer', 'count', 'Walk a blind drawer count', 900),
      {
        id: 'variance',
        label: 'Reconcile the drawer',
        command: 'drawer.reconcile()',
        output: `Counted ${formatCents(72190)} against ${formatCents(72580)} expected — ${formatCents(390)} short, next to two no-sales at 8:14pm.`,
        ms: 900,
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
        id: 'file',
        label: 'File the daily pack',
        command: `report.file(${dailyReports.length})`,
        output: `${dailyReports.map((r) => r.name).join(' · ')} filed to the dashboard and emailed.`,
        ms: 800,
      },
    ],
    closing: 'Day closed in under four minutes with two things flagged for a person.',
  },
  {
    id: 'reports',
    num: '10',
    title: 'Reporting, sales tax & payroll',
    subtitle: 'Twelve standard reports including tax by jurisdiction and a payroll export their bookkeeper accepts.',
    act: 'Money',
    icon: 'BarChart3',
    tone: 'from-indigo-600 to-sky-500',
    href: '/dashboard',
    hrefLabel: 'Browse the report suite',
    minutes: 4,
    talkTrack:
      'Independent operators do not have a controller. They have a shoebox and a cousin who does taxes. We ship the twelve reports their accountant actually asks for, including sales tax broken out by state, county and city, ready to e-file.',
    proof: [
      `${REPORTS.length} standard reports across daily, weekly, monthly and yearly`,
      'Sales tax split by jurisdiction with taxable vs exempt sales',
      'Payroll export with hours, breaks, overtime and tips',
    ],
    investorNote:
      'Reporting is the upsell surface: bookkeeping, payroll and lending partners all attach here, and each attachment raises revenue per location without raising the subscription.',
    steps: [
      {
        id: 'mix',
        label: 'Product mix for the week',
        command: 'report.run(mix)',
        output: 'Units and dollars by item, category and modifier. Four dead items flagged for the next menu print.',
        ms: 900,
      },
      {
        id: 'labor',
        label: 'Hourly sales against labor',
        command: 'report.run(hourly)',
        output: `Labor 21.4% of sales. Two overtime warnings on this week's schedule (${SHIFTS.length} staff).`,
        ms: 900,
        flag: true,
      },
      {
        id: 'tax',
        label: 'Build the sales tax filing',
        command: 'report.run(salestax)',
        output: 'Taxable vs exempt separated, tax collected by state, county and city. Ready for the state e-file.',
        ms: 1000,
      },
      {
        id: 'payroll',
        label: 'Export payroll',
        command: 'report.export(labor, csv)',
        output: 'Hours, breaks, overtime and declared tips exported. Straight into the payroll provider.',
        ms: 800,
      },
      {
        id: 'pack',
        label: 'Send the monthly pack',
        command: `report.email(${monthlyReports.length}, accountant)`,
        output: `${monthlyReports.map((r) => r.name).join(' · ')} sent. Year-end reconciliation builds from the same data.`,
        ms: 800,
      },
    ],
    closing: 'The accountant conversation is now a forwarded email.',
  },
  {
    id: 'growth',
    num: '11',
    title: 'Rewards, scheduling & labor control',
    subtitle: 'Guests join with a phone number at the counter; the week gets built, published and costed live.',
    act: 'Money',
    icon: 'Gift',
    tone: 'from-pink-600 to-rose-500',
    href: '/dashboard',
    hrefLabel: 'See rewards & scheduling',
    minutes: 3,
    talkTrack:
      'Two things every operator pays a separate vendor for: a loyalty app nobody downloads, and a scheduling tool. Loyalty here is a phone number at the terminal — no app. Scheduling publishes to phones and shows labor cost against live sales all day.',
    proof: [
      `${REWARD_PROGRAMS.length} reward models — points, punch, cash back or tiers`,
      'No app download; enrollment happens at the register in one tap',
      'Labor percentage against live sales with overtime warnings',
    ],
    investorNote:
      'Each of these replaces a $40–$90/mo point solution. Bundling them is how we defend the price point while raising perceived value.',
    steps: [
      {
        id: 'enroll',
        label: 'Enroll a guest at the register',
        command: 'loyalty.enroll(phone)',
        output: `Guest joined in one tap. Program: ${REWARD_PROGRAMS[0].name} — ${REWARD_PROGRAMS[0].rule}.`,
        ms: 800,
      },
      {
        id: 'winback',
        label: 'Fire a win-back to lapsed regulars',
        command: 'loyalty.campaign(lapsed: 45d)',
        output: '128 lapsed regulars texted. Redemption tracked against actual tickets, not opens.',
        ms: 900,
      },
      {
        id: 'schedule',
        label: 'Publish next week',
        command: `schedule.publish(${SHIFTS.length} staff)`,
        output: 'Week published to phones. Shift swap requests route to the manager for approval.',
        ms: 800,
      },
      {
        id: 'cost',
        label: 'Cost the schedule against forecast',
        command: 'labor.forecast()',
        output: 'Projected labor 22.8% against forecast sales. Friday close is one body heavy.',
        ms: 900,
        flag: true,
      },
    ],
    closing: 'Loyalty, scheduling and labor cost, all against the same sales data.',
  },
  {
    id: 'business',
    num: '12',
    title: 'The business model',
    subtitle: 'Two tiers, a deposit-funded build, hardware-agnostic delivery and a per-location subscription.',
    act: 'Money',
    icon: 'TrendingUp',
    tone: 'from-emerald-600 to-lime-500',
    href: '/starter',
    hrefLabel: 'See the starter kits',
    minutes: 4,
    talkTrack:
      'Revenue is a per-location subscription plus a one-time build fee that funds the build itself, so growth is not working-capital hungry. Hardware is optional and sold at margin, never subsidised. And because onboarding is automated, gross margin does not degrade as we add locations.',
    proof: [
      `${PLANS.map((p) => `${p.name} $${p.price}${p.per}`).join(' · ')}`,
      `Build funded by a $${PLANS[0].deposit} deposit; the balance invoices only on approval`,
      'No hardware subsidy, no long-term contract, no per-order commission',
    ],
    investorNote:
      'Unit economics: automated onboarding means CAC is marketing-only, the deposit covers build cost at signup, and the attach rate on hardware plus partner services lifts revenue per location without touching the subscription.',
    steps: [
      {
        id: 'tiers',
        label: 'Two tiers, one product',
        command: 'pricing.tiers()',
        output: `${PLANS[0].name} $${PLANS[0].price}/mo with the hosted site · ${PLANS[1].name} $${PLANS[1].price}/mo for shops that already have one.`,
        ms: 800,
      },
      {
        id: 'deposit',
        label: 'Build funded at signup',
        command: 'billing.deposit()',
        output: `$${PLANS[0].deposit} starts the build. The $${PLANS[0].balance} balance only invoices when the owner approves delivery.`,
        ms: 800,
      },
      {
        id: 'hardware',
        label: 'Hardware attaches at margin',
        command: 'shop.attach(starter kits)',
        output: 'Concept-matched kits ship pre-configured. Optional — the phone alone is a valid deployment.',
        ms: 800,
      },
      {
        id: 'partners',
        label: 'Partner services layer on top',
        command: 'partners.offers()',
        output: 'Insurance, supply, linens, payroll and financing attach through the dashboard at referral margin.',
        ms: 800,
      },
      {
        id: 'scale',
        label: 'Add the second location',
        command: 'locations.add()',
        output: 'Location-scoped menu, staff and drawer; rolled-up sales for the owner. Onboarding cost is the same near-zero.',
        ms: 900,
      },
    ],
    closing: `${BRAND.name}: one upload, a register, a storefront and the back office — priced for the independent operator nobody else calls on.`,
  },
];

export const chapterById = (id: string) => DEMO_CHAPTERS.find((c) => c.id === id);

export const DEMO_ACTS: { id: DemoChapter['act']; label: string; blurb: string }[] = [
  { id: 'Build', label: 'Act I · Build', blurb: 'Menu photo to a live register and storefront.' },
  { id: 'Service', label: 'Act II · Service', blurb: 'Hardware, the register and the floor at full speed.' },
  { id: 'Resilience', label: 'Act III · Resilience', blurb: 'What happens when the building fails.' },
  { id: 'Money', label: 'Act IV · Money', blurb: 'Close, report, grow and how it earns.' },
];

export const TOTAL_DEMO_MINUTES = DEMO_CHAPTERS.reduce((s, c) => s + c.minutes, 0);
export const TOTAL_DEMO_STEPS = DEMO_CHAPTERS.reduce((s, c) => s + c.steps.length, 0);

/** Headline numbers for the investor cover slide. */
export const DEMO_HEADLINES = [
  { value: String(DEMO_CHAPTERS.length), label: 'Workflow chapters, end to end' },
  { value: String(TOTAL_DEMO_STEPS), label: 'Executable steps in the walkthrough' },
  { value: String(DEVICE_KINDS.length), label: 'Hardware classes with live drivers' },
  { value: String(REPORTS.length), label: 'Standard reports shipped' },
];
