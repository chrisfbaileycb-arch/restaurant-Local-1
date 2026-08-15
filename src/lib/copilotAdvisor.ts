// ------------------------------------------------------------
// Build-side copilot skills: helping an owner set up the hosted
// website / online ordering and pick the right hardware.
//
// Deterministic answers built from the SAME platform data the
// marketing pages and the shop render from — never re-typed copy.
// Falls through (unhandled) to the AI edge function.
// ------------------------------------------------------------

import {
  SITE_BLOCKS, STARTER_PLANS, DEVICE_KINDS, PLANS, SETUP_FEE, BUSINESS_TYPES,
  FAILOVER_STAGES, DEVICE_SEVERITY,
} from '@/data/platform';
import type { CopilotResult } from '@/lib/copilotBrain';
import type { LoadedMenu } from '@/lib/menuStore';

/** Kit → the concepts it fits, so one shop type maps to one plan. */
const KIT_FOR = (t: string): (typeof STARTER_PLANS)[number] => {
  if (/truck|cart|market|pop-?up|trailer|festival/.test(t)) return STARTER_PLANS[0];
  if (/bakery|restaurant|kitchen|grill|taco|pizza|bbq|diner|deli/.test(t)) return STARTER_PLANS[2];
  return STARTER_PLANS[1];
};

const KIT_GEAR: Record<string, string[]> = {
  phone: [
    'Your own phone as the register — nothing to buy',
    'Window / dash phone mount',
    'Tap & chip reader (or the plug-in swiper, no battery)',
    'Bluetooth guest receipt printer',
  ],
  tablet: [
    '10" touchscreen tablet — $149',
    'Swivel countertop stand — $39',
    'Tap-only card reader — $49',
    'Guest receipt printer — $99',
  ],
  'counter-kitchen': [
    'Everything in the tablet counter kit',
    'Locking cash drawer — $89',
    'WiFi kitchen ticket printer — $149',
    'Optional: LTE failover router so a dead modem never closes you',
  ],
};

const conceptFrom = (t: string) => {
  const hit = BUSINESS_TYPES.find((b) => t.includes(b.id.replace('-', ' ')) || t.includes(b.label.toLowerCase()));
  if (hit) return hit;
  if (/truck|trailer|cart/.test(t)) return BUSINESS_TYPES[1];
  if (/cafe|espresso|latte/.test(t)) return BUSINESS_TYPES[3];
  return null;
};

const gearReply = (t: string, menu: LoadedMenu): CopilotResult => {
  const concept = conceptFrom(t);
  const kit = KIT_FOR(concept ? `${concept.id} ${concept.label.toLowerCase()}` : t);
  const gear = KIT_GEAR[kit.id] || [];
  const who = concept ? concept.label : kit.who;
  const stations = menu.categories.length;
  return {
    reply: [
      `For ${who.toLowerCase()}, I would start with the ${kit.name} kit.`,
      kit.note,
      '',
      gear.map((g) => `• ${g}`).join('\n'),
      '',
      stations > 3
        ? `You have ${stations} menu categories, so I would route food to a kitchen printer and keep drinks at the counter — that is the one upgrade worth paying for early.`
        : 'With a short menu you do not need a second station yet. Add the kitchen printer the week you start hearing orders shouted twice.',
      `Software is $${PLANS[1].price}/mo (POS only) or $${PLANS[0].price}/mo with your website hosted, plus a one-time $${SETUP_FEE} setup. Free shipping, no contract — you can add gear later without changing anything.`,
    ].join('\n'),
    effects: [kit.name, `${gear.length} pieces`, 'Free shipping'],
    tone: 'ok',
  };
};

