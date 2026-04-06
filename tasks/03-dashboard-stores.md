# Session 03 — Customer Dashboard + Store Locator

## Goal
Dashboard shows live Tiki balance from Nano Store. Store locator 
renders Leaflet map with pins. Selecting a store persists to 
selectedStore atom.
DoD: Both pages render, store selection persists across page reloads.

## Context
Stores: src/stores/index.ts — tikiBalance, transactionHistory, 
        selectedStore, challenges atoms
Data: src/data/stores.json, src/data/challenges.json
Layout: src/layouts/Layout.astro (requiresAuth: true)

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

## Task 1 — src/pages/dashboard.astro
requiresAuth: true. Import Layout.astro.
Two-column layout (70/30 split):

Left column — React Islands:
  <TikiTracker client:load />
  <ChallengesWidget client:visible />
  Quick action buttons (static links): 
    "Ver Menú" → /menu | "Mis Tiendas" → /tiendas | 
    "Gift Cards" → /gift-cards

Right column — React Islands:
  <TransactionFeed client:visible />
  <SelectedStoreCard client:load />

## Task 2 — src/components/TikiTracker.tsx
Reads: tikiBalance atom, userSession atom
Displays:
  - Large balance number (animated count-up on mount using 
    CSS transition, not a library)
  - Tier badge with emoji based on balance:
      0–49: "🌺 Explorador" | 50–149: "🌊 Viajero" | 150+: "🏄 Aloha VIP"
  - Progress bar (Purple→Magenta gradient) showing progress 
    to next tier threshold
  - Label: "X Tikis para alcanzar [next tier]" or 
           "¡Sos Aloha VIP! Nivel máximo 🏄" if 150+

## Task 3 — src/components/TransactionFeed.tsx
Reads: transactionHistory atom
Shows last 5 transactions. Each row:
  - Item name + category chip
  - Store name
  - Date formatted: toLocaleDateString('es-SV')
  - "+X Tikis" Golden Yellow chip
  - QR icon button (opens QR modal — pass transaction.qrPayload)
Empty state: "Todavía no tenés transacciones. 
              ¡Simulá tu primera compra!"

## Task 4 — src/components/ChallengesWidget.tsx
Reads: challenges atom. Shows first 2 non-completed challenges.
Each: name, progress bar (currentCount/targetCount), 
      "+X Tikis al completar" badge.
Link: "Ver todos los retos →" → /retos

## Task 5 — src/components/SelectedStoreCard.tsx
Reads: selectedStore atom
If store selected: store name, address, phone, 
                   "Cambiar tienda" link → /tiendas
If no store: "No seleccionaste tienda aún" + 
             "Seleccionar tienda" CTA → /tiendas

## Task 6 — src/pages/tiendas.astro
requiresAuth: true. Split layout (40/60):
Left panel (40%): <StoreList client:load />
Right panel (60%): <StoreMap client:load />

## Task 7 — src/components/StoreList.tsx
Reads: selectedStore atom, src/data/stores.json
Search input filters store list by name or address.
Each store card:
  - Name, address, phone, hours
  - "Seleccionar esta tienda" button
    → selected state: Magenta + checkmark, Purple left border on card
    → writes to selectedStore atom + localStorage