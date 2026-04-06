import { useMemo, useState } from 'react';

import { useStore } from '@nanostores/react';

import storesData from '../data/stores.json';
import { selectedStore, setSelectedStore } from '../stores';
import type { StoreLocation } from '../types';

const stores = storesData as StoreLocation[];

export default function StoreList() {
  const activeStore = useStore(selectedStore);
  const [query, setQuery] = useState('');

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stores;
    }

    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(normalizedQuery) ||
        store.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-2xl shadow-brand/10">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Tus tiendas</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">Encontrá tu sucursal ideal</h1>

      <input
        className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscá por nombre o dirección"
        type="search"
        value={query}
      />

      <div className="mt-6 space-y-4">
        {filteredStores.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-brand/20 bg-surface p-5 text-text-muted">
            No encontramos tiendas con ese criterio.
          </div>
        ) : (
          filteredStores.map((store) => {
            const isSelected = activeStore?.id === store.id;

            return (
              <article
                key={store.id}
                className={`rounded-[1.5rem] border bg-slate-50/80 p-5 shadow-sm transition ${
                  isSelected ? 'border-brand bg-brand/5 ring-1 ring-brand/15' : 'border-brand/10'
                }`}
                style={{
                  borderLeftWidth: '6px',
                  borderLeftColor: isSelected ? '#800080' : 'transparent'
                }}
              >
                <h2 className="text-lg font-black text-slate-950">{store.name}</h2>
                <p className="mt-2 text-sm text-text-muted">{store.address}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{store.phone}</p>
                <div className="mt-1 space-y-1 text-sm text-text-muted">
                  <p>Lun–Vie: {store.hours['lunes-viernes']}</p>
                  <p>Sábado: {store.hours.sabado}</p>
                  <p>Domingo: {store.hours.domingo ?? 'Cerrado'}</p>
                </div>

                <button
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? 'bg-cta text-white shadow-lg shadow-cta/20'
                      : 'border border-brand text-brand hover:bg-brand hover:text-white'
                  }`}
                  onClick={() => setSelectedStore(store)}
                  type="button"
                >
                  {isSelected ? '✓ Seleccionada' : 'Seleccionar esta tienda'}
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
