import { useState } from "react";
import { createPortal } from "react-dom";

import { addToCart } from "../stores";
import type { MenuCategory, MenuItem } from "../types";
import BuildYourOwnModal from "./menu/BuildYourOwnModal";
import GiftCardModal from "./menu/GiftCardModal";

interface MenuItemCardProps {
  item: MenuItem;
}

const categoryEmoji: Record<MenuCategory, string> = {
  bowls: "🏄",
  temporada: "🌴",
  bebidas: "🥤",
  "build-your-own": "💡",
  "gift-card": "🎁",
};

const categoryLabel: Record<MenuCategory, string> = {
  bowls: "Bowl",
  temporada: "Temporada",
  bebidas: "Bebida",
  "build-your-own": "Crea Tu Bowl",
  "gift-card": "Gift Card",
};

function getItemEmoji(item: MenuItem): string {
  if (item.tags.includes("proteina")) return "💪";
  if (item.tags.includes("picante")) return "🌶️";
  return categoryEmoji[item.category] ?? "🍽️";
}

function getLabel(item: MenuItem): string {
  if (item.category === "bebidas" && item.tags.includes("proteina"))
    return "Proteína";
  return categoryLabel[item.category] ?? item.category;
}

function getTagClasses(item: MenuItem): string {
  if (item.category === "bebidas" && item.tags.includes("proteina"))
    return "bg-emerald-50 text-emerald-600";
  switch (item.category) {
    case "bowls":
      return "bg-brand/10 text-brand";
    case "temporada":
      return "bg-amber-50 text-amber-600";
    case "bebidas":
      return "bg-sky-50 text-sky-600";
    case "build-your-own":
      return "bg-purple-50 text-purple-600";
    case "gift-card":
      return "bg-pink-50 text-accent";
    default:
      return "bg-brand/10 text-brand";
  }
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const sizeKeys = Object.keys(item.price);
  const [selectedSize, setSelectedSize] = useState<string>(sizeKeys[0] ?? "");
  const [added, setAdded] = useState(false);
  const [byoOpen, setByoOpen] = useState(false);
  const [gcOpen, setGcOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isBYO = item.category === "build-your-own";
  const isGiftCard = item.category === "gift-card";
  const displayPrice = item.price[selectedSize] ?? item.priceUSD;
  const purchaseItem =
    sizeKeys.length > 1
      ? {
          ...item,
          id: `${item.id}-${selectedSize}`,
          priceUSD: displayPrice,
          name: `${item.name} ${selectedSize}`,
        }
      : item;

  const showImage = item.img_url && !imgFailed && !isGiftCard;

  return (
    <div className="group relative h-full rounded-[1.75rem]">
      {/* Underglow gradient layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px -z-10 rounded-[2rem] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50"
        style={{
          background: isGiftCard
            ? "linear-gradient(135deg, #4EC5D4, #2F80ED)"
            : "linear-gradient(135deg, #4EC5D4, #FF2F92)",
        }}
      />
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-xl shadow-brand/5 transition-all duration-200 group-hover:-translate-y-1.5 group-hover:border-brand/30 group-hover:shadow-2xl group-hover:shadow-brand/15">
        {/* Image / Placeholder */}
        {isGiftCard ? (
          <div className="flex h-44 flex-shrink-0 items-center justify-center bg-gradient-to-br from-brand to-[#2F80ED]">
            <img
              src="/logo.png"
              alt="Aloha Gift Card"
              className="h-24 w-auto object-contain drop-shadow-xl"
            />
          </div>
        ) : showImage ? (
          <img
            alt={item.name}
            className="h-44 w-full flex-shrink-0 object-cover"
            src={item.img_url}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-44 flex-shrink-0 items-center justify-center bg-gradient-to-br from-brand/15 to-cta/15">
            <span aria-hidden="true" className="text-6xl">
              {getItemEmoji(item)}
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getTagClasses(item)}`}
            >
              {getLabel(item)}
            </span>
            {item.tags.includes("picante") && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-red-500">
                Picante 🌶️
              </span>
            )}
            <span className="ml-auto rounded-full bg-highlight px-3 py-1 text-xs font-bold text-slate-900">
              +{item.tikiEarn} Tikis
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black leading-tight text-slate-950">
            {item.name}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-text-muted">
            {item.description}
          </p>

          {item.calories ? (
            <p className="mt-1.5 text-xs font-semibold italic uppercase tracking-[0.12em] text-[#C4A882]">
              {item.calories} cal
            </p>
          ) : null}

          {/* Size selector */}
          {sizeKeys.length > 1 && !isBYO ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {sizeKeys.map((size) => (
                <button
                  key={size}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    selectedSize === size
                      ? "bg-brand text-white"
                      : "border border-brand/20 text-brand hover:bg-brand/5"
                  }`}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <p className="text-xl font-black text-slate-950">
              ${displayPrice.toFixed(2)}
            </p>
            {isBYO ? (
              <button
                className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-95"
                onClick={() => setByoOpen(true)}
                type="button"
              >
                Personalizar
              </button>
            ) : isGiftCard ? (
              <button
                className="rounded-full bg-gradient-to-r from-brand to-[#2F80ED] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-95"
                onClick={() => setGcOpen(true)}
                type="button"
              >
                Personalizar
              </button>
            ) : (
              <button
                className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:brightness-105 active:scale-95"
                onClick={() => {
                  addToCart(purchaseItem);
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1500);
                }}
                type="button"
              >
                {added ? "✓ Agregado" : "Agregar"}
              </button>
            )}
          </div>
        </div>

        {byoOpen && item.buildConfig
          ? createPortal(
              <BuildYourOwnModal
                item={item}
                onClose={() => setByoOpen(false)}
              />,
              document.body,
            )
          : null}
        {gcOpen && item.giftCardConfig
          ? createPortal(
              <GiftCardModal item={item} onClose={() => setGcOpen(false)} />,
              document.body,
            )
          : null}
      </article>
    </div>
  );
}
