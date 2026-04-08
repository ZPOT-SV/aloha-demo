import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useStore } from "@nanostores/react";
import { userSession } from "../stores";

const PRESET_AMOUNTS = [10, 15, 20, 25];

type Step = "customize" | "payment" | "result";
type CardType = "visa" | "mastercard" | "amex" | "discover" | null;

function generateId(): string {
  return "GC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function detectCardType(num: string): CardType {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6(?:011|5)/.test(n)) return "discover";
  return null;
}

function applyCardFormat(raw: string, type: CardType): string {
  const digits = raw.replace(/\D/g, "");
  if (type === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }
  return digits
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function applyExpiryFormat(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2, 4);
}

function CardTypeIcon({ type }: { type: CardType }) {
  if (!type) return null;
  const labels: Record<string, string> = {
    visa: "VISA",
    mastercard: "MC",
    amex: "AMEX",
    discover: "DISC",
  };
  const colors: Record<string, string> = {
    visa: "bg-blue-600",
    mastercard: "bg-orange-500",
    amex: "bg-slate-700",
    discover: "bg-orange-400",
  };
  return (
    <span
      className={`absolute right-3 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[10px] font-black text-white ${colors[type]}`}
    >
      {labels[type]}
    </span>
  );
}

interface GiftCard {
  id: string;
  amount: number;
  issuedTo: string;
  issuedAt: string;
  forOther: boolean;
  recipientName: string;
  message: string;
  type: "giftcard";
  app: "aloha-loyalty";
}

