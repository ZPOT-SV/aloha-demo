import { useState } from "react";

import { addToCart } from "../../stores";
import type { BuildYourOwnConfig, MenuItem } from "../../types";

interface Props {
  item: MenuItem;
  onClose: () => void;
}

const CAL_BASE: Record<string, number> = {
  çaí: 100,
  "pitaya/dragon fruit": 80,
  banana: 90,
};

const CAL_INGREDIENT: Record<string, number> = {
  banana: 89,
  mango: 60,
  piña: 50,
  fresas: 35,
  arándanos: 57,
  kiwi: 42,
  "mantequilla de maní": 94,
  "mantequilla de almendras": 98,
  "leche condensada": 130,
  nutella: 120,
  miel: 60,
};

const SIZE_MULTIPLIER: Record<string, number> = { "8oz": 1, "16oz": 1.75 };

const TIKI_EARN = 4;

export default function BuildYourOwnModal({ item, onClose }: Props) {
  const config = item.buildConfig as BuildYourOwnConfig;
  const sizeKeys = Object.keys(item.price);

  const [selectedSize, setSelectedSize] = useState<string>(
    sizeKeys[0] ?? "8oz",
  );
  const [selectedBase, setSelectedBase] = useState<string>("");
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const maxFruits = config.rules.maxFruits;
  const maxToppings = config.rules.maxToppings;
  const currentPrice = item.price[selectedSize] ?? item.priceUSD;
  const currentTiki = Math.round(currentPrice);

  function estimateCalories(): number | null {
    if (!selectedBase) return null;
    const mult = SIZE_MULTIPLIER[selectedSize] ?? 1;
    const baseCal = (CAL_BASE[selectedBase] ?? 85) * mult;
    const fruitCal =
      selectedFruits.reduce((s, f) => s + (CAL_INGREDIENT[f] ?? 50), 0) * mult;
    const toppingCal = selectedToppings.reduce(
      (s, t) => s + (CAL_INGREDIENT[t] ?? 80),
      0,
    );
    return Math.round(baseCal + fruitCal + toppingCal);
  }

  const estimatedCal = estimateCalories();

  function toggleFruit(fruit: string) {
    setSelectedFruits((prev) =>
      prev.includes(fruit)
        ? prev.filter((f) => f !== fruit)
        : prev.length < maxFruits
          ? [...prev, fruit]
          : prev,
    );
  }

  function toggleTopping(topping: string) {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : prev.length < maxToppings
          ? [...prev, topping]
          : prev,
    );
  }

  const canAdd = selectedBase !== "" && selectedFruits.length > 0;

  function handleAdd() {
    if (!canAdd) return;
    const parts: string[] = [];
    parts.push(`Base: ${selectedBase}`);
    if (selectedFruits.length > 0)
      parts.push(`Frutas: ${selectedFruits.join(", ")}`);
    if (selectedToppings.length > 0)
      parts.push(`Toppings: ${selectedToppings.join(", ")}`);
    parts.push(`Tamaño: ${selectedSize}`);
    const customDescription = parts.join(" · ");
    const cartItem: MenuItem = {
      ...item,
      id: `BYO0001-${Date.now()}`,
      name: "Crea Tu Bowl",
      description: customDescription,
      priceUSD: currentPrice,
      tikiEarn: currentTiki,
    };
    addToCart(cartItem);
    setAdded(true);
    window.setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  }

  return (
    /* Backdrop — always centered, strong blur */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card — fixed 600px height so it never resizes */}
      <div
        className="relative flex h-[600px] w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:max-w-2xl"
        style={{
          animation: "byoSlideUp 0.38s cubic-bezier(0.25,0.46,0.45,0.94) both",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <span className="text-2xl">💡</span>
            <h2 className="mt-1 font-heading text-xl font-black text-slate-950">
              Crea Tu Bowl
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <span>
                {selectedSize} · ${currentPrice.toFixed(2)}
              </span>
              {estimatedCal !== null && (
                <span className="italic text-[#C4A882]">
                  ∼{estimatedCal} cal
                </span>
              )}
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body — 2-col on desktop */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Left column: size + base */}
            <div className="space-y-6">
              {/* Size selector */}
              {sizeKeys.length > 1 && (
                <section>
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Tamaño
                  </p>
                  <div className="flex gap-2">
                    {sizeKeys.map((size) => (
                      <button
                        key={size}
                        className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-150 ${
                          selectedSize === size
                            ? "scale-105 bg-slate-900 text-white shadow-md"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                        }`}
                        onClick={() => setSelectedSize(size)}
                        type="button"
                      >
                        {size} · ${item.price[size].toFixed(2)}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Base */}
              <section>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Base <span className="text-cta">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.bases.map((base) => (
                    <button
                      key={base}
                      className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-all duration-150 ${
                        selectedBase === base
                          ? "bg-brand text-white shadow-md shadow-brand/25 scale-105"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand"
                      }`}
                      onClick={() => setSelectedBase(base)}
                      type="button"
                    >
                      {base}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column: fruits + toppings */}
            <div className="space-y-6">
              {/* Fruits */}
              <section>
                <div className="mb-2.5 flex items-baseline gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Frutas <span className="text-cta">*</span>
                  </p>
                  <span className="text-xs text-slate-400">
                    {selectedFruits.length}/{maxFruits} seleccionadas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.fruits.map((fruit) => {
                    const chosen = selectedFruits.includes(fruit);
                    const maxed = !chosen && selectedFruits.length >= maxFruits;
                    return (
                      <button
                        key={fruit}
                        disabled={maxed}
                        className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-all duration-150 ${
                          chosen
                            ? "bg-cta text-white shadow-md shadow-cta/25 scale-105"
                            : maxed
                              ? "border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-cta hover:text-cta"
                        }`}
                        onClick={() => toggleFruit(fruit)}
                        type="button"
                      >
                        {fruit}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Toppings */}
              <section>
                <div className="mb-2.5 flex items-baseline gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Toppings
                  </p>
                  <span className="text-xs text-slate-400">
                    {selectedToppings.length}/{maxToppings} seleccionados
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.toppings.map((topping) => {
                    const chosen = selectedToppings.includes(topping);
                    const maxed =
                      !chosen && selectedToppings.length >= maxToppings;
                    return (
                      <button
                        key={topping}
                        disabled={maxed}
                        className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-all duration-150 ${
                          chosen
                            ? "bg-highlight text-slate-900 shadow-md shadow-highlight/30 scale-105"
                            : maxed
                              ? "border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-highlight hover:text-slate-800"
                        }`}
                        onClick={() => toggleTopping(topping)}
                        type="button"
                      >
                        {topping}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          {/* Summary pill */}
          {(selectedBase ||
            selectedFruits.length > 0 ||
            selectedToppings.length > 0) && (
            <p className="mb-3 truncate rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
              {[selectedBase, ...selectedFruits, ...selectedToppings]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <button
            disabled={!canAdd}
            className={`w-full rounded-full py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
              canAdd
                ? added
                  ? "bg-brand text-white shadow-brand/25"
                  : "bg-cta text-white shadow-cta/25 hover:bg-deep-cta"
                : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
            }`}
            onClick={handleAdd}
            type="button"
          >
            {added
              ? "✓ Agregado al carrito"
              : canAdd
                ? `Agregar · $${currentPrice.toFixed(2)}`
                : "Elige base y al menos 1 fruta"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes byoSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
