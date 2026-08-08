import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/site/PageShell';
import ProductCard from '@/components/ProductCard';

const CollectionPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!handle) return;
      setLoading(true);
      setProducts([]);

      const { data: col } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('handle', handle)
        .single();

      if (!col) {
        setCollection(null);
        setLoading(false);
        return;
      }
      setCollection(col);

      const { data: links } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', col.id)
        .order('position');

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      const ids = links.map((l: any) => l.product_id);
      const { data: prods } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .in('id', ids)
        .eq('status', 'active');

      setProducts(ids.map((id: string) => prods?.find((p: any) => p.id === id)).filter(Boolean));
      setLoading(false);
    };
    load();
  }, [handle]);

  return (
    <PageShell>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-4 w-4" /> All hardware
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900">
            {loading ? 'Loading…' : collection?.title || 'Collection not found'}
          </h1>
          {collection?.description && <p className="mt-2 max-w-2xl text-stone-600">{collection.description}</p>}
          {!loading && collection && (
            <p className="mt-2 text-sm text-stone-500">{products.length} product{products.length === 1 ? '' : 's'}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-stone-200" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <p className="font-semibold text-stone-900">Nothing here yet</p>
            <Link to="/shop" className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              Browse all hardware
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CollectionPage;
