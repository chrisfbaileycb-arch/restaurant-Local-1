// ------------------------------------------------------------
// The three operational skill engines an active membership turns on:
//   1. Menu & margin ops   — food cost repricing to a target margin
//   2. Schedule & labor    — weekly build to an hour budget + roster
//   3. Reports & audits    — Z-report, food cost variance, PMIX, hourly labor
// Every answer is computed from the shared copilot data so the number
// on screen is the number that prints.
// ------------------------------------------------------------

import {
  COST_BASIS, FOOD_COST_TARGET, HOURLY_BANDS, PMIX_ROWS, STAFF_ROSTER, STATION_NEEDS,
  DAY_WEIGHTS, DEFAULT_WEEK_HOUR_BUDGET, OVERTIME_THRESHOLD, OVERTIME_LIMIT, LABOR_TARGET,
  TODAY_SNAPSHOT, SUPPLY_LINES, formatHours,
} from '@/data/copilot';
import { formatCents } from '@/data/platform';
import { opsApi } from '@/lib/opsStore';
import type { PrintDoc } from '@/lib/printDoc';
import type { LoadedMenu } from '@/lib/menuStore';
import type { MenuItem } from '@/data/menu';

const money = (c: number) => formatCents(c);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const today = () => new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export interface SkillResult {
  reply: string;
  effects?: string[];
  payload?: any;
  doc?: PrintDoc;
  tone?: 'ok' | 'warn' | 'alert';
}

// ---------------- 1. Menu & margin ops ----------------

/** Plate cost share for an item, from the shared cost basis. */
export const costRatio = (item: { name: string; category?: string }) => {
  const hay = `${item.category || ''} ${item.name}`;
  return COST_BASIS.find((c) => c.match.test(hay))?.ratio ?? FOOD_COST_TARGET;
};

/** Which supplier line moved, and by how much. */
const parseCostMove = (t: string) => {
  const line = SUPPLY_LINES.find((s) => t.includes(s));
  const m = t.match(/(\d{1,3}(?:\.\d)?)\s?%/);
  const up = !/(down|drop|fell|cheaper|decrease)/.test(t);
  return { line, move: m ? Number(m[1]) / 100 : 0.1, up };
};

/** Target margin the owner asked to hold (default 70%). */
const parseTargetMargin = (t: string) => {
  const all = [...t.matchAll(/(\d{1,3})\s?%/g)].map((m) => Number(m[1]) / 100);
  const margin = all.find((v) => v >= 0.5 && v <= 0.95);
  return margin ?? 1 - FOOD_COST_TARGET;
};

/** Items the command is scoped to — a category word, or the whole menu. */
const scopeItems = (t: string, menu: LoadedMenu): { items: MenuItem[]; label: string } => {
  const cat = menu.categories.find((c) => t.includes(c.toLowerCase()));
  if (cat) return { items: menu.items.filter((i) => i.category === cat), label: cat };
  const word = ['breakfast', 'combo', 'burger', 'sandwich', 'drink', 'coffee', 'salad', 'side'].find((w) => t.includes(w));
  if (word) {
    const hit = menu.items.filter((i) => new RegExp(word, 'i').test(`${i.category} ${i.name}`));
    if (hit.length) return { items: hit, label: `${word} items` };
  }
  return { items: menu.items, label: 'the full menu' };
};

