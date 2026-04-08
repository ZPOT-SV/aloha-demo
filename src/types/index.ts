export type UserRole = "customer" | "admin";
export type UserTierId = "rise" | "vibe" | "aloha";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  tikiBalance: number;
  tierId: UserTierId | null;
  createdAt: string;
}

export type MenuCategory =
  | "bowls"
  | "bebidas"
  | "temporada"
  | "build-your-own"
  | "gift-card";

export type MenuTag =
  | "regular"
  | "temporada"
  | "proteina"
  | "picante"
  | "personalizable";

export interface BuildYourOwnConfig {
  bases: string[];
  fruits: string[];
  toppings: string[];
  rules: {
    maxFruits: number;
    maxToppings: number;
  };
}

export interface GiftCardConfig {
  amounts: number[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: MenuCategory;
  tags: MenuTag[];
  priceUSD: number;
  price: Record<string, number>;
  tikiEarn: number;
  img_url: string;
  calories?: number;
  buildConfig?: BuildYourOwnConfig;
  giftCardConfig?: GiftCardConfig;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Transaction {
  id: string;
  userId: string;
  storeId: string;
  items: MenuItem[];
  tikiEarned: number;
  qrPayload: string;
  timestamp: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: {
    "lunes-viernes": string;
    sabado: string;
    domingo?: string;
  };
  lat: number;
  lng: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  tikiCost: number;
  emoji?: string;
  isActive: boolean;
  expiresAt: string | null;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetCount: number;
  currentCount: number;
  bonusTiki: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface GiftCard {
  id: string;
  fromUserId: string;
  toUserId: string;
  valueUSD: number;
  valueTiki: number;
  isRedeemed: boolean;
  createdAt: string;
}
