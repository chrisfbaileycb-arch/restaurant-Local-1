import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';

import PageShell from '@/components/site/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { CRM_SUBSCRIBE_URL } from '@/data/platform';

const Login: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    if (mode === 'signin') {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) setError(err);
      else navigate('/dashboard');
      return;
    }
    const { error: err } = await signUp(email, password, name);
    if (!err) {
      fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'newsletter',
          tags: ['account-signup'],
        }),
      }).catch(() => {});
    }
    setLoading(false);
    if (err) setError(err);
    else setNotice('Account created. Check your inbox to confirm, then sign in.');
  };

  const field = 'w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500';

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <Heart className="h-5 w-5 fill-current" />
          </span>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900">
            {mode === 'signin' ? 'Sign in to your store' : 'Create your owner account'}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage your POS, reports, schedule and rewards from anywhere.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === 'signup' && (
              <>
                <input className={field} placeholder="Shop or owner name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={field} type="tel" placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <label className="flex items-start gap-2 text-xs text-stone-600">
                  <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 h-4 w-4" />
                  <span>Text me setup help and updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
                </label>
              </>
            )}
            <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={field} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && <p className="text-sm text-emerald-700">{notice}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 font-bold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-stone-600">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
          <p className="mt-4 text-center text-xs text-stone-500">
            Just exploring?{' '}
            <Link to="/onboarding" className="font-semibold text-stone-700 underline">Build a store without an account</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Login;