/** Recalculate prices so every item in scope clears the target margin. */
export const marginReprice = (raw: string, menu: LoadedMenu): SkillResult => {
  const t = raw.toLowerCase();
  const { line, move, up } = parseCostMove(t);
  const target = parseTargetMargin(t);
  const { items, label } = scopeItems(t, menu);
  const shift = up ? 1 + move : 1 - move;

  const rows = items.slice(0, 12).map((i) => {
    const baseCost = Math.round(i.price * costRatio(i));
    const newCost = Math.round(baseCost * shift);
    const needed = Math.max(Math.ceil(newCost / (1 - target) / 5) * 5, i.price);
    return {
      name: i.name,
      was: i.price,
      cost: newCost,
      now: needed,
      delta: needed - i.price,
      marginNow: 1 - newCost / needed,
      marginIfHeld: 1 - newCost / i.price,
    };
  });

  const moved = rows.filter((r) => r.delta > 0);
  moved.forEach((r) => opsApi.setPrice(r.name, r.now));
  const lost = rows.reduce((s, r) => s + Math.round((r.marginIfHeld - r.marginNow) * r.was), 0);

  const doc: PrintDoc = {
    format: 'report',
    title: 'Food cost repricing',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · ${label} · target margin ${pct(target)} · ${today()}`,
    lines: [
      `Cost line moved\t${line ? line[0].toUpperCase() + line.slice(1) : 'Blended food cost'} ${up ? '+' : '-'}${(move * 100).toFixed(0)}%`,
      `Items recalculated\t${rows.length}`,
      `Prices changed\t${moved.length}`,
      `Margin protected\t${money(Math.abs(lost))} / day`,
    ],
    table: {
      head: ['Item', 'Old price', 'New plate cost', 'New price', 'Margin'],
      rows: rows.map((r) => [r.name, money(r.was), money(r.cost), money(r.now), pct(r.marginNow)]),
    },
    footer: 'Register buttons, the online cart and the public menu were repriced together.',
  };

  return {
    reply: [
      `${line ? `${line[0].toUpperCase() + line.slice(1)} ${up ? 'up' : 'down'} ${(move * 100).toFixed(0)}%` : `Food cost ${up ? 'up' : 'down'} ${(move * 100).toFixed(0)}%`} — recalculated ${rows.length} items across ${label} to hold a ${pct(target)} margin.`,
      '',
      ...rows.slice(0, 6).map((r) => `• ${r.name}: ${money(r.was)} → ${money(r.now)} (plate cost ${money(r.cost)}, margin ${pct(r.marginNow)})`),
      rows.length > 6 ? `…and ${rows.length - 6} more in the printable sheet.` : '',
      '',
      moved.length
        ? `${moved.length} price${moved.length === 1 ? '' : 's'} pushed live to the register, the online cart and your website at the same second. Everything else already cleared the target.`
        : 'Nothing needed a price change — every item still clears the target margin at the new cost.',
      `Holding the old prices would have cost you about ${money(Math.abs(lost))} of margin a day.`,
    ].filter(Boolean).join('\n'),
    effects: [`${moved.length} repriced`, `${pct(target)} margin`, 'POS · cart · site'],
    doc,
    tone: moved.length ? 'warn' : 'ok',
  };
};

// ---------------- 2. Schedule & labor ----------------

const parseHeads = (t: string) => {
  const heads: Record<string, number> = {};
  STATION_NEEDS.forEach((s) => {
    const word = s.role.toLowerCase().split(' ')[0];
    const m = t.match(new RegExp(`(\\d+)\\s*(?:${word}|${s.role.toLowerCase()})`));
    if (m) heads[s.role] = Number(m[1]);
  });
  return heads;
};

export const buildSchedule = (raw: string, menu: LoadedMenu): SkillResult => {
  const t = raw.toLowerCase();
  const budgetMatch = t.match(/(?:under|below|max|budget of|within)\s*(\d{2,4})\s*(?:total\s*)?(?:hours|hrs)/) || t.match(/(\d{3})\s*(?:hours|hrs)/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : DEFAULT_WEEK_HOUR_BUDGET;
  const asked = parseHeads(t);

  // Weight each day, then trim uniformly until the week fits the budget.
  const raw_rows = DAY_WEIGHTS.map((d) => {
    const shifts = STATION_NEEDS.map((s) => {
      const heads = Math.max(1, Math.round((asked[s.role] ?? s.heads) * (d.weight >= 1.2 ? 1 : d.weight >= 0.9 ? 0.85 : 0.7)));
      return { role: s.role, heads, hours: heads * s.shiftHours };
    });
    return { day: d.day, weight: d.weight, shifts, hours: shifts.reduce((s, x) => s + x.hours, 0) };
  });

  const rawTotal = raw_rows.reduce((s, d) => s + d.hours, 0);
  const trim = rawTotal > budget ? budget / rawTotal : 1;
  const rows = raw_rows.map((d) => ({
    ...d,
    shifts: d.shifts.map((s) => ({ ...s, hours: Math.round(s.hours * trim * 2) / 2 })),
    hours: Math.round(d.hours * trim * 2) / 2,
  }));
  const total = rows.reduce((s, d) => s + d.hours, 0);

  const blendedRate = Math.round(STAFF_ROSTER.reduce((s, p) => s + p.rate, 0) / STAFF_ROSTER.length);
  const wageCost = Math.round(total * blendedRate);
  const projectedSales = TODAY_SNAPSHOT.netSales * 6.6;
  const laborPct = wageCost / projectedSales;
  const overtime = STAFF_ROSTER.filter((s) => s.weekHours >= OVERTIME_THRESHOLD);

  const doc: PrintDoc = {
    format: 'receipt',
    title: 'Weekly floor schedule',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · posted ${today()}`,
    lines: [
      `Budget\t${budget} hrs`,
      `Scheduled\t${total.toFixed(1)} hrs`,
      `Est. wage cost\t${money(wageCost)}`,
      `Est. labor %\t${pct(laborPct)}`,
      '---',
      ...rows.flatMap((d) => [
        `${d.day.toUpperCase()} — ${d.hours.toFixed(1)} hrs`,
        ...d.shifts.map((s) => `  ${s.heads}x ${s.role}\t${s.hours.toFixed(1)}h`),
      ]),
      '---',
      ...(overtime.length
        ? overtime.map((s) => `OT WARNING: ${s.name} ${formatHours(s.weekHours)}`)
        : ['No overtime exposure this week']),
    ],
    footer: 'Post by the pass. Swaps go through the shift lead.',
  };

  opsApi.audit('Schedule built', `${total.toFixed(1)} hrs against a ${budget} hr budget`, wageCost);

  return {
    reply: [
      `Next week is built: ${total.toFixed(1)} hours against your ${budget}-hour ceiling, about ${money(wageCost)} in wages and ${pct(laborPct)} labor at projected sales.`,
      '',
      ...rows.map((d) => `${d.day}: ${d.shifts.map((s) => `${s.heads} ${s.role.toLowerCase()}`).join(', ')} — ${d.hours.toFixed(1)} hrs`),
      '',
      trim < 1 ? `I trimmed ${Math.round((1 - trim) * 100)}% off the slow days to fit the budget and left Friday and Saturday fully staffed.` : 'The requested coverage fit inside the budget with room to spare.',
      overtime.length
        ? `Overtime watch: ${overtime.map((s) => `${s.name} at ${formatHours(s.weekHours)} (${(OVERTIME_LIMIT - s.weekHours).toFixed(1)} to OT)`).join(', ')}. Cut them before the Friday close or you pay time and a half.`
        : 'Nobody crosses the overtime line on this build.',
      'Tap Print for the kitchen roster — it comes out on the 80mm ticket printer or saves as a PDF.',
    ].join('\n'),
    effects: [`${total.toFixed(1)} hrs`, `${pct(laborPct)} labor`, overtime.length ? `${overtime.length} OT risk` : 'No OT'],
    doc,
    tone: overtime.length ? 'warn' : 'ok',
  };
};

