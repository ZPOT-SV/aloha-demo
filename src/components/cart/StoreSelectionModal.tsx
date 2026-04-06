import { useMemo } from 'react';

import { useStore } from '@nanostores/react';

import storesData from '../../data/stores.json';
import { selectedStore, setSelectedStore } from '../../stores';
import type { StoreLocation } from '../../types';

interface StoreSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

type StoreWithFlexibleHours = Omit<StoreLocation, 'hours'> & {
  hours: StoreLocation['hours'] | string;
};

function renderHours(hours: StoreWithFlexibleHours['hours']) {
  if (typeof hours === 'string') {
    return <p>{hours}</p>;
  }

  return (
    <>
      <p>Lun–Vie: {hours['lunes-viernes']}</p>
      <p>Sábado: {hours.sabado}</p>
      <p>Domingo: {hours.domingo ?? 'Cerrado'}</p>
    </>
  );
}

export default function StoreSelectionModal({
  open,
  onCancel,
  onConfirm
}: StoreSelectionModalProps) {
  const activeStore = useStore(selectedStore);
  const stores = useMemo(() => storesData as StoreWithFlexibleHours[], []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20">
        <div className="border-l-4 border-deep-cta pl-4">
          <h2 className="text-3xl font-black text-slate-950">¿Dónde recogerás tu pedido?</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stores.map((store) => {
            const isSelected = activeStore?.id === store.id;

            return (
              <article
                key={store.id}
                className={`rounded-[1.5rem] border p-5 transition ${
                  isSelected
                    ? 'border-brand shadow-lg shadow-brand/10'
                    : 'border-brand/10 bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{store.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{store.address}</p>
                  </div>
                  {isSelected ? (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-white">
                      ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 space-y-1 text-sm text-text-muted">{renderHours(store.hours)}</div>

                <button
                  className={`mt-5 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'border border-brand/20 text-brand hover:bg-brand/5'
                  }`}
                  onClick={() => setSelectedStore(store as StoreLocation)}
                  type="button"
                >
                  {isSelected ? 'Seleccionada' : 'Seleccionar'}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
          <button
            className="text-sm font-bold text-brand transition hover:text-deep-cta"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!activeStore}
            onClick={onConfirm}
            type="button"
          >
            Continuar al Pago →
          </button>
        </div>
      </div>
    </div>
  );
}
