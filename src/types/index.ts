export type UserRole = 'customer' | 'admin';
export type UserTierId = 'rise' | 'vibe' | 'aloha';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  tikiBalance: number;
  tierId: UserTierId | null;
  createdAt: string;
}

export type MenuParentCategory = 'bebidas' | 'bowls' | 'temporada';

export type MenuSubCategory =
  | 'cafes'
  | 'jugos'
  | 'dragon-fruit'
  | 'acai'
  | 'banana'
  | 'temporada';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuParentCategory;
  subCategory: MenuSubCategory;
  priceUSD: number;
  tikiEarn: number;
  imageUrl: string;
  calories?: number;
  sizesUSD?: { '12oz': number; '16oz': number };
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
    'lunes-viernes': string;
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
