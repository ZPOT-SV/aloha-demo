# Session 02 — Layout Shell + Auth Modal

## Goal

Landing page renders. Auth modal works. Admin credentials route
to /admin. Customer credentials route to /dashboard.
Session persists on page reload.
DoD: Full auth flow works in browser with no console errors.

## Context

Types: src/types/index.ts
Stores: src/stores/index.ts — use userSession atom
Mock users: src/data/users.json

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

## Task 1 — src/layouts/Layout.astro

- Accepts props: { title: string, requiresAuth?: boolean }
- Includes NavBar component
- If requiresAuth=true and no session in localStorage → redirect to /
- Slot for page content
- Footer: "© 2026 Aloha Loyalty. El Salvador."

## Task 2 — src/components/NavBar.astro

Static structure. Two states:

Logged out:
Logo (left) | Inicio, Menú, Tiendas, Retos (center) |
"Iniciar Sesión" button (right, Magenta pill)

Logged in (read userSession from localStorage on client):
Logo (left) | same nav links |
Right: Golden Yellow chip showing tikiBalance + "Tikis" +
tier emoji + username | "Salir" link

## Task 3 — src/pages/index.astro

Use Layout.astro (requiresAuth: false).
Static content only — no React islands except AuthModal.

Sections:
Hero: "Acumulá Tikis, Viví la Experiencia" (h1)
"Ganás 1 Tiki Point por cada $1 que comprás" (subtitle)
Two buttons: "Empezá Ahora" (triggers auth modal, Magenta)
"Ver Menú" (links to /menu, Purple outline)

Features strip (3 cols):
🌺 "Acumulá Tikis" | 🎁 "Canjeá Premios" | ⚡ "Completá Retos"

Tier cards (3 cols):
🌺 Explorador (0–49 Tikis) | 🌊 Viajero (50–149) |
🏄 Aloha VIP (150+)
Each card: tier name, badge, point range, one sample benefit

AuthModal island: client:load, hidden by default,
triggered by "Empezá Ahora" button

## Task 4 — src/components/AuthModal.tsx (React Island)

Two tabs: "Iniciar Sesión" | "Registrarse"

Shared behavior:

- Any non-empty username + password → accepted
- Match username against src/data/users.json (import statically)
- If username === 'admin' → set userSession, redirect to /admin
- Any other username → set userSession with that user's data
  (or create a new mock session if username not in JSON)
- Write session to localStorage under key: aloha_session
- Initialize tikiBalance atom from user data

Tab A — Iniciar Sesión:
Input: "Usuario" | Input: "Contraseña" (show/hide toggle)
Button: "Entrar" (Magenta pill, full width)
Link: "¿No tenés cuenta? Registrate"
Note (muted): "Demo: usá cualquier usuario y contraseña"
Admin hint (very small): "Admin: admin / admin123"

Tab B — Registrarse:
Inputs: "Nombre completo", "Usuario", "Contraseña",
"Confirmar contraseña"
Button: "Crear Cuenta" (Magenta pill, full width)

Modal: centered, backdrop blur, closeable with Escape or clicking outside.
