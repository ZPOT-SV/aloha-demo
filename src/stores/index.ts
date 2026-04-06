import { atom } from 'nanostores';

import challengesData from '../data/challenges.json';
import giftCardsData from '../data/giftcards.json';
import rewardsData from '../data/rewards.json';
import type {
  CartItem,
  Challenge,
  GiftCard,
  MenuItem,
  Reward,
  StoreLocation,
  Transaction,
  User
} from '../types';

const isBrowser = typeof window !== 'undefined';

const fallbackChallenges = challengesData as Challenge[];
const fallbackGiftCards = giftCardsData as GiftCard[];
const fallbackRewards = rewardsData as Reward[];

function readFromStorage<T>(key: string, fallbackValue: T): T {
  if (!isBrowser) {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallbackValue;
  }
}

function persistStore<T>(key: string, store: ReturnType<typeof atom<T>>): void {
  if (!isBrowser) {
    return;
  }

  store.subscribe((value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  });
}

export const userSession = atom<User | null>(
  readFromStorage<User | null>('aloha_session', null)
);

export function setUserSession(value: User | null): void {
  userSession.set(value);
}

persistStore('aloha_session', userSession);

export const cart = atom<CartItem[]>(readFromStorage<CartItem[]>('aloha_cart', []));

export function setCart(value: CartItem[]): void {
  cart.set(value);
}

export function addToCart(item: MenuItem): void {
  const currentCart = cart.get();
  const existingItem = currentCart.find((entry) => entry.item.id === item.id && entry.item.name === item.name);

  if (existingItem) {
    cart.set(
      currentCart.map((entry) =>
        entry.item.id === item.id && entry.item.name === item.name
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      )
    );
    return;
  }

  cart.set([...currentCart, { item, quantity: 1 }]);
}

export function removeFromCart(itemId: string): void {
  cart.set(cart.get().filter((entry) => entry.item.id !== itemId));
}

export function updateQuantity(itemId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }

  cart.set(
    cart.get().map((entry) =>
      entry.item.id === itemId ? { ...entry, quantity } : entry
    )
  );
}

export function clearCart(): void {
  cart.set([]);
}

persistStore('aloha_cart', cart);

export const cartOpen = atom<boolean>(false);

export function setCartOpen(value: boolean): void {
  cartOpen.set(value);
}

export const tikiBalance = atom<number>(readFromStorage<number>('aloha_tikis', 0));

export function setTikiBalance(value: number): void {
  tikiBalance.set(value);
}

persistStore('aloha_tikis', tikiBalance);

export const transactionHistory = atom<Transaction[]>(
  readFromStorage<Transaction[]>('aloha_transactions', [])
);

export function setTransactionHistory(value: Transaction[]): void {
  transactionHistory.set(value);
}

persistStore('aloha_transactions', transactionHistory);

export const activeRewards = atom<Reward[]>(
  readFromStorage<Reward[]>('aloha_rewards', fallbackRewards)
);

export function setActiveRewards(value: Reward[]): void {
  activeRewards.set(value);
}

persistStore('aloha_rewards', activeRewards);

export const challenges = atom<Challenge[]>(
  readFromStorage<Challenge[]>('aloha_challenges', fallbackChallenges)
);

export function setChallenges(value: Challenge[]): void {
  challenges.set(value);
}

persistStore('aloha_challenges', challenges);

export const giftCards = atom<GiftCard[]>(
  readFromStorage<GiftCard[]>('aloha_giftcards', fallbackGiftCards)
);

export function setGiftCards(value: GiftCard[]): void {
  giftCards.set(value);
}

persistStore('aloha_giftcards', giftCards);

export const selectedStore = atom<StoreLocation | null>(
  readFromStorage<StoreLocation | null>('aloha_store', null)
);

export function setSelectedStore(value: StoreLocation | null): void {
  selectedStore.set(value);
}

persistStore('aloha_store', selectedStore);
