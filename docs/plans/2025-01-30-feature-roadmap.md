# Blizko - Projektový plán funkcí

> Vytvořeno: 2025-01-30
> Kontext: Mix komunitních a komerčních eventů, kompletní propagační systém, Stripe platby

---

## 1. INFRASTRUKTURA & ZÁKLAD

### Již existuje ✓
- Monorepo (client/server/shared)
- PostgreSQL + Prisma ORM
- Autentizace (BetterAuth)
- Základní Event model (title, description, date, location, price, capacity)
- EventParticipant model
- Leaflet mapa na detailu eventu
- CRUD pro eventy

### K dobudování
- [ ] File storage pro obrázky eventů (nyní jen `imageUrl` string)
- [ ] Email služba (pro notifikace, potvrzení)
- [ ] Background jobs (pro plánované úkoly)

---

## 2. PLATEBNÍ BRÁNA (Stripe)

### Nové modely
- `Payment` - id, eventId, userId, amount, currency, stripePaymentIntentId, status, createdAt
- `Payout` - id, organizerId, stripeTransferId, amount, status, createdAt
- Rozšířit `User` o `stripeCustomerId`, `stripeAccountId` (pro Connect)

### Backend
- [ ] Stripe SDK integrace
- [ ] Stripe Connect onboarding pro organizátory (aby mohli přijímat peníze)
- [ ] Checkout flow - vytvoření PaymentIntent
- [ ] Webhook handler pro potvrzení platby
- [ ] Automatické přiřazení účastníka po úspěšné platbě
- [ ] Refund logika při zrušení eventu/účasti
- [ ] Split platby (platforma si bere X%, zbytek organizátorovi)

### Frontend
- [ ] Stripe Elements pro platební formulář
- [ ] Checkout stránka s přehledem objednávky
- [ ] Potvrzení platby / error states
- [ ] Organizátor: Stripe Connect onboarding flow
- [ ] Organizátor: přehled příjmů a výplat

---

## 3. EVENTY - KOMPLETNÍ FLOW

### 3.1 Vytvoření eventu (rozšíření)
- [ ] Multi-step formulář (základní info → místo → cena/kapacita → obrázky)
- [ ] Upload obrázků (cover + galerie)
- [ ] Náhled před publikací
- [ ] Draft/Published stavy (již v modelu ✓)
- [ ] Opakující se eventy (weekly, monthly) - volitelné

### 3.2 Propagace
- [ ] SEO meta tagy pro sdílení (Open Graph)
- [ ] Sdílení na sociální sítě (FB, WhatsApp, kopírovat link)
- [ ] QR kód pro event
- [ ] Embed widget pro externí weby

### 3.3 Prodej / Registrace
- [ ] Rozlišení: zdarma vs. placené
- [ ] Zdarma: jednoduchá registrace (již funguje ✓)
- [ ] Placené: Stripe checkout
- [ ] Waitlist při plné kapacitě
- [ ] Potvrzovací email s QR kódem/vstupenkou

### 3.4 Účast
- [ ] Check-in systém (organizátor skenuje QR)
- [ ] Seznam účastníků pro organizátora
- [ ] Zrušení účasti (s refund logikou pro placené)

---

## 4. OBJEVOVÁNÍ EVENTŮ

### 4.1 Mapa
- [ ] Cluster markery při oddálení
- [ ] Filtry na mapě (kategorie, datum, cena)
- [ ] "Hledat v této oblasti" při posunu mapy
- [ ] Geolokace - zobrazit eventy kolem mě

### 4.2 Seznam / Vyhledávání
- [ ] Fulltext vyhledávání (title, description)
- [ ] Filtry: kategorie, datum, cena (zdarma/placené), vzdálenost
- [ ] Řazení: datum, vzdálenost, popularita
- [ ] Infinite scroll / pagination

### 4.3 Doporučení
- [ ] "Podobné eventy" na detailu
- [ ] Eventy od organizátorů, které sleduji
- [ ] Personalizované doporučení (na základě historie)

---

