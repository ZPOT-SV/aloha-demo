import { useEffect, useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import WhatsAppPanel from "../WhatsAppPanel";
import type { User } from "../../types";

interface SuccessScreenProps {
  open: boolean;
  customerName: string;
  customerPhone?: string;
  itemList?: string;
  newBalance: number;
  onClose: () => void;
  qrPayload: string;
  storeName: string;
  storeNotifPhone?: string;
  storePhone: string;
  tikiEarned: number;
  tierId: User["tierId"];
  tierUpMessage: string | null;
  transactionId: string;
}

function getTierLabel(tierId: User["tierId"]): string {
  if (tierId === "aloha") {
    return "🌺 Aloha";
  }

  if (tierId === "vibe") {
    return "🤙🏻 Vibe";
  }

  return "🌊 Rise";
}

export default function SuccessScreen({
  open,
  customerName,
  customerPhone = "",
  itemList = "",
  newBalance,
  onClose,
  qrPayload,
  storeName,
  storeNotifPhone = "",
  storePhone,
  tikiEarned,
  tierId,
  tierUpMessage,
  transactionId,
}: SuccessScreenProps) {
  const [animatedTikis, setAnimatedTikis] = useState(0);

  useEffect(() => {
    if (!open) {
      setAnimatedTikis(0);
      return;
    }

    const duration = 1500;
    const start = window.performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedTikis(Math.round(tikiEarned * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open, tikiEarned]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20">
        <div className="text-center">
          <div className="text-6xl text-accent [animation:bounce_1s_1]">✅</div>
          <h1 className="mt-4 text-4xl font-black text-slate-950">
            ¡Pedido Confirmado!
          </h1>
          <p className="mt-2 text-sm font-medium text-text-muted">
            Transacción #{transactionId}
          </p>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-surface p-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">
            Tiki Points ganados
          </p>
          <p className="mt-3 text-5xl font-black text-highlight">
            +{animatedTikis}
          </p>
          <p className="mt-4 text-base font-bold text-slate-950">
            Tu nuevo saldo: {newBalance} Tikis
          </p>
          <div className="mt-3 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">
            {getTierLabel(tierId)}
          </div>
          {tierUpMessage ? (
            <div className="mt-4 rounded-[1.25rem] bg-highlight px-4 py-3 text-sm font-bold text-slate-950">
              🎉 ¡Subiste a {getTierLabel(tierId).replace(/^.\s/, "")}!
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-white p-5 text-center shadow-lg shadow-brand/10">
          <div className="flex justify-center">
            <QRCodeSVG size={180} value={qrPayload} />
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Mostrá este QR en tienda al recoger tu pedido
          </p>
        </div>

        <div className="mt-6">
          <WhatsAppPanel
            customerName={customerName}
            customerPhone={customerPhone}
            embedded
            itemList={itemList}
            onDismiss={onClose}
            storeName={storeName}
            storeNotifPhone={storeNotifPhone}
            storePhone={storePhone}
            tikiEarned={tikiEarned}
            transactionId={transactionId}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            className="inline-flex items-center justify-center rounded-full border border-brand px-5 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
            href="/dashboard"
          >
            Ver mi Dashboard
          </a>
          <button
            className="text-sm font-bold text-brand transition hover:text-deep-cta"
            onClick={onClose}
            type="button"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
}
