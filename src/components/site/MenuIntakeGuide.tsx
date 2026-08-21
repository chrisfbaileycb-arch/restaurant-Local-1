import React, { useState } from 'react';
import { ClipboardList, Check, ChevronDown, ChevronUp, Bot, Info } from 'lucide-react';

import { INTAKE_DISCLAIMER, INTAKE_CHECKLIST, MENU_WALKTHROUGH } from '@/data/menuIntake';

interface Props {
  /** fired when the owner confirms they have their stuff ready */
  onReady?: () => void;
  /** ask the agent for help — wired to askCopilot by the parent */
  onAsk?: (q: string) => void;
  /** which walkthrough step is active right now */
  activeStep?: string;
  defaultOpen?: boolean;
}

/**
 * Read-this-first panel. The honest version of how menu building works:
 * what to bring, what the agent does, what you still have to approve.
 */
const MenuIntakeGuide: React.FC<Props> = ({ onReady, onAsk, activeStep, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const required = INTAKE_CHECKLIST.filter((c) => c.required);
  const readyCount = required.filter((c) => checked[c.id]).length;
  const ready = readyCount === required.length;

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <ClipboardList className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-extrabold text-stone-900">{INTAKE_DISCLAIMER.title}</span>
            <span className="block text-sm text-stone-600">{INTAKE_DISCLAIMER.body}</span>
          </span>
        </span>
        {open ? <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-stone-500" /> : <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-stone-500" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <ul className="space-y-1.5">
            {INTAKE_DISCLAIMER.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-stone-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> {p}
              </li>
            ))}
          </ul>

          {/* What to have ready */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Have these ready · {readyCount}/{required.length} required
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {INTAKE_CHECKLIST.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition ${
                    checked[c.id] ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked[c.id] ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {checked[c.id] && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-stone-900">
                      {c.label}
                      {!c.required && <span className="ml-1.5 text-[10px] font-semibold uppercase text-stone-400">optional</span>}
                    </span>
                    <span className="block text-xs text-stone-600">{c.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* The walkthrough */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">The seven steps — the agent runs each one with you</p>
            <ol className="mt-2 space-y-2">
              {MENU_WALKTHROUGH.map((s) => (
                <li
                  key={s.id}
                  className={`rounded-lg border p-3 ${
                    activeStep === s.id ? 'border-amber-400 bg-amber-50' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-extrabold text-white">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-stone-900">{s.title}</p>
                      <p className="text-xs text-stone-600">{s.what}</p>
                      <p className="mt-1 text-xs text-stone-700"><span className="font-bold">You:</span> {s.youDo}</p>
                      <p className="text-xs text-stone-700"><span className="font-bold">Agent:</span> {s.agentDoes}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-violet-700">{s.tool}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReady}
              disabled={!ready}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-5 py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> {ready ? "I've got it all — start" : `Check the ${required.length - readyCount} required item${required.length - readyCount === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              onClick={() => onAsk?.('Walk me through building my menu')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              <Bot className="h-4 w-4" /> Walk me through it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuIntakeGuide;
