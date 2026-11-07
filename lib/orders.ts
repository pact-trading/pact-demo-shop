import 'server-only';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** The store's own order book: a JSON file, enough for a demo. Use your database in production. */
export interface OrderLine { productId: string; name: string; image?: string; quantity: number; unitPrice: string }
export interface StoreOrder {
  id: string;
  /** What the customer sees: KC-1001, KC-1002… */
  number: string;
  shipTo: string;
  email: string;
  name: string;
  lines: OrderLine[];
  total: string;
  status: 'awaiting_payment' | 'paid' | 'refunded';
  createdAt: string;
  pact: { paymentId: string | null; payUrl: string | null; txHash: string | null; paidEventId: string | null; paidAt: string | null };
}
export interface WebhookLogEntry { id: string; type: string; objectId: string; result: string; receivedAt: string; attempt?: number }
interface Book { orders: StoreOrder[]; webhooks: WebhookLogEntry[] }

// Vercel functions can only write to /tmp (per instance, cleared on a cold start); locally the repo's data/.
const dir = process.env.VERCEL ? join('/tmp', 'kiln') : join(process.cwd(), 'data'), file = join(dir, 'store.json');
const read = (): Book => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { orders: [], webhooks: [] });
const write = (book: Book) => { mkdirSync(dir, { recursive: true }); writeFileSync(file, JSON.stringify(book, null, 2)); };

export const listOrders = () => read().orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getOrder = (id: string) => read().orders.find(o => o.id === id) ?? null;
export const webhookLog = () => read().webhooks.slice(0, 50);

export function createOrder(input: Omit<StoreOrder, 'id' | 'number' | 'status' | 'createdAt' | 'pact'>): StoreOrder {
  const book = read();
  const order: StoreOrder = { ...input, id: `ord_${randomUUID().slice(0, 8)}`, number: `KC-${1001 + book.orders.length}`, status: 'awaiting_payment', createdAt: new Date().toISOString(), pact: { paymentId: null, payUrl: null, txHash: null, paidEventId: null, paidAt: null } };
  book.orders.push(order);
  write(book);
  return order;
}

export function updateOrder(id: string, change: (order: StoreOrder) => void) {
  const book = read(), order = book.orders.find(o => o.id === id);
  if (!order) return null;
  change(order);
  write(book);
  return order;
}

export function logWebhook(entry: WebhookLogEntry) {
  const book = read();
  book.webhooks.unshift(entry);
  write(book);
}
/** Pact retries with the same event id: an event already handled is not handled twice. */
export const seenEvent = (eventId: string) => read().webhooks.some(w => w.id === eventId && w.result !== 'error');

export function updateOrderByPayment(paymentId: string, change: (order: StoreOrder) => void) {
  const id = read().orders.find(o => o.pact.paymentId?.toLowerCase() === paymentId.toLowerCase())?.id;
  return id ? updateOrder(id, change) : null;
}
