/**
 * Order history data layer — SINGLE SOURCE OF TRUTH for reading a signed-in
 * customer's ecom_orders / ecom_order_items.
 *
 * Same rules as the catalog layer: never throw, never console.error. A failed
 * read returns an explicit { error } so the page can show a real message
 * instead of an empty list that looks like "you have never ordered".
 */

import { supabase } from '@/lib/supabase';

export interface OrderRow {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  created_at: string;
  shipping_address: any;
  stripe_payment_intent_id?: string | null;
  customer_id?: string | null;
  notes?: string | null;
  itemCount?: number;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name: string;
  variant_title?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

/* --------------------------------------------------------------- */
/* Status presentation — used by the list, the detail page and any  */
/* future admin view so a "shipped" badge is never two colours.     */
/* --------------------------------------------------------------- */

export const ORDER_STATUS: Record<string, { label: string; className: string; blurb: string }> = {
  pending: {
    label: 'Payment pending',
    className: 'border-stone-300 bg-stone-100 text-stone-700',
    blurb: 'We have the order but the payment has not settled yet.',
  },
  paid: {
    label: 'Paid',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blurb: 'Payment cleared. Your gear is being configured with your menu before it ships.',
  },
  shipped: {
    label: 'Shipped',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    blurb: 'On the truck. Tracking is in the email we sent when it left our bench.',
  },
  delivered: {
    label: 'Delivered',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    blurb: 'Delivered. Plug it in and it boots straight into your register.',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-stone-300 bg-stone-100 text-stone-500',
    blurb: 'This order was cancelled and was not charged.',
  },
  refunded: {
    label: 'Refunded',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    blurb: 'Refunded back to the original card.',
  },
};

export const statusMeta = (status?: string) =>
  ORDER_STATUS[String(status || '').toLowerCase()] || {
    label: status || 'Unknown',
    className: 'border-stone-300 bg-stone-100 text-stone-700',
    blurb: '',
  };

export const formatOrderDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const orderRef = (id: string) => id.slice(0, 8).toUpperCase();

/* --------------------------------------------------------------- */
/* Reads                                                            */
/* --------------------------------------------------------------- */

export interface OrdersResult {
  orders: OrderRow[];
  customer: { id: string; email: string; name?: string | null } | null;
  error: string | null;
}

/** Every order belonging to the signed-in email, newest first. */
export async function fetchOrdersForEmail(email: string): Promise<OrdersResult> {
  if (!email) return { orders: [], customer: null, error: null };

  try {
    const { data: customers, error: cErr } = await supabase
      .from('ecom_customers')
      .select('id, email, name')
      .ilike('email', email)
      .limit(1);

    if (cErr) return { orders: [], customer: null, error: cErr.message };

    const customer = customers?.[0] || null;
    if (!customer) return { orders: [], customer: null, error: null };

    const { data: orders, error: oErr } = await supabase
      .from('ecom_orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (oErr) return { orders: [], customer, error: oErr.message };

    const rows = (orders || []) as OrderRow[];
    if (rows.length === 0) return { orders: [], customer, error: null };

    // One extra read gives us the item count per order for the list view.
    const { data: items } = await supabase
      .from('ecom_order_items')
      .select('order_id, quantity')
      .in('order_id', rows.map((o) => o.id));

    const counts = new Map<string, number>();
    (items || []).forEach((i: any) => {
      counts.set(i.order_id, (counts.get(i.order_id) || 0) + (i.quantity || 0));
    });

    return {
      orders: rows.map((o) => ({ ...o, itemCount: counts.get(o.id) || 0 })),
      customer,
      error: null,
    };
  } catch (e: any) {
    return { orders: [], customer: null, error: e?.message || 'Could not reach the order service.' };
  }
}

export interface OrderDetailResult {
  order: OrderRow | null;
  items: OrderItemRow[];
  error: string | null;
}

/** A single order plus its line items. Ownership is verified by the caller. */
export async function fetchOrderDetail(id: string): Promise<OrderDetailResult> {
  try {
    const { data: order, error: oErr } = await supabase
      .from('ecom_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (oErr) return { order: null, items: [], error: oErr.message };
    if (!order) return { order: null, items: [], error: null };

    const { data: items, error: iErr } = await supabase
      .from('ecom_order_items')
      .select('*')
      .eq('order_id', id);

    if (iErr) return { order: order as OrderRow, items: [], error: iErr.message };

    return { order: order as OrderRow, items: (items || []) as OrderItemRow[], error: null };
  } catch (e: any) {
    return { order: null, items: [], error: e?.message || 'Could not reach the order service.' };
  }
}
