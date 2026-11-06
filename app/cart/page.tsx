'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart';
import { CATALOG, fromMinor, toMinor } from '@/lib/catalog';

export default function CartPage() {
  const cart = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lines = cart.items.flatMap(i => {
    const p = CATALOG.find(c => c.id === i.id);
    return p ? [{ ...p, quantity: i.quantity }] : [];
  });
  const total = lines.reduce((t, l) => t + toMinor(l.price) * BigInt(l.quantity), 0n);

  async function checkout() {
    setBusy(true);
    setError('');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name, items: cart.items }),
    });
    const result = (await response.json()) as { payUrl?: string; error?: string };
    if (!response.ok || !result.payUrl) {
      setBusy(false);
      return setError(result.error ?? 'Could not start the checkout.');
    }
    cart.clear();
    window.location.assign(result.payUrl); // Pact's hosted checkout
  }

  return (
    <>
      <h1>Your cart</h1>
      <p className="lead">One payment for everything, settled in USDT.</p>
      {!lines.length ? (
        <div className="card">Your cart is empty. <a href="/">Back to the shop</a></div>
      ) : (
        <div className="two">
          <div className="card">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.id}>
                    <td>{l.emoji} {l.name}<div className="muted">${l.price} each</div></td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-start', gap: 6 }}>
                        <button className="ghost" onClick={() => cart.set(l.id, l.quantity - 1)}>−</button>
                        <span>{l.quantity}</span>
                        <button className="ghost" onClick={() => cart.set(l.id, l.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>${fromMinor(toMinor(l.price) * BigInt(l.quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row" style={{ marginTop: 14 }}>
              <strong>Total</strong>
              <strong>${fromMinor(total)} USDT</strong>
            </div>
          </div>
          <div className="card">
            <strong>Checkout</strong>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ana Silva" />
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <p className="muted" style={{ fontSize: 13 }}>You sign in with this email on the next page. No wallet or gas.</p>
            <button style={{ width: '100%' }} disabled={busy || !email} onClick={checkout}>
              {busy ? 'Opening checkout…' : `Pay $${fromMinor(total)} with Pact`}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
