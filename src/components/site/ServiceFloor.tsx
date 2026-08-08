import React, { useEffect, useState } from 'react';
import {
  ConciergeBell, Beer, ChefHat, ShieldCheck, ReceiptText, Split, BellRing,
  Building2, Check, Timer, Smartphone, KeyRound,
} from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import { STAFF_ROLES, ROLE_RULES, SERVICE_PILLARS, DEMO_TICKETS } from '@/data/platform';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ConciergeBell, Beer, ChefHat, ShieldCheck, ReceiptText, Split, BellRing, Building2,
};

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const Cmp = ICONS[name] ?? ReceiptText;
  return <Cmp className={className} />;
};

/**
 * ServiceFloor — the "who sees what" layer.
 * Role switcher + live ticket board with ready-pings so an owner can see
 * exactly how a busy floor stays honest without anyone shouting.
 */
export default function ServiceFloor() {
  const [roleId, setRoleId] = useState(STAFF_ROLES[0].id);
  const [ready, setReady] = useState<string[]>([]);
  const [ping, setPing] = useState<{ table: string; server: string; id: string } | null>(null);

  const role = STAFF_ROLES.find((r) => r.id === roleId) ?? STAFF_ROLES[0];

  // Which tickets this role is allowed to see (the whole point of roles).
  const visible = DEMO_TICKETS.filter((t) => {
    if (roleId === 'kitchen') return t.station === 'Kitchen';
    if (roleId === 'bar') return t.station === 'Bar';
    return true;
  });

  const bump = (id: string) => {
    const ticket = DEMO_TICKETS.find((t) => t.id === id);
    if (!ticket || ready.includes(id)) return;
    setReady((prev) => [...prev, id]);
    setPing({ table: ticket.table, server: ticket.server, id: ticket.id });
  };

  // Auto-demo: bump a ticket every few seconds so the section feels alive.
  useEffect(() => {
    const timer = setInterval(() => {
      setReady((prev) => {
        const next = DEMO_TICKETS.find((t) => !prev.includes(t.id));
        if (!next) {
          setPing(null);
          return [];
        }
        setPing({ table: next.table, server: next.server, id: next.id });
        return [...prev, next.id];
      });
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ping) return;
    const t = setTimeout(() => setPing(null), 2600);
    return () => clearTimeout(t);
  }, [ping]);

  return (
    <section id="floor" className="relative overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 animate-blob rounded-full bg-amber-300/30 blur-3xl [animation-delay:2s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-500/25">
            <ConciergeBell className="h-4 w-4" /> Service floor
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everyone sees <span className="text-gradient-vibe">only their own work</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            One login per person. They pick a role at clock-in — bar tonight, tables tomorrow — and the screen changes
            to match. Tap a role below and watch what that person actually sees.
          </p>
        </Reveal>

        {/* Role switcher */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {STAFF_ROLES.map((r) => {
            const active = r.id === roleId;
            return (
              <button
                key={r.id}
                onClick={() => setRoleId(r.id)}
                className={`hover-lift inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? `border-transparent bg-gradient-to-r ${r.tone} text-white shadow-lg`
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon name={r.icon} className="h-4 w-4" />
                {r.name}
              </button>
            );
          })}
        </div>

        {/* Live board */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2">love local eats · {role.name.toLowerCase()} view</span>

              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white">
                {visible.length} ticket{visible.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {visible.map((t) => {
                const isReady = ready.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`animate-pop-in rounded-2xl border p-4 transition-colors ${
                      isReady ? 'border-emerald-400/60 bg-emerald-500/15' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">{t.table}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          t.station === 'Kitchen'
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : 'bg-amber-400/20 text-amber-200'
                        }`}
                      >
                        {t.station === 'Kitchen' ? <ChefHat className="h-3 w-3" /> : <Beer className="h-3 w-3" />}
                        {t.station}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                      {t.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <Timer className="h-3 w-3" /> {t.minutes} min · {t.server}
                      </span>
                      <button
                        onClick={() => bump(t.id)}
                        disabled={isReady}
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                          isReady
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : 'bg-white text-slate-900 hover:bg-amber-300'
                        }`}
                      >
                        {isReady ? 'Ready · server pinged' : 'Bump ticket'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready ping */}
            {ping && (
              <div className="pointer-events-none absolute bottom-5 left-1/2 w-[min(22rem,90%)] -translate-x-1/2 animate-pop-in rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl">
                <div className="flex items-start gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <BellRing className="h-5 w-5 animate-wiggle" />
                    <span className="absolute inset-0 animate-pulse-ring rounded-xl border-2 border-emerald-400" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{ping.table} is up</p>
                    <p className="text-xs text-slate-600">
                      Sent to {ping.server}'s phone · ticket {ping.id}. Nothing sits in the window.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role detail card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <span
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.tone} text-white shadow-lg`}
            >
              <Icon name={role.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">{role.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{role.sees}</p>
            <ul className="mt-4 space-y-2">
              {role.can.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <KeyRound className="h-4 w-4" /> How logins work
              </p>
              <ul className="mt-3 space-y-2">
                {ROLE_RULES.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-slate-600">
                    <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Problem → fix pillars */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_PILLARS.map((p) => (
            <Reveal key={p.id}>
              <div className="hover-lift h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white shadow-md">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">{p.title}</h3>
                <p className="mt-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                  <span className="font-bold">Before: </span>
                  {p.problem}
                </p>
                <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                  <span className="font-bold">With us: </span>
                  {p.fix}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
