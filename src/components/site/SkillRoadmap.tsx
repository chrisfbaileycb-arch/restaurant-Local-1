import React, { useState } from 'react';
import { Layers, ChevronRight, Terminal } from 'lucide-react';

import { AGENT_SKILLS, SKILL_STATUS_META, SKILL_SURFACES, type AgentSkill } from '@/data/vibe';

/**
 * The ADK agent-skill roadmap, in build order.
 * Renders in the POS sidebar (dark) and on the dashboard (light) so the
 * back-end skills can be laid out and ticked off as they ship.
 */
const SkillRoadmap: React.FC<{ tone?: 'dark' | 'light'; limit?: number }> = ({ tone = 'light', limit }) => {
  const dark = tone === 'dark';
  const [surface, setSurface] = useState<string>('All');
  const [open, setOpen] = useState<string | null>(null);

  const rows: AgentSkill[] = AGENT_SKILLS.filter((s) => surface === 'All' || s.surface === surface);
  const shown = limit ? rows.slice(0, limit) : rows;
  const live = AGENT_SKILLS.filter((s) => s.status === 'live').length;

  return (
    <div className={dark ? 'text-white' : 'text-stone-900'}>
      <div className="flex items-center justify-between gap-2">
        <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-amber-300' : 'text-orange-600'}`}>
          <Layers className="h-3.5 w-3.5" /> Agent skills · ADK build order
        </p>
        <span className={`text-[10px] font-bold ${dark ? 'text-slate-400' : 'text-stone-500'}`}>
          {live}/{AGENT_SKILLS.length} live
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {['All', ...SKILL_SURFACES].map((s) => (
          <button
            key={s}
            onClick={() => setSurface(s)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
              surface === s
                ? dark ? 'bg-white text-slate-900' : 'bg-stone-900 text-white'
                : dark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ol className="mt-2 space-y-1">
        {shown.map((s, i) => {
          const meta = SKILL_STATUS_META[s.status];
          const isOpen = open === s.id;
          return (
            <li key={s.id}>
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition ${
                  dark ? 'hover:bg-white/5' : 'hover:bg-stone-50'
                }`}
              >
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-extrabold ${dark ? 'text-white' : 'text-stone-900'}`}>
                      {i + 1}. {s.name}
                    </span>
                    <span className={`rounded-full border px-1.5 py-px text-[9px] font-bold uppercase ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </span>
                  <span className={`block truncate font-mono text-[10px] ${dark ? 'text-slate-400' : 'text-stone-500'}`}>
                    {s.tool}
                  </span>
                </span>
                <ChevronRight className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition ${isOpen ? 'rotate-90' : ''} ${dark ? 'text-slate-500' : 'text-stone-400'}`} />
              </button>

              {isOpen && (
                <div className={`ml-4 rounded-lg border px-2.5 py-2 ${dark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-stone-50'}`}>
                  <p className={`text-[11px] leading-snug ${dark ? 'text-slate-300' : 'text-stone-600'}`}>{s.what}</p>
                  <p className={`mt-1 flex items-start gap-1 text-[10px] italic ${dark ? 'text-amber-200' : 'text-orange-700'}`}>
                    <Terminal className="mt-0.5 h-3 w-3 shrink-0" /> {s.says}
                  </p>
                  <p className={`mt-1 text-[10px] ${dark ? 'text-slate-500' : 'text-stone-500'}`}>
                    Surface: {s.surface}
                    {s.needs.length > 0 && ` · needs ${s.needs.join(', ')}`}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default SkillRoadmap;
