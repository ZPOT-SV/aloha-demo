import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { setTikiBalance, tikiBalance, userSession } from "../stores";
import rewardsData from "../data/rewards.json";
import type { Reward } from "../types";

type RewardWithEmoji = Reward & { emoji?: string };
const rewards = (rewardsData as RewardWithEmoji[])
  .filter((r) => r.isActive)
  .sort((a, b) => a.tikiCost - b.tikiCost);

interface RedeemedReward extends RewardWithEmoji {
  code: string;
  redeemedAt: string;
}

function generateCode(rewardId: string): string {
  return `RDM-${rewardId.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function HeroOffersWidget() {
  const session = useStore(userSession);
  const balance = useStore(tikiBalance);
  const [redeemed, setRedeemed] = useState<RedeemedReward | null>(null);

  if (!session || session.role !== "customer") return null;

  const nextLocked = rewards.find((r) => balance < r.tikiCost) ?? null;
  const progressPct = nextLocked
    ? Math.min(Math.round((balance / nextLocked.tikiCost) * 100), 100)
    : 100;
  const firstName = session.name.split(" ")[0];

  function handleRedeem(reward: RewardWithEmoji) {
    if (balance < reward.tikiCost) return;
    const newBal = balance - reward.tikiCost;
    setTikiBalance(newBal);
    setRedeemed({
      ...reward,
      code: generateCode(reward.id),
      redeemedAt: new Date().toISOString(),
    });
  }

  const qrPayload = redeemed
    ? JSON.stringify({
        type: "redemption",
        code: redeemed.code,
        reward: redeemed.name,
        clientId: `CLT-${session.id.toUpperCase()}`,
        redeemedAt: redeemed.redeemedAt,
        app: "aloha-loyalty",
      })
    : "";

  const redemptionModal =
    redeemed && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setRedeemed(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-brand to-[#38b2c0] px-6 pb-6 pt-5 text-white">
                <button
                  onClick={() => setRedeemed(null)}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white"
                  aria-label="Cerrar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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
                <div className="text-3xl">{redeemed.emoji ?? "🎁"}</div>
                <h2 className="mt-2 text-xl font-bold">¡Canjeo exitoso!</h2>
                <p className="mt-1 text-sm text-white/80">{redeemed.name}</p>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-3 px-6 py-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
                  <QRCodeSVG
                    value={qrPayload}
                    size={180}
                    level="M"
                    fgColor="#231F20"
                  />
                </div>

                <div className="w-full rounded-xl bg-slate-50 px-4 py-2.5 text-center">
                  <p className="text-xs text-slate-400">Código de canje</p>
                  <p className="font-mono text-base font-bold text-slate-800">
                    {redeemed.code}
                  </p>
                </div>

                {/* Non-transferable disclaimer */}
                <div className="flex w-full items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0 text-amber-600"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <p className="text-xs leading-relaxed text-amber-700">
                    Este cupón es <strong>personal e intransferible</strong>.
                    Solo puede ser usado por ti en tienda. No compartir.
                  </p>
                </div>

                <p className="text-center text-xs text-slate-400">
                  Mostrá este QR al cajero para aplicar tu recompensa
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {redemptionModal}
      <div className="overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-2xl shadow-brand/10">
        {/* Gradient header with greeting */}
        <div className="bg-gradient-to-br from-brand to-[#2F80ED] px-6 pb-5 pt-5 text-white">
          <p className="text-sm font-semibold text-white/75">¡Hola,</p>
          <p className="text-2xl font-black leading-tight">{firstName}! 👋</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-black leading-none">{balance}</span>
            <span className="mb-1 text-base font-semibold text-white/80">
              Tikis disponibles
            </span>
          </div>
        </div>

        {/* Progress to next reward */}
        {nextLocked && (
          <div className="border-b border-slate-100 px-5 py-4 text-center">
            <p className="mb-0.5 text-xs font-semibold text-slate-500">
              Próxima recompensa
            </p>
            <p className="text-sm font-bold text-slate-800">
              {nextLocked.emoji} {nextLocked.name}
            </p>
            <div className="mx-auto mt-3 max-w-xs">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">
                  {balance} Tikis
                </span>
                <span className="font-bold text-brand">
                  {nextLocked.tikiCost} Tikis
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-[#2F80ED] transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rewards list */}
        <div className="divide-y divide-slate-50">
          {rewards.map((r) => {
            const unlocked = balance >= r.tikiCost;
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 px-6 py-4 ${unlocked ? "" : "opacity-50"}`}
              >
                <span className="shrink-0 text-xl">{r.emoji ?? "🎁"}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold leading-tight ${unlocked ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400">{r.tikiCost} Tikis</p>
                </div>
                {unlocked ? (
                  <button
                    onClick={() => handleRedeem(r)}
                    className="shrink-0 rounded-full bg-cta px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-cta/30 transition hover:bg-deep-cta active:scale-95"
                  >
                    Canjear
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                    {r.tikiCost - balance} más
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
