// ============================================================
// Platform audit — the single source of truth for the
// investor-facing readiness review. Keep findings honest:
// "pass" means shipped and verifiable in the product,
// "gap" means named and scheduled, not hidden.
// ============================================================

export type FindingState = 'pass' | 'partial' | 'gap';
export type Severity = 'low' | 'medium' | 'high';

export interface Finding {
  id: string;
  title: string;
  state: FindingState;
  severity: Severity;
  /** what was checked / where the proof lives in the product */
  evidence: string;
  /** the action, if any */
  action?: string;
}

export interface AuditDomain {
  id: string;
  name: string;
  group: AuditGroupId;
  /** one line an investor can read out loud */
  question: string;
  icon: string; // lucide icon name resolved by the consuming component
  findings: Finding[];
}

export type AuditGroupId = 'product' | 'engineering' | 'trust' | 'growth';

export interface AuditGroup {
  id: AuditGroupId;
  name: string;
  blurb: string;
  tone: string;
}

export const AUDIT_GROUPS: AuditGroup[] = [
  { id: 'product', name: 'Product & Experience', blurb: 'Legal, design, devices, speed and docs — what an operator touches.', tone: 'from-fuchsia-500 to-pink-500' },
  { id: 'engineering', name: 'Engineering & Scale', blurb: 'Code, accessibility, reliability, errors, data and test coverage.', tone: 'from-sky-500 to-cyan-400' },
  { id: 'trust', name: 'Security & Trust', blurb: 'Integrations, cloud cost, security, identity and the supply chain.', tone: 'from-emerald-500 to-teal-400' },
  { id: 'growth', name: 'Marketing & Revenue', blurb: 'Discoverability, the landing page, and whether the copy says anything.', tone: 'from-amber-500 to-orange-500' },
];

export const AUDIT_META = {
  title: 'Full platform audit',
  scope: '18 domains · reviewed against the shipped build',
  reviewed: 'Love Local Eats POS — web platform, POS runtime, device layer, reporting suite',
  method:
    'Every domain was walked against the running product, not a spec. A finding is only marked Pass when there is a screen, a file or a report that proves it.',
  note: 'Payment-processor internals are intentionally excluded from this review at the operator’s request.',
};

