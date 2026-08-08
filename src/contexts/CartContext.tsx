import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CART_KEY } from '@/data/platform';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number; // cents
  image?: string;
}

interface CartContextValue {
  cart: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (product_id: string, variant_id: string | undefined, quantity: number) => void;
  removeFromCart: (product_id: string, variant_id?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const read = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(read());
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      const next = [...read()];
      const idx = next.findIndex(
        (c) => c.product_id === item.product_id && (c.variant_id || null) === (item.variant_id || null)
      );
      if (idx >= 0) next[idx].quantity += quantity;
      else next.push({ ...item, quantity });
      persist(next);
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (product_id: string, variant_id: string | undefined, quantity: number) => {
      const next = read()
        .map((c) =>
          c.product_id === product_id && (c.variant_id || null) === (variant_id || null)
            ? { ...c, quantity: Math.max(0, quantity) }
            : c
        )
        .filter((c) => c.quantity > 0);
      persist(next);
    },
    [persist]
  );

  const removeFromCart = useCallback(
    (product_id: string, variant_id?: string) => {
      const next = read().filter(
        (c) => !(c.product_id === product_id && (c.variant_id || null) === (variant_id || null))
      );
      persist(next);
    },
    [persist]
  );

  const clearCart = useCallback(() => persist([]), [persist]);

  const count = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, count, subtotal, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
