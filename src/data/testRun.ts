// ------------------------------------------------------------
// Weekend test run — the on-site runbook.
// ONE source of truth for the pathways you walk in the restaurant,
// consumed by /test-run (checklist + printable runbook).
// ------------------------------------------------------------

export interface RunStep {
  /** What you physically do. */
  do: string;
  /** What must happen for the step to pass. */
  expect: string;
}

export interface Pathway {
  id: string;
  title: string;
  /** Where you stand while doing it. */
  where: string;
  /** Who is holding the device. */
  who: string;
  minutes: number;
  route: string;
  routeLabel: string;
  blurb: string;
  steps: RunStep[];
  /** Shown if the pathway fails — the fallback that keeps service moving. */
  fallback: string;
}

export const TEST_RUN_PATHWAYS: Pathway[] = [
  {
    id: 'build',
    title: '1 · Build the store from your real menu',
    where: 'Office / back booth, before doors open',
    who: 'Owner',
    minutes: 20,
    route: '/onboarding',
    routeLabel: 'Open the builder',
    blurb:
      'Drop in a photo of the printed menu or type the categories. The copilot writes descriptions, sets tax classes and builds the register buttons.',
    steps: [
      { do: 'Upload or type in 8–12 real menu items with real prices.', expect: 'Every item lands in a category with a price and a tax class.' },
      { do: 'Set your sales tax rate and check the prepared-food class.', expect: 'Tax preview matches what your current register charges.' },
      { do: 'Save and open the POS.', expect: 'The same items appear as register buttons — no retyping.' },
    ],
    fallback: 'If a photo import misses items, add them by hand in the builder — it takes about 30 seconds each.',
  },
  {
    id: 'website',
    title: '2 · Website + logo from the vibe brief',
    where: 'Anywhere with the tablet',
    who: 'Owner',
    minutes: 10,
    route: '/templates',
    routeLabel: 'Open templates & logo',
    blurb: 'Pick a template, describe the vibe in three words, generate a logo and publish the one-page site with your live menu on it.',
    steps: [
      { do: 'Pick a template and enter three vibe words.', expect: 'Preview re-skins instantly with your colors.' },
      { do: 'Generate a logo and apply it.', expect: 'Logo shows in the site preview, the receipt header and the POS.' },
      { do: 'Publish and open the site on your phone.', expect: 'Menu, hours, phone and address are live and match the register.' },
    ],
    fallback: 'Not happy with the logo? Keep the wordmark — you can swap art later without rebuilding the site.',
  },
  {
    id: 'register',
    title: '3 · Ring a real ticket on the register',
    where: 'Front counter',
    who: 'Whoever normally runs the register',
    minutes: 15,
    route: '/pos',
    routeLabel: 'Open the register',
    blurb: 'The core loop. Ring it, modify it, send it, take money, print the receipt.',
    steps: [
      { do: 'Ring a 3-item ticket with one modifier and one size.', expect: 'Ticket total and tax match your current POS to the penny.' },
      { do: 'Send it to the kitchen.', expect: 'Ticket appears on the kitchen screen / prints at the line.' },
      { do: 'Take a card payment and add a tip.', expect: 'Tip lands on the ticket, drawer stays shut on card.' },
      { do: 'Take a cash payment.', expect: 'Change is calculated and the drawer kicks.' },
      { do: 'Void one item and comp another.', expect: 'Both show in the audit log with who did it.' },
    ],
    fallback: 'If a button is wrong, fix the price straight from the copilot — it pushes to register, online and website at once.',
  },
  {
    id: 'staff',
    title: '4 · Hand it to a staff member cold',
    where: 'Front counter',
    who: 'A server or cashier who has never seen it',
    minutes: 15,
    route: '/pos',
    routeLabel: 'Open the register',
    blurb: 'The real test. No training, no coaching from you — just watch. This is the number that tells you whether to switch.',
    steps: [
      { do: 'Give them a PIN and say nothing else.', expect: 'They log in and find the menu without asking.' },
      { do: 'Ask them to ring a 2-item order with a modifier.', expect: 'Done in under 60 seconds on the first try.' },
      { do: 'Ask them to split a check two ways.', expect: 'They find split without you pointing at it.' },
      { do: 'Ask what they hated.', expect: 'Write it down — that list is the punch list.' },
    ],
    fallback: 'If they stall for more than 15 seconds on any screen, note the screen name. That is a layout problem, not a them problem.',
  },
  {
    id: 'kitchen',
    title: '5 · Kitchen ticket flow at the line',
    where: 'The pass / expo',
    who: 'Kitchen lead',
    minutes: 10,
    route: '/devices',
    routeLabel: 'Open the device hub',
    blurb: 'Test print, drawer kick and a live ticket push, from the same console your installer would use.',
    steps: [
      { do: 'Run a test print from the device hub.', expect: 'Paper comes out at the line, legible at arm’s length.' },
      { do: 'Kick the cash drawer from the console.', expect: 'Drawer pops. If not, the RJ11 cable is in the wrong port.' },
      { do: 'Fire a ticket and bump it from the kitchen screen.', expect: 'Ticket clears the board and the register shows it as made.' },
      { do: 'Check the station board.', expect: 'Every paired device shows green with a last-seen time.' },
    ],
    fallback: 'A printer that will not answer is almost always DHCP — reserve its IP on the router and re-pair.',
  },
  {
    id: 'offline',
    title: '6 · Pull the internet on purpose',
    where: 'Router closet, mid-service',
    who: 'Owner',
    minutes: 10,
    route: '/stay-open-offline',
    routeLabel: 'Open the failover simulator',
    blurb: 'The pathway everyone skips and everyone regrets skipping. Do it while a ticket is open.',
    steps: [
      { do: 'Unplug the Wi-Fi router with a ticket open.', expect: 'Register flips to LTE / offline queue and keeps taking orders.' },
      { do: 'Ring and take a card payment while offline.', expect: 'Payment queues, receipt still prints, no error wall.' },
      { do: 'Plug the router back in.', expect: 'Queued tickets and payments sync, totals still match.' },
      { do: 'Ring one order on a phone as a backup register.', expect: 'Phone ticket lands on the same kitchen board.' },
    ],
    fallback: 'If the queue does not drain in 60 seconds after reconnect, force it from the device hub before you close.',
  },
  {
    id: 'online',
    title: '7 · Online order from a customer phone',
    where: 'Standing in the dining room with your own phone',
    who: 'Owner, pretending to be a guest',
    minutes: 10,
    route: '/shop',
    routeLabel: 'Open the storefront',
    blurb: 'Order the way a real guest would — from the phone, on cell data, not on your shop Wi-Fi.',
    steps: [
      { do: 'Turn Wi-Fi OFF on your phone and open the site.', expect: 'Site loads fast on cell data, menu matches the register.' },
      { do: 'Place an order and pay.', expect: 'Ticket hits the kitchen board tagged as an online order.' },
      { do: 'Check the confirmation email.', expect: 'Email arrives with items, total and pickup time.' },
      { do: '86 an item from the copilot, then reload the phone.', expect: 'The item is gone from the online menu within seconds.' },
    ],
    fallback: 'No email? Check the spam folder first, then the address on the shop record — it is almost never the sender.',
  },
  {
    id: 'close',
    title: '8 · Close the day and read the numbers',
    where: 'Office, after last ticket',
    who: 'Owner',
    minutes: 15,
    route: '/dashboard',
    routeLabel: 'Open reporting',
    blurb: 'The end of the loop. If the Z-close matches your drawer count, the whole system is trustworthy.',
    steps: [
      { do: 'Run the Z / daily close.', expect: 'Gross, net, tax and payment types all print.' },
      { do: 'Count the drawer against the report.', expect: 'Cash variance is explainable to the dollar.' },
      { do: 'Pull the tip sheet.', expect: 'Tips split per employee, credit tips owed in cash are correct.' },
      { do: 'Export the day to CSV.', expect: 'File opens in Sheets and your bookkeeper can read it.' },
    ],
    fallback: 'If the variance is off, check comps and voids first — the audit log names who did each one.',
  },
];

/** What to physically carry in the door. */
export const BRING_LIST = [
  'The tablet or laptop you will run the register on (charged)',
  'Your phone — you are the guest for the online-ordering pathway',
  'A printed copy of your current menu with prices',
  'Yesterday’s Z-report from your current POS to compare against',
  'A staff member who has never seen this software',
  'The Wi-Fi password, and access to the router so you can unplug it',
  'A receipt printer or the kitchen printer you already own, plus its power + network cable',
  '$20 in small bills for the cash-drawer and change pathway',
];

/** Signals that decide go / no-go on Monday. */
export const SUCCESS_SIGNALS = [
  { label: 'Untrained staff rings an order', target: 'under 60 seconds, first try' },
  { label: 'Ticket to the kitchen', target: 'under 3 seconds from Send' },
  { label: 'Z-close vs drawer count', target: 'variance explainable to the dollar' },
  { label: 'Service continues with internet down', target: 'zero refused orders' },
  { label: 'Online order to kitchen board', target: 'arrives tagged, no manual re-entry' },
];

export const TOTAL_MINUTES = TEST_RUN_PATHWAYS.reduce((n, p) => n + p.minutes, 0);
