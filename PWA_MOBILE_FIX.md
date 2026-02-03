# 🔧 PWA Mobile Fix - Rešeni Problemi

## ✅ Šta je Popravljeno

### 1. **Service Worker Problemi**

**Problem**: Service Worker je hvatao sve request-e, uključujući API pozive, što je uzrokovalo greške na mobilnim uređajima.

**Rešenje**:
- Service Worker sada **ignoriše API pozive** (`/api/*`)
- Ignoriše non-GET request-e
- Ignoriše non-HTTP protokole
- Cache-uje samo statičke resurse (JS, CSS, slike)

### 2. **Service Worker Registracija**

**Problem**: Service Worker nije bio pravilno registrovan.

**Rešenje**:
- Kreiran `ServiceWorkerRegistration` komponenta
- Automatska registracija samo u produkciji
- Automatsko unregister-ovanje u development modu
- Praćenje update-a i auto-refresh

### 3. **Cache Strategija**

**Problem**: Stara cache strategija je blokirala API pozive.

**Rešenje**:
- Network-first za API pozive (ignorišu se)
- Cache-first za statičke resurse
- Automatsko čišćenje starih cache-ova

## 🧪 Kako Testirati

### 1. Build i Start

```bash
npm run build
npm start
```

### 2. Test na Desktopu

1. Otvori Chrome DevTools (F12)
2. Application → Service Workers
3. Proveri da li je service worker registrovan
4. Network tab → proveri da li API pozivi idu direktno (ne kroz cache)

### 3. Test na Mobilnom

1. Otvori aplikaciju na telefonu
2. Dodaj na Home Screen
3. Otvori kao PWA
4. Proveri da li API pozivi rade:
   - Login
   - Učitavanje menija
   - Učitavanje porudžbina
   - Kreiranje porudžbine

### 4. Debug na Mobilnom

**Chrome Remote Debugging**:
1. Na telefonu: Chrome → Settings → Developer tools → Enable USB debugging
2. Na računaru: `chrome://inspect`
3. Poveži telefon
4. Inspect PWA aplikaciju
5. Proveri Console za greške

**Safari (iOS)**:
1. Na Mac-u: Safari → Develop → [Tvoj iPhone] → [PWA]
2. Proveri Console

## 🐛 Česti Problemi i Rešenja

### Problem: API pozivi ne rade u PWA

**Rešenje**: Service Worker sada ignoriše `/api/*` pozive. Ako i dalje ima problema:
1. Proveri da li je service worker registrovan
2. Proveri Network tab u DevTools
3. Proveri da li API endpoint-i vraćaju pravilne odgovore

### Problem: Stranica se ne učitava

**Rešenje**: 
1. Obriši cache: Chrome → Settings → Privacy → Clear browsing data → Cached images and files
2. Unregister service worker: Chrome DevTools → Application → Service Workers → Unregister
3. Refresh stranicu

### Problem: Stare verzije se prikazuju

**Rešenje**:
- Service Worker automatski osvežava stranicu kada se detektuje nova verzija
- Možeš ručno: Chrome DevTools → Application → Service Workers → Update

### Problem: Manifest se ne učitava

**Rešenje**:
1. Proveri da li `/manifest.json` postoji (Next.js automatski generiše iz `app/manifest.ts`)
2. Proveri Chrome DevTools → Application → Manifest
3. Proveri da li su ikone dostupne

## 📱 Mobile-Specific Optimizacije

### Dodato u layout.tsx:
- `format-detection` - sprečava automatsko formatiranje telefona
- `msapplication-TileColor` - Windows tile color
- Poboljšana Apple Web App podrška

## ✅ Checklist

- [x] Service Worker ignoriše API pozive
- [x] Service Worker registrovan samo u produkciji
- [x] Cache strategija optimizovana
- [x] Auto-refresh na update
- [x] Mobile meta tagovi dodati
- [ ] Testirano na Android telefonu
- [ ] Testirano na iPhone-u
- [ ] Testirano sa offline/online prelazima

## 🔄 Sledeći Koraci

1. **Testiraj na realnom telefonu**
2. **Proveri performanse** - da li je brže sa service worker-om
3. **Testiraj offline funkcionalnost** (opciono)
4. **Monitoruj greške** u produkciji

## 📝 Napomene

- Service Worker radi **samo u produkciji** (`npm run build && npm start`)
- U development modu (`npm run dev`) service worker je automatski unregister-ovan
- API pozivi **uvek** idu direktno na server, nikad kroz cache
- Statički resursi se cache-uju za brže učitavanje
