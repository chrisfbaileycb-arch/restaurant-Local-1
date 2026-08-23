import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { BRAND, BUSINESS_TYPES, REPORTS } from '@/data/platform';
import SignupForm from '@/components/site/SignupForm';

const Footer: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('ecom_collections')
      .select('id, title, handle')
      .eq('is_visible', true)
      .order('title')
      .then(({ data }) => setCollections(data || []));
  }, []);

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-slate-300">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 animate-blob rounded-full bg-amber-400/15 blur-3xl [animation-delay:5s]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg">
                <Heart className="h-5 w-5 fill-current" />
              </span>
              <span className="text-lg font-extrabold">{BRAND.name}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-rose-300">{BRAND.promise}</p>
            <p className="mt-2 max-w-sm text-sm text-slate-400">{BRAND.subtitle}</p>


            <div className="mt-6 max-w-md">
              <SignupForm
                source="footer-signup"
                tags={['newsletter', 'footer-signup']}
                cta="Send me the launch kit"
                dark
                compact
                showName={false}
                heading="Get the free launch kit"
                sub="Menu templates, rate benchmarks and a launch checklist."
              />
            </div>
            <div className="mt-6 flex flex-col gap-1 text-sm text-stone-400">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> {BRAND.supportPhone}
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" /> {BRAND.supportEmail}
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-amber-400" to="/demo">Full platform walkthrough</Link></li>
              <li><Link className="hover:text-amber-400" to="/onboarding">Menu-to-store builder</Link></li>
              <li><Link className="hover:text-amber-400" to="/templates-logo">Templates &amp; logo studio</Link></li>
              <li><Link className="hover:text-amber-400" to="/templates">Sample websites</Link></li>

              <li><Link className="hover:text-amber-400" to="/pos">Touchscreen POS</Link></li>
              <li><Link className="hover:text-amber-400" to="/devices">Devices &amp; printers</Link></li>
              <li><Link className="hover:text-amber-400" to="/stay-open-offline">Stay open offline</Link></li>
              <li><Link className="hover:text-amber-400" to="/test-run">Weekend test run</Link></li>
              <li><Link className="hover:text-amber-400" to="/dashboard">Reporting suite</Link></li>
            </ul>
          </div>


          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-amber-400" to="/shop">All hardware</Link></li>
              <li><Link className="hover:text-amber-400" to="/starter">Budget starter kits</Link></li>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-amber-400" to={`/collections/${c.handle}`}>
                    {c.title}
                  </Link>
                </li>
              ))}
              <li><Link className="hover:text-amber-400" to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Built for</h4>
            <ul className="space-y-2 text-sm">
              {BUSINESS_TYPES.map((b) => (
                <li key={b.id}>
                  <Link className="hover:text-amber-400" to={`/onboarding?type=${b.id}`}>
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}. Built for independent food businesses.</p>
          <p>{REPORTS.length} standard reports · PCI P2PE validated · No long-term contracts</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
