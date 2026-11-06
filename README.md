# Kiln & Co.: a ceramics store that takes USDT through Pact

A Next.js store (frontend and backend) for a small ceramics studio: catalog, product pages, a cart
drawer and a checkout that sells several products in one payment and gets paid in
USDT on Whitechain Sepolia through [Pact](https://pay.pactagent.app). It is a separate app that only
uses Pact's SDK and API, the way a real merchant would.

**Flow:** add to cart → `POST /api/checkout` → Pact's hosted pay page (payment link) → the customer
signs in with email and pays (no wallet, no gas) → Pact **redirects** back to `/orders/:id` → Pact's
**signed webhook** `payment.captured` marks the order paid. The redirect never marks anything paid.

```
Browser ──cart──▶ /api/checkout ──pact.orders.create()──▶ Pact API
   ▲                                   │ payUrl
   └────────── redirect ◀── Pact hosted page (email sign-in, pay USDT)
                                        │ onchain: Router → PaymentEscrow.charge (fee taken in the same tx)
/api/webhooks/pact ◀── payment.captured (HMAC signed, retried) ──┘
```

## The integration (about 25 lines)

`app/api/checkout/route.ts` sends the whole cart to Pact. Prices come from this server, never the browser:

```ts
const checkout = await pact.orders.create({
  customer: { kind: 'new', name: order.name, email },
  lines: lines.map(l => ({ description: l.name, quantity: l.quantity, unitMinor: toMinor(l.unitPrice).toString() })),
  returnUrl: `${process.env.APP_URL}/orders/${order.id}`,
  metadata: { store_order_id: order.id },
});
return NextResponse.json({ payUrl: checkout.payUrl }); // the browser goes there
```

`app/api/webhooks/pact/route.ts` fulfils the order. The signature is checked over the raw body first (401 otherwise):

```ts
export const POST = Webhooks({
  secret: process.env.PACT_WEBHOOK_SECRET!,
  onPaymentCaptured: async event => markPaid(String(event.metadata?.store_order_id), event.tx_hash),
  onPaymentRefunded: async event => markRefunded(event.object_id),
});
```

## Run it

1. In the Pact dashboard: **Developers → API keys → New key** (secret), and **Developers → Webhooks**:
   set the URL to `http://localhost:3220/api/webhooks/pact` and copy the signing secret. Sign Pact's fee
   terms once under **Money → Fees**.
2. `cp .env.example .env.local` and fill in `PACT_SECRET_KEY`, `PACT_WEBHOOK_SECRET` and `PACT_API_URL`.
3. `pnpm install && pnpm build && pnpm start` → http://localhost:3220

Pages: `/` shop, `/products/:id`, cart drawer, `/cart` (checkout: contact, shipping, payment), `/orders/:id`
(thank-you page that waits for the webhook), `/admin` (orders, revenue and every webhook received).

Product photos are CC0 (rawpixel, Wikimedia Commons, StockSnap, WordPress Photo Directory).

## Notes

- Until `@pactagent/*` is published on npm, the SDK is installed from the packed files in `vendor/`
  (see `pnpm-workspace.yaml`). Switching to npm is a one-line change per package.
- Orders are kept in `data/store.json` for the demo. Use your database in production.
- Webhook retries reuse the event id; the handler ignores an event it has already applied.
