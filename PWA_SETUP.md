# 📱 PWA Setup Guide

## ✅ Šta je Urađeno

1. **Manifest fajl** - `app/manifest.ts` (Next.js automatski generiše `/manifest.json`)
2. **Metadata** - PWA metadata u `app/layout.tsx`
3. **Service Worker** - `public/sw.js` (opciono, za offline podršku)
4. **Icon Generator** - `public/icon-placeholder.html` (tool za kreiranje ikona)

## 🎨 Kreiranje Ikona

### Opcija 1: Koristi Icon Generator (Najlakše)

1. Otvori `public/icon-placeholder.html` u browseru
2. Klikni "Download 192x192" i "Download 512x512"
3. Sačuvaj fajlove u `public` folder kao:
   - `icon-192x192.png`
   - `icon-512x512.png`

### Opcija 2: Koristi Online Tool

1. Idi na https://www.favicon-generator.org/ ili https://realfavicongenerator.net/
2. Upload svoju ikonu (minimalno 512x512px)
3. Download generisane ikone
4. Kopiraj `icon-192x192.png` i `icon-512x512.png` u `public` folder

### Opcija 3: Koristi Sharp Script

```bash
# Instaliraj sharp
npm install --save-dev sharp

# Kreiraj icon-source.png (512x512px) u public folderu
# Zatim pokreni:
node scripts/generate-icons.js
```

## 🧪 Testiranje PWA

### Chrome DevTools

1. Otvori aplikaciju u Chrome
2. F12 → Application tab
3. Proveri:
   - **Manifest** - treba da vidi manifest.json
   - **Service Workers** - treba da vidi sw.js (ako je aktiviran)
   - **Application** → **Manifest** - proveri da li su ikone učitane

### Mobile Test

1. Otvori aplikaciju na mobilnom telefonu
2. U Chrome/Safari: Menu → "Add to Home Screen"
3. Aplikacija će se pojaviti kao standalone app

## 🔧 Aktivacija Service Worker-a (Opciono)

Service Worker je kreiran ali nije automatski aktiviran. Da ga aktiviraš:

1. Dodaj u `app/layout.tsx`:

```typescript
'use client';

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  }
}, []);
```

**Napomena**: Service Worker nije obavezan za osnovni PWA, ali omogućava offline funkcionalnost.

## ✅ Checklist

- [ ] Ikone kreirane (`icon-192x192.png`, `icon-512x512.png`)
- [ ] Manifest testiran u Chrome DevTools
- [ ] Testirano na mobilnom telefonu
- [ ] "Add to Home Screen" radi
- [ ] Aplikacija se otvara kao standalone app

## 🐛 Troubleshooting

### Manifest se ne učitava

- Proveri da li `app/manifest.ts` postoji
- Proveri da li Next.js generiše `/manifest.json` (build i proveri)
- Proveri console za greške

### Ikone se ne prikazuju

- Proveri da li fajlovi postoje u `public` folderu
- Proveri putanje u manifest-u
- Proveri da li su fajlovi dostupni na `/icon-192x192.png`

### "Add to Home Screen" ne radi

- Proveri da li je aplikacija dostupna preko HTTPS (ili localhost)
- Proveri da li manifest ima sve obavezne polja
- Proveri da li su ikone validne (PNG format, tačne dimenzije)

## 📚 Dodatni Resursi

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Next.js PWA](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
