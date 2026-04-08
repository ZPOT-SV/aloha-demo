import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";
import { QRCodeSVG } from "qrcode.react";

import storesData from "../data/stores.json";
import { transactionHistory } from "../stores";
import type { StoreLocation } from "../types";

const storeLookup = new Map(
  (storesData as StoreLocation[]).map((store) => [store.id, store]),
);

function getPrimaryItemLabel(itemNames: string[]): string {
  if (itemNames.length === 0) {
    return "Compra Aloha";
  }

  return itemNames[0];
}

export default function TransactionFeed() {
  const transactions = useStore(transactionHistory);
  const [activeQrPayload, setActiveQrPayload] = useState<string | null>(null);

  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, 5);
  }, [transactions]);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-2xl shadow-brand/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
            Historial
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Últimas transacciones
          </h2>
        </div>
      </div>

      {latestTransactions.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-brand/20 bg-surface p-6 text-text-muted">
          Todavía no tenés transacciones. ¡Simulá tu primera compra!
        </div>
      ) : (
        <div className="mt-6 max-h-[26rem] overflow-y-auto space-y-3 pr-1">
          {latestTransactions.map((transaction) => {
            const store = storeLookup.get(transaction.storeId);
            const primaryItem = transaction.items[0];
            const itemNames = transaction.items.map((item) => item.name);

            return (
              <article
                key={transaction.id}
                className="rounded-[1.5rem] border border-brand/10 bg-slate-50/80 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-950">
                        {getPrimaryItemLabel(itemNames)}
                      </h3>
                      {primaryItem ? (
                        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                          {primaryItem.category}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-text-muted">
                      {store?.name ?? "Tienda Aloha"}
                    </p>
                    <p className="text-sm text-text-muted">
                      {new Date(transaction.timestamp).toLocaleDateString(
                        "es-SV",
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-highlight px-3 py-1.5 text-sm font-bold text-slate-900">
                      +{transaction.tikiEarned} Tikis
                    </span>
                    <button
                      aria-label="Ver código QR"
                      className="grid h-10 w-10 place-items-center rounded-full border border-brand/15 bg-white text-brand transition hover:bg-brand hover:text-white"
                      onClick={() => setActiveQrPayload(transaction.qrPayload)}
                      type="button"
                    >
                      ⌁
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeQrPayload ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
          onClick={() => setActiveQrPayload(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl shadow-brand/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
                  Código QR
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  QR de transacción
                </h3>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl text-slate-700"
                onClick={() => setActiveQrPayload(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
                <QRCodeSVG value={activeQrPayload} size={180} level="M" />
              </div>
              <p className="text-center text-sm text-text-muted">
                Presentá este QR al recoger tu pedido en tienda
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
