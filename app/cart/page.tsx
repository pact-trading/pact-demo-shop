'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart';
import { CATALOG, fromMinor, toMinor } from '@/lib/catalog';

const FREE_SHIPPING = 40_000_000n, SHIPPING = 5_000_000n;

export default function CheckoutPage() {
  const cart = useCart();
  const [form, setForm] = useState({ email: '', name: '', address: '', city: '', country: 'Vietnam' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lines = cart.items.flatMap(i => {
    const p = CATALOG.find(c => c.id === i.id);
    return p ? [{ ...p, quantity: i.quantity }] : [];
  });
  const subtotal = lines.reduce((t, l) => t + toMinor(l.price) * BigInt(l.quantity), 0n);
  const shipping = subtotal >= FREE_SHIPPING || !lines.length ? 0n : SHIPPING;
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }) });

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: form.email, name: form.name, shipping: { address: form.address, city: form.city, country: form.country }, items: cart.items }),
    });
    const result = (await response.json()) as { payUrl?: string; error?: string };
    if (!response.ok || !result.payUrl) {
      setBusy(false);
      return setError(result.error ?? 'Could not start the checkout.');
    }
    cart.clear();
    window.location.assign(result.payUrl); // Pact's hosted checkout
  }

  if (!lines.length)
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Link href="/" className="btn btn-primary mt-6">Continue shopping</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
      <form onSubmit={pay} className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <div className="mt-4 grid gap-4">
              <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" placeholder="you@example.com" {...field('email')} /></div>
              <p className="-mt-2 text-sm text-ink-soft">Your receipt goes here, and you sign in with it to pay. No account or wallet needed.</p>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label" htmlFor="name">Full name</label><input id="name" required className="input" placeholder="Ana Silva" {...field('name')} /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="address">Address</label><input id="address" className="input" placeholder="12 Nguyen Hue" {...field('address')} /></div>
              <div><label className="label" htmlFor="city">City</label><input id="city" className="input" placeholder="Ho Chi Minh City" {...field('city')} /></div>
              <div><label className="label" htmlFor="country">Country</label><input id="country" className="input" {...field('country')} /></div>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Payment</h2>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-ink bg-white p-5">
              <span className="grid size-11 place-items-center rounded-full bg-[#26A17B] text-lg font-bold text-white">₮</span>
              <div className="flex-1">
                <p className="font-semibold">USDT on Whitechain</p>
                <p className="text-sm text-ink-soft">Secure checkout by Pact. Sign in with your email, confirm once, no gas fees.</p>
              </div>
              <span className="text-sm font-semibold text-moss">Selected</span>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[24px] border border-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {lines.map(l => (
              <li key={l.id} className="flex items-center gap-4 py-3">
                <div className="relative">
                  <img src={l.image} alt="" className="size-16 rounded-xl object-cover" />
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-cream">{l.quantity}</span>
                </div>
                <p className="flex-1 text-sm font-medium">{l.name}</p>
                <p className="text-sm font-medium">${fromMinor(toMinor(l.price) * BigInt(l.quantity))}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>${fromMinor(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{shipping ? `$${fromMinor(shipping)}` : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>${fromMinor(subtotal + shipping)} <span className="text-sm font-normal text-ink-soft">USDT</span></dd></div>
          </dl>
          <button type="submit" disabled={busy} className="btn btn-clay mt-6 w-full py-4 text-base">
            {busy ? 'Opening secure checkout…' : `Pay $${fromMinor(subtotal + shipping)} with Pact`}
          </button>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <p className="mt-4 text-center text-xs text-ink-soft">🔒 You will finish on Pact&apos;s secure page, then come back here.</p>
        </aside>
      </form>
    </div>
  );
}
