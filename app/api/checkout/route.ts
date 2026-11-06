import { NextResponse } from 'next/server';
import { productById, toMinor, fromMinor } from '@/lib/catalog';
import { createOrder, updateOrder } from '@/lib/orders';
import { pact } from '@/lib/pact';

/**
 * The cart → Pact. The browser sends product ids and quantities only; prices come from this server.
 * Pact returns a hosted pay page; once paid it sends the customer back to returnUrl, and the
 * signed payment.captured webhook (not the redirect) marks the order paid.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; name?: string; items?: Array<{ id: string; quantity: number }> } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
  const lines = (body?.items ?? []).flatMap(item => {
    const product = productById(item.id), quantity = Math.floor(Number(item.quantity));
    return product && quantity > 0 && quantity <= 20 ? [{ productId: product.id, name: product.name, quantity, unitPrice: product.price }] : [];
  });
  if (!lines.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  const total = lines.reduce((sum, l) => sum + toMinor(l.unitPrice) * BigInt(l.quantity), 0n);
  const order = createOrder({ email, name: body?.name?.trim() || email, lines, total: fromMinor(total) });

  // ── Pact: one call creates the hosted checkout for the whole cart ──
  const checkout = await pact.orders.create({
    customer: { kind: 'new', name: order.name, email },
    lines: lines.map(l => ({ description: l.name, quantity: l.quantity, unitMinor: toMinor(l.unitPrice).toString() })),
    returnUrl: `${process.env.APP_URL}/orders/${order.id}`,
    metadata: { store_order_id: order.id },
  });
  updateOrder(order.id, o => { o.pact.paymentId = checkout.orderId; o.pact.payUrl = checkout.payUrl; });
  return NextResponse.json({ orderId: order.id, payUrl: checkout.payUrl });
}