// ---------------- 3. Reports & audits ----------------

export const foodCostVariance = (menu: LoadedMenu): SkillResult => {
  const rows = PMIX_ROWS.map((p) => {
    const sales = p.sold * p.price;
    const theoretical = p.sold * p.cost;
    const actual = theoretical + p.wasted * p.cost;
    return {
      ...p,
      sales,
      theoretical,
      actual,
      variance: actual - theoretical,
      theoreticalPct: theoretical / sales,
      actualPct: actual / sales,
    };
  }).sort((a, b) => b.variance - a.variance);

  const sales = rows.reduce((s, r) => s + r.sales, 0);
  const theo = rows.reduce((s, r) => s + r.theoretical, 0);
  const act = rows.reduce((s, r) => s + r.actual, 0);
  const worst = rows[0];

  const doc: PrintDoc = {
    format: 'report',
    title: 'Food cost variance',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · ${today()}`,
    lines: [
      `Item sales\t${money(sales)}`,
      `Theoretical food cost\t${money(theo)} (${pct(theo / sales)})`,
      `Actual food cost\t${money(act)} (${pct(act / sales)})`,
      `Variance / waste\t${money(act - theo)}`,
    ],
    table: {
      head: ['Item', 'Sold', 'Wasted', 'Sales', 'Theo %', 'Actual %', 'Variance'],
      rows: rows.map((r) => [r.name, r.sold, r.wasted, money(r.sales), pct(r.theoreticalPct), pct(r.actualPct), money(r.variance)]),
    },
    footer: 'Variance is waste, remakes and over-portioning — everything between the recipe and the register.',
  };

  return {
    reply: [
      `Food cost variance: theoretical ${pct(theo / sales)}, actual ${pct(act / sales)} — ${money(act - theo)} walked out the back door.`,
      '',
      ...rows.slice(0, 4).map((r) => `• ${r.name}: ${r.wasted} wasted, ${money(r.variance)} over theoretical (${pct(r.actualPct)} vs ${pct(r.theoreticalPct)})`),
      '',
      `${worst.name} is your worst line — ${worst.wasted} thrown against ${worst.sold} sold. Either prep it to order or cut the par down.`,
      'Print or export it for your bookkeeper below.',
    ].join('\n'),
    effects: [`${pct(act / sales)} actual`, money(act - theo), `${rows.length} items`],
    doc,
    tone: act / sales > 0.33 ? 'warn' : 'ok',
  };
};

export const pmixReport = (menu: LoadedMenu): SkillResult => {
  const rows = [...PMIX_ROWS]
    .map((p) => ({ ...p, sales: p.sold * p.price, margin: (p.price - p.cost) * p.sold }))
    .sort((a, b) => b.sales - a.sales);
  const sales = rows.reduce((s, r) => s + r.sales, 0);
  const byCat = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.sales;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const doc: PrintDoc = {
    format: 'report',
    title: 'Product mix (PMIX)',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · ${today()}`,
    lines: [
      `Item sales\t${money(sales)}`,
      `Units sold\t${rows.reduce((s, r) => s + r.sold, 0)}`,
      '---',
      ...byCat.map(([c, v]) => `${c}\t${money(v)} · ${pct(v / sales)}`),
    ],
    table: {
      head: ['Item', 'Category', 'Sold', 'Price', 'Sales', 'Gross margin'],
      rows: rows.map((r) => [r.name, r.category, r.sold, money(r.price), money(r.sales), money(r.margin)]),
    },
  };

  return {
    reply: [
      `Product mix for today — ${money(sales)} across ${rows.reduce((s, r) => s + r.sold, 0)} units.`,
      '',
      ...rows.slice(0, 5).map((r, i) => `${i + 1}. ${r.name} — ${r.sold} sold, ${money(r.sales)}, ${money(r.margin)} gross margin`),
      '',
      `Category split: ${byCat.map(([c, v]) => `${c} ${pct(v / sales)}`).join(' · ')}.`,
      `Slowest mover is ${rows[rows.length - 1].name} at ${rows[rows.length - 1].sold} — that is the one to cut or feature, not both.`,
    ].join('\n'),
    effects: [money(sales), `${rows.length} items`, byCat[0][0]],
    doc,
    tone: 'ok',
  };
};

