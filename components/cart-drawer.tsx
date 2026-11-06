'use client';

import Link from 'next/link';
import { useCart } from './cart';
import { CATALOG, fromMinor, toMinor } from '@/lib/catalog';

/** Slide-over cart, like most real stores. Checkout happens on /cart. */
export function CartDrawer() {
  const cart = useCart();
  const lines = cart.items.flatMap(i => {
    const p = CATALOG.find(c => c.id === i.id);
    return p ? [{ ...p, quantity: i.quantity }] : [];
  });
  const subtotal = lines.reduce((t, l) => t + toMinor(l.price) * BigInt(l.quantity), 0n);
  return (
    <div className={`fixed inset-0 z-50 ${cart.open ? '' : 'pointer-events-none'}`} aria-hidden={!cart.open}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity ${cart.open ? 'opacity-100' : 'opacity-0'}`} onClick={() => cart.setOpen(false)} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${cart.open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-display text-xl">Your cart ({cart.count})</p>
          <button onClick={() => cart.setOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label="Close cart">✕</button>
        </div>
        {lines.length ? (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map(l => (
                <li key={l.id} className="flex gap-4 py-5">
                  <img src={l.image} alt="" className="size-20 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium">{l.name}</p>
                      <p className="font-medium">${fromMinor(toMinor(l.price) * BigInt(l.quantity))}</p>
                    </div>
                    <p className="text-sm text-ink-soft">{l.category}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line bg-white">
                        <button className="px-3 py-1" onClick={() => cart.set(l.id, l.quantity - 1)} aria-label="Remove one">−</button>
                        <span className="w-6 text-center text-sm">{l.quantity}</span>
                        <button className="px-3 py-1" onClick={() => cart.set(l.id, l.quantity + 1)} aria-label="Add one">+</button>
                      </div>
                      <button className="text-sm text-ink-soft underline" onClick={() => cart.set(l.id, 0)}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
              <div className="flex justify-between text-lg"><span>Subtotal</span><span className="font-semibold">${fromMinor(subtotal)}</span></div>
              <p className="mt-1 text-sm text-ink-soft">Shipping calculated at checkout. Paid in USDT.</p>
              <Link href="/cart" onClick={() => cart.setOpen(false)} className="btn btn-clay mt-4 w-full py-4 text-base">Checkout</Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl">Your cart is empty</p>
            <button className="btn btn-primary" onClick={() => cart.setOpen(false)}>Continue shopping</button>
          </div>
        )}
      </aside>
    </div>
  );
}
