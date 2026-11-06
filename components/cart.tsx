'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface CartItem { id: string; quantity: number }
interface Cart { items: CartItem[]; add: (id: string) => void; set: (id: string, quantity: number) => void; clear: () => void; count: number }

const CartContext = createContext<Cart | null>(null);
const KEY = 'pact-demo-cart';

/** The cart lives in the browser; prices are only ever read on the server. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { /* empty cart */ }
  }, []);
  const save = (next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };
  const cart: Cart = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    add: id => save(items.some(i => i.id === id) ? items.map(i => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)) : [...items, { id, quantity: 1 }]),
    set: (id, quantity) => save(quantity <= 0 ? items.filter(i => i.id !== id) : items.map(i => (i.id === id ? { ...i, quantity } : i))),
    clear: () => save([]),
  };
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart outside CartProvider');
  return cart;
};

export function CartLink() {
  const { count } = useCart();
  return <a className="pill" href="/cart">Cart · {count}</a>;
}

export function AddToCart({ id }: { id: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button onClick={() => { add(id); setAdded(true); setTimeout(() => setAdded(false), 900); }}>
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
