import { useState } from 'react';

import WhatsAppPanel from '../WhatsAppPanel';

export default function RedeemCoupon() {
  const [couponId, setCouponId] = useState('');
  const [redeemedId, setRedeemedId] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const redeemCoupon = () => {
    const normalizedId = couponId.trim();

    if (!normalizedId) {
      return;
    }

    window.localStorage.setItem(`aloha_redeemed_${normalizedId}`, 'true');
    setRedeemedId(normalizedId);
    setShowMessage(true);
    setCouponId('');
  };

  return (
    <>
      <section className="max-w-3xl rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Canje de cupón</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Validar y registrar canje</h1>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <input
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
            onChange={(event) => setCouponId(event.target.value)}
            placeholder="ID de Transacción o Cupón"
            value={couponId}
          />
          <button
            className="rounded-full bg-cta px-5 py-3 font-bold text-white transition hover:bg-deep-cta"
            onClick={redeemCoupon}
            type="button"
          >
            Validar y Canjear
          </button>
        </div>

        {redeemedId ? (
          <div className="mt-6 rounded-[1.5rem] border border-highlight bg-highlight/20 p-5">
            <p className="text-lg font-black text-slate-950">✓ Cupón #{redeemedId} canjeado exitosamente</p>
          </div>
        ) : null}
      </section>

      {showMessage ? (
        <WhatsAppPanel
          onDismiss={() => setShowMessage(false)}
          customerName=""
          storeName="Administrador Aloha"
          storePhone="+503 7000-0101"
          tikiEarned={0}
          transactionId={redeemedId}
        />
      ) : null}
    </>
  );
}
