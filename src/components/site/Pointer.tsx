import React from 'react';
import { MousePointer2 } from 'lucide-react';

type Dir = 'left' | 'right' | 'up' | 'down';

interface PointerProps {
  /** the helpful note shown in the bubble */
  label: string;
  /** which way the little arrow leans */
  dir?: Dir;
  /** color theme of the bubble */
  tone?: 'amber' | 'fuchsia' | 'sky' | 'emerald';
  className?: string;
}

const TONES: Record<string, string> = {
  amber: 'bg-amber-400 text-stone-900 shadow-amber-400/40',
  fuchsia: 'bg-fuchsia-500 text-white shadow-fuchsia-500/40',
  sky: 'bg-sky-500 text-white shadow-sky-500/40',
  emerald: 'bg-emerald-500 text-white shadow-emerald-500/40',
};

const MOTION: Record<Dir, string> = {
  left: 'animate-bob-x',
  right: 'animate-bob-x',
  up: 'animate-bob-y',
  down: 'animate-bob-y',
};

const ROTATE: Record<Dir, string> = {
  left: 'rotate-180',
  right: 'rotate-0',
  up: '-rotate-90',
  down: 'rotate-90',
};

/**
 * A small animated "look here" helper — a bobbing cursor icon plus a
 * hand-written style note. Purely decorative but makes flows obvious.
 */
export const Pointer: React.FC<PointerProps> = ({ label, dir = 'right', tone = 'amber', className = '' }) => (
  <span
    className={`pointer-events-none inline-flex items-center gap-2 ${MOTION[dir]} ${className}`}
    aria-hidden="true"
  >
    <MousePointer2 className={`h-4 w-4 shrink-0 ${ROTATE[dir]} ${tone === 'amber' ? 'text-amber-500' : tone === 'fuchsia' ? 'text-fuchsia-500' : tone === 'sky' ? 'text-sky-500' : 'text-emerald-500'}`} />
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-lg ${TONES[tone]}`}>{label}</span>
  </span>
);

/** A pulsing tap target ring — draws the eye to a button. */
export const TapRing: React.FC<{ className?: string; tone?: 'amber' | 'emerald' | 'fuchsia' }> = ({
  className = '',
  tone = 'amber',
}) => (
  <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
    <span
      className={`absolute inset-0 animate-pulse-ring rounded-[inherit] ${
        tone === 'amber' ? 'bg-amber-400/50' : tone === 'emerald' ? 'bg-emerald-400/50' : 'bg-fuchsia-400/50'
      }`}
    />
  </span>
);

export default Pointer;
