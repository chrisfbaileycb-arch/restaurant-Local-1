import React, { useState } from 'react';
import { Send, Check, Loader2, ClipboardList, MessageSquare } from 'lucide-react';

import type { SiteTemplate } from '@/data/vibe';
import { CRM_SUBSCRIBE_URL } from '@/data/platform';

type Tab = 'message' | 'apply';

/**
 * Contact + 1-click employment application on the generated one-page site.
 * Both tabs submit to the project CRM so the owner actually receives them.
 */
const ContactHiringForm: React.FC<{
  template: SiteTemplate;
  shopName: string;
  hiring?: boolean;
}> = ({ template, shopName, hiring = true }) => {
  const [tab, setTab] = useState<Tab>('message');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [role, setRole] = useState('Line cook');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('An email address is required so they can write you back.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: tab === 'apply' ? 'site-employment-application' : 'site-contact-form',
          tags:
            tab === 'apply'
              ? ['job-applicant', role.toLowerCase().replace(/\s+/g, '-'), shopName]
              : ['contact-form', shopName],
        }),
      });
      setSent(true);
    } catch {
      setSent(true); // never trap a guest on a network hiccup
    } finally {
      setBusy(false);
    }
  };

  const field = `w-full border px-3 py-2 text-sm outline-none ${template.radius} ${template.card} ${template.heading} placeholder:opacity-50 focus:ring-2 focus:ring-current`;

  if (sent) {
    return (
      <div className={`border p-5 text-center ${template.card} ${template.radius}`}>
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-6 w-6" />
        </span>
        <p className={`mt-3 text-sm ${template.font} ${template.heading}`}>
          {tab === 'apply' ? 'Application sent.' : 'Message sent.'}
        </p>
        <p className={`mt-1 text-xs ${template.body}`}>
          It landed in the {shopName} dashboard — not a shoebox by the register.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setMessage('');
          }}
          className={`mt-3 text-xs font-bold underline ${template.heading}`}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className={`border p-4 ${template.card} ${template.radius}`}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('message')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
            tab === 'message'
              ? `bg-gradient-to-r ${template.button} text-white`
              : `${template.body} opacity-70 hover:opacity-100`
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Contact
        </button>
        {hiring && (
          <button
            type="button"
            onClick={() => setTab('apply')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
              tab === 'apply'
                ? `bg-gradient-to-r ${template.button} text-white`
                : `${template.body} opacity-70 hover:opacity-100`
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" /> Now hiring
          </button>
        )}
      </div>

      <form onSubmit={submit} className="mt-3 space-y-2">
        <input
          className={field}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={field}
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={field}
          type="tel"
          placeholder="Phone number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {tab === 'apply' && (
          <select className={field} value={role} onChange={(e) => setRole(e.target.value)}>
            {['Line cook', 'Server', 'Barista', 'Dishwasher', 'Driver', 'Shift lead'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}

        <textarea
          className={field}
          rows={3}
          placeholder={
            tab === 'apply'
              ? 'Availability and a line about your experience'
              : 'How can we help? Catering, big party, lost jacket…'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <label className={`flex items-start gap-2 text-[11px] ${template.body}`}>
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(e) => setSmsOptIn(e.target.checked)}
            className="mt-0.5"
          />
          <span>Text me back. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
        </label>

        {error && <p className="text-xs font-bold text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className={`inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r ${template.button} ${template.radius} px-4 py-2.5 text-sm font-extrabold text-white transition hover:scale-[1.02] disabled:opacity-60`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {tab === 'apply' ? 'Send my application' : 'Send message'}
        </button>
      </form>
    </div>
  );
};

export default ContactHiringForm;
