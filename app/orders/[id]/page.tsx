'use client';

import { use, useEffect, useState } from 'react';

interface Order {
  id: string; email: string; total: string; status: 'awaiting_payment' | 'paid' | 'refunded';
  lines: Array<{ name: string; quantity: number; unitPrice: string }>;
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
  if (!order) return <h1>Loading order…</h1>;
  const paid = order.status !== 'awaiting_payment';
  return (
    <>
      <h1>{paid ? 'Thank you, your order is confirmed' : 'Waiting for payment confirmation…'}</h1>
      <p className="lead">Order <span className="mono">{order.id}</span> · {order.email}</p>
      <div className="two">
        <div className="card">
          <table>
            <tbody>
              {order.lines.map(l => (
                <tr key={l.name}><td>{l.name} × {l.quantity}</td><td style={{ textAlign: 'right' }}>${(Number(l.unitPrice) * l.quantity).toFixed(2)}</td></tr>
              ))}
              <tr><td><strong>Total</strong></td><td style={{ textAlign: 'right' }}><strong>${order.total} USDT</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <span className={`status ${order.status}`}>{order.status.replace('_', ' ')}</span>
          <div className="steps">
            <div className="step"><span className="dot done">✓</span>Cart sent to Pact</div>
            <div className="step"><span className="dot done">✓</span>Paid on Pact&apos;s hosted page</div>
            <div className="step"><span className={`dot ${paid ? 'done' : ''}`}>{paid ? '✓' : '…'}</span>Signed webhook received</div>
          </div>
          {paid && order.pact.txHash && (
            <p style={{ marginTop: 16 }}>
              <a href={`${explorer}/tx/${order.pact.txHash}`} target="_blank" rel="noreferrer">View the USDT payment on Whitechain ↗</a>
              <br /><span className="muted mono">event {order.pact.paidEventId}</span>
            </p>
          )}
          {!paid && <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>This page updates when Pact&apos;s signed webhook arrives, not from the redirect.</p>}
        </div>
      </div>
    </>
  );
}
