import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import menuRaw from "../data/menu.json";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  priceUSD: number;
  tikiEarn: number;
  imageUrl: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  bebidas: "🥤",
  comida: "🍔",
  postres: "🍰",
  desayunos: "🥞",
  snacks: "🍟",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  bebidas: "from-brand to-[#2F80ED]",
  comida: "from-cta to-[#FF8C42]",
  postres: "from-accent to-cta",
  desayunos: "from-highlight to-cta",
  snacks: "from-brand to-accent",
};

// Pick 4 featured products (varied categories, have a description)
const allMenu = menuRaw as MenuItem[];
const featured = [
  allMenu.find((m) => m.id === "m2"), // Latte
  allMenu.find((m) => m.id === "m5"), // Detox juice
  allMenu.find((m) => m.subCategory === "bowls"),
  allMenu.find((m) => m.subCategory === "snacks") ??
    allMenu.find((m) => m.category === "comida"),
].filter(Boolean) as MenuItem[];

// Fallback to first 4 if ids not found
const PRODUCTS =
  featured.length >= 4
    ? featured
    : allMenu.filter((m) => m.description).slice(0, 4);

export default function ProductCarousel() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const goTo = (idx: number) => {
    if (isAnimating.current || !trackRef.current) return;
    const next = (idx + PRODUCTS.length) % PRODUCTS.length;
    const dir = next > current ? -1 : 1;

    isAnimating.current = true;
    const cards =
      trackRef.current.querySelectorAll<HTMLElement>(".carousel-card");

    // Slide out current
    gsap.to(cards[current], {
      x: dir * -120,
      opacity: 0,
      scale: 0.92,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setCurrent(next);
        isAnimating.current = false;
      },
    });
  };

  // Animate in when current changes
  useEffect(() => {
    if (!trackRef.current) return;
    const cards =
      trackRef.current.querySelectorAll<HTMLElement>(".carousel-card");
    const dir = 1;
    gsap.fromTo(
      cards[current],
      { x: dir * 80, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    );
  }, [current]);

  const product = PRODUCTS[current];
  const gradientClass =
    CATEGORY_GRADIENT[product.category] ?? "from-brand to-cta";
  const emoji = CATEGORY_EMOJI[product.category] ?? "🍽️";

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand/10">
      {/* Track */}
      <div ref={trackRef} className="relative">
        {PRODUCTS.map((p, i) => {
          const grad = CATEGORY_GRADIENT[p.category] ?? "from-brand to-cta";
          const em = CATEGORY_EMOJI[p.category] ?? "🍽️";
          return (
            <div
              key={p.id}
              className={`carousel-card ${i === current ? "block" : "hidden"}`}
            >
              {/* Visual top */}
              <div
                className={`bg-gradient-to-br ${grad} flex h-52 items-center justify-center sm:h-64`}
              >
                <span className="text-8xl drop-shadow-lg sm:text-9xl">
                  {em}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-3 p-6 pb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="mt-1 text-text-muted">{p.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-3xl font-black text-brand">
                      ${p.priceUSD.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-muted">
                      +{p.tikiEarn} Tikis
                    </p>
                  </div>
                </div>

                <a
                  href="/menu"
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-90"
                >
                  Ver en Menú
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Anterior"
        className="absolute left-4 top-[6.5rem] z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-brand hover:text-white sm:top-[8rem]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Siguiente"
        className="absolute right-4 top-[6.5rem] z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-brand hover:text-white sm:top-[8rem]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Producto ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-brand"
                : "w-2 bg-brand/30 hover:bg-brand/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
