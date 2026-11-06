import type { Metadata } from 'next';
import { CartLink, CartProvider } from '@/components/cart';
import './globals.css';

export const metadata: Metadata = { title: 'Studio Supply', description: 'A demo store that takes USDT on Whitechain through Pact.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="top">
            <div className="wrap">
              <a className="brand" href="/">Studio Supply</a>
              <nav className="nav">
                <a href="/">Shop</a>
                <a href="/admin">Orders (admin)</a>
                <CartLink />
              </nav>
            </div>
          </header>
          <main className="wrap">{children}</main>
          <footer className="wrap">Testnet demo. Payments settle in USDT on Whitechain Sepolia through Pact.</footer>
        </CartProvider>
      </body>
    </html>
  );
}
