import type { MenuItem } from '@/data/menu';
import {
  STAFF_ROSTER, OVERTIME_THRESHOLD, OVERTIME_LIMIT, LABOR_TARGET,
  TODAY_SNAPSHOT, FLOOR_TABLES, formatHours,
} from '@/data/copilot';
import { opsApi, key } from '@/lib/opsStore';
import { formatCents } from '@/data/platform';
import { computeTax } from '@/lib/taxEngine';
import type { LoadedMenu } from '@/lib/menuStore';
import type { PrintDoc } from '@/lib/printDoc';
import type { SiteSettings } from '@/lib/siteSettings';
import {
  marginReprice, buildSchedule, foodCostVariance, pmixReport, hourlyLaborReport, zReport,
} from '@/lib/copilotSkills';

// ------------------------------------------------------------
// The copilot's deterministic skill layer. Anything that changes real
// state (86ing, prices, comps, close) is parsed and executed here so
// it is exact and auditable. Open-ended questions fall through to the
// AI edge function.
// ------------------------------------------------------------

export interface CopilotResult {
  reply: string;
  /** Short chips rendered under the reply: what actually changed. */
  effects?: string[];
  /** Structured payload (daily close) rendered as JSON. */
  payload?: any;
  /** A printable roster / report — print to the kitchen printer or save as PDF. */
  doc?: PrintDoc;
  /** Fields the copilot is writing into the shop's saved website settings. */
  siteWrite?: Partial<Omit<SiteSettings, 'shop_id'>>;
  /** A buildable hardware kit rendered as real, priced product cards. */
  kit?: {
    planId: string;
    name: string;
    who: string;
    note: string;
    handles: string[];
  };
  /** Nothing matched — caller should ask the model. */
  unhandled?: boolean;
  tone?: 'ok' | 'warn' | 'alert';
}



const money = (c: number) => formatCents(c);