export const AUDIT_DOMAINS: AuditDomain[] = [
  // ---------------- Product & Experience ----------------
  {
    id: 'legal',
    name: 'Legal',
    group: 'product',
    question: 'Are billing and tax correct, and are the required legal pages real?',
    icon: 'Scale',
    findings: [
      { id: 'l1', title: 'Billing math is deterministic and shown before charge', state: 'pass', severity: 'high', evidence: 'Deposit ($100) and balance are separate line items on every plan; prepay math is a pure function (prepayEffective) so the displayed price and the invoiced price cannot drift.' },
      { id: 'l2', title: 'Sales tax is jurisdiction-aware, not a single flat rate', state: 'pass', severity: 'high', evidence: 'State / county / city rates stack per store, item tax classes mark exempt goods, and the filing report groups by jurisdiction and entity.' },
      { id: 'l3', title: 'Per-store tax rates in a multi-location group', state: 'pass', severity: 'medium', evidence: 'Each location carries its own taxRate; the group filing report never blends two jurisdictions into one number.' },
      { id: 'l4', title: 'Terms, Privacy, Refund and Acceptable Use pages', state: 'partial', severity: 'medium', evidence: 'Policy content is drafted and linked from the footer.', action: 'Counsel review before the first paid cohort; add signed-at timestamp to the signup record.' },
      { id: 'l5', title: 'Data collection is disclosed where it happens', state: 'pass', severity: 'medium', evidence: 'Signup and contact forms state what is collected and why, and SMS consent carries the required opt-out disclaimer inline.' },
      { id: 'l6', title: 'Merchant agreement + hardware warranty terms', state: 'gap', severity: 'medium', evidence: 'Hardware replace-in-24h is promised in marketing copy.', action: 'Publish the warranty terms page it points to before launch.' },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    group: 'product',
    question: 'Is the visual language consistent across every screen?',
    icon: 'Palette',
    findings: [
      { id: 'd1', title: 'One shell, one header, one footer on every page', state: 'pass', severity: 'medium', evidence: 'PageShell wraps all routes, so navigation, copilot dock and footer can never diverge page to page.' },
      { id: 'd2', title: 'Single brand token set', state: 'pass', severity: 'low', evidence: 'BRAND plus the fuchsia→orange gradient family are defined once in platform.ts and index.css and reused, not re-picked per screen.' },
      { id: 'd3', title: 'Consistent card, chip and severity vocabulary', state: 'pass', severity: 'low', evidence: 'Status chips (blocking / warn / info, open / building / seasonal) come from shared maps so the same colour always means the same thing.' },
      { id: 'd4', title: 'Dense operator screens vs marketing screens', state: 'partial', severity: 'low', evidence: 'POS and dashboard use a tighter scale than the landing pages.', action: 'Intentional, but document the two scales in the design notes so it stays deliberate.' },
      { id: 'd5', title: 'Empty, loading and error states drawn', state: 'pass', severity: 'medium', evidence: 'Product, collection and report views all render explicit empty and loading states rather than a blank region.' },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile & Tablet',
    group: 'product',
    question: 'Does it hold up on a phone in an apron and a tablet on a counter?',
    icon: 'Tablet',
    findings: [
      { id: 'm1', title: 'Every layout is responsive from 360px up', state: 'pass', severity: 'high', evidence: 'Grids collapse at sm/md/lg breakpoints; the header switches to a full mobile sheet under lg.' },
      { id: 'm2', title: 'The phone is a real register, not a shrunken desktop', state: 'pass', severity: 'high', evidence: 'Phone-becomes-the-register is rung as its own failover rung with tap, swipe, scan and Bluetooth print paths.' },
      { id: 'm3', title: 'Tap targets sized for wet hands', state: 'pass', severity: 'medium', evidence: 'POS tiles and quantity controls are 44px+ with generous padding; no hover-only affordances in the ordering path.' },
      { id: 'm4', title: 'Tablet stand / landscape counter layout', state: 'pass', severity: 'medium', evidence: 'Register grid reflows to a two-pane order + ticket layout at tablet width.' },
      { id: 'm5', title: 'Installable home-screen shortcut', state: 'gap', severity: 'low', evidence: 'Runs in the browser today.', action: 'Add a web app manifest so a counter tablet can boot straight into the register.' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    group: 'product',
    question: 'Where is it slow, and does it matter at a rush?',
    icon: 'Gauge',
    findings: [
      { id: 'p1', title: 'Device drivers run on the terminal, not the cloud', state: 'pass', severity: 'high', evidence: 'Print, drawer kick and card read have no network hop in the path — that is why they survive an outage.' },
      { id: 'p2', title: 'Shared data modules instead of duplicated constants', state: 'pass', severity: 'medium', evidence: 'platform.ts, menu.ts, locations.ts and audit.ts are imported everywhere; nothing is re-declared per page.' },
      { id: 'p3', title: 'Images served as compressed CDN assets', state: 'partial', severity: 'medium', evidence: 'Hero and product art are CDN-hosted.', action: 'Convert remaining PNG marketing art to WebP and add width hints to cut first-paint bytes.' },
      { id: 'p4', title: 'Route-level code splitting', state: 'gap', severity: 'medium', evidence: 'All routes are in one bundle today.', action: 'Lazy-load the heavy operator routes (POS, dashboard, demo) so the landing page ships less JS.' },
      { id: 'p5', title: 'Report queries are aggregate, not row-by-row', state: 'pass', severity: 'medium', evidence: 'Roll-ups are computed with single reduce passes over a scoped set, so a 50-store group costs the same shape of work as one.' },
    ],
  },
  {
    id: 'docs',
    name: 'Documentation',
    group: 'product',
    question: 'Can an owner get unstuck without calling you?',
    icon: 'BookOpen',
    findings: [
      { id: 'do1', title: 'Guided in-product walkthrough of every workflow', state: 'pass', severity: 'high', evidence: 'The full walkthrough runs 12 chapters and 63 steps live on screen, with a printable script.' },
      { id: 'do2', title: 'Menu intake guide with accepted formats', state: 'pass', severity: 'medium', evidence: 'The intake wizard states exactly what a photo, PDF, CSV or link needs to contain before upload.' },
      { id: 'do3', title: 'Weekend test-run checklist', state: 'pass', severity: 'medium', evidence: 'Pre-flight checklist walks hardware, menu, staff PINs and a live pathway rehearsal before opening.' },
      { id: 'do4', title: 'Searchable help centre', state: 'gap', severity: 'medium', evidence: 'Help is embedded per screen today.', action: 'Extract the in-product guidance into a searchable help index with deep links back to the screens.' },
      { id: 'do5', title: 'Copilot answers operator questions in context', state: 'pass', severity: 'low', evidence: 'The operator copilot is mounted on every screen and scoped to that screen’s mode.' },
    ],
  },

  // ---------------- Engineering & Scale ----------------
  {
    id: 'code',
    name: 'Code Quality',
    group: 'engineering',
    question: 'Would a new engineer be productive in a week?',
    icon: 'Code2',
    findings: [
      { id: 'c1', title: 'Typed domain models, no loose object literals', state: 'pass', severity: 'medium', evidence: 'StoreLocation, DeviceKind, Plan, ReportDef and Finding are all explicit interfaces exported from data modules.' },
      { id: 'c2', title: 'Single source of truth enforced by structure', state: 'pass', severity: 'high', evidence: 'Data lives in src/data, behaviour in src/lib, screens in src/pages, and pages compose components rather than re-implementing them.' },
      { id: 'c3', title: 'Components are small and single-purpose', state: 'pass', severity: 'medium', evidence: 'Large surfaces (demo, devices, multi-location) are split into a runner, a table, a panel and a data file instead of one giant file.' },
      { id: 'c4', title: 'Derived values are pure functions', state: 'pass', severity: 'medium', evidence: 'laborPct, avgTicket, rollup, railCost and prepayEffective are pure and unit-testable with no component coupling.' },
      { id: 'c5', title: 'Lint and type gates in CI', state: 'partial', severity: 'medium', evidence: 'ESLint and TS config are present.', action: 'Wire them to a required CI check so a type error cannot merge.' },
    ],
  },
  {
    id: 'a11y',
    name: 'Accessibility',
    group: 'engineering',
    question: 'Can everyone on the staff actually use it?',
    icon: 'Accessibility',
    findings: [
      { id: 'a1', title: 'Semantic landmarks and heading order', state: 'pass', severity: 'medium', evidence: 'header / main / footer landmarks come from PageShell; sections lead with a real heading level.' },
      { id: 'a2', title: 'Icon-only controls carry accessible names', state: 'pass', severity: 'medium', evidence: 'Cart, menu and close buttons all have aria-label; no control relies on the glyph alone.' },
      { id: 'a3', title: 'Colour is never the only signal', state: 'pass', severity: 'high', evidence: 'Device and store status always pair the colour chip with a word — Critical, Warn, Offline, In build.' },
      { id: 'a4', title: 'Keyboard path through the register', state: 'partial', severity: 'high', evidence: 'Native buttons are focusable throughout.', action: 'Add explicit focus rings and a documented tab order for the ring-up → tender path.' },
      { id: 'a5', title: 'Large-type kitchen display mode', state: 'pass', severity: 'medium', evidence: 'KDS renders big-type tickets specifically so a line cook reads it from two metres away.' },
      { id: 'a6', title: 'Screen-reader pass on the ordering flow', state: 'gap', severity: 'medium', evidence: 'Not yet formally tested.', action: 'Run a VoiceOver and NVDA pass on cart → checkout and log the results.' },
    ],
  },
  {
    id: 'scale',
    name: 'Scalability & Reliability',
    group: 'engineering',
    question: 'What happens on the day 500 stores all rush at 6pm?',
    icon: 'TrendingUp',
    findings: [
      { id: 's1', title: 'Offline-first is the architecture, not a feature', state: 'pass', severity: 'high', evidence: 'Five-rung failover ladder: WiFi → LTE → hotspot → phone-as-register → full offline queue, all able to take payment.' },
      { id: 's2', title: 'Store-and-forward settlement', state: 'pass', severity: 'high', evidence: 'Queued sales settle themselves when a link returns and land in reports with their real timestamps.' },
      { id: 's3', title: 'Location-scoped data model', state: 'pass', severity: 'high', evidence: 'Every read is scoped to a store id, so group size does not change the cost of a store-level query.' },
      { id: 's4', title: 'Serverless compute scales horizontally', state: 'pass', severity: 'medium', evidence: 'Backend work runs as stateless edge functions; no shared server to saturate at a dinner rush.' },
      { id: 's5', title: 'Load test at portfolio scale', state: 'gap', severity: 'high', evidence: 'Verified at single-store and small-group volume.', action: 'Run a synthetic 500-store, 6pm-concurrent load test and publish the numbers before an enterprise pitch.' },
      { id: 's6', title: 'Fleet health heartbeat', state: 'pass', severity: 'medium', evidence: 'Every paired device is pinged every 45 seconds open to close, and a dark critical device holds order entry at that store only.' },
    ],
  },
  {
    id: 'errors',
    name: 'Error Handling',
    group: 'engineering',
    question: 'When something breaks at 7pm, does the floor find out gracefully?',
    icon: 'AlertTriangle',
    findings: [
      { id: 'e1', title: 'Failures degrade instead of blocking', state: 'pass', severity: 'high', evidence: 'A dead printer warns; a dead kitchen printer holds new order entry but never blocks tickets already fired, open tabs or taking payment.' },
      { id: 'e2', title: 'Alerts self-clear', state: 'pass', severity: 'medium', evidence: 'The health alert closes itself the moment the device answers again — nobody has to remember to un-pause.' },
      { id: 'e3', title: 'Async calls check both data and error', state: 'pass', severity: 'medium', evidence: 'Function invocations destructure error and render a human message rather than an endless spinner.' },
      { id: 'e4', title: 'A 404 that helps', state: 'pass', severity: 'low', evidence: 'Unknown routes land on a NotFound screen with navigation back into the platform.' },
      { id: 'e5', title: 'Global error boundary + reporting sink', state: 'gap', severity: 'high', evidence: 'Errors are handled locally per screen.', action: 'Add a top-level error boundary and ship exceptions to a monitoring sink with store id attached.' },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    group: 'engineering',
    question: 'Is the data model sound and protected?',
    icon: 'Database',
    findings: [
      { id: 'db1', title: 'Normalised catalog with variants', state: 'pass', severity: 'medium', evidence: 'Products, variants, collections and product-collection joins are separate tables; variants own their own price, sku and inventory.' },
      { id: 'db2', title: 'Money stored as integer cents', state: 'pass', severity: 'high', evidence: 'No float money anywhere in the schema — formatting happens at the edge with formatCents.' },
      { id: 'db3', title: 'Orders and order items are immutable records', state: 'pass', severity: 'medium', evidence: 'Line items snapshot name, variant title, sku and unit price at sale time so a later menu edit cannot rewrite history.' },
      { id: 'db4', title: 'Row-level security on customer data', state: 'partial', severity: 'high', evidence: 'Policies are in place on the customer-facing tables.', action: 'Add a written policy matrix per table and re-verify after every schema change.' },
      { id: 'db5', title: 'Indexes on the hot lookups', state: 'pass', severity: 'medium', evidence: 'Handle and status lookups are the read path for storefront and register, and are indexed.' },
      { id: 'db6', title: 'Point-in-time restore drill', state: 'gap', severity: 'high', evidence: 'Managed backups are on.', action: 'Actually perform a restore into a scratch project and time it. An untested backup is not a backup.' },
    ],
  },
  {
    id: 'testing',
    name: 'Test Coverage & QA',
    group: 'engineering',
    question: 'Which critical path is untested?',
    icon: 'FlaskConical',
    findings: [
      { id: 't1', title: 'Executable end-to-end walkthrough', state: 'pass', severity: 'medium', evidence: '63 scripted steps across 12 chapters run the real workflows on screen — a manual regression suite anyone can run.' },
      { id: 't2', title: 'Hardware self-test for all 33 driver actions', state: 'pass', severity: 'high', evidence: 'Every device action is individually runnable plus a one-click self-test of the whole rack.' },
      { id: 't3', title: 'Weekend test-run rehearsal before go-live', state: 'pass', severity: 'medium', evidence: 'Pre-flight checklist forces a full pathway rehearsal in the building before real guests.' },
      { id: 't4', title: 'Automated unit tests on money and roll-up math', state: 'gap', severity: 'high', evidence: 'The math is pure and testable but not yet covered.', action: 'Add unit tests for railCost, rollup, laborPct, tax stacking and prepay math — highest value per line in the codebase.' },
      { id: 't5', title: 'Automated regression on ring-up → tender → close', state: 'gap', severity: 'high', evidence: 'Currently manual via the walkthrough.', action: 'Script the register happy path headlessly so it runs on every merge.' },
    ],
  },

  // ---------------- Security & Trust ----------------
  {
    id: 'integrations',
    name: 'Integrations',
    group: 'trust',
    question: 'Are the outside connections implemented correctly?',
    icon: 'Plug',
    findings: [
      { id: 'i1', title: 'All third-party calls run server-side', state: 'pass', severity: 'high', evidence: 'Nothing calls an external vendor from the browser; every integration goes through an edge function.' },
      { id: 'i2', title: 'Google Business Profile sync', state: 'pass', severity: 'medium', evidence: 'Hours, address and phone re-check hourly so the website matches Maps without the owner editing twice.' },
      { id: 'i3', title: 'Payroll and accounting exports', state: 'pass', severity: 'medium', evidence: 'Hours, breaks, overtime and tips export as CSV, and the group version merges an employee who works two stores into one line.' },
      { id: 'i4', title: 'Integration failure is isolated', state: 'partial', severity: 'medium', evidence: 'A failed sync does not block service.', action: 'Add per-integration retry with backoff and a visible last-synced timestamp on each connector.' },
      { id: 'i5', title: 'Vendor-neutral processing layer', state: 'pass', severity: 'medium', evidence: 'Routing is expressed as an interface over acquirers, so a processor can be added or dropped without touching the register.' },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud SDK & Cost',
    group: 'trust',
    question: 'What does a store cost us to run per month?',
    icon: 'Cloud',
    findings: [
      { id: 'cl1', title: 'POS traffic is intentionally tiny', state: 'pass', severity: 'medium', evidence: 'A full store uses under 2GB a month even running on LTE — the payload is orders, not media.' },
      { id: 'cl2', title: 'No always-on server per store', state: 'pass', severity: 'high', evidence: 'Stateless functions mean cost tracks transactions, so gross margin holds as stores are added.' },
      { id: 'cl3', title: 'Static assets on CDN', state: 'pass', severity: 'low', evidence: 'Marketing art and place-card photos are CDN-served, not proxied through compute.' },
      { id: 'cl4', title: 'Per-store cost attribution', state: 'gap', severity: 'medium', evidence: 'Cost is tracked in aggregate.', action: 'Tag function invocations with store id so unit economics can be reported per location, not per account.' },
      { id: 'cl5', title: 'Scheduled work runs as cron, not client timers', state: 'pass', severity: 'medium', evidence: 'Recurring jobs are server-scheduled, so nothing depends on someone leaving a tab open.' },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    group: 'trust',
    question: 'Where could someone get in?',
    icon: 'ShieldCheck',
    findings: [
      { id: 'se1', title: 'No secrets in the browser bundle', state: 'pass', severity: 'high', evidence: 'Every key lives in server-side environment configuration; the client never sees a vendor credential.' },
      { id: 'se2', title: 'Card data is masked before storage', state: 'pass', severity: 'high', evidence: 'Camera scan masks the number on device and wipes the frame buffer; readers encrypt at the head under P2PE.' },
      { id: 'se3', title: 'Every privileged action is stamped', state: 'pass', severity: 'high', evidence: 'Voids, comps, drawer opens and no-sales record the employee, the role they were working and the timestamp.' },
      { id: 'se4', title: 'Manager approval is a second factor on the floor', state: 'pass', severity: 'medium', evidence: 'Manager PIN is required for voids, comps and no-sales, and lands in the audit trail.' },
      { id: 'se5', title: 'Transport security end to end', state: 'pass', severity: 'high', evidence: 'TLS on every hop including the hosted one-page site, with SSL issued and renewed automatically.' },
      { id: 'se6', title: 'Third-party penetration test', state: 'gap', severity: 'high', evidence: 'Internal review only so far.', action: 'Commission an external pen test and publish the remediation log — investors and enterprise buyers will both ask.' },
      { id: 'se7', title: 'Rate limiting on public endpoints', state: 'partial', severity: 'medium', evidence: 'Platform defaults apply.', action: 'Add explicit per-IP limits on signup, contact and ordering endpoints.' },
    ],
  },
  {
    id: 'identity',
    name: 'Identity & Access',
    group: 'trust',
    question: 'Does the right person see exactly the right thing?',
    icon: 'KeyRound',
    findings: [
      { id: 'id1', title: 'Four floor roles with explicit capabilities', state: 'pass', severity: 'high', evidence: 'Server, bar, kitchen and manager each have a defined "sees" and "can" list rather than an all-or-nothing login.' },
      { id: 'id2', title: 'One person, one login, role chosen at clock-in', state: 'pass', severity: 'medium', evidence: 'Cover the bar tonight and wait tables tomorrow without a second account; the ticket records which role was worked.' },
      { id: 'id3', title: 'Reporting scope follows the org tree', state: 'pass', severity: 'high', evidence: 'Store manager sees a store, regional sees a region, only the owner sees group P&L — enforced at the reporting level, not the UI.' },
      { id: 'id4', title: 'Staff data is location-scoped', state: 'pass', severity: 'high', evidence: 'A store’s staff never see another store’s sales, tabs or drawer, even inside the same group account.' },
      { id: 'id5', title: 'Session handling on shared terminals', state: 'pass', severity: 'medium', evidence: 'PIN switch between orders takes about a second and re-stamps ownership of the ticket.' },
      { id: 'id6', title: 'Owner account recovery + audit of admin changes', state: 'partial', severity: 'high', evidence: 'Recovery exists through the auth provider.', action: 'Add an admin-change log (who changed a permission, when) and require a second owner approval for role escalation.' },
    ],
  },
  {
    id: 'supply',
    name: 'Dependency & Supply Chain',
    group: 'trust',
    question: 'What are we depending on that could rot?',
    icon: 'Boxes',
    findings: [
      { id: 'su1', title: 'Mainstream, actively maintained stack', state: 'pass', severity: 'medium', evidence: 'React, TypeScript, Vite, Tailwind and Radix primitives — all current major versions with large maintainer bases.' },
      { id: 'su2', title: 'No abandoned or single-maintainer critical packages', state: 'pass', severity: 'high', evidence: 'Nothing in the register or payment path depends on an unmaintained library.' },
      { id: 'su3', title: 'Device drivers are first-party', state: 'pass', severity: 'high', evidence: 'ESC/POS, drawer kick and KDS routing are implemented in-house, so a vendor SDK cannot break service.' },
      { id: 'su4', title: 'Automated vulnerability scanning', state: 'gap', severity: 'medium', evidence: 'Dependencies are reviewed manually.', action: 'Turn on automated advisory scanning with a weekly digest and a policy for high-severity patches.' },
      { id: 'su5', title: 'Lockfile committed and reproducible builds', state: 'pass', severity: 'medium', evidence: 'Builds are pinned, so what ships is what was reviewed.' },
    ],
  },

  // ---------------- Marketing & Revenue ----------------
  {
    id: 'seo',
    name: 'Discoverability & Sharing',
    group: 'growth',
    question: 'Can people find it and share it?',
    icon: 'Search',
    findings: [
      { id: 'sh1', title: 'Every store gets a hosted, indexable one-page site', state: 'pass', severity: 'high', evidence: 'Domain, SSL and hosting are included, and hours come from Google so the listing and the site agree.' },
      { id: 'sh2', title: 'Open Graph preview on shared links', state: 'pass', severity: 'medium', evidence: 'Site blocks include a share sheet and OG preview image for the operator’s own page.' },
      { id: 'sh3', title: 'Clean, deep-linkable routes', state: 'pass', severity: 'medium', evidence: 'Products live at /products/:handle and collections at /collections/:handle, so any item can be linked directly.' },
      { id: 'sh4', title: 'Platform-level meta titles and descriptions', state: 'partial', severity: 'medium', evidence: 'Titles are set on the shell.', action: 'Give each marketing route its own title, description and OG image instead of inheriting one set.' },
      { id: 'sh5', title: 'Sitemap and structured data for operator sites', state: 'gap', severity: 'medium', evidence: 'Pages are crawlable but unannotated.', action: 'Emit LocalBusiness + Menu structured data per store site — it is the single cheapest local-search win available.' },
    ],
  },
  {
    id: 'landing',
    name: 'Landing Page Optimisation',
    group: 'growth',
    question: 'Does the front page drive the one action that matters?',
    icon: 'MousePointerClick',
    findings: [
      { id: 'ln1', title: 'One primary call to action, repeated', state: 'pass', severity: 'high', evidence: 'Start my build appears in the header, the hero and the pricing cards, always pointing at the same flow.' },
      { id: 'ln2', title: 'Price and setup cost stated on the page', state: 'pass', severity: 'high', evidence: 'No "contact us for pricing" — the plan, the deposit and the balance are all visible before signup.' },
      { id: 'ln3', title: 'Objections answered inline', state: 'pass', severity: 'medium', evidence: 'No contracts, no hardware lock-in, runs on gear you already own, and what happens when the internet dies — all above the fold or one scroll down.' },
      { id: 'ln4', title: 'Proof next to the claim', state: 'pass', severity: 'medium', evidence: 'Operator testimonials name the concept and the number, and the stat strip is specific (11 min, 0%, <3 sec).' },
      { id: 'ln5', title: 'Conversion instrumentation', state: 'gap', severity: 'high', evidence: 'No funnel measurement on the CTA today.', action: 'Instrument hero → signup → deposit as a measured funnel; you cannot optimise a page you are not counting.' },
    ],
  },
  {
    id: 'copy',
    name: 'Copy & Content',
    group: 'growth',
    question: 'Is the writing specific, or is it vague software noise?',
    icon: 'Type',
    findings: [
      { id: 'cp1', title: 'Claims are numeric and checkable', state: 'pass', severity: 'medium', evidence: '"Under 3 seconds", "0% commission", "45-second heartbeat", "$100 deposit" — not "blazing fast" and "seamless".' },
      { id: 'cp2', title: 'Written for an operator, not a CTO', state: 'pass', severity: 'medium', evidence: 'Features are framed as the problem on the floor first, then the fix — fries in the window, bottles under the table.' },
      { id: 'cp3', title: 'One vocabulary across product and marketing', state: 'pass', severity: 'medium', evidence: 'Tab, ticket, station, rung, bump and drawer mean the same thing in the marketing copy and in the register.' },
      { id: 'cp4', title: 'No unexplained jargon in operator-facing screens', state: 'pass', severity: 'low', evidence: 'Where a term is technical (P2PE, least-cost routing, PMIX) it is defined in the same sentence.' },
      { id: 'cp5', title: 'Copy review cadence as the product changes', state: 'partial', severity: 'low', evidence: 'Copy is currently reviewed alongside features.', action: 'Add a copy check to the release checklist so shipped features never outrun the page describing them.' },
    ],
  },
];

// ---------------- Scoring ----------------

export const STATE_COPY: Record<FindingState, { label: string; chip: string; dot: string; weight: number }> = {
  pass: { label: 'Pass', chip: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', weight: 1 },
  partial: { label: 'Partial', chip: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500', weight: 0.5 },
  gap: { label: 'Gap', chip: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500', weight: 0 },
};

export const SEVERITY_LABEL: Record<Severity, { label: string; chip: string }> = {
  high: { label: 'High', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Medium', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  low: { label: 'Low', chip: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const domainScore = (d: AuditDomain) =>
  Math.round((d.findings.reduce((s, f) => s + STATE_COPY[f.state].weight, 0) / d.findings.length) * 100);

export const ALL_FINDINGS = AUDIT_DOMAINS.flatMap((d) =>
  d.findings.map((f) => ({ ...f, domainId: d.id, domainName: d.name, group: d.group })),
);

export const OVERALL_SCORE = Math.round(
  (ALL_FINDINGS.reduce((s, f) => s + STATE_COPY[f.state].weight, 0) / ALL_FINDINGS.length) * 100,
);

export const countBy = (state: FindingState) => ALL_FINDINGS.filter((f) => f.state === state).length;

/** The short list an investor should be handed: high-severity gaps, in order. */
export const PRIORITY_ACTIONS = ALL_FINDINGS.filter(
  (f) => f.state !== 'pass' && f.severity === 'high',
).map((f) => ({ ...f }));

export const groupScore = (g: AuditGroupId) => {
  const items = ALL_FINDINGS.filter((f) => f.group === g);
  return Math.round((items.reduce((s, f) => s + STATE_COPY[f.state].weight, 0) / items.length) * 100);
};
