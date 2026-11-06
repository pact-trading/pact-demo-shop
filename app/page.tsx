import { AddToCart } from '@/components/cart';
import { CATALOG } from '@/lib/catalog';

export default function Shop() {
  return (
    <>
      <h1>Small goods for the studio</h1>
      <p className="lead">Pick a few, pay once in USDT. No wallet needed: just your email.</p>
      <div className="grid">
        {CATALOG.map(p => (
          <div key={p.id} className="card product">
            <div className="art" aria-hidden>{p.emoji}</div>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="row">
              <span className="price">${p.price}</span>
              <AddToCart id={p.id} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
