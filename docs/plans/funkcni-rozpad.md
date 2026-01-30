# Zokoli - Rozpad funkcí

## Tech stack

- Frontend: React 19, React Router 7, Vite, Tailwind, Radix UI
- Backend: Hono, tRPC, Prisma, PostgreSQL
- Auth: BetterAuth (session-based)
- Platby: Stripe Connect
- Mapy: Leaflet + OpenStreetMap
- Emaily: Resend
- Storage: Cloudflare R2

---

## Co už máme
- Základní CRUD eventů
- Registrace/přihlášení
- Mapa na detailu eventu
- Join/leave na event

---

## 1. Vytvořit událost, propagovat, prodat, dostat peníze

Vytvoření eventu:
- Upload fotek (potřeba storage, asi R2)
- Náhled před publikací
- Draft stavy

Propagace:
- OG meta tagy
- Share buttony (FB, WhatsApp, link)
- QR kód

Platby přes Stripe:
- Stripe Connect - organizátor si propojí účet
- Checkout - uživatel zaplatí
- Webhook - po platbě se přidá jako účastník
- Split - platforma si bere procento, zbytek organizátorovi
- Refundy

---

## 2. Prozkoumat, vybrat, zaplatit, zúčastnit se

Objevování:
- Fulltext search
- Filtry (kategorie, datum, cena, vzdálenost)
- Řazení

Platba:
- Pro zdarma jen přihlásit
- Pro placené checkout
- Waitlist když plno

Po zaplacení:
- Email s QR
- Vstupenka v appce
- Check-in pro organizátora

---

## 3. Mapa

- Piny na mapě
- Clustering při oddálení
- Popup s názvem
- Filtry na mapě
- Hledat v oblasti
- Geolokace

Leaflet + OpenStreetMap, je to zadarmo.

---

## 4. Hodnocení a důvěra

Hodnocení:
- Po skončení eventu (1-5 hvězd + komentář)
- Jen účastníci můžou hodnotit
- Průměr na detailu

Organizátor:
- Agregované hodnocení ze všech eventů

Důvěra:
- Ověřený email
- Počet eventů
- Report button

---

## 5. Sociální funkce

- Sledovat organizátora
- Feed od sledovaných

Notifikace:
- Nový event od sledovaného
- Připomínka před eventem
- Změna/zrušení

Profily:
- Veřejný profil
- Historie eventů
- Bio

---
