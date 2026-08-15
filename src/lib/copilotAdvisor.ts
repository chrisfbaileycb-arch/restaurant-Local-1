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
import { SITE_SECTIONS, missingSitePieces, type SiteSettings } from '@/lib/siteSettings';

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
      `Here is that kit priced from the shop — take anything out you do not want, then add it to your cart.`,
      `Software is $${PLANS[1].price}/mo (POS only) or $${PLANS[0].price}/mo with your website hosted, plus a one-time $${SETUP_FEE} setup. Free shipping, no contract — you can add gear later without changing anything.`,
    ].join('\n'),
    // The sidebar turns this into real product cards priced from ecom_products.
    kit: { planId: kit.id, name: kit.name, who, note: kit.note, handles: kit.handles },
    effects: [kit.name, `${kit.handles.length} pieces`, 'Free shipping'],
    tone: 'ok',
  };
};

/**
 * @param site the owner's SAVED website settings, when we have them —
 *   the build answers read real values instead of describing a generic plan.
 */
export const runAdvisor = (raw: string, menu: LoadedMenu, site?: SiteSettings | null): CopilotResult => {
  const t = raw.trim().toLowerCase();
  if (!t) return { reply: '', unhandled: true };

  // ---------------- Equipment ----------------
  if (/(recommend|spec|what).*(equipment|hardware|gear|kit)|equipment for|gear for|hardware for|what do i need to (open|start)|cheapest way to open|budget kit|starter kit|build (me )?a kit|add the kit/.test(t)) {
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

  // ---------------- Website build (reads the owner's SAVED settings) ----------------
  if (/(build|make|set ?up|design|create).*(site|website|page)|website page|my page/.test(t)) {
    const shop = menu.isDemo ? 'your shop' : menu.shopName;
    const on = site ? site.section_order : SITE_SECTIONS.map((s) => s.id);
    const live = SITE_SECTIONS.filter((s) => on.includes(s.id));
    const off = SITE_SECTIONS.filter((s) => !on.includes(s.id));
    const gaps = missingSitePieces(site);

    return {
      reply: [
        site
          ? `Reading your saved website settings for ${shop} — ${live.length} of ${SITE_SECTIONS.length} sections are switched on right now.`
          : `Here is the page I would build for ${shop}, top to bottom:`,
        ...live.map((s, i) => `${i + 1}. ${s.title} — ${s.summary} (${s.source})`),
        off.length ? `\nSwitched off: ${off.map((s) => s.title).join(', ')}. Flip any of them on in Dashboard → Website.` : '',
        '',
        site?.domain ? `Domain: ${site.domain} — hosting, SSL and renewals are ours.` : 'Domain: not saved yet — add it in Dashboard → Website and I will register or transfer it.',
        site?.google_place_id ? `Google Business listing: ${site.google_place_id} — hours, address and phone stay right on their own.` : 'Google Business listing: not linked yet, so hours have to be typed by hand.',
        site?.logo_url ? 'Logo: uploaded and in use across the header, receipts and the register.' : 'Logo: not uploaded yet.',
        site ? `Hiring form: ${site.hiring_enabled ? 'on — applications land in your dashboard.' : 'off.'}` : '',
        '',
        `${menu.items.length} menu items are already loaded, so ordering and the menu cards are done the second you approve it.`,
        gaps.length ? `Still need from you: ${gaps.join(', ')}.` : 'Nothing is missing — say the word and this goes live.',
      ].filter(Boolean).join('\n'),
      payload: {
        schema: 'love-local-eats.site-plan.v1',
        shop: menu.shopName,
        shopId: menu.shopId,
        saved: !!site,
        domain: site?.domain || null,
        googlePlaceId: site?.google_place_id || null,
        logoUrl: site?.logo_url || null,
        socials: site?.socials || {},
        hiringEnabled: !!site?.hiring_enabled,
        sections: live.map((s) => ({ id: s.id, title: s.title, source: s.source })),
        sectionsOff: off.map((s) => s.id),
        menuItems: menu.items.length,
        hosting: { domain: true, ssl: true, includedWith: PLANS[0].name },
      },
      effects: [
        `${live.length}/${SITE_SECTIONS.length} sections on`,
        site?.domain ? site.domain : 'Domain needed',
        `${menu.items.length} items ready`,
      ],
      tone: gaps.length ? 'warn' : 'ok',
    };
  }

  if (/(online ordering|order online|takeout online|commission)/.test(t)) {
    const b = SITE_BLOCKS[0];
    return {
      reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}\n\nIt runs off the same menu as the register, so an item you 86 disappears from ordering at the same second.${
        site?.domain ? ` Your ordering page lives at ${site.domain}/order.` : ''
      }`,
      effects: ['0% commission', 'Same menu as POS'],
      tone: 'ok',
    };
  }

  if (/(logo|photo|picture|image|place card)/.test(t)) {
    const b = SITE_BLOCKS[1];
    return {
      reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}\n\n${
        site?.logo_url
          ? 'Your logo is saved and already on the header, receipts and the register.'
          : 'Upload your logo and dish photos in Dashboard → Website — they save straight to your shop and I use them everywhere.'
      }`,
      effects: [site?.logo_url ? 'Logo saved' : 'Logo needed', 'Dashboard → Website'],
      tone: site?.logo_url ? 'ok' : 'warn',
    };
  }

  if (/(hours|google business|open now)/.test(t)) {
    const b = SITE_BLOCKS[2];
    return {
      reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}\n\n${
        site?.google_place_id
          ? `Linked listing: ${site.google_place_id}. Hours re-check hourly.`
          : 'No listing saved yet — paste your Google Business place ID or profile link in Dashboard → Website and hours stop being your job.'
      }`,
      effects: [site?.google_place_id ? 'Google linked' : 'Listing needed', 'Hourly re-check'],
      tone: site?.google_place_id ? 'ok' : 'warn',
    };
  }

  if (/(domain|hosting|ssl|host it|who hosts)/.test(t)) {
    return {
      reply: `${
        site?.domain
          ? `Your saved domain is ${site.domain}. `
          : 'No domain saved yet — add it in Dashboard → Website. '
      }We host it. Domain registration or transfer, SSL certificate, renewals, updates and uptime are all ours to worry about — it is included in ${PLANS[0].name} at $${PLANS[0].price}/mo. Already have a site you love? Take ${PLANS[1].name} at $${PLANS[1].price}/mo and I will just give you an order link to drop on it.`,
      effects: [site?.domain || 'Domain + SSL', 'We renew it', 'Or keep your site'],
      tone: 'ok',
    };
  }

  if (/(hiring|application|apply|employment)/.test(t)) {
    const b = SITE_BLOCKS[4];
    return {
      reply: `${b.body}\n\n${b.bullets.map((x) => `• ${x}`).join('\n')}\n\nRight now it is ${
        site?.hiring_enabled ? 'ON — applications land in your dashboard.' : 'OFF. Flip the switch in Dashboard → Website whenever you start hiring.'
      }`,
      effects: [site?.hiring_enabled ? 'Hiring form on' : 'Hiring form off'],
      tone: 'ok',
    };
  }

  if (/(what do you (still )?need|what.*from me|next step|checklist)/.test(t)) {
    const gaps = missingSitePieces(site);
    return {
      reply: [
        gaps.length ? `${gaps.length} thing${gaps.length === 1 ? '' : 's'} left and you are live:` : 'Everything I need is saved:',
        menu.isDemo
          ? '• Your menu — a photo, PDF, CSV or a link. I parse items, prices, sizes and modifiers.'
          : `• Menu — done. ${menu.items.length} items across ${menu.categories.length} categories are loaded.`,
        `• Google Business listing — ${site?.google_place_id ? `linked (${site.google_place_id}).` : 'not linked yet.'}`,
        `• Logo — ${site?.logo_url ? 'uploaded.' : 'not uploaded yet.'}`,
        `• Domain — ${site?.domain ? `${site.domain}, hosted by us.` : 'not saved yet.'}`,
        `• Social links — ${Object.values(site?.socials || {}).filter(Boolean).length || 0} saved.`,
        '',
        'All of that saves in Dashboard → Website, and hardware can come later — I will spec that whenever you want.',
      ].join('\n'),
      effects: gaps.length ? gaps.slice(0, 3) : ['Ready to launch'],
      tone: gaps.length ? 'warn' : 'ok',
    };
  }


  return { reply: '', unhandled: true };
};
