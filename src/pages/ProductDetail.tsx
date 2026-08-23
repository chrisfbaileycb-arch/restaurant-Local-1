import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck, Check, Minus, Plus } from 'lucide-react';
import { fetchProductByHandle, fetchActiveProducts } from '@/lib/catalog';
import PageShell from '@/components/site/PageShell';
import ProductCard from '@/components/ProductCard';
import { formatCents } from '@/data/platform';
import { useCart } from '@/contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!handle) return;
      setLoading(true);
      setSelectedVariant(null);
      setSelectedOption('');
      setQuantity(1);
      setActiveImage(0);
      setAdded(false);

      const data = await fetchProductByHandle(handle);
      if (!alive) return;

      if (data) {
        const variants = data.variants || [];
        setProduct(data);
        if (variants.length > 0) {
          const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          const first = sorted.find((v: any) => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
          setSelectedVariant(first);
          setSelectedOption(first?.option1 || '');
        }

        const all = await fetchActiveProducts();
        if (!alive) return;
        setRelated(all.filter((p) => p.id !== data.id && p.handle !== data.handle).slice(0, 4));
      } else {
        setProduct(null);
      }
      setLoading(false);
    };
    load();
    return () => {
      alive = false;
    };
  }, [handle]);


  const variantOptions: string[] = Array.from(
    new Set((product?.variants || []).map((v: any) => v.option1).filter(Boolean))
  ) as string[];
  const hasVariants = Boolean(product?.has_variants && (product?.variants || []).length > 0);

  const handleOptionSelect = (opt: string) => {
    setSelectedOption(opt);
    const v = (product?.variants || []).find(
      (x: any) => x.option1 === opt || x.title?.toLowerCase().includes(opt.toLowerCase())
    );
    if (v) setSelectedVariant(v);
  };

  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants && product.variants.length > 0) {
      return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = getInStock();

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedOption) return;
    if (!inStock) return;
    addToCart(
      {
        product_id: product.id,
        variant_id: selectedVariant?.id || undefined,
        name: product.name,
        variant_title: selectedVariant?.title || (hasVariants ? selectedOption : undefined),
        sku: selectedVariant?.sku || product.sku || product.handle,
        price: selectedVariant?.price || product.price,
        image: product.images?.[0],
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const price = selectedVariant?.price || product?.price || 0;
  const meta = product?.metadata || {};

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
              <div className="h-12 w-40 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-bold text-stone-900">Product not found</h1>
          <Link to="/shop" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white">
            Back to shop
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <img
                src={product.images?.[activeImage] || product.images?.[0]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      activeImage === i ? 'border-amber-500' : 'border-stone-200'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.product_type && (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{product.product_type}</span>
            )}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold text-stone-900">{formatCents(price)}</p>
            <p className="mt-4 leading-relaxed text-stone-600">{product.description}</p>

            {(hasVariants || variantOptions.length > 0) && (
              <div className="mt-7">
                <label className="mb-2 block text-sm font-bold text-stone-900">Configuration</label>
                <div className="flex flex-wrap gap-2">
                  {(variantOptions.length ? variantOptions : ['Standard']).map((opt) => {
                    const v = (product.variants || []).find((x: any) => x.option1 === opt);
                    const ok = v ? v.inventory_qty == null || v.inventory_qty > 0 : true;
                    return (
                      <button
                        key={opt}
                        onClick={() => ok && handleOptionSelect(opt)}
                        disabled={!ok}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          selectedOption === opt
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : ok
                            ? 'border-stone-300 text-stone-800 hover:border-stone-500'
                            : 'border-stone-200 text-stone-300'
                        }`}
                      >
                        {opt}
                        {v && <span className="ml-2 text-xs opacity-70">{formatCents(v.price)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-stone-300">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-3 text-stone-600 hover:text-stone-900" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-3 text-stone-600 hover:text-stone-900" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className={`text-sm font-semibold ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
                {inStock ? 'In stock · ships in 1 business day' : 'Out of stock'}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={(hasVariants && !selectedOption) || !inStock}
              className="mt-5 w-full rounded-xl bg-stone-900 py-4 font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!inStock ? 'Out of stock' : added ? 'Added to cart' : hasVariants && !selectedOption ? 'Choose a configuration' : 'Add to cart'}
            </button>
            {added && (
              <Link to="/cart" className="mt-3 block rounded-xl border border-stone-300 py-3 text-center font-semibold text-stone-800 hover:bg-stone-100">
                View cart &amp; check out
              </Link>
            )}

            <div className="mt-6 grid gap-2 rounded-2xl bg-stone-100 p-4 text-sm text-stone-700">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Free shipping on all orders</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Ships pre-loaded with your menu</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Replace-in-24h hardware coverage</span>
            </div>

            {Object.keys(meta).length > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(meta).map(([k, v]) => (
                      <tr key={k} className="border-b border-stone-100 last:border-0">
                        <td className="bg-stone-50 px-4 py-3 font-semibold capitalize text-stone-700">
                          {k.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-stone-600">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((t: string) => (
                  <span key={t} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-stone-900">Pairs well with</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ProductDetail;
