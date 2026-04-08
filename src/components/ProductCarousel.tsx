import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import menuRaw from "../data/menu.json";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  priceUSD: number;
  tikiEarn: number;
  img_url?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  bowls: "🏄",
  temporada: "🌴",
  bebidas: "🥤",
  "build-your-own": "💡",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  bowls: "from-brand to-[#2F80ED]",
  temporada: "from-cta to-[#FF8C42]",
  bebidas: "from-accent to-cta",
  "build-your-own": "from-highlight to-cta",
};

const CATEGORY_LABEL: Record<string, string> = {
  bowls: "Bowls",
  temporada: "Temporada",
  bebidas: "Bebidas",
  "build-your-own": "Crea Tu Bowl",
};

const allMenu = menuRaw as MenuItem[];
const FEATURED_IDS = ["BO0001", "TE0005", "BE0001", "BYO0001"];
const PRODUCTS = FEATURED_IDS.map((id) =>
  allMenu.find((m) => m.id === id),
).filter((m): m is MenuItem => Boolean(m));

export default function ProductCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ]);
  const [current, setCurrent] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand/10">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {PRODUCTS.map((p) => {
            const grad = CATEGORY_GRADIENT[p.category] ?? "from-brand to-cta";
            const emoji = CATEGORY_EMOJI[p.category] ?? "🍽️";
            const showImg = p.img_url && !imgFailed[p.id];

            return (
              <div
                key={p.id}
                className="relative min-w-0 flex-[0_0_100%]"
                style={{ height: "440px" }}
              >
                <div className="absolute inset-0 flex flex-col">
                  {/* Image */}
                  {showImg ? (
                    <img
                      src={p.img_url}
                      alt={p.name}
                      className="h-52 w-full flex-shrink-0 object-cover sm:h-56"
                      onError={() =>
                        setImgFailed((prev) => ({ ...prev, [p.id]: true }))
                      }
                    />
                  ) : (
                    <div
                      className={`flex h-52 flex-shrink-0 items-center justify-center bg-gradient-to-br sm:h-56 ${grad}`}
                    >
                      <span className="text-8xl drop-shadow-lg sm:text-9xl">
                        {emoji}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between overflow-hidden p-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                          {CATEGORY_LABEL[p.category] ?? p.category}
                        </span>
                        <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                            {p.description}
                          </p>
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
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-90"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        aria-label="Anterior"
        onClick={scrollPrev}
        type="button"
        className="absolute left-3 top-[6.5rem] z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white sm:top-[7rem]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
        aria-label="Siguiente"
        onClick={scrollNext}
        type="button"
        className="absolute right-3 top-[6.5rem] z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white sm:top-[7rem]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
            aria-label={`Ir a producto ${i + 1}`}
            onClick={() => scrollTo(i)}
            type="button"
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-brand" : "w-1.5 bg-brand/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

