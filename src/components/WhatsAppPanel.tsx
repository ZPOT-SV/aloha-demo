interface WhatsAppPanelProps {
  storeName: string;
  storePhone: string;
  customerName: string;
  tikiEarned: number;
  transactionId: string;
  onDismiss: () => void;
  embedded?: boolean;
}

export default function WhatsAppPanel({
  storeName,
  storePhone,
  customerName,
  tikiEarned,
  transactionId,
  onDismiss,
  embedded = false
}: WhatsAppPanelProps) {
  const formattedTime = new Date().toLocaleTimeString('es-SV', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const wrapperClass = embedded
    ? 'w-full rounded-[2rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/10'
    : 'w-full max-w-lg rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20';
  const containerClass = embedded
    ? 'w-full'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm';

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        <div className="border-l-4 border-deep-cta pl-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Confirmación</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">📲 Notificaciones Enviadas</h3>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[1.5rem] bg-surface p-5">
            <p className="text-sm font-semibold text-slate-950">Para la tienda:</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{storeName}</p>
            <p className="mt-1 text-sm text-text-muted">{storePhone}</p>
            <div className="mt-4 flex">
              <div className="max-w-[85%] rounded-[1.5rem] rounded-tl-md bg-[#DCF8C6] px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                {`Hola, el cliente ${customerName || 'Aloha'} acumuló ${tikiEarned} Tiki Points en su compra. Transacción #${transactionId}. — Sistema Aloha Loyalty`}
              </div>
            </div>
          </div>

          {customerName ? (
            <div className="rounded-[1.5rem] bg-surface p-5">
              <p className="text-sm font-semibold text-slate-950">Para el cliente:</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{customerName}</p>
              <p className="mt-1 text-sm text-text-muted">+503 0000-0000</p>
              <div className="mt-4 flex">
                <div className="max-w-[85%] rounded-[1.5rem] rounded-tl-md bg-[#DCF8C6] px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                  {`¡Hola ${customerName}! Tu compra fue registrada exitosamente. Ganaste ${tikiEarned} Tiki Points. Transacción #${transactionId}. Recogé tu pedido en ${storeName}. — Aloha Loyalty`}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-xs font-medium text-text-muted">Enviado hoy a las {formattedTime}</p>

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
