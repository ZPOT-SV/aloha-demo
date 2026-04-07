import { useState, useEffect, useRef } from "react";
import menuRaw from "../data/menu.json";
import storesRaw from "../data/stores.json";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  priceUSD: number;
}

interface StoreItem {
  id: string;
  name: string;
  address: string;
}

interface Result {
  type: "menu" | "store" | "page";
  title: string;
  subtitle: string;
  href: string;
  emoji: string;
  badge: string;
}

const menuData = menuRaw as MenuItem[];
const storesData = storesRaw as StoreItem[];

const PAGES: Result[] = [
  {
    type: "page",
    title: "Inicio",
    subtitle: "Página principal",
    href: "/",
    emoji: "🏠",
    badge: "Página",
  },
  {
    type: "page",
    title: "Menú",
    subtitle: "Ver todos los productos",
    href: "/menu",
    emoji: "🍽️",
    badge: "Página",
  },
  {
    type: "page",
    title: "Tiendas",
    subtitle: "Encuentra tu tienda cercana",
    href: "/tiendas",
    emoji: "📍",
    badge: "Página",
  },
  {
    type: "page",
    title: "Retos",
    subtitle: "Desafíos y recompensas",
    href: "/retos",
    emoji: "🏆",
    badge: "Página",
  },
  {
    type: "page",
    title: "Dashboard",
    subtitle: "Tu perfil y Tikis",
    href: "/dashboard",
    emoji: "📊",
    badge: "Página",
  },
  {
    type: "page",
    title: "Gift Cards",
    subtitle: "Tarjetas de regalo",
    href: "/gift-cards",
    emoji: "🎁",
    badge: "Página",
  },
];

const CATEGORY_EMOJI: Record<string, string> = {
  bebidas: "🥤",
  comida: "🍔",
  postres: "🍰",
  desayunos: "🥞",
  snacks: "🍟",
};

export default function NavSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const found: Result[] = [];

    menuData.forEach((item) => {
      if (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q)
      ) {
        found.push({
          type: "menu",
          title: item.name,
          subtitle: `$${item.priceUSD.toFixed(2)} · ${item.category}`,
          href: "/menu",
          emoji: CATEGORY_EMOJI[item.category] ?? "🍽️",
          badge: "Menú",
        });
      }
    });

    storesData.forEach((store) => {
      if (
        store.name.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q)
      ) {
        found.push({
          type: "store",
          title: store.name,
          subtitle: store.address,
          href: "/tiendas",
          emoji: "📍",
          badge: "Tienda",
        });
      }
    });

    PAGES.forEach((page) => {
      if (
        page.title.toLowerCase().includes(q) ||
        page.subtitle.toLowerCase().includes(q)
      ) {
        found.push(page);
      }
    });

    setResults(found.slice(0, 7));
    setOpen(found.length > 0);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={ref} className="relative w-52 sm:w-64 lg:w-72">
      {/* Input */}
      <div
        className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200 ${
          focused
            ? "border-brand bg-white shadow-md shadow-brand/20"
            : "border-slate-200 bg-slate-50 hover:border-brand/40"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-text-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Buscar menú, tiendas..."
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-text-muted outline-none"
        />
        {query && (
          <button
            onClick={clear}
            className="shrink-0 rounded-full p-0.5 text-text-muted transition hover:bg-slate-200 hover:text-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10">
          <p className="border-b border-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((r, i) => (
            <a
              key={i}
              href={r.href}
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface group"
            >
              <span className="shrink-0 text-xl">{r.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-brand">
                  {r.title}
                </p>
                <p className="truncate text-xs text-text-muted">{r.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                {r.badge}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* No results */}
      {focused && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-2xl shadow-slate-900/10">
          <p className="text-2xl">🌊</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            Sin resultados para "{query}"
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Intenta con otro término
          </p>
        </div>
      )}
    </div>
  );
}
