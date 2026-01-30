# Blizko - Rozpad funkcí

## Co už máme
- Základní CRUD eventů (název, popis, datum, místo, cena, kapacita)
- Registrace/přihlášení
- Mapa na detailu eventu
- Účast na eventu (join/leave)

---

## 1. Vytvořit událost → propagovat → prodat → dostat peníze

### Vytvoření eventu (rozšíření)
- [ ] Upload obrázků (cover + galerie) - potřeba file storage (Cloudflare R2 nebo S3)
- [ ] Náhled před publikací
- [ ] Draft/Published stavy (už máme v DB)

### Propagace
- [ ] Open Graph meta tagy (aby se hezky zobrazilo při sdílení)
- [ ] Sdílení: FB, WhatsApp, kopírovat link
- [ ] QR kód pro event

### Platby (Stripe)
- [ ] Stripe Connect - organizátor si propojí účet, aby mohl přijímat peníze
- [ ] Checkout flow - uživatel zaplatí kartou
- [ ] Webhook - po zaplacení se automaticky přidá jako účastník
- [ ] Split platby - platforma si bere X% (např. 10%), zbytek jde organizátorovi
- [ ] Refund při zrušení

### Co to potřebuje
| Služba | Účel | Cena |
|--------|------|------|
| Stripe | platby | ~1.5% + 6 Kč/transakce |
| Cloudflare R2 | obrázky | první 10GB zdarma |
| Resend | emaily (potvrzení) | 3000/měsíc zdarma |

---

## 2. Prozkoumat události → vybrat → zaplatit → zúčastnit se

### Objevování
- [ ] Fulltext vyhledávání (název, popis, místo)
- [ ] Filtry: kategorie, datum, cena (zdarma/placené), vzdálenost
- [ ] Řazení: datum, vzdálenost, popularita

### Výběr a platba
- [ ] Detail eventu s mapou (už máme)
- [ ] Pro zdarma: tlačítko "Přihlásit se"
- [ ] Pro placené: tlačítko "Zaplatit X Kč" → Stripe checkout
- [ ] Waitlist při plné kapacitě

### Po zaplacení
- [ ] Potvrzovací email s QR kódem
- [ ] Vstupenka v appce
- [ ] Organizátor: check-in (skenování QR)

---

## 3. Mapa

### Základní
- [ ] Zobrazit eventy jako piny na mapě
- [ ] Clustering při oddálení (aby se nepřekrývaly)
- [ ] Klik na pin → popup s názvem a odkazem

### Rozšířené
- [ ] Filtry přímo na mapě
- [ ] "Hledat v této oblasti" při posunu
- [ ] Geolokace - tlačítko "Eventy poblíž mě"

### Technicky
- Leaflet (open source, zdarma)
- OpenStreetMap tiles

---

## 4. Hodnocení a důvěra

### Hodnocení eventů
- [ ] Po skončení eventu může účastník ohodnotit (1-5 hvězd + komentář)
- [ ] Pouze účastníci můžou hodnotit
- [ ] Zobrazení průměru na detailu eventu

### Hodnocení organizátorů
- [ ] Agregované hodnocení ze všech eventů
- [ ] Zobrazení na profilu organizátora

### Důvěra
- [ ] Ověřený email (už máme)
- [ ] Počet uspořádaných/navštívených eventů
- [ ] Report tlačítko pro nahlášení problému

---

## 5. Sociální funkce

### Sledování
- [ ] Sledovat organizátora
- [ ] Feed eventů od sledovaných

### Notifikace
- [ ] Nový event od sledovaného
- [ ] Připomínka před eventem (den předem, hodinu předem)
- [ ] Změna/zrušení eventu

### Profily
- [ ] Veřejný profil uživatele
- [ ] Historie eventů
- [ ] Bio, lokalita

---

## Prioritní pořadí

**Fáze 1 - Platby** (základ byznysu)
1. Stripe Connect onboarding
2. Checkout pro placené eventy
3. Webhook + email potvrzení

**Fáze 2 - Objevování**
1. Mapa s clustery
2. Filtry a vyhledávání
3. Geolokace

**Fáze 3 - Důvěra**
1. Hodnocení po eventu
2. Profil organizátora s ratingem

**Fáze 4 - Social**
1. Sledování
2. Notifikace
3. Sdílení

---

## Technické závislosti

```
Stripe (platby)
    ↓
Email služba (potvrzení plateb)
    ↓
File storage (obrázky eventů)
    ↓
Push notifikace (volitelné, později)
```
