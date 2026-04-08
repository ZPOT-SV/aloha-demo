import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import {
  cartOpen,
  selectedStore,
  setCartOpen,
  userSession,
} from "../../stores";
import type { User } from "../../types";
import AuthModal from "../AuthModal";
import AuthPromptModal from "../auth/AuthPromptModal";
import CartDrawer from "./CartDrawer";
import PaymentModal from "./PaymentModal";
import StoreSelectionModal from "./StoreSelectionModal";
import SuccessScreen from "./SuccessScreen";

type CartFlowState =
  | "idle"
  | "cart-open"
  | "store-selection"
  | "payment"
  | "success";

interface SuccessData {
  customerPhone: string;
  itemList: string;
  newBalance: number;
  qrPayload: string;
  storeName: string;
  storeNotifPhone: string;
  storePhone: string;
  tikiEarned: number;
  tierId: User["tierId"];
  tierUpMessage: string | null;
  transactionId: string;
}

export default function CartFlow() {
  const isCartOpen = useStore(cartOpen);
  const activeStore = useStore(selectedStore);
  const currentUser = useStore(userSession);
  const [state, setState] = useState<CartFlowState>("idle");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const openAuthPrompt = () => {
      setAuthPromptOpen(true);
    };

    window.addEventListener("aloha:open-auth-prompt", openAuthPrompt);

    return () => {
      window.removeEventListener("aloha:open-auth-prompt", openAuthPrompt);
    };
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      setState("cart-open");
      return;
    }

    setState((current) => (current === "cart-open" ? "idle" : current));
  }, [isCartOpen]);

  return (
    <>
      <CartDrawer
        open={state === "cart-open"}
        onClose={() => {
          setCartOpen(false);
          setState("idle");
        }}
        onProceed={() => {
          if (!currentUser) {
            setCartOpen(false);
            setState("idle");
            setAuthPromptOpen(true);
            return;
          }

          setState("store-selection");
        }}
      />

      <StoreSelectionModal
        open={state === "store-selection"}
        onCancel={() => {
          setCartOpen(true);
          setState("cart-open");
        }}
        onConfirm={() => {
          if (!activeStore) {
            return;
          }

          setState("payment");
        }}
      />

      <PaymentModal
        open={state === "payment"}
        onCancel={() => {
          setState("store-selection");
        }}
        onConfirm={(result) => {
          setSuccessData(result);
          setState("success");
        }}
      />

      <SuccessScreen
        customerName={currentUser?.name ?? ""}
        customerPhone={successData?.customerPhone ?? ""}
        itemList={successData?.itemList ?? ""}
        newBalance={successData?.newBalance ?? 0}
        onClose={() => {
          setSuccessData(null);
          setState("idle");
          setCartOpen(false);
        }}
        open={state === "success" && !!successData}
        qrPayload={successData?.qrPayload ?? ""}
        storeName={successData?.storeName ?? ""}
        storeNotifPhone={successData?.storeNotifPhone ?? ""}
        storePhone={successData?.storePhone ?? ""}
        tikiEarned={successData?.tikiEarned ?? 0}
        tierId={successData?.tierId ?? "rise"}
        tierUpMessage={successData?.tierUpMessage ?? null}
        transactionId={successData?.transactionId ?? ""}
      />

      <AuthPromptModal
        isOpen={authPromptOpen}
        onClose={() => {
          setAuthPromptOpen(false);
        }}
        onLoginClick={() => {
          setAuthPromptOpen(false);
          setAuthTab("login");
          window.dispatchEvent(
            new CustomEvent("aloha:open-auth", {
              detail: { defaultTab: "login" },
            }),
          );
        }}
        onRegisterClick={() => {
          setAuthPromptOpen(false);
          setAuthTab("register");
          window.dispatchEvent(
            new CustomEvent("aloha:open-auth", {
              detail: { defaultTab: "register" },
            }),
          );
        }}
      />
      <AuthModal defaultTab={authTab} />
    </>
  );
}
