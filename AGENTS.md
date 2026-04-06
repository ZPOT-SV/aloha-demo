# AGENTS.md — ALOHA LOYALTY

## Stack
Astro v4 (SSG) | React 18 Islands | TypeScript strict | 
Tailwind CSS v3 | Nano Stores | Leaflet.js | qrcode.react | pnpm

## Design Source
UI designs live in `aloha-loyalty.pen` (Pencil canvas — open in VS Code).
The .pen file is the single source of truth for all visual decisions.
Do NOT make layout or visual decisions independently.
When implementing a screen, request the exported spec from the canvas first.
Brand tokens in tailwind.config.mjs match the Pencil design system exactly.

## Rules
- No `any` in TypeScript — ever
- All UI copy in Spanish (es-SV)
- All data from src/data/ JSON files — no external API calls
- All new dependencies must be confirmed before installing
- Styling: Tailwind only, using brand tokens from tailwind.config.mjs
- State: Nano Stores atoms only, always init from localStorage with fallback
- Persistence: localStorage only

## Brand Tokens
brand:#800080 | cta:#FF00FF | highlight:#FFD700 | 
accent:#00FFFF | deep-cta:#FF1493 | bg:#FFFFFF

## Auth
Any non-empty credentials accepted. Admin: admin/admin123.
Session stored in localStorage under key: aloha_session

## Data
src/data/users.json | menu.json | stores.json | 
rewards.json | challenges.json | giftcards.json