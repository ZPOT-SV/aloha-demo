import { useEffect, useState } from 'react';

import { useStore } from '@nanostores/react';

import { cart, cartOpen, selectedStore, setCartOpen, userSession } from '../../stores';
import type { User } from '../../types';
import CartDrawer from './CartDrawer';
import PaymentModal from './PaymentModal';
import StoreSelectionModal from './StoreSelectionModal';
import SuccessScreen from './SuccessScreen';

type CartFlowState = 'idle' | 'cart-open' | 'store-selection' | 'payment' | 'success';

interface SuccessData {
  newBalance: number;
  qrPayload: string;
  storeName: string;
  storePhone: string;
  tikiEarned: number;
  tierId: User['tierId'];
  tierUpMessage: string | null;
  transactionId: string;
}

export default function CartFlow() {
  const isCartOpen = useStore(cartOpen);
  const cartItems = useStore(cart);
  const activeStore = useStore(selectedStore);
  const currentUser = useStore(userSession);
  const [state, setState] = useState<CartFlowState>('idle');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      setState('cart-open');
      return;
    }

    setState((current) => (current === 'cart-open' ? 'idle' : current));
  }, [isCartOpen]);

  useEffect(() => {
    if (cartItems.length === 0 && state === 'cart-open') {
      setCartOpen(false);
    }
  }, [cartItems.length, state]);

  return (
    <>
      <CartDrawer
        open={state === 'cart-open'}
        onClose={() => {
          setCartOpen(false);
          setState('idle');
        }}
        onProceed={() => {
          setState('store-selection');
        }}
      />

      <StoreSelectionModal
        open={state === 'store-selection'}
        onCancel={() => {
          setCartOpen(true);
          setState('cart-open');
        }}
        onConfirm={() => {
          if (!activeStore) {
            return;
          }

          setState('payment');
        }}
      />

      <PaymentModal
        open={state === 'payment'}
        onCancel={() => {
          setState('store-selection');
        }}
        onConfirm={(result) => {
          setSuccessData(result);
          setState('success');
        }}
      />

      <SuccessScreen
        customerName={currentUser?.name ?? ''}
        newBalance={successData?.newBalance ?? 0}
        onClose={() => {
          setSuccessData(null);
          setState('idle');
          setCartOpen(false);
        }}
        open={state === 'success' && !!successData}
        qrPayload={successData?.qrPayload ?? ''}
        storeName={successData?.storeName ?? ''}
        storePhone={successData?.storePhone ?? ''}
        tikiEarned={successData?.tikiEarned ?? 0}
        tierId={successData?.tierId ?? 'rise'}
        tierUpMessage={successData?.tierUpMessage ?? null}
        transactionId={successData?.transactionId ?? ''}
      />
    </>
  );
}
