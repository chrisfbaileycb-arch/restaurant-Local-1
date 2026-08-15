// ------------------------------------------------------------
// Printable documents: kitchen rosters and financial reports.
// One builder used by the copilot, the drawer and the dashboard so a
// report reads the same on screen, on the receipt printer and in PDF
// (the browser print dialog's "Save as PDF" destination).
// ------------------------------------------------------------

export interface PrintDoc {
  /** Kitchen / guest receipt printers are 80mm; reports print letter. */
  format: 'receipt' | 'report';
  title: string;
  subtitle?: string;
  /** Pre-formatted lines. Two-column rows use a tab between the halves. */
  lines: string[];
  /** Optional table rendered under the lines. */
  table?: { head: string[]; rows: (string | number)[][] };
  footer?: string;
}

const esc = (s: any) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const bodyHtml = (doc: PrintDoc) => {
  const lines = doc.lines
    .map((l) => {
      if (l === '---') return '<hr />';
      if (l.includes('\t')) {
        const [a, b] = l.split('\t');
        return `<div class="row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
      }
      return `<div class="line">${esc(l)}</div>`;
    })
    .join('');

  const table = doc.table
    ? `<table><thead><tr>${doc.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${doc.table.rows
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    : '';

  return `${lines}${table}${doc.footer ? `<p class="foot">${esc(doc.footer)}</p>` : ''}`;
};

const styles = (format: PrintDoc['format']) =>
  format === 'receipt'
    ? `@page { size: 80mm auto; margin: 4mm; }
       body { font-family: "SFMono-Regular", ui-monospace, Menlo, monospace; font-size: 12px; width: 72mm; color:#000; }
       h1 { font-size: 15px; text-align:center; margin:0 0 2px; text-transform:uppercase; letter-spacing:1px; }
       h2 { font-size: 11px; text-align:center; font-weight:400; margin:0 0 10px; }
       .row { display:flex; justify-content:space-between; gap:8px; padding:1px 0; }
       .line { padding:1px 0; white-space:pre-wrap; }
       hr { border:none; border-top:1px dashed #000; margin:6px 0; }
       table { width:100%; border-collapse:collapse; margin-top:6px; font-size:11px; }
       th, td { text-align:left; padding:2px 0; border-bottom:1px dotted #999; }
       .foot { margin-top:10px; text-align:center; font-size:10px; }`
    : `@page { size: letter; margin: 16mm; }
       body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:#1c1917; font-size:13px; }
       h1 { font-size: 22px; margin:0 0 4px; }
       h2 { font-size: 13px; font-weight:500; color:#57534e; margin:0 0 18px; }
       .row { display:flex; justify-content:space-between; gap:16px; padding:5px 0; border-bottom:1px solid #f5f5f4; }
       .line { padding:4px 0; white-space:pre-wrap; }
       hr { border:none; border-top:2px solid #1c1917; margin:14px 0; }
       table { width:100%; border-collapse:collapse; margin-top:14px; }
       th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:#78716c; border-bottom:2px solid #e7e5e4; padding:6px 8px; }
       td { padding:7px 8px; border-bottom:1px solid #f5f5f4; }
       .foot { margin-top:22px; color:#78716c; font-size:11px; }`;

/** Open the browser print dialog — the operator picks the kitchen printer or Save as PDF. */
export const printDocument = (doc: PrintDoc) => {
  const win = window.open('', '_blank', 'width=520,height=720');
  if (!win) return false;
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8" /><title>${esc(doc.title)}</title><style>${styles(
      doc.format,
    )}</style></head><body><h1>${esc(doc.title)}</h1>${
      doc.subtitle ? `<h2>${esc(doc.subtitle)}</h2>` : ''
    }${bodyHtml(doc)}</body></html>`,
  );
  win.document.close();
  win.focus();
  window.setTimeout(() => win.print(), 350);
  return true;
};

/** Same document, downloaded as a spreadsheet-friendly CSV. */
export const docToCsv = (doc: PrintDoc) => {
  const cell = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
  const rows: string[] = [cell(doc.title)];
  if (doc.subtitle) rows.push(cell(doc.subtitle));
  doc.lines.filter((l) => l !== '---').forEach((l) => rows.push(l.split('\t').map(cell).join(',')));
  if (doc.table) {
    rows.push('');
    rows.push(doc.table.head.map(cell).join(','));
    doc.table.rows.forEach((r) => rows.push(r.map(cell).join(',')));
  }
  return rows.join('\n');
};

export const downloadDoc = (doc: PrintDoc) => {
  const blob = new Blob([docToCsv(doc)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
