'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface CartItem { id: string; quantity: number }
interface Cart {
  items: CartItem[];
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (id: string, quantity?: number) => void;
  set: (id: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<Cart | null>(null);
const KEY = 'kiln-cart';

/** The cart lives in the browser; prices are only ever read on the server. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { /* empty cart */ }
  }, []);
  const save = (next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };
  const cart: Cart = {
    items,
    open,
    setOpen,
    count: items.reduce((n, i) => n + i.quantity, 0),
    add: (id, quantity = 1) => {
      save(items.some(i => i.id === id) ? items.map(i => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i)) : [...items, { id, quantity }]);
      setOpen(true);
    },
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

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} className="relative flex items-center gap-2 rounded-full p-2 hover:bg-sand" aria-label={`Cart, ${count} items`}>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
      {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-clay text-[11px] font-bold text-white">{count}</span>}
    </button>
  );
}

export function AddToCart({ id, quantity = 1, full = false }: { id: string; quantity?: number; full?: boolean }) {
  const { add } = useCart();
  return (
    <button onClick={() => add(id, quantity)} className={`btn btn-primary ${full ? 'w-full py-4 text-base' : ''}`}>
      Add to cart
    </button>
  );
}
