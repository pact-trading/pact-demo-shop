import { Check } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCart } from '@/components/cart';
import { Stars } from '@/components/chrome';
import { CATALOG, productById } from '@/lib/catalog';

export function generateStaticParams() {
  return CATALOG.map(p => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = productById((await params).id);
  if (!product) notFound();
  const related = CATALOG.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8">
      <nav className="text-sm text-ink-soft"><Link href="/" className="hover:underline">Shop</Link> / {product.category} / <span className="text-ink">{product.name}</span></nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <img src={product.image} alt={product.name} className="aspect-square w-full rounded-[28px] object-cover" />
        <div className="lg:pt-6">
          {product.badge && <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{product.badge}</span>}
          <h1 className="mt-3 font-display text-4xl tracking-tight">{product.name}</h1>
          <div className="mt-2"><Stars rating={product.rating} reviews={product.reviews} /></div>
          <p className="mt-5 text-3xl font-semibold">${product.price} <span className="text-base font-normal text-ink-soft">USDT</span></p>
          <p className="mt-5 text-lg text-ink-soft">{product.description}</p>
          <ul className="mt-5 space-y-2">
            {product.details.map(d => <li key={d} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-moss" />{d}</li>)}
          </ul>
          <div className="mt-8"><AddToCart id={product.id} full /></div>
          <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-5 text-sm">
            <p><strong>Pay in USDT, no wallet needed.</strong> At checkout you sign in with your email and confirm once. No gas, no seed phrase.</p>
            <p className="text-ink-soft">Ships in 2 days. Free over $40. 30-day returns.</p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <img src={p.image} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />
                <div className="mt-3 flex justify-between"><span className="font-medium group-hover:underline">{p.name}</span><span className="font-semibold">${p.price}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
