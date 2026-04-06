import { useMemo } from 'react';

import { useStore } from '@nanostores/react';

import {
  cart,
  challenges,
  clearCart,
  selectedStore,
  setChallenges,
  setTikiBalance,
  setTransactionHistory,
  setUserSession,
  tikiBalance,
  transactionHistory,
  userSession
} from '../../stores';
import type { CartItem, Challenge, MenuItem, Transaction, User } from '../../types';

interface PaymentResult {
  newBalance: number;
  qrPayload: string;
  storeName: string;
  storePhone: string;
  tikiEarned: number;
  tierUpMessage: string | null;
  tierId: User['tierId'];
  transactionId: string;
}

interface PaymentModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (result: PaymentResult) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

function getTierId(balance: number): User['tierId'] {
  if (balance >= 150) {
    return 'aloha';
  }

  if (balance >= 50) {
    return 'vibe';
  }

  return 'rise';
}

function getTierLabel(balance: number): string {
  if (balance >= 150) {
    return 'Aloha';
  }

  if (balance >= 50) {
    return 'Vibe';
  }

  return 'Rise';
}

function expandCartItems(items: CartItem[]): MenuItem[] {
  return items.flatMap((entry) => Array.from({ length: entry.quantity }, () => entry.item));
}

function updateChallengeProgress(
  currentChallenges: Challenge[],
  cartItems: CartItem[],
  timestamp: Date
): Challenge[] {
  const bowlCount = cartItems.reduce((sum, entry) => {
    return entry.item.category === 'bowls' ? sum + entry.quantity : sum;
  }, 0);

  return currentChallenges.map((challenge) => {
    if (challenge.isLocked || challenge.isCompleted) {
      return challenge;
    }

    let increment = 0;

    if (challenge.name === 'Comprador Frecuente') {
      increment = 1;
    } else if (challenge.name === 'Fan de los Bowls') {
      increment = bowlCount;
    } else if (challenge.name === 'Madrugador' && timestamp.getHours() < 10) {
      increment = 1;
    }

    if (increment <= 0) {
      return challenge;
    }

    const currentCount = Math.min(challenge.currentCount + increment, challenge.targetCount);

    return {
      ...challenge,
      currentCount,
      isCompleted: currentCount >= challenge.targetCount
    };
  });
}

export default function PaymentModal({ open, onCancel, onConfirm }: PaymentModalProps) {
  const cartItems = useStore(cart);
  const activeStore = useStore(selectedStore);
  const currentUser = useStore(userSession);
  const balance = useStore(tikiBalance);
  const challengeList = useStore(challenges);
  const history = useStore(transactionHistory);

  const total = useMemo(() => {
    return cartItems.reduce((sum, entry) => sum + entry.item.priceUSD * entry.quantity, 0);
  }, [cartItems]);

  const totalTikis = useMemo(() => {
    return cartItems.reduce((sum, entry) => sum + entry.item.tikiEarn * entry.quantity, 0);
  }, [cartItems]);

  if (!open) {
    return null;
  }

  const confirmOrder = () => {
    if (!activeStore || !currentUser || cartItems.length === 0) {
      onCancel();
      return;
    }

    const timestamp = new Date();
    const transactionId = `TXN-${Date.now()}`;
    const newBalance = balance + totalTikis;
    const qrPayload = JSON.stringify({
      userId: currentUser.id,
      transactionId,
      tikiEarned: totalTikis,
      storeName: activeStore.name,
      timestamp: timestamp.toISOString()
    });
    const transaction: Transaction = {
      id: transactionId,
      userId: currentUser.id,
      storeId: activeStore.id,
      items: expandCartItems(cartItems),
      tikiEarned: totalTikis,
      qrPayload,
      timestamp: timestamp.toISOString()
    };
    const previousTier = getTierLabel(balance);
    const nextTier = getTierLabel(newBalance);
    const nextSession: User = {
      ...currentUser,
      tikiBalance: newBalance,
      tierId: getTierId(newBalance)
    };

    setTikiBalance(newBalance);
    setTransactionHistory([transaction, ...history]);
    setChallenges(updateChallengeProgress(challengeList, cartItems, timestamp));
    setUserSession(nextSession);
    clearCart();
    window.dispatchEvent(new CustomEvent('aloha:auth-changed'));

    onConfirm({
      newBalance,
      qrPayload,
      storeName: activeStore.name,
      storePhone: activeStore.phone,
      tikiEarned: totalTikis,
      tierUpMessage:
        previousTier === nextTier
          ? null
          : newBalance >= 150
            ? '🏄 ¡Alcanzaste Aloha! El nivel más alto. ¡Eres increíble!'
            : '🌊 ¡Subiste a Vibe! Seguí acumulando Tikis.',
      tierId: getTierId(newBalance),
      transactionId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-brand/10 bg-white p-6 shadow-2xl shadow-brand/20">
        <div className="border-l-4 border-deep-cta pl-4">
          <h2 className="text-3xl font-black text-slate-950">Confirmar Pedido</h2>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-surface p-5">
          <div className="space-y-3">
            {cartItems.map((entry) => (
              <div key={entry.item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-slate-950">{entry.item.name}</p>
                  <p className="text-text-muted">Cantidad: {entry.quantity}</p>
                </div>
                <p className="font-black text-slate-950">
                  {formatCurrency(entry.item.priceUSD * entry.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-brand/10 pt-5">
            <p className="text-xl font-black text-slate-950">Total a pagar: {formatCurrency(total)} USD</p>
            <p className="mt-2 text-sm text-text-muted">
              Tienda de recogida: {activeStore?.name ?? 'Sin tienda seleccionada'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted uppercase tracking-wider">
            Datos de tarjeta
          </h3>
          <input
            placeholder="Número de tarjeta — 4242 4242 4242 4242"
            className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            type="text"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="MM/AA"
              className="rounded-lg border border-gray-200 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              type="text"
            />
            <input
              placeholder="CVV"
              className="rounded-lg border border-gray-200 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              type="text"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
          <button
            className="text-sm font-bold text-brand transition hover:text-deep-cta"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="w-full rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta sm:w-auto"
            onClick={confirmOrder}
            type="button"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
