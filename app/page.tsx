import Link from 'next/link';
import { AddToCart } from '@/components/cart';
import { Stars } from '@/components/chrome';
import { CATALOG, type Product } from '@/lib/catalog';

export default function Home() {
  const mugs = CATALOG.filter(p => p.category === 'Mugs & cups');
  const rest = CATALOG.filter(p => p.category !== 'Mugs & cups');
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Autumn collection</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">Made by hand,<br />made to be used.</h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">Small batches of stoneware thrown and glazed in our studio. Every piece is a little different, and meant for every day.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#shop" className="btn btn-clay">Shop the collection</Link>
            <Link href="#story" className="btn btn-ghost">Visit the studio</Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
            <div><dt className="font-display text-2xl text-ink">4.9★</dt><dd className="text-ink-soft">2,300 reviews</dd></div>
            <div><dt className="font-display text-2xl text-ink">2 days</dt><dd className="text-ink-soft">to dispatch</dd></div>
            <div><dt className="font-display text-2xl text-ink">USDT</dt><dd className="text-ink-soft">pay with email</dd></div>
          </dl>
        </div>
        <div className="relative">
          <img src="/hero.jpg" alt="Terracotta pots drying in a wooden crate" className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-xl" />
          <div className="absolute -bottom-5 left-5 rounded-2xl bg-white px-5 py-4 shadow-lg">
            <p className="text-xs uppercase tracking-wider text-ink-soft">Fresh from the kiln</p>
            <p className="font-display text-lg">New planters every Friday</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-sand/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-sm sm:grid-cols-3">
          {[['Handmade in small batches', 'Thrown, trimmed and glazed by four potters.'], ['Free shipping over $40', 'Packed in recycled paper, dispatched in 2 days.'], ['Pay in USDT, no wallet', 'Sign in with email at checkout. Powered by Pact.']].map(([t, d]) => (
            <div key={t}><p className="font-semibold">{t}</p><p className="text-ink-soft">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-28 px-5 pt-16">
        <div id="mugs" className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Mugs &amp; cups</h2>
          <p className="text-sm text-ink-soft">{mugs.length} pieces</p>
        </div>
        <ProductGrid products={mugs} />
        <div id="planters" className="mt-16 flex scroll-mt-28 items-end justify-between">
          <h2 className="font-display text-3xl">Planters &amp; home</h2>
          <p className="text-sm text-ink-soft">{rest.length} pieces</p>
        </div>
        <ProductGrid products={rest} />
      </section>

      <section id="story" className="mx-auto mt-20 grid max-w-6xl scroll-mt-28 items-center gap-10 px-5 lg:grid-cols-2">
        <img src="/journal.jpg" alt="A notebook and a coffee cup on a pink table" className="aspect-[4/3] w-full rounded-[28px] object-cover" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Our studio</p>
          <h2 className="mt-3 font-display text-4xl leading-tight">A small workshop with a very hot kiln.</h2>
          <p className="mt-4 text-ink-soft">We started Kiln &amp; Co. to make the mugs we wanted to drink from. Today four of us throw, glaze and fire everything in-house, and ship to customers in 30 countries, who pay the same way wherever they are: in USDT, with just an email.</p>
        </div>
      </section>
    </>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {products.map(p => (
        <div key={p.id} className="group">
          <Link href={`/products/${p.id}`} className="relative block overflow-hidden rounded-2xl bg-sand">
            <img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {p.badge && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold">{p.badge}</span>}
          </Link>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <Link href={`/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
              <Stars rating={p.rating} reviews={p.reviews} />
            </div>
            <p className="font-semibold">${p.price}</p>
          </div>
          <div className="mt-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <AddToCart id={p.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
