# 🎨 Ikone Setup

## ⚠️ Potrebne Ikone

Aplikacija traži sledeće ikone u `public` folderu:

1. **`icon-192x192.png`** - 192x192 piksela
2. **`icon-512x512.png`** - 512x512 piksela

## 📝 Kako Dodati Ikone

1. **Kreiraj ili preuzmi ikone** u PNG formatu
2. **Resize na potrebne veličine**:
   - 192x192 px za `icon-192x192.png`
   - 512x512 px za `icon-512x512.png`
3. **Postavi ih u `public` folder**
4. **Refresh aplikaciju** - ikone će se automatski učitati

## 🛠️ Online Alati za Resize

- https://www.iloveimg.com/resize-image
- https://www.resizepixel.com/
- https://imageresizer.com/

## ✅ Provera

Nakon što dodaš ikone:
1. Otvori aplikaciju u browseru
2. Proveri Chrome DevTools → Application → Manifest
3. Proveri da li se ikone učitavaju bez 404 grešaka

## 📱 Napomena

Ako nemaš ikone, aplikacija će raditi, ali će prikazivati 404 greške u konzoli. Ovo ne utiče na funkcionalnost aplikacije.
