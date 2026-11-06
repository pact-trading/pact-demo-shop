import { listOrders, webhookLog } from '@/lib/orders';

export const dynamic = 'force-dynamic';
const explorer = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.whitechain.io';

/** What the store knows, all of it learned from Pact's webhooks. */
export default function Admin() {
  const orders = listOrders(), log = webhookLog();
  return (
    <>
      <h1>Orders</h1>
      <p className="lead">Marked paid only by a verified Pact webhook.</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="mono"><a href={`/orders/${o.id}`}>{o.id}</a></td>
                <td>{o.email}</td>
                <td>{o.lines.map(l => `${l.name} ×${l.quantity}`).join(', ')}</td>
                <td>${o.total}</td>
                <td><span className={`status ${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                <td className="mono">{o.pact.txHash ? <a href={`${explorer}/tx/${o.pact.txHash}`} target="_blank" rel="noreferrer">{o.pact.txHash.slice(0, 10)}…</a> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 style={{ fontSize: 22 }}>Webhooks received</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Received</th><th>Event</th><th>Type</th><th>Attempt</th><th>Result</th></tr></thead>
          <tbody>
            {log.map(w => (
              <tr key={`${w.id}-${w.receivedAt}`}>
                <td>{new Date(w.receivedAt).toLocaleTimeString()}</td>
                <td className="mono">{w.id}</td>
                <td>{w.type}</td>
                <td>{w.attempt ?? 1}</td>
                <td>{w.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
