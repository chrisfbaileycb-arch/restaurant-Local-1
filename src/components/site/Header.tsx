import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, LogOut, Heart } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';


const PLATFORM_LINKS = [
  { to: '/onboarding', label: 'Build my store' },
  { to: '/templates', label: 'Templates & logo' },
  { to: '/pos', label: 'POS demo' },
  { to: '/devices', label: 'Devices' },
  { to: '/stay-open-offline', label: 'Stay open offline' },
  { to: '/shop', label: 'Hardware shop' },
  { to: '/test-run', label: 'Weekend test run' },
];




const Header: React.FC = () => {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [openShop, setOpenShop] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    supabase
      .from('ecom_collections')
      .select('id, title, handle')
      .eq('is_visible', true)
      .order('title')
      .then(({ data }) => setCollections(data || []));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-md">
      <div className="h-1 w-full animate-gradient-x bg-gradient-to-r from-fuchsia-500 via-orange-500 to-amber-400 bg-[length:200%_200%]" />

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2 font-extrabold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md transition group-hover:animate-wiggle">
            <Heart className="h-5 w-5 fill-current" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base sm:text-lg">
              <span className="text-gradient-vibe">Love</span> Local Eats
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">POS</span>
          </span>
        </Link>



        <nav className="hidden items-center gap-1 lg:flex">
          {PLATFORM_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
            >
              {l.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setOpenShop(true)}
            onMouseLeave={() => setOpenShop(false)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
              Collections <ChevronDown className={`h-4 w-4 transition ${openShop ? 'rotate-180' : ''}`} />
            </button>
            {openShop && collections.length > 0 && (
              <div className="absolute left-0 top-full w-64 animate-pop-in rounded-xl border border-orange-100 bg-white p-2 shadow-xl">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    to={`/collections/${c.handle}`}
                    onClick={() => setOpenShop(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-orange-600"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop-in items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:block"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/onboarding"
            className="hidden rounded-lg bg-gradient-to-r from-fuchsia-600 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 transition hover:scale-[1.04] md:block"
          >
            Start free
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-orange-50 lg:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>


      {mobile && (
        <div className="animate-slide-in border-t border-orange-100 bg-white px-4 py-3 lg:hidden">
          {PLATFORM_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobile(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-orange-600"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-orange-100 pt-2">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-fuchsia-500">
              Collections
            </p>
            {collections.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                onClick={() => setMobile(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-orange-600"
              >
                {c.title}
              </Link>
            ))}
          </div>
          <Link
            to={user ? '/dashboard' : '/login'}
            onClick={() => setMobile(false)}
            className="mt-2 block rounded-lg bg-gradient-to-r from-fuchsia-600 to-orange-500 px-3 py-2 text-center text-sm font-extrabold text-white"
          >
            {user ? 'My dashboard' : 'Sign in'}
          </Link>
        </div>
      )}

    </header>
  );
};

export default Header;
