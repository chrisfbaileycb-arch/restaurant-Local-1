import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { CRM_SUBSCRIBE_URL } from '@/data/platform';

interface Props {
  source: string;
  tags?: string[];
  cta?: string;
  dark?: boolean;
  showName?: boolean;
  compact?: boolean;
  heading?: string;
  sub?: string;
}

const SignupForm: React.FC<Props> = ({
  source,
  tags = ['newsletter'],
  cta = 'Get my free build',
  dark = false,
  showName = true,
  compact = false,
  heading,
  sub,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined,
          sms_opt_in: smsOptIn === true,
          source,
          tags,
        }),
      });
      setStatus('done');
      setMessage('You are on the list — we will email your build link shortly.');
      setName('');
      setEmail('');
      setPhone('');
    } catch {
      setStatus('done');
      setMessage('Thanks! We will be in touch shortly.');
    }
  };

  const inputCls = dark
    ? 'w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-amber-400'
    : 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-600';

  if (status === 'done') {
    return (
      <div
        className={`flex items-start gap-3 rounded-xl border p-5 ${
          dark ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
        }`}
      >
        <Check className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">You&apos;re in.</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {heading && (
        <div>
          <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-stone-900'}`}>{heading}</h3>
          {sub && <p className={`text-sm ${dark ? 'text-white/70' : 'text-stone-600'}`}>{sub}</p>}
        </div>
      )}
      <div className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'}>
        {showName && (
          <input
            className={inputCls}
            placeholder="Shop or your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className={inputCls}
          type="email"
          required
          placeholder="you@yourshop.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={`${inputCls} ${showName && !compact ? 'sm:col-span-2' : ''}`}
          type="tel"
          placeholder="Phone number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <label className={`flex items-start gap-2 text-xs ${dark ? 'text-white/70' : 'text-stone-600'}`}>
        <input
          type="checkbox"
          checked={smsOptIn}
          onChange={(e) => setSmsOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-stone-400"
        />
        <span>
          Text me launch updates and my build link. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
        </span>
      </label>
      {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-stone-900 transition hover:bg-amber-400 disabled:opacity-60 sm:w-auto"
      >
        {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        {cta}
      </button>
    </form>
  );
};

export default SignupForm;
