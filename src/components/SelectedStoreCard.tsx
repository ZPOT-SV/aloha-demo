import { useStore } from '@nanostores/react';

import { selectedStore } from '../stores';

export default function SelectedStoreCard() {
  const store = useStore(selectedStore);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-2xl shadow-brand/10">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Tu tienda activa</p>

      {store ? (
        <div className="mt-4 space-y-3">
          <h2 className="text-2xl font-black text-slate-950">{store.name}</h2>
          <p className="text-sm text-text-muted">{store.address}</p>
          <p className="text-sm font-semibold text-slate-700">{store.phone}</p>
          <a className="inline-flex text-sm font-bold text-brand transition hover:text-deep-cta" href="/tiendas">
            Cambiar tienda
          </a>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <h2 className="text-2xl font-black text-slate-950">No seleccionaste tienda aún</h2>
          <p className="text-sm text-text-muted">
            Elegí tu sucursal favorita para acelerar compras y personalizar tu experiencia.
          </p>
          <a
            className="inline-flex rounded-full bg-cta px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
            href="/tiendas"
          >
            Seleccionar tienda
          </a>
        </div>
      )}
    </section>
  );
}