## 5. HODNOCENÍ & DŮVĚRA

### Nové modely
- `Review` - id, eventId, reviewerId, organizerRating, eventRating, comment, createdAt
- `UserTrust` - id, userId, verifiedEmail, verifiedPhone, reviewCount, avgRating

### Funkce
- [ ] Hodnocení eventu po účasti (1-5 hvězd + komentář)
- [ ] Hodnocení organizátora
- [ ] Zobrazení průměrného hodnocení na profilu organizátora
- [ ] Zobrazení hodnocení na detailu eventu
- [ ] Ověření uživatele (email ✓, telefon, sociální sítě)
- [ ] "Trust score" indikátor na profilu
- [ ] Report nevhodného obsahu/uživatele

---

## 6. SOCIÁLNÍ FUNKCE

### Nové modely
- `Follow` - id, followerId, followingId, createdAt
- `Notification` - id, userId, type, title, body, data, read, createdAt

### 6.1 Sledování
- [ ] Sledovat/přestat sledovat uživatele
- [ ] Seznam sledujících / sledovaných
- [ ] Feed eventů od sledovaných organizátorů

### 6.2 Notifikace
- [ ] In-app notifikace (bell icon)
- [ ] Push notifikace (web push)
- [ ] Email notifikace (konfigurovatelné)
- [ ] Typy: nový event od sledovaného, připomínka eventu, změna eventu, nový follower

### 6.3 Profil uživatele
- [ ] Veřejný profil s bio, neighborhood
- [ ] Historie eventů (organizované / zúčastněné)
- [ ] Hodnocení a recenze
- [ ] Odznaky/achievementy (volitelné)

### 6.4 Interakce
- [ ] Komentáře pod eventem (dotazy před akcí)
- [ ] "Zajímá mě" / bookmark
- [ ] Pozvat přátele na event

---

## 7. PRIORITIZOVANÝ ROADMAP

### Fáze 1 - MVP plateb (2-3 týdny)
1. Stripe Connect onboarding pro organizátory
2. Checkout flow pro placené eventy
3. Webhook + automatické přiřazení účastníka
4. Základní email notifikace (potvrzení nákupu)

### Fáze 2 - Objevování (1-2 týdny)
1. Mapa s filtry a geolokací
2. Fulltext vyhledávání
3. Vylepšený seznam s filtry

### Fáze 3 - Důvěra (1-2 týdny)
1. Hodnocení po eventu
2. Zobrazení hodnocení na profilech
3. Report systém

### Fáze 4 - Sociální (2-3 týdny)
1. Follow systém
2. Notifikace (in-app + email)
3. Sdílení na sociální sítě
4. Komentáře

### Fáze 5 - Polish (průběžně)
1. Check-in systém
2. QR vstupenky
3. Personalizovaná doporučení
4. Push notifikace

---

## 8. TECHNICKÉ ZÁVISLOSTI

```
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUKTURA                          │
├─────────────────────────────────────────────────────────────┤
│  File Storage (S3/Cloudflare R2)                           │
│  Email Service (Resend/Postmark)                           │
│  Background Jobs (BullMQ + Redis / Inngest)                │
│  Push Notifications (web-push)                             │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PLATEBNÍ BRÁNA                           │
├─────────────────────────────────────────────────────────────┤
│  Stripe Connect ──► Checkout ──► Webhooks ──► Payouts      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CORE FEATURES                             │
├─────────────────────────────────────────────────────────────┤
│  Events (CRUD, Search, Map)                                │
│  Hodnocení & Důvěra                                        │
│  Sociální (Follow, Notifikace)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. DOPORUČENÉ TECHNOLOGIE

| Oblast | Doporučení | Alternativa |
|--------|------------|-------------|
| File Storage | Cloudflare R2 | AWS S3 |
| Email | Resend | Postmark, SendGrid |
| Background Jobs | Inngest | BullMQ + Redis |
| Push Notifications | web-push | OneSignal |
| Fulltext Search | PostgreSQL tsvector | Meilisearch |
| QR Codes | qrcode (npm) | - |
