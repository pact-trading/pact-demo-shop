'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Order {
  id: string; number: string; email: string; name: string; shipTo: string; total: string;
  status: 'awaiting_payment' | 'paid' | 'refunded'; createdAt: string;
  lines: Array<{ productId: string; name: string; image?: string; quantity: number; unitPrice: string }>;
  pact: { paymentId: string | null; txHash: string | null; paidEventId: string | null; paidAt: string | null };
}
const explorer = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.whitechain.io';

/** Where Pact sends the customer back. The redirect proves nothing: this page waits for the webhook. */
export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const response = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
      if (response.ok) setOrder(await response.json());
      if (!stop) setTimeout(tick, 1500);
    };
    void tick();
    return () => { stop = true; };
  }, [id]);
  if (!order) return <div className="mx-auto max-w-3xl px-5 py-24 text-center text-ink-soft">Loading your order…</div>;
  const paid = order.status !== 'awaiting_payment';
  const steps = [
    { label: 'Order placed', done: true },
    { label: 'Payment confirmed', done: paid },
    { label: 'Packing', done: false },
    { label: 'Shipped', done: false },
  ];
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <div className="flex items-start gap-4">
        <span className={`grid size-12 shrink-0 place-items-center rounded-full text-xl ${paid ? 'bg-moss text-white' : 'bg-sand text-ink-soft'}`}>{paid ? '✓' : '…'}</span>
        <div>
          <p className="text-sm text-ink-soft">Order {order.number}</p>
          <h1 className="font-display text-4xl tracking-tight">{paid ? `Thank you, ${order.name.split(' ')[0]}!` : 'Confirming your payment…'}</h1>
          <p className="mt-1 text-ink-soft">{paid ? `Your order is confirmed. A receipt is on its way to ${order.email}.` : 'This takes a few seconds while Pact confirms it on Whitechain.'}</p>
        </div>
      </div>

      <ol className="mt-10 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s.label}>
            <div className={`h-1.5 rounded-full ${s.done ? 'bg-moss' : i === 1 && !paid ? 'animate-pulse bg-clay/60' : 'bg-line'}`} />
            <p className={`mt-2 text-sm ${s.done ? 'font-medium' : 'text-ink-soft'}`}>{s.label}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[24px] border border-line bg-white p-6">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.lines.map(l => (
              <li key={l.productId} className="flex items-center gap-4 py-3">
                {l.image ? <img src={l.image} alt="" className="size-14 rounded-xl object-cover" /> : <span className="grid size-14 place-items-center rounded-xl bg-sand text-xl">📦</span>}
                <p className="flex-1 text-sm font-medium">{l.name} <span className="text-ink-soft">× {l.quantity}</span></p>
                <p className="text-sm">${(Number(l.unitPrice) * l.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-semibold"><span>Total paid</span><span>${order.total} USDT</span></div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-[24px] border border-line bg-white p-6 text-sm">
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-3 flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-[#26A17B] text-xs font-bold text-white">₮</span> USDT on Whitechain, via Pact</p>
            {paid && order.pact.txHash ? (
              <a className="mt-3 inline-block font-medium text-clay underline" href={`${explorer}/tx/${order.pact.txHash}`} target="_blank" rel="noreferrer">View the payment on Whitechain ↗</a>
            ) : <p className="mt-3 text-ink-soft">Waiting for Pact&apos;s confirmation…</p>}
            <p className="mt-3 text-xs text-ink-soft">Confirmed by a signed webhook from Pact, not by this page.</p>
          </div>
          <div className="rounded-[24px] border border-line bg-white p-6 text-sm">
            <h2 className="font-semibold">Shipping to</h2>
            <p className="mt-3">{order.name}</p>
            <p className="text-ink-soft">{order.shipTo || 'Address on file'}</p>
          </div>
          <Link href="/" className="btn btn-primary w-full">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
