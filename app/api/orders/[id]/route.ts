import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/** The order page polls this until the webhook has marked the order paid. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const order = getOrder((await params).id);
  return order ? NextResponse.json(order) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}
