import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, Truck, ArrowRight } from 'lucide-react';
import PageShell from '@/components/site/PageShell';
import { useCart } from '@/contexts/CartContext';
import { formatCents } from '@/data/platform';

const Cart: React.FC = () => {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Your cart</h1>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-stone-900">Your cart is empty</p>
            <p className="mt-1 text-stone-500">Add a terminal, a reader or a done-for-you launch package.</p>
            <Link to="/shop" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white">
              Browse hardware
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product_id}-${item.variant_id || 'base'}`}
                  className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900">{item.name}</h3>
                    {item.variant_title && <p className="text-sm text-stone-500">{item.variant_title}</p>}
                    {item.sku && <p className="text-xs text-stone-400">SKU {item.sku}</p>}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-stone-300">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                          className="px-2 py-1.5 text-stone-600 hover:text-stone-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                          className="px-2 py-1.5 text-stone-600 hover:text-stone-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.variant_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-stone-900">{formatCents(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="font-bold text-stone-900">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatCents(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span className="text-stone-500">Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold text-stone-900">
                <span>Total</span>
                <span>{formatCents(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 font-bold text-white transition hover:bg-stone-800"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                <Truck className="h-4 w-4 text-emerald-600" /> Free shipping on all orders, always.
              </p>
              <Link to="/shop" className="mt-3 block text-center text-sm font-semibold text-amber-700 hover:text-amber-800">
                Keep shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Cart;
