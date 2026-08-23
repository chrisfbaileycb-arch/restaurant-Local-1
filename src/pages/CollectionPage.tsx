import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchCollectionByHandle } from '@/lib/catalog';
import PageShell from '@/components/site/PageShell';
import ProductCard from '@/components/ProductCard';

const CollectionPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!handle) return;
    setLoading(true);
    setProducts([]);

    fetchCollectionByHandle(handle).then(({ collection: col, products: prods }) => {
      if (!alive) return;
      setCollection(col);
      setProducts(prods);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
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
