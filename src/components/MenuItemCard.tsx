import { useState } from 'react';

import { addToCart } from '../stores';
import type { MenuItem, MenuSubCategory } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
}

const categoryIcons: Record<MenuSubCategory, string> = {
  cafes: '☕',
  jugos: '🥤',
  'dragon-fruit': '🐉',
  acai: '🫐',
  banana: '🍌',
  temporada: '⭐'
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [selectedSize, setSelectedSize] = useState<'12oz' | '16oz'>('12oz');
  const [added, setAdded] = useState(false);
  const displayPrice = item.sizesUSD ? item.sizesUSD[selectedSize] : item.priceUSD;
  const icon = categoryIcons[item.subCategory] ?? '🍽️';
  const purchaseItem = item.sizesUSD
    ? {
        ...item,
        id: `${item.id}-${selectedSize}`,
        priceUSD: displayPrice,
        name: `${item.name} ${selectedSize}`
      }
    : item;

  return (
    <article className="rounded-[1.75rem] border border-brand/10 bg-white p-5 shadow-xl shadow-brand/5">
      <div className="flex h-44 items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand to-cta">
        <span className="text-5xl">{icon}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          {item.category}
        </span>
        <span className="rounded-full bg-highlight px-3 py-1 text-sm font-bold text-slate-900">
          +{item.tikiEarn} Tikis
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-black text-slate-950">{item.name}</h2>
      <p className="mt-3 min-h-12 text-sm leading-6 text-text-muted">{item.description}</p>
      {item.calories ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Cal {item.calories}</p> : null}

      {item.sizesUSD ? (
        <div className="mt-4 flex gap-2">
          {(['12oz', '16oz'] as const).map((size) => (
            <button
              key={size}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                selectedSize === size
                  ? 'bg-brand text-white'
                  : 'border border-brand/20 text-brand hover:bg-brand/5'
              }`}
              onClick={() => setSelectedSize(size)}
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-lg font-black text-slate-950">${displayPrice.toFixed(2)} USD</p>
        <button
          className="rounded-full bg-cta px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
          onClick={() => {
            addToCart(purchaseItem);
            setAdded(true);
            window.setTimeout(() => {
              setAdded(false);
            }, 1500);
          }}
          type="button"
        >
          {added ? '✓ Agregado' : 'Agregar al Carrito'}
        </button>
      </div>
    </article>
  );
}
