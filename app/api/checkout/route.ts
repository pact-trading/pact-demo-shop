import { NextResponse } from 'next/server';
import { productById, toMinor, fromMinor } from '@/lib/catalog';
import { createOrder, updateOrder } from '@/lib/orders';
import { pact } from '@/lib/pact';

const FREE_SHIPPING = 40_000_000n, SHIPPING = '5.00';

/**
 * The cart → Pact. The browser sends product ids and quantities only; prices come from this server.
 * Pact returns a hosted pay page; once paid it sends the customer back to returnUrl, and the
 * signed payment.captured webhook (not the redirect) marks the order paid.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string; name?: string; items?: Array<{ id: string; quantity: number }>;
    shipping?: { address?: string; city?: string; country?: string };
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
  const lines = (body?.items ?? []).flatMap(item => {
    const product = productById(item.id), quantity = Math.floor(Number(item.quantity));
    return product && quantity > 0 && quantity <= 20 ? [{ productId: product.id, name: product.name, image: product.image, quantity, unitPrice: product.price }] : [];
  });
  if (!lines.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  const subtotal = lines.reduce((sum, l) => sum + toMinor(l.unitPrice) * BigInt(l.quantity), 0n);
  if (subtotal < FREE_SHIPPING) lines.push({ productId: 'shipping', name: 'Shipping', image: '', quantity: 1, unitPrice: SHIPPING });
  const total = lines.reduce((sum, l) => sum + toMinor(l.unitPrice) * BigInt(l.quantity), 0n);
  const s = body?.shipping ?? {};
  const order = createOrder({ email, name: body?.name?.trim() || email, lines, total: fromMinor(total), shipTo: [s.address, s.city, s.country].filter(Boolean).join(', ') });

  // ── Pact: one call creates the hosted checkout for the whole cart ──
  const checkout = await pact.orders.create({
    customer: { kind: 'new', name: order.name, email },
    lines: lines.map(l => ({ description: l.name, quantity: l.quantity, unitMinor: toMinor(l.unitPrice).toString(), ...(l.image ? { imageUrl: `${process.env.APP_URL}${l.image}` } : {}) })),
    returnUrl: `${process.env.APP_URL}/orders/${order.id}`,
    metadata: { store_order_id: order.id, order_number: order.number },
  });
  updateOrder(order.id, o => { o.pact.paymentId = checkout.orderId; o.pact.payUrl = checkout.payUrl; });
  return NextResponse.json({ orderId: order.id, payUrl: checkout.payUrl });
}
