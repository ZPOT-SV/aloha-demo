# Session 05 — Admin Panel

## Goal
Admin login routes to /admin. All 4 admin sections render 
with mock data. Award points updates customer balance 
in localStorage. WhatsApp panel fires on every admin action.
DoD: Full admin flow works. No customer routes accessible 
     without re-logging as customer.

## Context
Stores: userSession, tikiBalance, activeRewards atoms
Data: src/data/users.json, src/data/rewards.json
Reuse: src/components/WhatsAppPanel.tsx
Layout: Create a separate admin layout (no customer nav)

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

## Task 1 — src/layouts/AdminLayout.astro
Sidebar (Purple bg, white text, 240px fixed):
  Logo: "ALOHA LOYALTY — Admin"
  Nav links (active state: Magenta left border, white):
    Dashboard → /admin
    Planes de Recompensa → /admin/recompensas
    Otorgar Puntos → /admin/otorgar
    Canjear Cupón → /admin/canjear
  Bottom: "Cerrar Sesión" link (clears localStorage, → /)
Main content area: white, full height, 24px padding
Guard: if userSession.role !== 'admin' → redirect to /

## Task 2 — src/pages/admin/index.astro
Use AdminLayout.
4 stat cards (2x2 grid). React island: <AdminDashboard client:load />

src/components/admin/AdminDashboard.tsx:
  Reads: activeRewards atom, src/data/users.json (static import)
  Stat cards:
    "Tikis Emitidos" — sum of all user tikiBalances from JSON
    "Recompensas Activas" — count of isActive rewards
    "Usuarios Registrados" — count from users.json
    "Total Canjes" — hardcoded mock: 47

  Rewards table below cards:
  Columns: Nombre | Costo en Tikis | Estado | Vencimiento | Acciones
  "Editar" (Purple outline btn) — opens inline edit mode
  "Desactivar/Activar" (toggles isActive in activeRewards atom)
  "Crear Plan" button (Magenta, top right) → opens CreateRewardModal

  CreateRewardModal:
    Inputs: Nombre, Costo en Tikis (number), Descripción, 
            Vencimiento (date picker)
    "Guardar" → prepends to activeRewards atom + localStorage
    "Cancelar" → close modal

## Task 3 — src/pages/admin/otorgar.astro
Use AdminLayout. React island: <AwardPoints client:load />

src/components/admin/AwardPoints.tsx:
  Step 1 — User search:
    Searchable select of users from users.json (role: customer only)
    Shows selected user card: name, current tikiBalance, tier badge
  
  Step 2 — Award form:
    Number input: "Cantidad de Tiki Points"
    Text input: "Motivo (opcional)"
    "Otorgar Tikis" button (Magenta)

  On confirm:
    - Update that user's tikiBalance in localStorage 
      (key: aloha_user_[userId]_balance)
    - Show WhatsAppPanel with message:
      "El cliente [name] recibió [X] Tiki Points por parte 
       del administrador. Motivo: [motivo]. 
       — Sistema Aloha Loyalty"
    - Show success toast: "✓ Tikis otorgados correctamente"

## Task 4 — src/pages/admin/canjear.astro
Use AdminLayout. React island: <RedeemCoupon client:load />

src/components/admin/RedeemCoupon.tsx:
  Input: "ID de Transacción o Cupón" (e.g. TXN-00421)
  "Validar y Canjear" button (Magenta)
  
  On confirm (any non-empty ID accepted):
    - Mark as redeemed in localStorage (key: aloha_redeemed_[id])
    - Show success state: "✓ Cupón #[id] canjeado exitosamente"
    - Show WhatsAppPanel with message:
      "El cupón #[id] fue canjeado exitosamente en tienda. 
       — Sistema Aloha Loyalty"