export const runAdvisor = (raw: string, menu: LoadedMenu): CopilotResult => {
  const t = raw.trim().toLowerCase();
  if (!t) return { reply: '', unhandled: true };

  // ---------------- Equipment ----------------
  if (/(recommend|spec|what).*(equipment|hardware|gear|kit)|equipment for|gear for|hardware for|what do i need to (open|start)|cheapest way to open|budget kit|starter kit/.test(t)) {
    return gearReply(t, menu);
  }

  if (/(kitchen printer|ticket printer|do i need a printer)/.test(t)) {
    const k = DEVICE_KINDS.find((d) => d.id === 'kitchen-printer')!;
    return {
      reply: `${k.name}: ${k.blurb}\n\nYou need one the moment somebody other than the person ringing the order is making the food. Under that, skip it — the guest receipt printer is enough. It is ${DEVICE_SEVERITY['kitchen-printer'] === 'blocking' ? 'a critical station, so if it ever stops answering we hold new orders instead of letting the line fall behind' : 'monitored all day'}. ${k.offline}`,
      effects: [k.connection, 'Category routing', 'Health monitored'],
      tone: 'ok',
    };
  }

  if (/(cash drawer|drawer)/.test(t) && /(need|should|buy|which)/.test(t)) {
    const d = DEVICE_KINDS.find((x) => x.id === 'cash-drawer')!;
    return { reply: `${d.name}: ${d.blurb} Connects ${d.connection.toLowerCase()}. ${d.offline}`, effects: ['$89 compact', 'Audit logged'], tone: 'ok' };
  }

  if (/(card reader|tap|chip|swiper|take cards)/.test(t) && !/rate/.test(t)) {
    const d = DEVICE_KINDS.find((x) => x.id === 'card-reader')!;
    return {
      reply: `${d.name}: ${d.blurb}\n\nIf you want the absolute cheapest start, the plug-in phone swiper needs no battery and no pairing — it is the thing that still works when everything else has quit.`,
      effects: ['Tap · chip · wallets', 'Least-cost routing'],
      tone: 'ok',
    };
  }

  if (/(internet|wifi|wi-fi|goes out|goes down|no signal|offline)/.test(t) && /(what|happens|if|lose)/.test(t)) {
    return {
      reply: `Five layers, in this order:\n${FAILOVER_STAGES.map((s, i) => `${i + 1}. ${s.name} — ${s.detail} (${s.seconds})`).join('\n')}\n\nEvery one of those still takes payments.`,
      effects: ['<3s failover', 'Never stops selling'],
      tone: 'ok',
    };
  }

  if (/(cost|price|monthly|how much|fees?)/.test(t) && /(month|cost|much|plan|software|pay)/.test(t)) {
    return {
      reply: [
        `$${SETUP_FEE} one time at signup — that covers menu parsing, the POS build, hardware staging and your site.`,
        `$0 while you build. Take a week or take two months.`,
        `${PLANS[0].name}: $${PLANS[0].price}/mo — ${PLANS[0].blurb}`,
        `${PLANS[1].name}: $${PLANS[1].price}/mo — ${PLANS[1].blurb}`,
        'Billing starts the day you take your first real order. No contract, cancel any month.',
      ].join('\n'),
      effects: [`$${SETUP_FEE} setup`, `$${PLANS[1].price}–$${PLANS[0].price}/mo`, 'No contract'],
      tone: 'ok',
    };
  }

  // ---------------- Website build ----------------
  if (/(build|make|set ?up|design|create).*(site|website|page)|website page|my page/.test(t)) {
    const shop = menu.isDemo ? 'your shop' : menu.shopName;
    return {
      reply: [
        `Here is the page I would build for ${shop}, top to bottom:`,
        ...SITE_BLOCKS.map((b, i) => `${i + 1}. ${b.title} — ${b.body.split('.')[0]}. (${b.source})`),
        '',
        `That is the whole site. ${menu.items.length} items are already loaded, so the ordering section and the menu cards are done the second you approve it. Give me your logo, four dish photos and your Google Business listing and it goes live.`,
      ].join('\n'),
      payload: {
        schema: 'love-local-eats.site-plan.v1',
        shop: menu.shopName,
        sections: SITE_BLOCKS.map((b) => ({ id: b.id, title: b.title, source: b.source })),
        menuItems: menu.items.length,
        hosting: { domain: true, ssl: true, includedWith: PLANS[0].name },
      },
      effects: [`${SITE_BLOCKS.length} sections`, `${menu.items.length} items ready`, 'Hosting included'],
      tone: 'ok',
    };
  }

  if (/(online ordering|order online|takeout online|commission)/.test(t)) {
    const b = SITE_BLOCKS[0];
    return {
      reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}\n\nIt runs off the same menu as the register, so an item you 86 disappears from ordering at the same second.`,
      effects: ['0% commission', 'Same menu as POS'],
      tone: 'ok',
    };
  }

  if (/(photo|picture|image|place card)/.test(t)) {
    const b = SITE_BLOCKS[1];
    return { reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}`, effects: ['Dashboard → POS → site'], tone: 'ok' };
  }

  if (/(hours|google business|open now)/.test(t)) {
    const b = SITE_BLOCKS[2];
    return { reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}`, effects: ['Google synced', 'Hourly re-check'], tone: 'ok' };
  }

  if (/(domain|hosting|ssl|host it|who hosts)/.test(t)) {
    return {
      reply: `We host it. Domain registration or transfer, SSL certificate, renewals, updates and uptime are all ours to worry about — it is included in ${PLANS[0].name} at $${PLANS[0].price}/mo. Already have a site you love? Take ${PLANS[1].name} at $${PLANS[1].price}/mo and I will just give you an order link to drop on it.`,
      effects: ['Domain + SSL', 'We renew it', 'Or keep your site'],
      tone: 'ok',
    };
  }

  if (/(hiring|application|apply|employment)/.test(t)) {
    const b = SITE_BLOCKS[4];
    return { reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}`, effects: ['Toggle on/off'], tone: 'ok' };
  }

  if (/(what do you (still )?need|what.*from me|next step|checklist)/.test(t)) {
    return {
      reply: [
        'Four things and you are live:',
        menu.isDemo
          ? '1. Your menu — a photo, PDF, CSV or a link. I parse items, prices, sizes and modifiers.'
          : `1. Menu — done. ${menu.items.length} items across ${menu.categories.length} categories are loaded.`,
        '2. Your Google Business listing, so hours, address and phone stay right on their own.',
        '3. Four dish photos for the place cards (a phone camera is fine).',
        '4. Your logo and social links.',
        'Hardware can come later — I will spec that whenever you want.',
      ].join('\n'),
      effects: menu.isDemo ? ['Menu needed'] : ['Menu loaded', `${menu.items.length} items`],
      tone: menu.isDemo ? 'warn' : 'ok',
    };
  }

  return { reply: '', unhandled: true };
};
