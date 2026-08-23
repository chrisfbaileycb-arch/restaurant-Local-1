import React from 'react';
import { Check } from 'lucide-react';

import DemoIcon from '@/components/demo/demoIcons';
import { DEMO_ACTS, DEMO_CHAPTERS, type DemoChapter } from '@/data/demoScript';

/**
 * The agenda rail — the running order of the demo. Doubles as the presenter's
 * place-keeper: chapters tick green once they have been run on stage.
 */
const DemoAgenda: React.FC<{
  activeId: string;
  covered: string[];
  onPick: (c: DemoChapter) => void;
}> = ({ activeId, covered, onPick }) => (
  <nav aria-label="Demo agenda" className="space-y-5">
    {DEMO_ACTS.map((act) => {
      const chapters = DEMO_CHAPTERS.filter((c) => c.act === act.id);
      const mins = chapters.reduce((s, c) => s + c.minutes, 0);
      return (
        <div key={act.id}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">{act.label}</p>
            <span className="text-[11px] font-semibold text-slate-400">{mins} min</span>
          </div>
          <p className="mb-2 text-xs text-slate-500">{act.blurb}</p>
          <div className="space-y-1.5">
            {chapters.map((c) => {
              const on = c.id === activeId;
              const done = covered.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    on
                      ? 'border-transparent bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-amber-50'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      done ? 'bg-emerald-500 text-white' : on ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <DemoIcon name={c.icon} className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[11px] font-bold ${on ? 'text-white/60' : 'text-slate-400'}`}>
                      {c.num}
                    </span>
                    <span className={`block truncate text-sm font-bold ${on ? 'text-white' : 'text-slate-800'}`}>
                      {c.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </nav>
);

export default DemoAgenda;
