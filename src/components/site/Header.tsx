import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, LogOut, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND } from '@/data/platform';

const PLATFORM_LINKS = [
  { to: '/onboarding', label: 'Build my store' },
  { to: '/pos', label: 'POS demo' },
  { to: '/dashboard', label: 'Reports & team' },
  { to: '/starter', label: 'Start cheap' },
  { to: '/shop', label: 'Hardware shop' },
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
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-stone-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-amber-400">
            <Flame className="h-5 w-5" />
          </span>
          <span className="text-lg">{BRAND.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PLATFORM_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              {l.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setOpenShop(true)}
            onMouseLeave={() => setOpenShop(false)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
              Collections <ChevronDown className="h-4 w-4" />
            </button>
            {openShop && collections.length > 0 && (
              <div className="absolute left-0 top-full w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-xl">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    to={`/collections/${c.handle}`}
                    onClick={() => setOpenShop(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-stone-900"
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
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-stone-900">
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
              className="hidden items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 sm:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 sm:block"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/onboarding"
            className="hidden rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 md:block"
          >
            Start free
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 lg:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
          {PLATFORM_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobile(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-stone-200 pt-2">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Collections
            </p>
            {collections.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                onClick={() => setMobile(false)}
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                {c.title}
              </Link>
            ))}
          </div>
          <Link
            to={user ? '/dashboard' : '/login'}
            onClick={() => setMobile(false)}
            className="mt-2 block rounded-lg bg-stone-900 px-3 py-2 text-center text-sm font-semibold text-white"
          >
            {user ? 'My dashboard' : 'Sign in'}
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
