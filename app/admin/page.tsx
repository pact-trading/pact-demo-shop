import { listOrders, webhookLog } from '@/lib/orders';

export const dynamic = 'force-dynamic';
const explorer = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.whitechain.io';
const badge = { paid: 'bg-moss/15 text-moss', awaiting_payment: 'bg-clay/15 text-clay-dark', refunded: 'bg-line text-ink-soft' } as const;

/** The store's back office: everything here was learned from Pact's signed webhooks. */
export default function Admin() {
  const orders = listOrders(), log = webhookLog();
  const revenue = orders.filter(o => o.status === 'paid').reduce((t, o) => t + Number(o.total), 0);
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Store admin</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Orders</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[['Paid orders', String(orders.filter(o => o.status === 'paid').length)], ['Revenue (USDT)', `$${revenue.toFixed(2)}`], ['Webhooks received', String(log.length)]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-5"><p className="text-sm text-ink-soft">{k}</p><p className="mt-1 font-display text-3xl">{v}</p></div>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[20px] border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50 text-ink-soft"><tr>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {orders.map(o => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium"><a href={`/orders/${o.id}`} className="hover:underline">{o.number}</a><div className="text-xs text-ink-soft">{new Date(o.createdAt).toLocaleString()}</div></td>
                <td className="px-4 py-3">{o.name}<div className="text-xs text-ink-soft">{o.email}</div></td>
                <td className="px-4 py-3">{o.lines.filter(l => l.productId !== 'shipping').map(l => `${l.name} ×${l.quantity}`).join(', ')}</td>
                <td className="px-4 py-3 font-medium">${o.total}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[o.status]}`}>{o.status.replace('_', ' ')}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{o.pact.txHash ? <a className="text-clay underline" href={`${explorer}/tx/${o.pact.txHash}`} target="_blank" rel="noreferrer">{o.pact.txHash.slice(0, 10)}…</a> : '-'}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="mt-12 font-display text-2xl">Webhooks from Pact</h2>
      <div className="mt-4 overflow-x-auto rounded-[20px] border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50 text-ink-soft"><tr>{['Received', 'Event', 'Type', 'Attempt', 'Result'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {log.map(w => (
              <tr key={`${w.id}-${w.receivedAt}`}>
                <td className="px-4 py-3">{new Date(w.receivedAt).toLocaleTimeString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                <td className="px-4 py-3"><code className="rounded bg-sand px-2 py-0.5 text-xs">{w.type}</code></td>
                <td className="px-4 py-3">{w.attempt ?? 1}</td>
                <td className="px-4 py-3">{w.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