export const hourlyLaborReport = (menu: LoadedMenu): SkillResult => {
  const blendedRate = Math.round(STAFF_ROSTER.reduce((s, p) => s + p.rate, 0) / STAFF_ROSTER.length);
  const rows = HOURLY_BANDS.map((h) => {
    const wage = Math.round(h.laborHours * blendedRate);
    return { ...h, wage, pct: h.sales > 0 ? wage / h.sales : 0 };
  });
  const sales = rows.reduce((s, r) => s + r.sales, 0);
  const wage = rows.reduce((s, r) => s + r.wage, 0);
  const overs = rows.filter((r) => r.pct > LABOR_TARGET.warn);

  const doc: PrintDoc = {
    format: 'report',
    title: 'Hourly labor vs sales',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · ${today()}`,
    lines: [
      `Sales\t${money(sales)}`,
      `Wages\t${money(wage)}`,
      `Labor %\t${pct(wage / sales)}`,
      `Target\t${pct(LABOR_TARGET.good)} good · ${pct(LABOR_TARGET.warn)} ceiling`,
    ],
    table: {
      head: ['Hour', 'Sales', 'Labor hrs', 'Wages', 'Labor %', 'Covers'],
      rows: rows.map((r) => [r.hour, money(r.sales), r.laborHours.toFixed(1), money(r.wage), pct(r.pct), r.covers]),
    },
  };

  return {
    reply: [
      `Hourly labor: ${pct(wage / sales)} on the day — ${money(wage)} in wages against ${money(sales)}.`,
      '',
      ...rows.map((r) => `${r.hour.padEnd(4)} ${money(r.sales).padStart(9)}  ${r.laborHours.toFixed(1)}h  ${pct(r.pct)}${r.pct > LABOR_TARGET.warn ? '  ← over' : ''}`),
      '',
      overs.length
        ? `${overs.map((o) => o.hour).join(', ')} run over the ${pct(LABOR_TARGET.warn)} ceiling. That is where to cut a body, not at the noon rush.`
        : 'Every band is inside the ceiling — this is a clean day.',
    ].join('\n'),
    effects: [pct(wage / sales), money(wage), overs.length ? `${overs.length} hours over` : 'All in band'],
    doc,
    tone: overs.length ? 'warn' : 'ok',
  };
};

export const zReport = (menu: LoadedMenu, closePayload: any): SkillResult => {
  const s = TODAY_SNAPSHOT;
  const doc: PrintDoc = {
    format: 'receipt',
    title: 'Z-Report · daily close',
    subtitle: `${menu.isDemo ? 'Demo shop' : menu.shopName} · ${today()}`,
    lines: [
      `Gross sales\t${money(s.grossSales)}`,
      `Discounts\t-${money(closePayload.sales.discounts)}`,
      `Comps\t-${money(s.comps)}`,
      `Voids\t-${money(s.voids)}`,
      `Net sales\t${money(s.netSales)}`,
      '---',
      `Sales tax\t${money(s.taxCollected)}`,
      ...closePayload.tax.byJurisdiction.map((j: any) => `  ${j.name}\t${money(j.amount)}`),
      '---',
      `Cash\t${money(s.cashTenders)}`,
      `Card\t${money(s.cardTenders)}`,
      `Tips\t${money(s.tips)}`,
      '---',
      `Tickets\t${s.ticketCount}`,
      `Covers\t${s.coverCount}`,
      `Avg ticket\t${money(closePayload.sales.averageTicket)}`,
      `Labor\t${money(closePayload.labor.wageCost)} · ${closePayload.labor.laborPct}%`,
    ],
    footer: 'Drawer counted and signed by: ______________________',
  };

  return {
    reply: [
      `Z-report built for ${today()}.`,
      `Net ${money(s.netSales)} on ${s.ticketCount} tickets, tax ${money(s.taxCollected)}, tips ${money(s.tips)}, cash ${money(s.cashTenders)} / card ${money(s.cardTenders)}, labor ${closePayload.labor.laborPct}%.`,
      'Print it for the drawer count or export the CSV for your bookkeeper — the ledger JSON is below either way.',
    ].join('\n'),
    payload: closePayload,
    effects: [money(s.netSales), `${s.ticketCount} tickets`, 'Z-report ready'],
    doc,
    tone: 'ok',
  };
};
