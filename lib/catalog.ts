/** The store's own catalog. Prices live here, on the server: the browser only sends ids and quantities. */
export interface Product {
  id: string;
  name: string;
  category: 'Mugs & cups' | 'Planters' | 'Home';
  description: string;
  details: string[];
  /** USDT with 2 decimals; sent to Pact in base units (6 decimals). */
  price: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export const CATALOG: Product[] = [
  { id: 'speckled-mug', name: 'Speckled Stoneware Mug', category: 'Mugs & cups', price: '16.00', image: '/products/mug-table.jpg', badge: 'Bestseller', rating: 4.9, reviews: 212,
    description: 'Wheel-thrown in our studio from speckled stoneware, with a satin oatmeal glaze and an unglazed foot.',
    details: ['350 ml', 'Dishwasher and microwave safe', 'Each piece is slightly different'] },
  { id: 'brushstroke-mug', name: 'Brushstroke Mug', category: 'Mugs & cups', price: '18.00', image: '/products/mug-tray.jpg', badge: 'New', rating: 4.8, reviews: 64,
    description: 'Hand-painted indigo strokes over a creamy glaze. No two mugs carry the same marks.',
    details: ['400 ml', 'Hand-painted', 'Dishwasher safe'] },
  { id: 'classic-mugs', name: 'Classic White Mugs, set of 2', category: 'Mugs & cups', price: '22.00', image: '/products/mug-white.jpg', rating: 4.7, reviews: 98,
    description: 'A pair of everyday mugs in a glossy porcelain white. The ones you reach for first.',
    details: ['2 × 300 ml', 'Porcelain', 'Stackable'] },
  { id: 'cappuccino-set', name: 'Cappuccino Cup & Saucer', category: 'Mugs & cups', price: '14.00', image: '/products/cappuccino.jpg', rating: 4.9, reviews: 151,
    description: 'Wide, thin-rimmed cup for a proper microfoam, on a saucer that fits a spoon and a biscuit.',
    details: ['180 ml', 'Matte stone glaze', 'Saucer included'] },
  { id: 'soy-candle', name: 'Studio Soy Candle', category: 'Home', price: '12.00', image: '/products/candle-soy.jpg', rating: 4.6, reviews: 87,
    description: 'Poured into a reusable ceramic vessel. Notes of cedar, fig leaf and a little smoke.',
    details: ['40 hour burn', '100% soy wax', 'Cotton wick'] },
  { id: 'fluted-planter', name: 'Fluted Planter', category: 'Planters', price: '24.00', image: '/products/plant-indoor.jpg', badge: 'Bestseller', rating: 4.9, reviews: 176,
    description: 'Ribbed white planter with a matching saucer and a drainage hole, sized for a full trailing plant.',
    details: ['Ø 18 cm', 'Drainage hole and saucer', 'Plant not included'] },
  { id: 'charcoal-planter', name: 'Charcoal Planter', category: 'Planters', price: '20.00', image: '/products/pot-plant.jpg', rating: 4.7, reviews: 59,
    description: 'Ringed stoneware in a deep charcoal glaze, raised on a dark wood stand.',
    details: ['Ø 12 cm', 'Wood stand included', 'Plant not included'] },
  { id: 'bud-vase', name: 'Midnight Bud Vase', category: 'Home', price: '26.00', image: '/products/vase-navy.jpg', badge: 'Limited', rating: 5.0, reviews: 33,
    description: 'A tall, narrow-necked vase in a glossy midnight blue. Holds a single stem beautifully.',
    details: ['H 24 cm', 'Glazed inside, watertight', 'Limited batch'] },
];

export const productById = (id: string) => CATALOG.find(p => p.id === id);

/** "16.00" → 16000000n (USDT has 6 decimals). */
export const toMinor = (price: string) => {
  const [whole, fraction = ''] = price.split('.');
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0').slice(0, 6));
};
export const fromMinor = (minor: bigint | string) => (Number(BigInt(minor)) / 1_000_000).toFixed(2);
