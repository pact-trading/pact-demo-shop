/** The store's own catalog. Prices live here, on the server: the browser only sends ids and quantities. */
export interface Product {
  id: string;
  name: string;
  description: string;
  /** USDT, 2 decimals for display; sent to Pact in base units (6 decimals). */
  price: string;
  emoji: string;
}

export const CATALOG: Product[] = [
  { id: 'mug', name: 'Ceramic mug', description: 'Stoneware, 350 ml, glazed in sage.', price: '1.20', emoji: '☕' },
  { id: 'poster', name: 'Risograph poster', description: 'A3, two colours, signed print.', price: '1.50', emoji: '🖼️' },
  { id: 'notebook', name: 'Dot-grid notebook', description: 'A5, 160 pages, lay-flat binding.', price: '0.90', emoji: '📓' },
  { id: 'tote', name: 'Canvas tote', description: 'Heavy cotton, inside pocket.', price: '1.40', emoji: '👜' },
];

export const productById = (id: string) => CATALOG.find(p => p.id === id);

/** "1.20" → 1200000n (USDT has 6 decimals). */
export const toMinor = (price: string) => {
  const [whole, fraction = ''] = price.split('.');
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0').slice(0, 6));
};
export const fromMinor = (minor: bigint | string) => (Number(BigInt(minor)) / 1_000_000).toFixed(2);
