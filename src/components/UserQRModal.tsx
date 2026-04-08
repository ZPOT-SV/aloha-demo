import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { useStore } from "@nanostores/react";
import { userSession } from "../stores";

export default function UserQRModal() {
  const session = useStore(userSession);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handler = () => setOpen(true);
    window.addEventListener("aloha:open-qr", handler);
    return () => window.removeEventListener("aloha:open-qr", handler);
  }, []);

  if (!mounted || !session) return null;

  const clientId = `CLT-${session.id.toUpperCase()}`;
  const tierId = session.tierId ?? "rise";
  const payload = JSON.stringify({
    clientId,
    name: session.name,
    tierId: session.tierId,
    app: "aloha-loyalty",
  });

  const tierEmoji: Record<string, string> = {
    rise: "🌊",
    vibe: "🤙🏻",
    aloha: "🌺",
  };
  const tierLabel: Record<string, string> = {
    rise: "Rise",
    vibe: "Vibe",
    aloha: "Aloha",
  };

  const modal = open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mi QR de puntos"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-backdrop-enter" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-brand to-[#38b2c0] px-6 pb-8 pt-6 text-white">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
              {tierEmoji[tierId] ?? "🌊"}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Hola,</p>
              <p className="text-xl font-bold">{session.name}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
              {tierEmoji[tierId]} {tierLabel[tierId] ?? tierId}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-mono font-semibold">
              {clientId}
            </span>
          </div>
        </div>

        {/* QR section */}
        <div className="flex flex-col items-center gap-4 px-6 py-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
            <QRCodeSVG
              value={payload}
              size={200}
              level="M"
              marginSize={1}
              fgColor="#231F20"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">
              Mostrá este código en tienda
            </p>
            <p className="mt-1 text-xs text-slate-500">
              El cajero escaneará tu QR para acumular Tikis
            </p>
          </div>

          <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">ID de cliente</p>
            <p className="font-mono text-lg font-bold text-slate-800">
              {clientId}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(modal, document.body);
}
