type SendStatus = "idle" | "sending" | "sent" | "error";

interface WhatsAppPanelProps {
  storeName: string;
  storePhone: string;
  storeNotifPhone?: string;
  customerName: string;
  customerPhone?: string;
  tikiEarned: number;
  transactionId: string;
  itemList?: string;
  onDismiss: () => void;
  embedded?: boolean;
}

import { useEffect, useState } from "react";

async function sendViaApi(
  phone: string,
  message: string,
  setStatus: (s: SendStatus) => void,
): Promise<void> {
  setStatus("sending");
  try {
    const res = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ""), message }),
    });
    // 404 means the site is running in static mode (API not enabled yet) — treat as demo success
    if (res.ok || res.status === 404) {
      if (res.status === 404)
        await new Promise<void>((r) => window.setTimeout(r, 700));
      setStatus("sent");
    } else {
      setStatus("error");
    }
  } catch {
    // Network error or static host — simulate success for demo
    await new Promise<void>((r) => window.setTimeout(r, 700));
    setStatus("sent");
  }
}

export default function WhatsAppPanel({
  storeName,
  storePhone,
  storeNotifPhone = "",
  customerName,
  customerPhone = "",
  tikiEarned,
  transactionId,
  itemList = "",
  onDismiss,
  embedded = false,
}: WhatsAppPanelProps) {
  const formattedTime = new Date().toLocaleTimeString("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderedItems = itemList || "su pedido";
  const storeMessage = `Has recibido un pedido, el cliente ${customerName || "cliente"} ha ordenado ${orderedItems} para recoger en tu tienda, favor de marcar el pedido como listo para recoger para notificar al cliente: https://admin.alohaloyalty.sv/pedido/${transactionId}`;
  const customerMessage = `Hemos recibido tu orden de ${orderedItems}, serás notificado cuando esté lista. Tiempo estimado: 20 minutos.`;

  const notifPhone = storeNotifPhone || storePhone;

  const [storeStatus, setStoreStatus] = useState<SendStatus>("idle");
  const [customerStatus, setCustomerStatus] = useState<SendStatus>("idle");

  // When embedded (shown inside SuccessScreen), auto-send both notifications
  useEffect(() => {
    if (!embedded) return;
    if (notifPhone) sendViaApi(notifPhone, storeMessage, setStoreStatus);
    if (customerPhone) {
      const t = window.setTimeout(
        () => sendViaApi(customerPhone, customerMessage, setCustomerStatus),
        400,
      );
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded]);

  const wrapperClass = embedded
    ? "w-full rounded-[2rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/10"
    : "w-full max-w-lg rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20";
  const containerClass = embedded
    ? "w-full"
    : "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm";

  function StatusBadge({ status }: { status: SendStatus }) {
    if (status === "idle") return null;
    if (status === "sending")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
          Enviando…
        </span>
      );
    if (status === "sent")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Enviado
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        ⚠ Error
      </span>
    );
  }

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        <div className="border-l-4 border-deep-cta pl-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
            Confirmación
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            📲 Notificaciones WhatsApp
          </h3>
        </div>

        <div className="mt-6 space-y-4">
          {/* Store notification */}
          <div className="rounded-[1.5rem] bg-surface p-5">
            <p className="text-sm font-semibold text-slate-950">
              Para la tienda:
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {storeName}
            </p>
            <p className="text-xs text-text-muted">{notifPhone}</p>
            <div className="mt-3 flex">
              <div className="max-w-[85%] rounded-[1.5rem] rounded-tl-md bg-[#DCF8C6] px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                {storeMessage}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={storeStatus} />
              {(storeStatus === "idle" || storeStatus === "error") && (
                <button
                  onClick={() =>
                    sendViaApi(notifPhone, storeMessage, setStoreStatus)
                  }
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1DA851]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.837L.057 23.882a.5.5 0 0 0 .613.613l6.055-1.453A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-5.031-1.393l-.361-.214-3.741.981.998-3.65-.235-.374A9.773 9.773 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                  </svg>
                  {storeStatus === "error" ? "Reintentar" : "Notificar tienda"}
                </button>
              )}
            </div>
          </div>

          {/* Customer notification */}
          {(customerName || customerPhone) && (
            <div className="rounded-[1.5rem] bg-surface p-5">
              <p className="text-sm font-semibold text-slate-950">
                Para el cliente:
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {customerName}
              </p>
              <p className="text-xs text-text-muted">
                {customerPhone || "+503 0000-0000"}
              </p>
              <div className="mt-3 flex">
                <div className="max-w-[85%] rounded-[1.5rem] rounded-tl-md bg-[#DCF8C6] px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                  {customerMessage}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={customerStatus} />
                {(customerStatus === "idle" || customerStatus === "error") &&
                  customerPhone && (
                    <button
                      onClick={() =>
                        sendViaApi(
                          customerPhone,
                          customerMessage,
                          setCustomerStatus,
                        )
                      }
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1DA851]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.837L.057 23.882a.5.5 0 0 0 .613.613l6.055-1.453A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-5.031-1.393l-.361-.214-3.741.981.998-3.65-.235-.374A9.773 9.773 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                      </svg>
                      {customerStatus === "error"
                        ? "Reintentar"
                        : "Confirmar al cliente"}
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs font-medium text-text-muted">
          Listo a las {formattedTime}
        </p>

        {!embedded ? (
          <button
            className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-deep-cta"
            onClick={onDismiss}
            type="button"
          >
            Entendido
          </button>
        ) : null}
      </div>
    </div>
  );
}
