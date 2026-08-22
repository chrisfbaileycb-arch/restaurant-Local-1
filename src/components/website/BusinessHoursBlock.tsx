import React from 'react';
import { Clock, MapPin, Phone, ExternalLink } from 'lucide-react';

import type { SiteTemplate } from '@/data/vibe';
import { DEMO_HOURS } from '@/data/platform';

export interface HoursRow {
  day: string;
  hours: string;
}

/** Mon=0 … Sun=6 to match DEMO_HOURS ordering. */
const todayIndex = () => (new Date().getDay() + 6) % 7;

/** "11a – 9p" → is right now inside that window. */
export const parseOpen = (label: string): boolean => {
  const m = label.match(/(\d{1,2})(?::(\d{2}))?\s*([ap])\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*([ap])/i);
  if (!m) return false;
  const to24 = (h: string, mm: string | undefined, ap: string) => {
    let hr = parseInt(h, 10) % 12;
    if (ap.toLowerCase() === 'p') hr += 12;
    return hr * 60 + (mm ? parseInt(mm, 10) : 0);
  };
  const start = to24(m[1], m[2], m[3]);
  let end = to24(m[4], m[5], m[6]);
  if (end <= start) end += 24 * 60; // closes after midnight
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= start && mins <= end;
};

export const openStatus = (rows: HoursRow[]) => {
  const row = rows[todayIndex()];
  if (!row || /closed/i.test(row.hours)) return { open: false, label: 'Closed today', today: row?.hours || 'Closed' };
  const open = parseOpen(row.hours);
  const closeAt = row.hours.split(/[–-]/)[1]?.trim();
  return {
    open,
    label: open ? `Open until ${closeAt || 'later'}` : `Opens ${row.hours.split(/[–-]/)[0]?.trim()}`,
    today: row.hours,
  };
};

/**
 * Hours block on the generated site — synced from the Google Business
 * Profile, never re-typed by the owner.
 */
const BusinessHoursBlock: React.FC<{
  template: SiteTemplate;
  rows?: HoursRow[];
  address?: string;
  phone?: string;
  mapUrl?: string;
}> = ({ template, rows = DEMO_HOURS, address, phone, mapUrl }) => {
  const status = openStatus(rows);
  const idx = todayIndex();

  return (
    <div className={`border p-4 ${template.card} ${template.radius}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`flex items-center gap-2 text-sm ${template.font} ${template.heading}`}>
          <Clock className="h-4 w-4" /> Hours
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
            status.open ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
          }`}
        >
          {status.label}
        </span>
      </div>

      <ul className="mt-3 space-y-1">
        {rows.map((r, i) => (
          <li
            key={r.day}
            className={`flex items-center justify-between text-xs ${
              i === idx ? `font-extrabold ${template.heading}` : template.body
            }`}
          >
            <span>{r.day}</span>
            <span>{r.hours}</span>
          </li>
        ))}
      </ul>

      <div className={`mt-3 space-y-1 border-t pt-3 text-xs ${template.body}`}>
        {address && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {address}
          </p>
        )}
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" /> {phone}
          </a>
        )}
        <a
          href={mapUrl || 'https://www.google.com/maps'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold hover:underline"
        >
          Google Business Profile sync <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default BusinessHoursBlock;
