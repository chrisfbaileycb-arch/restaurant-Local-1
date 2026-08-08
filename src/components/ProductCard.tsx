import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Truck } from 'lucide-react';
import { formatCents } from '@/data/platform';
import { useCart } from '@/contexts/CartContext';

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { addToCart } = useCart();
  const variants = product?.variants || [];
  const price = variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : product?.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    const v = sorted.find((x: any) => x.inventory_qty == null || x.inventory_qty > 0) || sorted[0];
    addToCart(
      {
        product_id: product.id,
        variant_id: v?.id || undefined,
        name: product.name,
        variant_title: v?.title || undefined,
        sku: v?.sku || product.sku || product.handle,
        price: v?.price || product.price,
        image: product.images?.[0],
      },
      1
    );
  };

  return (
    <Link
      to={`/products/${product.handle}`}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-fuchsia-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
        {product.tags?.includes('bestseller') && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
            Bestseller
          </span>
        )}
        <button
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-orange-500 text-white opacity-0 shadow-lg transition hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.product_type && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-600">
            {product.product_type}
          </span>
        )}
        <h3 className="font-bold leading-snug text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold text-slate-900">
            {variants.length > 1 ? `From ${formatCents(price)}` : formatCents(price)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
            <Truck className="h-3.5 w-3.5" /> Free shipping
          </span>
        </div>
      </div>
    </Link>
  );

};

export default ProductCard;
