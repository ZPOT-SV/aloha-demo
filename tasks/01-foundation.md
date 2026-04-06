# Session 01 — Foundation

## Goal
Build the entire data and configuration layer. No UI. No pages.
DoD: `pnpm dev` runs with zero errors. All types compile. 
Mock data is importable from src/data/.

## Design Reference
Before writing any component or page in this session, read the 
Pencil design via MCP. The relevant frames for this session are:

Session 01 → No UI — skip Pencil
Session 02 → SCREEN 1 (Landing), SCREEN 2 (Auth Modal)
Session 03 → SCREEN 3 (Dashboard), SCREEN 8 (Store Locator)
Session 04 → SCREEN 4 (Menu), SCREEN 5 (Purchase Popover), 
             SCREEN 6 (QR Modal), SCREEN 7 (WhatsApp Panel)
Session 05 → SCREEN 11 (Admin Dashboard), SCREEN 12 (Award Points)
Session 06 → SCREEN 9 (Challenges), SCREEN 10 (Gift Cards), 
             STUB A (Referidos), STUB B (Geolocalización)

Implement pixel-accurate to the canvas. If a detail in the canvas 
conflicts with the task description, the canvas wins.

## Task 1 — tailwind.config.mjs
Add custom color tokens under theme.extend.colors:
  brand: '#800080'
  cta: '#FF00FF'
  highlight: '#FFD700'
  accent: '#00FFFF'
  deep-cta: '#FF1493'
  surface: '#F5F5F5'
  text-muted: '#6B7280'

## Task 2 — astro.config.mjs
Configure: React integration, Tailwind integration, 
static output mode, Netlify adapter (@astrojs/netlify).

## Task 3 — src/types/index.ts
Create strict TypeScript interfaces for all 7 entities:

User         { id, username, name, role: 'customer'|'admin', 
               tikiBalance, tierId, createdAt }

Transaction  { id, userId, storeId, items: MenuItem[], 
               tikiEarned, qrPayload, timestamp }

MenuItem     { id, name, description, category: 'bebidas'|'bowls'|'temporada',
               priceUSD, tikiEarn, imageUrl }

StoreLocation { id, name, address, phone, hours, 
                lat, lng }

Reward       { id, name, description, tikiCost, 
               isActive, expiresAt }

Challenge    { id, name, description, targetCount, 
               currentCount, bonusTiki, 
               isCompleted, isLocked }

GiftCard     { id, fromUserId, toUserId, valueUSD, 
               valueTiki, isRedeemed, createdAt }

## Task 4 — src/data/ (all mock JSON files)
All user-facing strings in Spanish.

users.json — 3 users:
  - { id:"u1", username:"carlos", name:"Carlos Martínez", 
      role:"customer", tikiBalance:142, tierId:"viajero" }
  - { id:"u2", username:"maria", name:"María López", 
      role:"customer", tikiBalance:32, tierId:"explorador" }
  - { id:"u3", username:"admin", name:"Administrador", 
      role:"admin", tikiBalance:0, tierId:null }

menu.json — 6 items (2 bebidas, 2 bowls, 2 temporada):
  Bebidas: "Frappé Tropical" $4.50, "Limonada de Coco" $3.00
  Bowls: "Bowl Hawaiano" $7.50, "Bowl Verde" $6.50
  Temporada: "Smoothie Mango" $4.00, "Bowl Veranero" $8.00

stores.json — 3 locations in El Salvador:
  - Aloha Beverages Multiplaza (lat:13.6929, lng:-89.2182)
  - Aloha Bowls Santa Elena (lat:13.6789, lng:-89.2456)
  - Aloha Express San Benito (lat:13.7012, lng:-89.2334)
  Each with phone, hours: "Lunes a Domingo 8:00 AM – 8:00 PM"

rewards.json — 3 rewards:
  "Bebida Gratis" (50 tikis), "Descuento 20%" (80 tikis), 
  "Bowl Gratis" (120 tikis)

challenges.json — 4 challenges:
  "Comprador Frecuente" target:3 current:2 bonus:20 (in progress)
  "Fan de los Bowls" target:5 current:5 bonus:30 (completed)
  "Madrugador" target:2 current:0 bonus:15 (in progress)
  "Embajador" target:1 current:0 bonus:50 (locked)

giftcards.json — 2 gift cards (one received by u1, one redeemed)

## Task 5 — src/stores/index.ts
All 7 Nano Store atoms. Each must:
  1. Import its TypeScript type from src/types/index.ts
  2. Initialize from localStorage with a safe fallback
  3. Include a localStorage subscription to auto-persist on change
  4. Export a typed setter function alongside the atom

Atoms:
  userSession    atom<User | null>         key: aloha_session
  tikiBalance    atom<number>              key: aloha_tikis
  transactionHistory  atom<Transaction[]>  key: aloha_transactions
  activeRewards  atom<Reward[]>            key: aloha_rewards
  challenges     atom<Challenge[]>         key: aloha_challenges
  giftCards      atom<GiftCard[]>          key: aloha_giftcards
  selectedStore  atom<StoreLocation | null> key: aloha_store