import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import storesData from "../data/stores.json";
import { selectedStore, setSelectedStore, userSession } from "../stores";
import type { StoreLocation } from "../types";

const stores = storesData as StoreLocation[];

function HoursDisplay({ hours }: { hours: StoreLocation["hours"] }) {
  const sameSatSun = hours["lunes-viernes"] === hours.sabado;
  return (
    <div className="mt-1 space-y-0.5 text-sm text-text-muted">
      {sameSatSun ? (
        <p>Lun–Sáb: {hours["lunes-viernes"]}</p>
      ) : (
        <>
          <p>Lun–Vie: {hours["lunes-viernes"]}</p>
          <p>Sábado: {hours.sabado}</p>
        </>
      )}
      <p>Domingo: {hours.domingo ?? "Cerrado"}</p>
    </div>
  );
}

export default function StoreList() {
  const activeStore = useStore(selectedStore);
  const session = useStore(userSession);
  const [query, setQuery] = useState("");

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
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
        Tus tiendas
      </p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">
        Encontrá tu sucursal ideal
      </h1>

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
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

            return (
              <article
                key={store.id}
                className={`rounded-[1.5rem] border bg-slate-50/80 p-5 shadow-sm transition ${
                  isSelected
                    ? "border-brand bg-brand/5 ring-1 ring-brand/15"
                    : "border-brand/10"
                }`}
                style={{
                  borderLeftWidth: "6px",
                  borderLeftColor: isSelected ? "#800080" : "transparent",
                }}
              >
                <h2 className="text-lg font-black text-slate-950">
                  {store.name}
                </h2>
                <p className="mt-2 text-sm text-text-muted">{store.address}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {store.phone}
                </p>
                <HoursDisplay hours={store.hours} />

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* GPS routing — always visible */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand px-4 py-2 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    Cómo llegar
                  </a>

                  {/* Select store — only if logged in */}
                  {session && (
                    <button
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                        isSelected
                          ? "bg-cta text-white shadow-lg shadow-cta/20"
                          : "border border-slate-300 text-slate-600 hover:border-brand hover:text-brand"
                      }`}
                      onClick={() => setSelectedStore(store)}
                      type="button"
                    >
                      {isSelected ? "✓ Seleccionada" : "Seleccionar"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
