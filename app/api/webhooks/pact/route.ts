import { Webhooks } from '@pactagent/node';
import { logWebhook, seenEvent, updateOrder, updateOrderByPayment } from '@/lib/orders';

/**
 * Pact → the store. The signature is checked over the raw body before anything runs (401 if not).
 * Fulfilment happens here, never on the browser redirect. Retries reuse the event id.
 */
export const POST = Webhooks({
  secret: process.env.PACT_WEBHOOK_SECRET!,
  onPaymentCaptured: async event => {
    const orderId = String(event.metadata?.store_order_id ?? '');
    if (seenEvent(event.id)) return logWebhook({ id: event.id, type: event.type, objectId: event.object_id, result: 'duplicate', receivedAt: new Date().toISOString(), attempt: event.attempt });
    const order = updateOrder(orderId, o => {
      o.status = 'paid';
      o.pact.txHash = event.tx_hash ?? null;
      o.pact.paidEventId = event.id;
      o.pact.paidAt = event.occurred_at;
    });
    logWebhook({ id: event.id, type: event.type, objectId: event.object_id, result: order ? `paid ${orderId}` : 'not this store', receivedAt: new Date().toISOString(), attempt: event.attempt });
    console.log(`[webhook] ${event.type} ${event.id} → ${order ? `order ${orderId} paid, tx ${event.tx_hash}` : 'ignored'}`);
  },
  onPaymentRefunded: async event => {
    const order = updateOrderByPayment(event.object_id, o => { o.status = 'refunded'; });
    logWebhook({ id: event.id, type: event.type, objectId: event.object_id, result: order ? `refunded ${order.id}` : 'not this store', receivedAt: new Date().toISOString(), attempt: event.attempt });
    console.log(`[webhook] ${event.type} ${event.id}`);
  },
  onEvent: async event => {
    if (!['payment.captured', 'payment.refunded'].includes(event.type)) {
      logWebhook({ id: event.id, type: event.type, objectId: event.object_id, result: 'received', receivedAt: new Date().toISOString(), attempt: event.attempt });
      console.log(`[webhook] ${event.type} ${event.id}`);
    }
  },
});
