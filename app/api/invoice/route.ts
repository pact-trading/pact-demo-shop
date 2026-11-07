import { NextResponse } from 'next/server';
import { pact } from '@/lib/pact';

export const dynamic = 'force-dynamic';

// A public demo that emails real invoices: a few per visitor, and a cap per instance.
const sent = new Map<string, number[]>();
const HOUR = 3_600_000;
function allowed(key: string, limit: number) {
  const now = Date.now();
  const recent = (sent.get(key) ?? []).filter(at => now - at < HOUR);
  if (recent.length >= limit) return false;
  sent.set(key, [...recent, now]);
  return true;
}

/** Kiln's glaze workshop, invoiced to the visitor: Pact emails it in Kiln's colours with a pay link. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; company?: string } | null;
  if (body?.company) return NextResponse.json({ ok: true }); // honeypot
  const email = body?.email?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (!allowed(`ip:${ip}`, 3) || !allowed(`email:${email}`, 2) || !allowed('all', 40))
    return NextResponse.json({ error: 'Too many invoices for now. Try again in an hour.' }, { status: 429 });
  try {
    const invoice = await pact.invoices.create({
      customerEmail: email,
      lines: [{ description: 'Glaze workshop, one seat', quantity: 1, unitAmount: '2' }],
      memo: 'Thanks for booking with Kiln & Co. This is a testnet demo invoice.',
    });
    const delivered = await pact.invoices.send(invoice.id);
    return NextResponse.json({ invoiceId: invoice.id, hostedUrl: delivered.hostedUrl });
  } catch (error) {
    console.error('[invoice]', error);
    return NextResponse.json({ error: 'Could not send the invoice. Try again.' }, { status: 502 });
  }
}
