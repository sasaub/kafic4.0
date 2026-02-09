# Kako očistiti browser cache i Service Worker

## Problem
Kada se pojavi print dialog umesto direktnog slanja na štampač, to znači da browser koristi staru cached verziju stranice.

## Rešenje - Očisti cache i Service Worker

### Metod 1: Hard Refresh (NAJBRŽI)

**Chrome/Edge:**
1. Otvori stranicu konobara
2. Pritisni **Ctrl + Shift + R** (Windows/Linux)
3. Ili **Ctrl + F5**

**Firefox:**
1. Otvori stranicu konobara
2. Pritisni **Ctrl + Shift + R**
3. Ili **Ctrl + F5**

### Metod 2: Očisti cache kroz Developer Tools

1. Otvori Developer Tools (**F12**)
2. Idi na **Application** tab (Chrome) ili **Storage** tab (Firefox)
3. U levom meniju:
   - Klikni na **Service Workers**
   - Klikni **Unregister** pored svakog service worker-a
   - Klikni na **Cache Storage**
   - Desni klik na svaki cache → **Delete**
4. Refresh stranicu (**Ctrl + Shift + R**)

### Metod 3: Očisti sve podatke sajta

**Chrome/Edge:**
1. Otvori stranicu konobara
2. Klikni na **ikonicu brave** (levo od URL-a)
3. Klikni **Site settings**
4. Scroll dole i klikni **Clear data**
5. Potvrdi
6. Refresh stranicu

**Firefox:**
1. Otvori stranicu konobara
2. Klikni na **ikonicu brave** (levo od URL-a)
3. Klikni **Clear cookies and site data**
4. Potvrdi
5. Refresh stranicu

### Metod 4: Incognito/Private mode (ZA TESTIRANJE)

**Chrome/Edge:**
- Pritisni **Ctrl + Shift + N**

**Firefox:**
- Pritisni **Ctrl + Shift + P**

Otvori stranicu u incognito mode-u - neće koristiti cache.

## Provera da li je cache očišćen

1. Otvori Developer Tools (**F12**)
2. Idi na **Console** tab
3. Klikni "Prihvati i Štampaj" ili "Štampaj"
4. Trebalo bi da vidiš:
   ```
   🖨️ printReceipt POZVANA za order: 123
   📤 Šaljem na /api/print...
   📥 Response status: 200
   📥 Response data: { ok: true, message: "Print job queued", jobId: 456 }
   ✅ Štampanje uspešno poslato!
   ```

**Ako NE vidiš ove poruke** → cache nije očišćen, pokušaj ponovo.

**Ako vidiš print dialog** → stara verzija je još uvek učitana.

## Prevencija - Disable cache tokom development-a

1. Otvori Developer Tools (**F12**)
2. Idi na **Network** tab
3. Čekiraj **Disable cache** checkbox
4. Ostavi Developer Tools otvorene dok testiraš

## Za administratore - Force refresh za sve korisnike

Ako želiš da forsiraš sve korisnike da učitaju novu verziju:

### Opcija 1: Promeni Service Worker cache name

U `public/sw.js`:
```javascript
const CACHE_NAME = 'qr-restaurant-v2'; // Promeni v1 u v2
```

### Opcija 2: Dodaj version query parameter

U `app/layout.tsx` ili gde god učitavaš skripte:
```javascript
<script src="/sw.js?v=2"></script>
```

### Opcija 3: Unregister Service Worker programski

Dodaj u `app/layout.tsx`:
```javascript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
}, []);
```

## Provera verzije na serveru

```bash
cd /opt/qr-restaurant/releases/kafic4.0

# Proveri trenutni commit
git log -1 --oneline

# Trebalo bi da vidiš:
# b352ba1 Add emoji logging to track print function execution
```

Ako vidiš stariji commit, uradi:
```bash
git pull origin main
sudo systemctl restart qr-restaurant
```

## Troubleshooting

### Problem: I dalje se pojavljuje print dialog

**Mogući uzroci:**
1. Browser cache nije očišćen
2. Service Worker nije unregister-ovan
3. Server nije restartovan nakon git pull
4. Koristiš staru tab-u (otvori novu)

**Rešenje:**
1. Zatvori SVE tab-ove sa aplikacijom
2. Otvori Developer Tools (F12)
3. Application → Service Workers → Unregister all
4. Application → Cache Storage → Delete all
5. Zatvori browser POTPUNO
6. Otvori browser ponovo
7. Otvori stranicu u novom tab-u

### Problem: Console ne pokazuje emoji poruke

To znači da se koristi stara verzija koda.

**Rešenje:**
1. Proveri da li je server restartovan
2. Očisti browser cache (Metod 2 ili 3)
3. Hard refresh (Ctrl + Shift + R)

### Problem: Console pokazuje emoji poruke ali se i dalje pojavljuje print dialog

To je NEMOGUĆE - ako vidiš emoji poruke, znači da se izvršava nova verzija koja NE poziva window.print().

**Mogući uzrok:**
- Možda postoji neki drugi event listener koji poziva print?
- Možda browser extension?

**Provera:**
1. Testiraj u Incognito mode (bez extensions)
2. Proveri da li postoji neki drugi kod koji poziva print

## Brzi test

```bash
# Na serveru
cd /opt/qr-restaurant/releases/kafic4.0
git pull
sudo systemctl restart qr-restaurant

# U browser-u
# 1. Ctrl + Shift + R (hard refresh)
# 2. F12 (open console)
# 3. Klikni "Štampaj"
# 4. Proveri console output
```

Ako vidiš 🖨️ emoji → nova verzija je učitana ✅
Ako NE vidiš emoji → stara verzija, očisti cache ❌
