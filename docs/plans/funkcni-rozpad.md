# Blizko - Rozpad funkcí

## Co už máme
Základní CRUD eventů, registrace, mapa na detailu, join/leave na event.

---

## 1. Vytvořit událost, propagovat, prodat, dostat peníze

Vytvoření eventu - upload fotek (potřeba storage, asi R2), náhled před publikací, draft stavy.

Propagace - OG meta tagy aby se to hezky sdílelo, share buttony (FB, WhatsApp, link), QR kód.

Platby přes Stripe:
- Stripe Connect - organizátor si propojí účet
- Checkout - uživatel zaplatí
- Webhook - po platbě se přidá jako účastník
- Split - platforma si bere procento, zbytek organizátorovi
- Refundy

Služby co budeme potřebovat: Stripe (platby), R2 (obrázky), Resend (emaily).

---

## 2. Prozkoumat, vybrat, zaplatit, zúčastnit se

Objevování - fulltext search, filtry (kategorie, datum, cena, vzdálenost), řazení.

Platba - pro zdarma jen přihlásit, pro placené checkout, waitlist když plno.

Po zaplacení - email s QR, vstupenka v appce, check-in pro organizátora.

---

## 3. Mapa

Piny na mapě, clustering při oddálení, popup s názvem. Filtry na mapě, hledat v oblasti, geolokace.

Leaflet + OpenStreetMap, je to zadarmo.

---

## 4. Hodnocení a důvěra

Hodnocení eventu po skončení (1-5 hvězd + komentář), jen účastníci můžou hodnotit. Průměr na detailu.

Organizátor má agregované hodnocení ze všech eventů.

Ověřený email, počet eventů, report button.

---

## 5. Sociální funkce

Sledovat organizátora, feed od sledovaných.

Notifikace - nový event od sledovaného, připomínka před eventem, změna/zrušení.

Veřejný profil, historie eventů, bio.

---

## Pořadí

1. Platby (Stripe Connect, checkout, webhook)
2. Mapa a filtry
3. Hodnocení
4. Social
