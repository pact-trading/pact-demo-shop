'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

/** Get a real Kiln invoice by email, then pay it through Pact. */
export default function InvoiceDemoPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<{ hostedUrl: string } | null>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/invoice', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, company }) });
    const result = (await response.json()) as { hostedUrl?: string; error?: string };
    setBusy(false);
    if (!response.ok || !result.hostedUrl) return setError(result.error ?? 'Could not send the invoice.');
    setSent({ hostedUrl: result.hostedUrl });
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="font-display text-4xl tracking-tight">Book the glaze workshop</h1>
      <p className="mt-3 text-ink-soft">We send you an invoice for 2 USDT. Open the email, review it and pay by card, bank transfer or USDT.</p>
      {sent ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-6">
          <Mail className="text-clay" size={22} />
          <p className="mt-3 font-semibold">Invoice sent to {email}</p>
          <p className="mt-1 text-sm text-ink-soft">It arrives in a minute from Kiln & Co., with the PDF and a Review and pay button.</p>
          <a href={sent.hostedUrl} className="btn btn-primary mt-5">Open the invoice now</a>
        </div>
      ) : (
        <form onSubmit={send} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <input aria-hidden tabIndex={-1} autoComplete="off" className="hidden" value={company} onChange={e => setCompany(e.target.value)} />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Email me the invoice'}</button>
          <p className="text-xs text-ink-soft">Testnet demo: no real money moves.</p>
        </form>
      )}
    </div>
  );
}
