import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";

import {
  cart,
  removeFromCart,
  setCartOpen,
  updateQuantity,
} from "../../stores";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

const categoryLabel: Record<string, string> = {
  bowls: "Bowl",
  bebidas: "Bebida",
  temporada: "Temporada",
  "build-your-own": "Crea Tu Bowl",
  "gift-card": "Gift Card",
};

export default function CartDrawer({
  open,
  onClose,
  onProceed,
}: CartDrawerProps) {
  const items = useStore(cart);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (!open && prevOpen.current) {
      setVisible(false);
      const t = window.setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
    prevOpen.current = open;
  }, [open]);

  if (!mounted) return null;

  const subtotal = items.reduce(
    (sum, entry) => sum + entry.item.priceUSD * entry.quantity,
    0,
  );
  const tikiPreview = items.reduce(
    (sum, entry) => sum + entry.item.tikiEarn * entry.quantity,
    0,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{
        backgroundColor: `rgba(2,6,23,${visible ? 0.45 : 0})`,
        backdropFilter: `blur(${visible ? 4 : 0}px)`,
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <button
        aria-label="Cerrar carrito"
        className="flex-1 cursor-default"
        onClick={onClose}
        type="button"
      />

      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-brand/10 bg-white shadow-2xl shadow-slate-950/20"
        style={{
          transform: `translateX(${visible ? 0 : 100}%)`,
          transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        <div className="flex items-center justify-between border-b border-brand/10 px-6 py-5">
          <h2 className="text-2xl font-black text-slate-950">Mi Carrito</h2>
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
            <p className="text-xl font-bold text-slate-950">
              Tu carrito está vacío
            </p>
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
                      <h3 className="text-base font-black leading-snug text-slate-950">
                        {entry.item.name}
                      </h3>
                      {entry.item.description && (
                        <p className="mt-1 text-xs leading-relaxed text-text-muted">
                          {entry.item.description}
                        </p>
                      )}
                      <span className="mt-2 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand">
                        {categoryLabel[entry.item.category] ??
                          entry.item.category}
                      </span>
                    </div>
                    <button
                      aria-label={`Quitar ${entry.item.name}`}
                      className="text-slate-400 transition hover:scale-110 hover:text-red-500"
                      onClick={() => removeFromCart(entry.item.id)}
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-brand/15 text-lg font-bold text-brand transition hover:bg-brand/5"
                        onClick={() =>
                          updateQuantity(entry.item.id, entry.quantity - 1)
                        }
                        type="button"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-slate-950">
                        {entry.quantity}
                      </span>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-brand/15 text-lg font-bold text-brand transition hover:bg-brand/5"
                        onClick={() =>
                          updateQuantity(entry.item.id, entry.quantity + 1)
                        }
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

              <p className="mt-4 text-sm italic font-semibold text-brand">
                ✦ Acumulas{" "}
                <span className="font-black not-italic text-accent">
                  +{tikiPreview} Tikis
                </span>{" "}
                al completar tu compra
              </p>

              <button
                className="mt-5 w-full rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
                onClick={() => {
                  setCartOpen(false);
                  onProceed();
                }}
                type="button"
              >
                Continuar
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
