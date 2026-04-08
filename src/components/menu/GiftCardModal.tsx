import { useState } from "react";
import { addToCart } from "../../stores";
import type { GiftCardConfig, MenuItem } from "../../types";

interface Props {
  item: MenuItem;
  onClose: () => void;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export default function GiftCardModal({ item, onClose }: Props) {
  const config = item.giftCardConfig as GiftCardConfig;

  const [preset, setPreset] = useState<number>(config.amounts[0] ?? 10);
  const [customMode, setCustomMode] = useState(false);
  const [customRaw, setCustomRaw] = useState("");
  const [forOther, setForOther] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  const parsedCustom = parseInt(customRaw);
  const customValid =
    !customMode ||
    (!isNaN(parsedCustom) && parsedCustom >= 1 && parsedCustom <= 100);
  const amount = customMode ? (customValid ? parsedCustom : 0) : preset;
  const canAdd =
    amount > 0 && customValid && (!forOther || recipientName.trim().length > 0);

  function handleAdd() {
    const parts: string[] = [];
    if (forOther && recipientName.trim())
      parts.push(`Para: ${recipientName.trim()}`);
    if (forOther && recipientPhone.trim())
      parts.push(`WA: +503 ${recipientPhone.trim()}`);
    if (message.trim()) parts.push(`"${message.trim()}"`);
    const description =
      parts.length > 0
        ? parts.join(" · ")
        : "Gift Card Aloha. Válida en todas las sucursales.";

    addToCart({
      ...item,
      id: `GC-${amount}-${Date.now()}`,
      name: `Gift Card $${amount}`,
      description,
      priceUSD: amount,
      tikiEarn: amount,
    });
    setAdded(true);
    window.setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:max-w-lg"
        style={{
          animation: "gcSlideUp 0.38s cubic-bezier(0.25,0.46,0.45,0.94) both",
        }}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Aloha"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h2 className="font-heading text-xl font-black text-slate-950">
                  Gift Card Aloha
                </h2>
                <p className="text-xs text-text-muted">
                  Regalá una experiencia única
                </p>
              </div>
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
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Amount selector */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Monto <span className="text-cta">*</span>
            </p>
            <div className="flex gap-2">
              {config.amounts.map((a) => (
                <button
                  key={a}
                  className={`flex-1 rounded-2xl border-2 py-4 text-center transition-all duration-150 ${
                    !customMode && amount === a
                      ? "scale-105 border-brand bg-brand/5 shadow-md shadow-brand/20"
                      : "border-slate-200 hover:border-brand/50"
                  }`}
                  onClick={() => {
                    setPreset(a);
                    setCustomMode(false);
                  }}
                  type="button"
                >
                  <p
                    className={`text-2xl font-black ${!customMode && amount === a ? "text-brand" : "text-slate-700"}`}
                  >
                    ${a}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    +{a} Tikis
                  </p>
                </button>
              ))}
              <button
                className={`flex-1 rounded-2xl border-2 py-4 text-center transition-all duration-150 ${
                  customMode
                    ? "scale-105 border-accent bg-accent/5 shadow-md shadow-accent/20"
                    : "border-slate-200 hover:border-accent/40"
                }`}
                onClick={() => setCustomMode(true)}
                type="button"
              >
                <p
                  className={`text-lg font-black ${customMode ? "text-accent" : "text-slate-700"}`}
                >
                  Otro
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  hasta $100
                </p>
              </button>
            </div>
            {customMode && (
              <div className="mt-3">
                <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 focus-within:ring-2 focus-within:ring-accent">
                  <span className="text-xl font-black text-slate-700">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    placeholder="25"
                    value={customRaw}
                    onChange={(e) =>
                      setCustomRaw(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 3),
                      )
                    }
                    className="w-full flex-1 bg-transparent text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-sm font-semibold text-slate-400">
                    USD
                  </span>
                </div>
                {customRaw !== "" && !customValid && (
                  <p className="mt-1 text-xs font-semibold text-cta">
                    Ingresá un monto entre $1 y $100
                  </p>
                )}
              </div>
            )}
          </section>

          {/* For-other toggle */}
          <section>
            <button
              type="button"
              onClick={() => setForOther((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150 ${
                forOther
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${forOther ? "bg-accent" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${forOther ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Es para otra persona
                </p>
                <p className="text-xs text-slate-400">
                  Incluye nombre y mensaje personalizado
                </p>
              </div>
            </button>
          </section>

          {/* Recipient fields */}
          {forOther && (
            <section className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Nombre del destinatario <span className="text-cta">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ej: María García"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  WhatsApp del destinatario{" "}
                  <span className="ml-1 font-normal normal-case text-slate-400">
                    (opcional)
                  </span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-brand">
                  <span className="text-sm text-slate-400">+503</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="7000-0000"
                    value={recipientPhone}
                    onChange={(e) =>
                      setRecipientPhone(formatPhone(e.target.value))
                    }
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Personal message */}
          <section>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Mensaje personalizado{" "}
              <span className="ml-1 font-normal normal-case text-slate-400">
                (opcional)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="ej: ¡Feliz cumpleaños! Espero que disfrutes tus bowls 🌊"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {message.length}/200
            </p>
          </section>

          {/* Preview card */}
          <section className="rounded-2xl bg-gradient-to-br from-brand to-[#2F80ED] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Aloha Loyalty
                </p>
                <p className="mt-1 text-3xl font-black">${amount} USD</p>
                {forOther && recipientName.trim() && (
                  <p className="mt-1 text-sm text-white/80">
                    Para {recipientName.trim()}
                  </p>
                )}
              </div>
              <img
                src="/logo.png"
                alt="Aloha"
                className="h-14 w-auto opacity-90 drop-shadow-lg"
              />
            </div>
            {message.trim() && (
              <p className="mt-3 border-t border-white/20 pt-3 text-sm italic text-white/80">
                "{message.trim()}"
              </p>
            )}
            <p className="mt-3 text-xs text-white/60">
              +{amount} Tikis incluidos · Válida en todas las tiendas
            </p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          {!canAdd && (
            <p className="mb-2 text-center text-xs font-semibold text-cta">
              Ingresá el nombre del destinatario para continuar
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
              ? "✓ Agregada al carrito"
              : `Agregar Gift Card · \$${amount}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gcSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
