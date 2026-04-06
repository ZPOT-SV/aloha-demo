# Session 04 — Menu Page + Complete Purchase Flow

## Goal
Full purchase flow works end-to-end: store gate → confirmation → 
Tiki update → QR modal → WhatsApp panel → tier toast.
DoD: Entire flow runs without console errors. 
     Tiki balance updates visibly on Dashboard after purchase.

## Context
Stores: tikiBalance, transactionHistory, selectedStore, 
        challenges, userSession atoms
Data: src/data/menu.json
Components to reuse: none yet — all new this session
Install if not present: qrcode.react

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

## Task 1 — src/pages/menu.astro
requiresAuth: true.
Category tab bar: "Bebidas" | "Bowls" | "Temporada"
Active tab controlled by URL query param ?categoria=bebidas (default)
Product grid (3 columns): <MenuItemCard /> per item, filtered by tab.
React island: <PurchaseFlow client:load /> (manages all purchase 
              modals globally — mounted once on page)

## Task 2 — src/components/MenuItemCard.tsx
Props: MenuItem
Displays: placeholder image div (brand-colored bg + category icon),
          name, category chip, "$X.XX USD", "+X Tikis" badge
Button behavior:
  - If selectedStore is null → disabled, shows 
    "Seleccioná una tienda primero" (muted, no hover)
  - If selectedStore set → "Simular Compra" (Magenta pill)
    onClick: emit a custom event with MenuItem data 
    that PurchaseFlow listens to

## Task 3 — src/components/PurchaseFlow.tsx
Orchestrates the 3-step post-purchase UI.
State machine: idle → confirming → qr → whatsapp → idle

Step 1 — PurchaseConfirmPopover (confirming state):
  Shows: item name + thumbnail, selected store name,
         price in USD, "+X Tiki Points" (highlighted),
         projected new balance
  "Confirmar Compra" (Magenta) | "Cancelar" (text link)

  On confirm:
    - Generate transactionId: "TXN-" + Date.now()
    - Build qrPayload: JSON.stringify({ 
        userId, transactionId, tikiEarned, timestamp 
      })
    - Update tikiBalance atom: current + tikiEarned
    - Prepend new Transaction to transactionHistory atom
    - Update challenge progress (increment currentCount for 
      relevant challenges by category)
    - Persist all to localStorage
    - Check tier threshold → if crossed, set tierUpFlag
    - Advance to qr state

Step 2 — QRModal (qr state):
  "¡Compra Registrada!" header + ✓ checkmark (Cyan)
  Large "+X Tiki Points" in Golden Yellow
  <QRCodeSVG value={qrPayload} size={200} /> from qrcode.react
  "Mostrá este código en tienda para validar tus Tiki Points."
  Transaction ID (muted small text)
  "Cerrar" (Purple outline) → advances to whatsapp state

Step 3 — WhatsAppPanel (whatsapp state):
  Reusable component — also used in Admin panel.
  Props: { storeName, phone, message }
  Displays:
    Header: "📲 Notificación Enviada a Tienda" 
            (Deep Pink left border)
    Store name + phone
    WhatsApp-style message bubble (green bg):
      "Hola, el cliente [userName] acumuló [X] Tiki Points 
       en su compra. Transacción #[txnId]. 
       — Sistema Aloha Loyalty"
    Timestamp: "Enviado hoy a las [current time es-SV]"
    "Entendido" button → idle state

Tier toast: if tierUpFlag is set, show floating toast 
(bottom-right, 4s duration):
  "🎉 ¡Subiste a [tier name]! Seguí acumulando Tikis."
  (Golden Yellow border, dark bg, white text)

## Task 4 — src/components/WhatsAppPanel.tsx
Extract as a standalone reusable component with props:
  { storeName: string, phone: string, 
    message: string, onDismiss: () => void }
This same component will be imported in the Admin panel (Session 5).