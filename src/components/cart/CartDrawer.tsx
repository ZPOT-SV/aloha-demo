import { useStore } from '@nanostores/react';

import { cart, removeFromCart, setCartOpen, updateQuantity } from '../../stores';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

export default function CartDrawer({ open, onClose, onProceed }: CartDrawerProps) {
  const items = useStore(cart);

  if (!open) {
    return null;
  }

  const subtotal = items.reduce((sum, entry) => sum + entry.item.priceUSD * entry.quantity, 0);
  const tikiPreview = items.reduce((sum, entry) => sum + entry.item.tikiEarn * entry.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
      <button
        aria-label="Cerrar carrito"
        className="flex-1 cursor-default"
        onClick={onClose}
        type="button"
      />

      <aside className="flex h-full w-full max-w-md flex-col border-l border-brand/10 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-brand/10 px-6 py-5">
          <h2 className="text-2xl font-black text-slate-950">Mi Carrito 🛒</h2>
          <button
            className="rounded-full border border-brand/15 px-3 py-2 text-sm font-bold text-brand transition hover:bg-brand/5"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-xl font-bold text-slate-950">Tu carrito está vacío</p>
            <a
              className="mt-4 rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
              href="/menu"
              onClick={() => {
                setCartOpen(false);
              }}
            >
              Ver Menú
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((entry) => (
                <article
                  key={entry.item.id}
                  className="rounded-[1.5rem] border border-brand/10 bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">{entry.item.name}</h3>
                      <span className="mt-2 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand">
                        {entry.item.category}
                      </span>
                    </div>
                    <button
                      aria-label={`Quitar ${entry.item.name}`}
                      className="text-lg transition hover:scale-110"
                      onClick={() => removeFromCart(entry.item.id)}
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-brand/15 text-lg font-bold text-brand transition hover:bg-brand/5"
                        onClick={() => updateQuantity(entry.item.id, entry.quantity - 1)}
                        type="button"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-slate-950">
                        {entry.quantity}
                      </span>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-brand/15 text-lg font-bold text-brand transition hover:bg-brand/5"
                        onClick={() => updateQuantity(entry.item.id, entry.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-black text-slate-950">
                      {formatCurrency(entry.item.priceUSD * entry.quantity)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-brand/10 px-6 py-5">
              <div className="flex items-center justify-between text-base font-bold text-slate-950">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="mt-4 inline-flex rounded-full bg-highlight px-4 py-2 text-sm font-bold text-slate-950">
                +{tikiPreview} Tiki Points al completar tu compra
              </div>

              <button
                className="mt-5 w-full rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
                onClick={() => {
                  setCartOpen(false);
                  onProceed();
                }}
                type="button"
              >
                Seleccionar Tienda
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