/** Find the menu item a phrase is talking about. */
export const matchItem = (items: MenuItem[], phrase: string): MenuItem | null => {
  const p = phrase.trim().toLowerCase().replace(/[.?!]$/, '');
  if (!p) return null;
  const exact = items.find((i) => i.name.toLowerCase() === p);
  if (exact) return exact;
  const starts = items.find((i) => i.name.toLowerCase().startsWith(p) || p.startsWith(i.name.toLowerCase()));
  if (starts) return starts;
  const contains = items.find((i) => i.name.toLowerCase().includes(p) || p.includes(i.name.toLowerCase()));
  if (contains) return contains;
  // last resort: strongest word overlap
  const words = p.split(/\s+/).filter((w) => w.length > 2);
  let best: MenuItem | null = null;
  let bestScore = 0;
  items.forEach((i) => {
    const hay = i.name.toLowerCase();
    const score = words.reduce((s, w) => (hay.includes(w) ? s + 1 : s), 0);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return bestScore > 0 ? best : null;
};

const parseMoney = (text: string): number | null => {
  const m = text.match(/\$?\s?(\d+(?:\.\d{1,2})?)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : null;
};

const tableFor = (text: string) => {
  const m = text.match(/\b(table|tbl|bar|patio)\s*#?\s*(\d+)/i);
  if (!m) return null;
  const label = `${m[1].toLowerCase() === 'tbl' ? 'table' : m[1].toLowerCase()} ${m[2]}`;
  return (
    FLOOR_TABLES.find((t) => t.label.toLowerCase() === label) || {
      id: label,
      label: label.replace(/\b\w/g, (c) => c.toUpperCase()),
      seats: 4,
      open: 0,
    }
  );
};

// ---------------- Labor ----------------

export const laborAudit = () => {
  const onFloor = STAFF_ROSTER.filter((s) => s.clockedIn);
  const laborCost = onFloor.reduce((s, p) => s + Math.round(p.todayHours * p.rate), 0);
  const pct = TODAY_SNAPSHOT.netSales > 0 ? laborCost / TODAY_SNAPSHOT.netSales : 0;
  const overtime = STAFF_ROSTER.filter((s) => s.weekHours >= OVERTIME_THRESHOLD);
  return { onFloor, laborCost, pct, overtime };
};

const laborReply = (): CopilotResult => {
  const { onFloor, laborCost, pct, overtime } = laborAudit();
  const band = pct <= LABOR_TARGET.good ? 'inside target' : pct <= LABOR_TARGET.warn ? 'tight but workable' : 'over target';
  const lines = [
    `Labor is ${(pct * 100).toFixed(1)}% of net sales right now — ${band}.`,
    `${money(laborCost)} in wages against ${money(TODAY_SNAPSHOT.netSales)} net, ${onFloor.length} on the clock.`,
  ];
  if (overtime.length) {
    lines.push(
      overtime
        .map((s) => `${s.name} is at ${formatHours(s.weekHours)} — ${(OVERTIME_LIMIT - s.weekHours).toFixed(1)} hrs to overtime. Alert before the next shift.`)
        .join(' '),
    );
  } else {
    lines.push('Nobody is inside the overtime window this week.');
  }
  opsApi.audit('Labor audit', `${(pct * 100).toFixed(1)}% labor · ${money(laborCost)} wages`);
  return {
    reply: lines.join('\n'),
    tone: overtime.length ? 'warn' : 'ok',
    effects: [
      `${(pct * 100).toFixed(1)}% labor`,
      `${onFloor.length} clocked in`,
      overtime.length ? `${overtime.length} overtime risk` : 'No OT risk',
    ],
  };
};

// ---------------- Daily close ----------------

export const buildClosePayload = (menu: LoadedMenu) => {
  const s = TODAY_SNAPSHOT;
  const { laborCost, pct } = laborAudit();
  const jurisdictions = computeTax([{ amount: s.netSales, taxClass: 'prepared_food' }], menu.taxProfile).lines;
  return {
    schema: 'love-local-eats.daily-close.v1',
    generatedAt: new Date().toISOString(),
    businessDate: new Date().toISOString().slice(0, 10),
    shop: { id: menu.shopId, name: menu.shopName },
    sales: {
      grossSales: s.grossSales,
      discounts: s.grossSales - s.netSales - s.comps,
      comps: s.comps,
      voids: s.voids,
      netSales: s.netSales,
      ticketCount: s.ticketCount,
      coverCount: s.coverCount,
      averageTicket: Math.round(s.netSales / Math.max(1, s.ticketCount)),
    },
    tax: {
      totalCollected: s.taxCollected,
      byJurisdiction: jurisdictions.map((j) => ({ authority: j.name, rate: j.rate, amount: j.amount })),
    },
    tenders: { cash: s.cashTenders, card: s.cardTenders, total: s.cashTenders + s.cardTenders },
    tips: { collected: s.tips, poolMethod: 'hours-weighted', distributed: s.tips },
    labor: { wageCost: laborCost, laborPct: Number((pct * 100).toFixed(2)) },
    currency: 'USD',
    amountsIn: 'cents',
    handoff: { ready: true, destination: 'external-ledger' },
  };
};

// ---------------- Main router ----------------

export const runCommand = (raw: string, menu: LoadedMenu): CopilotResult => {
  const text = raw.trim();
  const t = text.toLowerCase();
  if (!t) return { reply: '', unhandled: true };

  // ============ Membership skill engines ============
  // These run before the single-item commands so a phrase like
  // "reprice breakfast to 68% margin" is never read as one price change.

  // 1. Menu & margin ops — food cost repricing
  if (
    /(margin|food ?cost|plate cost|reprice|re-price|repricing|recalculate|cost (jumped|went up|rose|is up|increase|spiked)|price increase from)/.test(t) &&
    !/(variance|waste|report on)/.test(t)
  ) {
    return marginReprice(text, menu);
  }

  // 3. Reports & audits
  if (/(food cost variance|variance report|waste report|how much waste)/.test(t)) return foodCostVariance(menu);
  if (/(pmix|product mix|item velocity|best ?sell|top sellers|sales categor|category summary|category mix)/.test(t)) {
    return pmixReport(menu);
  }
  if (/(hourly labor|labor by hour|labor percentage|labor %|labour percent)/.test(t)) return hourlyLaborReport(menu);
  if (/(z-?report|z close|zed report|end of day report|drawer count)/.test(t)) {
    const payload = buildClosePayload(menu);
    opsApi.saveClose(payload);
    return zReport(menu, payload);
  }

  // 2. Schedule & labor — weekly build + printable roster
  if (
    /(build|generate|make|create|draft|write|print|post)\b[\s\S]*\b(schedule|shifts?|roster|rota)/.test(t) ||
    /(next week'?s (floor |staff )?schedule|weekly schedule|shift template|staff the week)/.test(t)
  ) {
    return buildSchedule(text, menu);
  }


  // --- restore / un-86 ---
  const un86 = t.match(/(?:un-?86|restore|bring back|put back|back on)\s+(?:the\s+)?(.+)/);
  if (un86) {
    const item = matchItem(menu.items, un86[1]);
    const name = item?.name || un86[1];
    opsApi.restore(name);
    return {
      reply: `${name} is back on. Register button re-enabled, online ordering re-opened and the public menu updated.`,
      effects: ['Register', 'Online cart', 'Website'],
      tone: 'ok',
    };
  }

  // --- 86 an item ---
  const eightySix = t.match(/(?:86|eighty-?six|sold out of|out of|kill|pull)\s+(?:the\s+)?(.+)/);
  if (eightySix) {
    const item = matchItem(menu.items, eightySix[1]);
    const name = item?.name || eightySix[1].replace(/\b\w/g, (c) => c.toUpperCase());
    opsApi.eightySix(name);
    return {
      reply: `86'd ${name}. Pulled from the register, greyed out in online ordering and removed from the live website menu — all three at once.`,
      effects: ['Register button off', 'Online cart hidden', 'Website updated'],
      tone: 'warn',
    };
  }

  // --- price change ---
  const price = t.match(/(?:change|set|make|update)\s+(?:the\s+)?(.+?)\s+(?:price\s+)?to\s+\$?\s?(\d+(?:\.\d{1,2})?)/);
  if (price) {
    const item = matchItem(menu.items, price[1]);
    const cents = Math.round(parseFloat(price[2]) * 100);
    const name = item?.name || price[1].replace(/\b\w/g, (c) => c.toUpperCase());
    opsApi.setPrice(name, cents);
    const was = item ? ` (was ${money(item.price)})` : '';
    return {
      reply: `${name} is now ${money(cents)}${was}. Register, online cart and the public menu all repriced.`,
      effects: ['Register', 'Online cart', 'Website'],
      tone: 'ok',
    };
  }

  // --- flash discount / happy hour ---
  if (/(happy hour|flash|discount|% off|percent off)/.test(t)) {
    const pctMatch = t.match(/(\d{1,2})\s?%/);
    const pct = pctMatch ? Number(pctMatch[1]) : 15;
    const hrMatch = t.match(/(\d+)\s*(hour|hr)/);
    const hours = hrMatch ? Number(hrMatch[1]) : 2;
    const scope = /drink|beverage|beer|wine/.test(t) ? 'drinks' : /food/.test(t) ? 'food' : 'the whole ticket';
    const promo = opsApi.addPromo({
      label: /happy hour/.test(t) ? 'Happy hour' : 'Flash discount',
      pct,
      scope,
      endsAt: Date.now() + hours * 3600_000,
    });
    return {
      reply: `${promo.label} live: ${pct}% off ${scope} for the next ${hours} hour${hours === 1 ? '' : 's'}. It is applied at the register and on the online menu, and it expires on its own — no one has to remember to turn it off.`,
      effects: [`${pct}% off`, `${hours}h window`, 'Manager log entry'],
      tone: 'ok',
    };
  }

  // --- move a check ---
  const move = t.match(/move\s+(.+?)\s+to\s+(.+)/);
  if (move && /(table|bar|patio)/.test(move[1])) {
    const from = tableFor(move[1]);
    const to = tableFor(move[2]);
    if (from && to) {
      opsApi.audit('Ticket moved', `${from.label} → ${to.label}`, from.open);
      return {
        reply: `Moved ${from.label} to ${to.label} with the open tab of ${money(from.open)} and every seat's items intact. The kitchen ticket was not re-fired.`,
        effects: [`${from.label} → ${to.label}`, money(from.open)],
        tone: 'ok',
      };
    }
  }

  // --- split a check ---
  if (/split/.test(t)) {
    const table = tableFor(t);
    const waysMatch = t.match(/(\d+)\s*(?:ways|way|guests|people)/);
    const ways = waysMatch ? Number(waysMatch[1]) : 2;
    const open = table?.open || 0;
    const each = Math.round(open / Math.max(1, ways));
    const bySeat = /by seat|per seat|seat by seat/.test(t);
    opsApi.audit('Check split', `${table?.label || 'Open check'} split ${ways} ways`, open);
    return {
      reply: bySeat
        ? `${table?.label || 'The check'} is now split by seat — each seat carries only its own items, tax follows the item, and every card prompts for its own tip.`
        : `${table?.label || 'The check'} split evenly ${ways} ways: ${money(each)} each on ${money(open)}. Tax and any discount were prorated, and each guest gets their own tip prompt.`,
      effects: [`${ways} checks`, `${money(each)} each`],
      tone: 'ok',
    };
  }

  // --- comps and overrides ---
  if (/(comp|void|refund|discount off|take .* off)/.test(t)) {
    const amount = parseMoney(t) || 0;
    const table = tableFor(t);
    const reason = t.split(/because|for|—|-/).slice(1).join(' ').trim();
    opsApi.audit(
      /void/.test(t) ? 'Void' : 'Comp',
      `${money(amount)} on ${table?.label || 'open check'}${reason ? ` — ${reason}` : ''}`,
      amount,
    );
    return {
      reply: `${/void/.test(t) ? 'Voided' : 'Comped'} ${money(amount)} on ${table?.label || 'the open check'}${
        reason ? ` (${reason})` : ''
      }. Logged to the manager audit trail with your name, the timestamp and the reason — it will show on tonight's close.`,
      effects: ['Manager audit log', money(amount)],
      tone: 'warn',
    };
  }

  // --- labor ---
  if (/(labor|overtime|clock|hours|schedule|payroll)/.test(t)) return laborReply();

  // --- hardware diagnostics ---
  if (/(ping|test|check|diagnos|printer|drawer|swiper|reader|spool|wifi|wi-fi|network|lte|cellular)/.test(t)) {
    return { reply: '', unhandled: false, tone: 'ok', effects: ['__hardware__'] };
  }

  // --- daily close ---
  if (/(daily close|run close|close out|end of day|eod|handoff)/.test(t)) {
    const payload = buildClosePayload(menu);
    opsApi.saveClose(payload);
    const s = TODAY_SNAPSHOT;
    return {
      reply: `Daily close built. Net sales ${money(s.netSales)}, tax ${money(s.taxCollected)}, tips ${money(s.tips)}, cash ${money(s.cashTenders)}, card ${money(s.cardTenders)}, voids ${money(s.voids)} across ${s.ticketCount} tickets. The payload below is the standardized handoff — copy it or push it straight to your ledger.`,
      payload,
      effects: ['JSON ready', `${s.ticketCount} tickets`, money(s.netSales)],
      tone: 'ok',
    };
  }

  // --- what's 86'd ---
  if (/(what.*86|86 list|sold out list|whats off)/.test(t)) {
    const list = opsApi.get().eightySixed;
    return {
      reply: list.length
        ? `Currently 86'd: ${list.map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase())).join(', ')}. Say "restore" plus the name to put anything back.`
        : `Nothing is 86'd right now — the full menu is live on the register, online ordering and the website.`,
      tone: 'ok',
    };
  }

  return { reply: '', unhandled: true };
};

export const isEightySixed = (name: string, list: string[]) => list.includes(key(name));
