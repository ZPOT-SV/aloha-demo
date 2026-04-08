import { useEffect, useMemo, useState } from "react";

import menuData from "../../data/menu.json";
import type { MenuCategory, MenuItem, MenuTag } from "../../types";
import MenuItemCard from "../MenuItemCard";

const items = menuData as MenuItem[];

type FilterId = "todos" | MenuCategory | MenuTag;
type SortId =
  | "relevancia"
  | "nombre-az"
  | "nombre-za"
  | "precio-asc"
  | "precio-desc";

const filterChips: Array<{ id: FilterId; label: string; emoji: string }> = [
  { id: "todos", label: "Todos", emoji: "🌊" },
  { id: "bowls", label: "Bowls", emoji: "🏄" },
  { id: "temporada", label: "Temporada", emoji: "🌴" },
  { id: "bebidas", label: "Bebidas", emoji: "🥤" },
  { id: "proteina", label: "Proteína", emoji: "💪" },
  { id: "picante", label: "Picante", emoji: "🌶️" },
  { id: "build-your-own", label: "Crea Tu Bowl", emoji: "💡" },
  { id: "gift-card", label: "Gift Cards", emoji: "🎁" },
];

const sortOptions: Array<{ id: SortId; label: string }> = [
  { id: "relevancia", label: "Relevancia" },
  { id: "nombre-az", label: "Nombre A–Z" },
  { id: "nombre-za", label: "Nombre Z–A" },
  { id: "precio-asc", label: "Precio ↑" },
  { id: "precio-desc", label: "Precio ↓" },
];

const categoryFilters: FilterId[] = [
  "bowls",
  "bebidas",
  "temporada",
  "build-your-own",
  "gift-card",
];

function getInitialFilter(): FilterId {
  if (typeof window === "undefined") return "todos";
  const f = new URLSearchParams(window.location.search).get(
    "filtro",
  ) as FilterId | null;
  const valid = filterChips.map((c) => c.id);
  return f && valid.includes(f) ? f : "todos";
}

export default function MenuPage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>(getInitialFilter);
  const [activeSort, setActiveSort] = useState<SortId>("relevancia");
  const [animKey, setAnimKey] = useState(0);

  const displayItems = useMemo(() => {
    let result: MenuItem[];

    if (activeFilter === "todos") {
      result = items;
    } else if (categoryFilters.includes(activeFilter)) {
      result = items.filter(
        (item) => item.category === (activeFilter as MenuCategory),
      );
    } else {
      result = items.filter((item) =>
        item.tags.includes(activeFilter as MenuTag),
      );
    }

    switch (activeSort) {
      case "nombre-az":
        return [...result].sort((a, b) => a.name.localeCompare(b.name, "es"));
      case "nombre-za":
        return [...result].sort((a, b) => b.name.localeCompare(a.name, "es"));
      case "precio-asc":
        return [...result].sort((a, b) => a.priceUSD - b.priceUSD);
      case "precio-desc":
        return [...result].sort((a, b) => b.priceUSD - a.priceUSD);
      default:
        return result;
    }
  }, [activeFilter, activeSort]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeFilter === "todos") {
      params.delete("filtro");
    } else {
      params.set("filtro", activeFilter);
    }
    const qs = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
  }, [activeFilter]);

  function handleFilterClick(id: FilterId) {
    setActiveFilter(id);
    setActiveSort("relevancia");
    setAnimKey((k) => k + 1);
  }

  function handleSortChange(id: SortId) {
    setActiveSort(id);
    setAnimKey((k) => k + 1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Navbar spacer — clears the hanging logo on both mobile and desktop */}
      <div aria-hidden="true" className="h-14 md:h-24" />

      <div className="flex gap-8 py-6 sm:py-8">
        {/* ── SIDEBAR (desktop only) ─────────────────────────────── */}
        <aside className="hidden md:flex md:w-44 md:shrink-0 md:flex-col md:gap-0.5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Filtrar
          </p>
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeFilter === chip.id
                  ? "bg-brand text-white shadow-sm shadow-brand/25"
                  : "text-slate-500 hover:bg-brand/10 hover:text-brand"
              }`}
              onClick={() => handleFilterClick(chip.id)}
              type="button"
            >
              <span className="text-base leading-none">{chip.emoji}</span>
              {chip.label}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ───────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* Mobile chip row (hidden on md+) */}
          <div
            className="mb-4 flex gap-2 overflow-x-auto pb-2 md:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  activeFilter === chip.id
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : "border border-brand/20 bg-white text-slate-600 hover:border-brand hover:text-brand"
                }`}
                onClick={() => handleFilterClick(chip.id)}
                type="button"
              >
                <span aria-hidden="true">{chip.emoji}</span>
                {chip.label}
              </button>
            ))}
          </div>

          {/* Sort row + item count */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {displayItems.length}{" "}
              {displayItems.length === 1 ? "producto" : "productos"}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-bold text-slate-400">Ordenar:</span>
              <select
                className="cursor-pointer rounded-full border border-brand/20 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:border-brand focus:border-brand focus:outline-none"
                onChange={(e) => handleSortChange(e.target.value as SortId)}
                value={activeSort}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid — key changes on every filter/sort to re-trigger card animations */}
          {displayItems.length > 0 ? (
            <div
              key={animKey}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {displayItems.map((item, i) => (
                <div
                  key={item.id}
                  className="menu-card-enter h-full"
                  style={{ animationDelay: `${i * 0.055}s` }}
                >
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="text-5xl">🤙</span>
              <p className="mt-4 text-lg font-bold text-slate-700">
                Sin resultados
              </p>
              <button
                className="mt-3 text-sm font-semibold text-brand underline"
                onClick={() => handleFilterClick("todos")}
                type="button"
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
