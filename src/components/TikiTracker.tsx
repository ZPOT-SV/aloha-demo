import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { tikiBalance, userSession } from "../stores";

function getTier(balance: number) {
  if (balance >= 150) {
    return {
      id: "aloha",
      label: "� Aloha",
      next: null,
      nextLabel: "¡Sos Aloha! Nivel máximo 🌺",
    };
  }
  if (balance >= 50) {
    return {
      id: "vibe",
      label: "🤙🏻 Vibe",
      next: 150,
      nextLabel: `${150 - balance} Tikis para alcanzar Aloha`,
    };
  }
  return {
    id: "rise",
    label: "🌊 Rise",
    next: 50,
    nextLabel: `${50 - balance} Tikis para alcanzar Vibe`,
  };
}

export default function TikiTracker() {
  const session = useStore(userSession);
  const balance = useStore(tikiBalance);
  const [displayBalance, setDisplayBalance] = useState(0);

  const tier = getTier(balance);
  const progress = tier.next ? Math.min((balance / tier.next) * 100, 100) : 100;

  useEffect(() => {
    const nextFrame = window.requestAnimationFrame(() => {
      setDisplayBalance(balance);
    });

    return () => {
      window.cancelAnimationFrame(nextFrame);
    };
  }, [balance]);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-2xl shadow-brand/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
            Tus Tikis
          </p>
          <h2 className="mt-2 text-5xl font-black tracking-tight text-slate-950">
            <span
              className="inline-block transition-[transform,opacity] duration-700 ease-out"
              style={{
                opacity: displayBalance === balance ? 1 : 0.4,
                transform:
                  displayBalance === balance
                    ? "translateY(0)"
                    : "translateY(8px)",
              }}
            >
              {displayBalance}
            </span>
          </h2>
          <p className="mt-2 text-base text-text-muted">
            {session
              ? `Hola, ${session.name.split(" ")[0]}. Seguís acumulando beneficios.`
              : "Tu saldo se actualiza en tiempo real."}
          </p>
        </div>

        <div className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand/20">
          {tier.label}
        </div>
      </div>

      <div className="mt-8">
        <div className="h-4 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand to-cta transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-text-muted">
          {tier.nextLabel}
        </p>
      </div>
    </section>
  );
}
