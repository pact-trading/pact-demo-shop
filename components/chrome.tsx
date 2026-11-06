import Link from 'next/link';
import { CartButton } from './cart';
import { KilnLogo } from './logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-ink px-4 py-2 text-center text-[13px] text-cream">
        Free shipping on orders over $40 · Pay in USDT with just your email, no wallet needed
      </div>
      <div className="border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="Kiln & Co. home"><KilnLogo /></Link>
          <nav className="hidden items-center gap-7 text-[15px] text-ink-soft md:flex">
            <Link href="/#shop" className="hover:text-ink">Shop all</Link>
            <Link href="/#mugs" className="hover:text-ink">Mugs &amp; cups</Link>
            <Link href="/#planters" className="hover:text-ink">Planters</Link>
            <Link href="/#story" className="hover:text-ink">Our studio</Link>
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/admin" className="hidden rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand sm:block">Store admin</Link>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <KilnLogo />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">Small-batch stoneware, thrown and glazed by hand in our studio since 2019.</p>
        </div>
        <FooterColumn title="Shop" links={['Mugs & cups', 'Planters', 'Home', 'Gift cards']} />
        <FooterColumn title="Help" links={['Shipping', 'Returns (30 days)', 'Care guide', 'Contact us']} />
        <div>
          <p className="text-sm font-semibold">Payments</p>
          <p className="mt-3 text-sm text-ink-soft">Checkout by Pact. Pay in USDT on Whitechain with your email: no wallet, no gas.</p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">© 2026 Kiln &amp; Co. · Testnet demo store, no real goods are shipped.</div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-ink-soft">{links.map(l => <li key={l}>{l}</li>)}</ul>
    </div>
  );
}

export function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-ink-soft">
      <span className="text-clay" aria-hidden>{'★★★★★'.slice(0, Math.round(rating))}<span className="text-line">{'★★★★★'.slice(Math.round(rating))}</span></span>
      {rating.toFixed(1)} ({reviews})
    </span>
  );
}
