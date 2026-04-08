import { QRCodeSVG } from "qrcode.react";
import { useStore } from "@nanostores/react";
import { userSession } from "../stores";

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

export default function DashboardQRCard() {
  const session = useStore(userSession);

  if (!session) return null;

  const tierId = session.tierId ?? "rise";
  const clientId = `CLT-${session.id.toUpperCase()}`;
  const payload = JSON.stringify({
    clientId,
    name: session.name,
    tierId: session.tierId,
    app: "aloha-loyalty",
  });

  return (
    <div className="overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-2xl shadow-brand/10">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand to-[#38b2c0] px-5 pb-4 pt-4 text-white">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{tierEmoji[tierId] ?? "🌊"}</span>
          <div>
            <p className="text-xs font-medium text-white/75">Mi QR de puntos</p>
            <p className="text-base font-bold leading-tight">{session.name}</p>
          </div>
          <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
            {tierLabel[tierId] ?? tierId}
          </span>
        </div>
      </div>

      {/* QR + ID */}
      <div className="flex flex-col items-center gap-3 px-5 py-5">
        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <QRCodeSVG
            value={payload}
            size={148}
            level="M"
            marginSize={1}
            fgColor="#231F20"
          />
        </div>

        <div className="w-full rounded-xl bg-slate-50 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            ID de cliente
          </p>
          <p className="font-mono text-base font-bold text-slate-800">
            {clientId}
          </p>
        </div>
      </div>
    </div>
  );
}
