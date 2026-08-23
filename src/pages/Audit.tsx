import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Printer, ArrowRight } from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import AuditScorecard from '@/components/audit/AuditScorecard';
import AuditFindings from '@/components/audit/AuditFindings';
import {
  AUDIT_META,
  AUDIT_DOMAINS,
  ALL_FINDINGS,
  OVERALL_SCORE,
  PRIORITY_ACTIONS,
  STATE_COPY,
} from '@/data/audit';
import { BRAND } from '@/data/platform';

const Audit: React.FC = () => {
  const [focus, setFocus] = useState<string | undefined>();

  const jump = (id: string) => {
    setFocus(id);
    const el = document.getElementById(`audit-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const printReport = () => {
    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) return;
    const body = AUDIT_DOMAINS.map(
      (d) => `
        <h2>${d.name}</h2>
        <p class="q">${d.question}</p>
        <table>
          <thead><tr><th>Finding</th><th>State</th><th>Severity</th><th>Evidence / action</th></tr></thead>
          <tbody>
            ${d.findings
              .map(
                (f) => `<tr>
                  <td><strong>${f.title}</strong></td>
                  <td>${STATE_COPY[f.state].label}</td>
                  <td>${f.severity}</td>
                  <td>${f.evidence}${f.action ? `<br/><em>Action: ${f.action}</em>` : ''}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>`,
    ).join('');

    w.document.write(`<!doctype html><html><head><title>${BRAND.name} — ${AUDIT_META.title}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;padding:36px;line-height:1.45}
        h1{margin:0 0 4px;font-size:26px}
        h2{margin:28px 0 2px;font-size:17px;border-bottom:2px solid #f97316;padding-bottom:4px}
        .q{color:#64748b;font-size:12px;margin:4px 0 8px}
        .meta{color:#475569;font-size:12px;margin-bottom:18px}
        table{width:100%;border-collapse:collapse;font-size:11.5px}
        th{text-align:left;background:#fff7ed;border-bottom:1px solid #fed7aa;padding:6px}
        td{border-bottom:1px solid #f1f5f9;padding:6px;vertical-align:top}
        .score{font-size:34px;font-weight:800}
        ol{font-size:12px}
      </style></head><body>
      <h1>${BRAND.name} — ${AUDIT_META.title}</h1>
      <div class="meta">${AUDIT_META.scope} · ${new Date().toLocaleDateString()}<br/>${AUDIT_META.reviewed}<br/>${AUDIT_META.method}<br/><em>${AUDIT_META.note}</em></div>
      <p class="score">${OVERALL_SCORE}<span style="font-size:14px;font-weight:400"> / 100 overall · ${ALL_FINDINGS.length} checks</span></p>
      <h2>Priority list — high severity, not yet Pass</h2>
      <ol>${PRIORITY_ACTIONS.map((f) => `<li><strong>${f.domainName}:</strong> ${f.title} — ${f.action || f.evidence}</li>`).join('')}</ol>
      ${body}
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <PageShell copilot="floor">
      <section className="border-b border-orange-100 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <ClipboardCheck className="h-3.5 w-3.5" /> {AUDIT_META.scope}
          </span>
          <h1 className="max-w-3xl pt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            {AUDIT_META.title}
          </h1>
          <p className="max-w-3xl pt-3 text-lg text-white/80">{AUDIT_META.method}</p>
          <p className="max-w-3xl pt-2 text-sm text-white/60">{AUDIT_META.note}</p>
          <div className="flex flex-wrap gap-3 pt-6">
            <button
              onClick={printReport}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:scale-[1.03]"
            >
              <Printer className="h-4 w-4" /> Print the audit
            </button>
            <Link
              to="/locations"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Multi-location view <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Full walkthrough
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
          <AuditScorecard onJump={jump} />

          <div>
            <h2 className="pb-1 text-2xl font-extrabold text-slate-900">Every finding</h2>
            <p className="pb-5 text-sm text-slate-600">
              Filter by domain group or by state. Each line names what was checked and where the proof lives.
            </p>
            <AuditFindings focusId={focus} />
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Audit;
