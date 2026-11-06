import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { CartProvider } from '@/components/cart';
import { CartDrawer } from '@/components/cart-drawer';
import { SiteFooter, SiteHeader } from '@/components/chrome';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Kiln & Co. | Handmade ceramics',
  description: 'Small-batch stoneware made in our studio. Pay in USDT with just your email.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream">
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