export default function GiftCardPurchase() {
  const session = useStore(userSession);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("customize");
  const [selected, setSelected] = useState<number | null>(10);
  const [customInput, setCustomInput] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [forOther, setForOther] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState<CardType>(null);

  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);

  const effectiveAmount = isCustom
    ? Math.min(100, Math.max(1, parseInt(customInput || "0", 10)))
    : (selected ?? 0);
  const validAmount = effectiveAmount >= 1 && effectiveAmount <= 100;

  function handleProceedToPayment() {
    if (!validAmount) return;
    setStep("payment");
  }

  function handleConfirmPayment() {
    const card: GiftCard = {
      id: generateId(),
      amount: effectiveAmount,
      issuedTo: forOther ? (recipientName || "Destinatario") : (session?.name ?? "Invitado"),
      issuedAt: new Date().toISOString(),
      forOther,
      recipientName: forOther ? (recipientName || "Destinatario") : "",
      message: forOther ? customMessage : "",
      type: "giftcard",
      app: "aloha-loyalty",
    };
    setGiftCard(card);
    setStep("result");
  }

  function handleWhatsApp() {
    if (!giftCard) return;
    const senderName = session?.name ?? "Aloha";
    let text: string;
    if (giftCard.forOther) {
      const recipient = giftCard.recipientName || "Invitado";
      const msg = giftCard.message ? `\n\n"${giftCard.message}"` : "";
      text =
        `🌺 ¡Hola ${recipient}! ${senderName} te regala una experiencia Aloha Bowls.${msg}\n\n` +
        `💳 Valor: $${giftCard.amount}.00\n` +
        `🔑 Código: ${giftCard.id}\n\n` +
        `📋 Condiciones: válida para quien la porte, sin fecha de vencimiento, canjeable en cualquier sucursal Aloha Bowls.`;
    } else {
      text =
        `🌺 ¡Hola! ${senderName} te regala una Gift Card de Aloha Bowls.\n\n` +
        `💳 Valor: $${giftCard.amount}.00\n` +
        `🔑 Código: ${giftCard.id}\n\n` +
        `📋 Condiciones: válida para quien la porte, sin fecha de vencimiento, canjeable en cualquier sucursal Aloha Bowls.`;
    }

    const digits = recipientPhone.replace(/\D/g, "");
    const base = digits.length >= 8 ? `https://wa.me/${digits}` : `https://wa.me/`;
    window.open(
      `${base}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleDownloadPDF() {
    if (!giftCard) return;
    const printWindow = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=600,height=800",
    );
    if (!printWindow) return;

    const canvas = canvasRef.current?.querySelector(
      "canvas",
    ) as HTMLCanvasElement | null;
    const qrDataUrl = canvas?.toDataURL("image/png") ?? "";
    const senderName = session?.name ?? "Aloha";
    const forOtherRow = giftCard.forOther
      ? `<tr><td>De:</td><td>${senderName}</td></tr>`
      : "";
    const messageSection = giftCard.message
      ? `<div class="message-box">"${giftCard.message}"</div>`
      : "";

    printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Gift Card Aloha Bowls</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; }
    .card { width: 540px; margin: 40px auto; border-radius: 24px; overflow: hidden; border: 2px solid #e2e8f0; box-shadow: 0 4px 32px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #4EC5D4 0%, #38b2c0 100%); padding: 32px 32px 24px; color: white; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 900; }
    .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
    .amount-badge { display: inline-block; background: white; color: #FF4D5A; font-size: 42px; font-weight: 900; border-radius: 16px; padding: 12px 32px; margin-top: 20px; }
    .body { padding: 28px 32px; display: flex; gap: 24px; align-items: flex-start; }
    .qr-wrap { flex-shrink: 0; background: #f8fafc; border-radius: 16px; padding: 12px; border: 1px solid #e2e8f0; }
    .qr-wrap img { display: block; width: 140px; height: 140px; }
    .info { flex: 1; }
    .info h2 { font-size: 17px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .info table { font-size: 13px; color: #475569; border-collapse: collapse; width: 100%; }
    .info td { padding: 4px 0; vertical-align: top; }
    .info td:first-child { font-weight: 600; color: #1e293b; padding-right: 10px; white-space: nowrap; }
    .message-box { margin: 0 32px 20px; background: #FFF6E8; border-left: 4px solid #4EC5D4; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #475569; font-style: italic; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { background: white; } .card { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🌺 Aloha Bowls</h1>
      <p>Gift Card — Válida en todas las sucursales</p>
      <div class="amount-badge">$${giftCard.amount}.00</div>
    </div>
    ${messageSection}
    <div class="body">
      <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR Gift Card" /></div>
      <div class="info">
        <h2>Detalles</h2>
        <table>
          <tr><td>Código:</td><td>${giftCard.id}</td></tr>
          <tr><td>Para:</td><td>${giftCard.issuedTo}</td></tr>
          ${forOtherRow}
          <tr><td>Emitida:</td><td>${new Date(giftCard.issuedAt).toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
          <tr><td>Valor:</td><td><strong>$${giftCard.amount}.00</strong></td></tr>
        </table>
      </div>
    </div>
    <div class="footer">Válida para quien la porte · Sin fecha de vencimiento · Canjeable en cualquier sucursal Aloha Bowls.</div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  }

  // ── STEP: RESULT ────────────────────────────────────────────────
  if (step === "result" && giftCard) {
    const qrPayload = JSON.stringify(giftCard);
    return (
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
          <div className="bg-gradient-to-br from-brand to-[#38b2c0] px-6 pb-8 pt-6 text-center text-white">
            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="text-xl font-bold">¡Gift Card lista!</h2>
            <p className="mt-1 text-sm text-white/80">
              {giftCard.forOther
                ? `Para ${giftCard.recipientName || "tu destinatario"}`
                : "Compartí o descargá tu tarjeta de regalo"}
            </p>
            <div className="mx-auto mt-4 inline-block rounded-2xl bg-white px-8 py-3">
              <span className="text-4xl font-black text-cta">
                ${giftCard.amount}.00
              </span>
            </div>
          </div>

          {giftCard.message ? (
            <div className="mx-6 mt-5 rounded-2xl border-l-4 border-brand bg-surface px-4 py-3 text-sm italic text-slate-600">
              "{giftCard.message}"
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div
              ref={canvasRef}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner"
            >
              <QRCodeCanvas value={qrPayload} size={200} level="M" marginSize={1} fgColor="#231F20" />
            </div>

            <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs text-slate-500">Código</p>
              <p className="font-mono text-lg font-bold text-slate-800">{giftCard.id}</p>
            </div>

            <div className="w-full text-center text-sm text-slate-500">
              <p>
                Para:{" "}
                <span className="font-semibold text-slate-700">{giftCard.issuedTo}</span>
              </p>
              <p className="mt-0.5">
                Emitida:{" "}
                {new Date(giftCard.issuedAt).toLocaleDateString("es-SV", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <button
                onClick={handleWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:bg-[#1ebe59]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 0 1 2.187 12C2.188 6.55 6.623 2.116 12.075 2.116c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                {giftCard.forOther ? "Enviar a destinatario" : "Enviar por WhatsApp"}
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar PDF
              </button>

              <button
                onClick={() => {
                  setGiftCard(null);
                  setStep("customize");
                  setForOther(false);
                  setRecipientName("");
                  setRecipientPhone("");
                  setCustomMessage("");
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCvv("");
                  setCardType(null);
                }}
                className="text-center text-sm text-slate-400 transition hover:text-slate-600"
              >
                Comprar otra gift card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: PAYMENT ────────────────────────────────────────────────
  if (step === "payment") {
    const maxCvv = cardType === "amex" ? 4 : 3;
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setStep("customize")}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Paso 2 de 2</p>
            <h2 className="text-xl font-black text-slate-950">Datos de pago</h2>
          </div>
        </div>

        <div className="mb-5 rounded-2xl bg-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Gift Card Aloha</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Para: {forOther ? (recipientName || "Destinatario") : (session?.name ?? "Invitado")}
              </p>
            </div>
            <span className="text-2xl font-black text-cta">${effectiveAmount}.00</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Número de tarjeta
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={cardType === "amex" ? 17 : 19}
                  value={cardNumber}
                  onChange={(e) => {
                    const type = detectCardType(e.target.value);
                    setCardType(type);
                    setCardNumber(applyCardFormat(e.target.value, type));
                  }}
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pr-16 font-mono text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-brand"
                />
                <CardTypeIcon type={cardType} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Fecha de expiración
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(applyExpiryFormat(e.target.value))}
                  placeholder="MM/AA"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Código de seguridad
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={maxCvv}
                  value={cardCvv}
                  onChange={(e) =>
                    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, maxCvv))
                  }
                  placeholder={cardType === "amex" ? "0000" : "000"}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-brand"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={
              cardNumber.replace(/\s/g, "").length < 13 ||
              cardExpiry.length < 5 ||
              cardCvv.length < 3
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-4 text-base font-bold text-white transition hover:bg-deep-cta disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Confirmar pago — ${effectiveAmount}.00
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Simulación de pago. No se realizará ningún cargo real.
          </p>
        </div>
      </div>
    );
  }

  // ── STEP: CUSTOMIZE ─────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <div className="mb-3 text-5xl">🎁</div>
        <h1 className="font-heading text-3xl font-black text-slate-950">
          Gift Cards
        </h1>
        <p className="mt-2 text-slate-500">
          Regalá experiencias Aloha a quien quieras
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div className="px-6 py-6">
          {/* Amount selection */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Elegí el monto
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelected(amt);
                    setIsCustom(false);
                    setCustomInput("");
                  }}
                  className={`rounded-xl border-2 py-3 text-base font-bold transition ${
                    !isCustom && selected === amt
                      ? "border-brand bg-brand text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand/60"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsCustom(true);
                setSelected(null);
              }}
              className={`mt-2 w-full rounded-xl border-2 py-3 text-sm font-semibold transition ${
                isCustom
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-slate-200 bg-white text-slate-500 hover:border-brand/60"
              }`}
            >
              Monto personalizado (máx. $100)
            </button>

            {isCustom && (
              <div className="mt-3 flex items-center overflow-hidden rounded-xl border-2 border-brand bg-white">
                <span className="px-4 text-lg font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ej: 35"
                  className="flex-1 py-3 pr-4 text-lg font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300"
                />
                <span className="pr-4 text-sm text-slate-400">.00</span>
              </div>
            )}
          </div>

          {/* For-other toggle */}
          <div className="mb-6">
            <button
              onClick={() => setForOther((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                forOther
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 bg-slate-50 hover:border-brand/40"
              }`}
              type="button"
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${
                  forOther ? "bg-accent text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                🎁
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  ¿Es para otra persona?
                </p>
                <p className="text-xs text-slate-500">
                  Incluí un mensaje y datos del destinatario
                </p>
              </div>
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  forOther ? "bg-accent" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    forOther ? "translate-x-4 left-0.5" : "left-0.5"
                  }`}
                />
              </div>
            </button>

            {forOther && (
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nombre del destinatario"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-brand"
                />
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="WhatsApp del destinatario (ej: 50300000000)"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-brand"
                />
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Mensaje personalizado para el recibo..."
                  rows={3}
                  className="w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-brand"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand/10 to-brand/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Gift Card Aloha
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Para:{" "}
                  {forOther
                    ? recipientName || "destinatario"
                    : (session?.name ?? "tu contacto")}
                </p>
              </div>
              <span className="text-3xl font-black text-cta">
                {validAmount ? `$${effectiveAmount}.00` : "$—"}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={!validAmount}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-4 text-base font-bold text-white transition hover:bg-deep-cta disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Continuar al pago
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            La gift card se genera al instante tras el pago. Podés compartirla
            por WhatsApp o descargarla en PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
