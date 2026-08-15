import React, { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw, FileSpreadsheet } from 'lucide-react';

import { useOps } from '@/lib/opsStore';
import {
  loadCopilotLog, exportAuditCsv, exportConversationCsv, isManagerAudit, isoDay,
  type StoredMessage,
} from '@/lib/copilotHistory';
import { formatCents } from '@/data/platform';

interface Props {
  shopId?: string | null;
  userId?: string | null;
}

/** Everything the copilot has been asked to do, with a date filter and CSV exports. */
const CopilotHistory: React.FC<Props> = ({ shopId, userId }) => {
  const ops = useOps();
  const [rows, setRows] = useState<StoredMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = () => {
    setLoading(true);
    loadCopilotLog(shopId, userId, 250)
      .then(setRows)
      .finally(() => setLoading(false));
  };

  useEffect(load, [shopId, userId]);

  const inRange = (day: string) => (!from || !day || day >= from) && (!to || !day || day <= to);

  const messages = useMemo(() => rows.filter((r) => inRange(isoDay(r.created_at))), [rows, from, to]);
  const audit = useMemo(
    () => ops.audit.filter(isManagerAudit).filter((e) => inRange(isoDay(e.at))),
    [ops.audit, from, to],
  );

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
      {/* Filter + exports */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Date filter</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-[11px] text-white outline-none focus:border-amber-400/60"
          />
          <span className="text-[11px] text-slate-400">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-[11px] text-white outline-none focus:border-amber-400/60"
          />
          <button
            onClick={() => {
              setFrom('');
              setTo('');
            }}
            className="shrink-0 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-bold text-slate-300 hover:bg-white/10"
          >
            All
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button
            onClick={() => exportAuditCsv(ops.audit, from || undefined, to || undefined)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 px-2 py-2 text-[11px] font-extrabold text-slate-900"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Audit CSV
          </button>
          <button
            onClick={() => exportConversationCsv(rows, from || undefined, to || undefined)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-2 py-2 text-[11px] font-bold text-slate-200 hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> Chat CSV
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-slate-400">
          The audit export is the manager trail your accountant asks for: 86s, comps, voids, discounts and price
          changes with timestamps.
        </p>
      </div>

      {/* Manager audit trail */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Manager audit trail · {audit.length}
        </p>
        {audit.length === 0 ? (
          <p className="rounded-lg border border-white/10 px-3 py-3 text-[11px] text-slate-400">
            No 86s, comps, voids or price changes recorded in this window.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {audit.slice(0, 40).map((e) => (
              <li key={e.id} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-amber-300">{e.action}</span>
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {new Date(e.at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-200">{e.detail}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {e.actor}
                  {e.amount ? ` · ${formatCents(e.amount)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conversation log */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Saved conversation · {messages.length}
          </p>
          <button onClick={load} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
        {loading ? (
          <p className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading saved history…
          </p>
        ) : messages.length === 0 ? (
          <p className="rounded-lg border border-white/10 px-3 py-3 text-[11px] text-slate-400">
            Nothing saved for this window yet. Every command you run from here is written down automatically.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {messages.slice(0, 60).map((m) => (
              <li key={m.id} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    m.role === 'user' ? 'text-fuchsia-300' : m.role === 'system' ? 'text-amber-300' : 'text-emerald-300'
                  }`}>
                    {m.role === 'user' ? 'Operator' : m.role === 'system' ? 'Sentinel' : 'Copilot'}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-4 whitespace-pre-line text-[11px] leading-snug text-slate-200">{m.text}</p>
                {m.effects && m.effects.length > 0 && (
                  <p className="mt-1 text-[10px] font-bold text-emerald-300">{m.effects.join(' · ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CopilotHistory;
