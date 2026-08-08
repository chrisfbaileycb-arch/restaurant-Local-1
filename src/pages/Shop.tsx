import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Truck, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import ProductCard from '@/components/ProductCard';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('status', 'active');
      setProducts(data || []);
      const { data: cols } = await supabase
        .from('ecom_collections')
        .select('id, title, handle')
        .eq('is_visible', true)
        .order('title');
      setCollections(cols || []);
      setLoading(false);
    };
    load();
  }, []);

  const types = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.product_type).filter(Boolean)))],
    [products]
  );

  const shown = useMemo(() => {
    const priceOf = (p: any) =>
      p.variants?.length ? Math.min(...p.variants.map((v: any) => v.price)) : p.price;
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(q));
      const matchT = type === 'All' || p.product_type === type;
      return matchQ && matchT;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === 'price-desc') list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'featured')
      list = [...list].sort(
        (a, b) => Number((b.tags || []).includes('featured')) - Number((a.tags || []).includes('featured'))
      );
    return list;
  }, [products, query, type, sort]);

  return (
    <PageShell>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Hardware &amp; services shop</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Everything ships pre-configured with your menu already loaded. Free shipping on all orders.
          </p>
          <Link
            to="/starter"
            className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:border-emerald-400 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <span>
                <span className="block font-bold text-stone-900">On a tight budget? Start from $49.</span>
                <span className="block text-sm text-stone-600">
                  Cheap tablets, stands, cash drawer, tap reader, printers — plus a phone-only setup for food trucks.
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-stone-900 px-5 py-2.5 text-center text-sm font-semibold text-white">
              Build a budget kit
            </span>
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {collections.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:border-amber-500 hover:bg-amber-50"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>


      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terminals, readers, printers, services…"
              className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All categories' : t}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
          >
            <option value="featured">Featured first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <p className="mb-4 flex items-center gap-2 text-sm text-stone-500">
          <Truck className="h-4 w-4 text-emerald-600" /> {shown.length} item{shown.length === 1 ? '' : 's'} · free shipping on all orders
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <p className="font-semibold text-stone-900">No matches</p>
            <p className="mt-1 text-sm text-stone-500">Try a different search or category.</p>
            <button
              onClick={() => { setQuery(''); setType('All'); }}
              className="mt-4 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Shop;
