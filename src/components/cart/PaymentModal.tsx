import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import {
  cart,
  challenges,
  clearCart,
  selectedStore,
  setChallenges,
  setTikiBalance,
  setTransactionHistory,
  setUserSession,
  tikiBalance,
  transactionHistory,
  userSession,
} from "../../stores";
import type {
  CartItem,
  Challenge,
  MenuItem,
  Transaction,
  User,
} from "../../types";

type CardType = "visa" | "mastercard" | "amex" | "discover";

function detectCardType(digits: string): CardType | null {
  if (!digits) return null;
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  return null;
}

function applyCardFormat(digits: string, type: CardType | null): string {
  if (type === "amex") {
    const d = digits.slice(0, 15);
    if (d.length <= 4) return d;
    if (d.length <= 10) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 10)} ${d.slice(10)}`;
  }
  const d = digits.slice(0, 16);
  return (d.match(/.{1,4}/g) ?? []).join(" ");
}

function applyExpiryFormat(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function CardTypeIcon({ type }: { type: CardType | null }) {
  if (type === "visa")
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 28,
          borderRadius: 5,
          background: "#1A1F71",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 44 16" width="36" height="11" fill="none">
          <path
            d="M16.5 2.5 13 13.5h-3L6.5 5.3c-.2-.6-.4-.8-.9-1.1C4.8 3.9 3.6 3.6 2.5 3.4l.1-.9h5c.7 0 1.3.4 1.4 1.2l1.3 6.8 3.2-8zm5 0-2.5 11h-3l2.5-11zm10.5 7.4c0-3-.4-3.8-.3-4.7 0-.4.4-.9 1.3-1 .8-.1 1.7.1 2.5.4l.5-2.5a8 8 0 0 0-2.8-.5c-3 0-5.1 1.6-5.1 3.9 0 1.7 1.5 2.6 2.6 3.2 1.2.5 1.6 1 1.6 1.5 0 .8-.9 1.1-1.8 1.1-1.3 0-2.4-.4-3.1-.7l-.5 2.6c.7.3 2 .6 3.4.6 3.2 0 5.3-1.5 5.2-4zm7.5-7.4-4.9 11h-3.2l-2.4-9.7c-.15-.56-.28-.77-.72-1.01-.73-.39-1.93-.76-2.98-.99l.07-.3h5.17c.67 0 1.25.44 1.4 1.2l1.28 6.83 3.18-8.03z"
            fill="white"
          />
        </svg>
      </span>
    );
  if (type === "mastercard")
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 28,
          borderRadius: 5,
          background: "white",
          border: "1.5px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 38 24" width="38" height="24" fill="none">
          <circle cx="14" cy="12" r="8" fill="#EB001B" />
          <circle cx="24" cy="12" r="8" fill="#F79E1B" opacity="0.9" />
          <path d="M19 5.2a8 8 0 0 1 0 13.6A8 8 0 0 1 19 5.2z" fill="#FF5F00" />
        </svg>
      </span>
    );
  if (type === "amex")
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 28,
          borderRadius: 5,
          background: "#2E77BC",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 44 18" width="40" height="14" fill="none">
          <text
            x="2"
            y="13"
            fill="white"
            fontSize="12"
            fontFamily="Arial Black, Arial, sans-serif"
            fontWeight="800"
            letterSpacing="1.5"
          >
            AMEX
          </text>
        </svg>
      </span>
    );
  if (type === "discover")
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          paddingLeft: 4,
          paddingRight: 3,
          width: 44,
          height: 28,
          borderRadius: 5,
          background: "white",
          border: "1.5px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 26 18" width="26" height="18" fill="none">
          <text
            x="0"
            y="13"
            fill="#231F20"
            fontSize="9.5"
            fontFamily="Arial, sans-serif"
            fontWeight="700"
          >
            DISC
          </text>
          <circle cx="20" cy="9" r="7" fill="url(#dg)" />
          <defs>
            <radialGradient id="dg" cx="0.38" cy="0.38" r="0.62">
              <stop offset="0%" stopColor="#FFB347" />
              <stop offset="100%" stopColor="#E65C00" />
            </radialGradient>
          </defs>
        </svg>
      </span>
    );
  return null;
}

interface PaymentResult {
  customerPhone: string;
  itemList: string;
  newBalance: number;
  qrPayload: string;
  storeName: string;
  storeNotifPhone: string;
  storePhone: string;
  tikiEarned: number;
  tierUpMessage: string | null;
  tierId: User["tierId"];
  transactionId: string;
}

interface PaymentModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (result: PaymentResult) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getTierId(balance: number): User["tierId"] {
  if (balance >= 150) {
    return "aloha";
  }

  if (balance >= 50) {
    return "vibe";
  }

  return "rise";
}

function getTierLabel(balance: number): string {
  if (balance >= 150) {
    return "Aloha";
  }

  if (balance >= 50) {
    return "Vibe";
  }

  return "Rise";
}

function expandCartItems(items: CartItem[]): MenuItem[] {
  return items.flatMap((entry) =>
    Array.from({ length: entry.quantity }, () => entry.item),
  );
}

function updateChallengeProgress(
  currentChallenges: Challenge[],
  cartItems: CartItem[],
  timestamp: Date,
): Challenge[] {
  const bowlCount = cartItems.reduce((sum, entry) => {
    return entry.item.category === "bowls" ? sum + entry.quantity : sum;
  }, 0);

  return currentChallenges.map((challenge) => {
    if (challenge.isLocked || challenge.isCompleted) {
      return challenge;
    }

    let increment = 0;

    if (challenge.name === "Comprador Frecuente") {
      increment = 1;
    } else if (challenge.name === "Fan de los Bowls") {
      increment = bowlCount;
    } else if (challenge.name === "Madrugador" && timestamp.getHours() < 10) {
      increment = 1;
    }

    if (increment <= 0) {
      return challenge;
    }

    const currentCount = Math.min(
      challenge.currentCount + increment,
      challenge.targetCount,
    );

    return {
      ...challenge,
      currentCount,
      isCompleted: currentCount >= challenge.targetCount,
    };
  });
}

export default function PaymentModal({
  open,
  onCancel,
  onConfirm,
}: PaymentModalProps) {
  const cartItems = useStore(cart);
  const activeStore = useStore(selectedStore);
  const currentUser = useStore(userSession);
  const balance = useStore(tikiBalance);
  const challengeList = useStore(challenges);
  const history = useStore(transactionHistory);

  const [storeNotifPhone, setStoreNotifPhone] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState<CardType | null>(null);
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, entry) => sum + entry.item.priceUSD * entry.quantity,
      0,
    );
  }, [cartItems]);

  const totalTikis = useMemo(() => {
    return cartItems.reduce(
      (sum, entry) => sum + entry.item.tikiEarn * entry.quantity,
      0,
    );
  }, [cartItems]);

  if (!open) {
    return null;
  }

  const confirmOrder = () => {
    if (!activeStore || !currentUser || cartItems.length === 0) {
      onCancel();
      return;
    }

    const timestamp = new Date();
    const transactionId = `TXN-${Date.now()}`;
    const newBalance = balance + totalTikis;
    const qrPayload = JSON.stringify({
      userId: currentUser.id,
      transactionId,
      tikiEarned: totalTikis,
      storeName: activeStore.name,
      timestamp: timestamp.toISOString(),
    });
    const transaction: Transaction = {
      id: transactionId,
      userId: currentUser.id,
      storeId: activeStore.id,
      items: expandCartItems(cartItems),
      tikiEarned: totalTikis,
      qrPayload,
      timestamp: timestamp.toISOString(),
    };
    const previousTier = getTierLabel(balance);
    const nextTier = getTierLabel(newBalance);
    const nextSession: User = {
      ...currentUser,
      tikiBalance: newBalance,
      tierId: getTierId(newBalance),
    };

    setTikiBalance(newBalance);
    setTransactionHistory([transaction, ...history]);
    setChallenges(updateChallengeProgress(challengeList, cartItems, timestamp));
    setUserSession(nextSession);
    clearCart();
    window.dispatchEvent(new CustomEvent("aloha:auth-changed"));

    const itemList = cartItems
      .map((e) =>
        e.quantity > 1 ? `${e.quantity}x ${e.item.name}` : e.item.name,
      )
      .join(", ");

    onConfirm({
      customerPhone,
      itemList,
      newBalance,
      qrPayload,
      storeName: activeStore.name,
      storeNotifPhone,
      storePhone: activeStore.phone,
      tikiEarned: totalTikis,
      tierUpMessage:
        previousTier === nextTier
          ? null
          : newBalance >= 150
            ? "🏄 ¡Alcanzaste Aloha! El nivel más alto. ¡Eres increíble!"
            : "🌊 ¡Subiste a Vibe! Seguí acumulando Tikis.",
      tierId: getTierId(newBalance),
      transactionId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20">
        <div className="border-l-4 border-deep-cta pl-4">
          <h2 className="text-3xl font-black text-slate-950">
            Confirmar Pedido
          </h2>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-surface p-5">
          <div className="space-y-3">
            {cartItems.map((entry) => (
              <div
                key={entry.item.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    {entry.item.name}{" "}
                    <span className="font-normal text-text-muted">
                      x{entry.quantity}
                    </span>
                  </p>
                </div>
                <p className="font-black text-slate-950">
                  {formatCurrency(entry.item.priceUSD * entry.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-brand/10 pt-5">
            <p className="text-xl font-black text-slate-950">
              Total: {formatCurrency(total)} USD
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Recoger en:{" "}
              <span className="font-semibold text-slate-800">
                {activeStore?.name ?? "Sin tienda seleccionada"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Datos de pago
          </h3>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Número de tarjeta
            </label>
            <div className="relative">
              <input
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                maxLength={cardType === "amex" ? 17 : 19}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const type = detectCardType(raw);
                  setCardType(type);
                  setCardNumber(applyCardFormat(raw, type));
                }}
                className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                type="text"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <CardTypeIcon type={cardType} />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Fecha de expiración
              </label>
              <input
                inputMode="numeric"
                placeholder="MM/AA"
                value={cardExpiry}
                maxLength={5}
                onChange={(e) =>
                  setCardExpiry(applyExpiryFormat(e.target.value))
                }
                className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Código de seguridad
              </label>
              <input
                inputMode="numeric"
                placeholder={cardType === "amex" ? "4 dígitos" : "CVV"}
                value={cardCvv}
                maxLength={cardType === "amex" ? 4 : 3}
                onChange={(e) =>
                  setCardCvv(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, cardType === "amex" ? 4 : 3),
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                type="text"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp demo fields */}
        <div className="mt-5 rounded-[1.25rem] border border-green-200 bg-green-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#25D366"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.837L.057 23.882a.5.5 0 0 0 .613.613l6.055-1.453A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-5.031-1.393l-.361-.214-3.741.981.998-3.65-.235-.374A9.773 9.773 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
            </svg>
            <span className="text-sm font-bold text-green-800">
              Notificación por WhatsApp (demo)
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-green-700">
                Número de la tienda (recibirá el pedido)
              </label>
              <input
                className="w-full rounded-lg border border-green-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="+503 7000-0000"
                type="tel"
                value={storeNotifPhone}
                onChange={(e) => setStoreNotifPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-green-700">
                Tu número (recibirás la confirmación)
              </label>
              <input
                className="w-full rounded-lg border border-green-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="+503 7000-1111"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
          <button
            className="text-sm font-bold text-brand transition hover:text-deep-cta"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="w-full rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta sm:w-auto"
            onClick={confirmOrder}
            type="button"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
