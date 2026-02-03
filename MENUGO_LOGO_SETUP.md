# 🎨 MenuGo Logo Setup

## ✅ Šta je Urađeno

### 1. **Manifest Ažuriran**
- ✅ Ime aplikacije promenjeno na "MenuGo"
- ✅ Logo putanje ažurirane na `/menugo-logo-192x192.png` i `/menugo-logo-512x512.png`
- ✅ Theme color promenjen na plavu (#1E3A8A) koja odgovara MenuGo brendu
- ✅ Background color promenjen na belu (#FFFFFF)

### 2. **Layout Ažuriran**
- ✅ Title promenjen na "MenuGo - Moderan sistem naručivanja"
- ✅ Apple Web App title promenjen na "MenuGo"
- ✅ Icons ažurirane da koriste MenuGo logo
- ✅ Theme color ažuriran u viewport

### 3. **Fajlovi Ažurirani**
- ✅ `app/manifest.ts` - Next.js manifest
- ✅ `public/manifest.json` - PWA manifest
- ✅ `app/layout.tsx` - Metadata i viewport

## 📁 Potrebne Slike

Trebaju ti sledeće slike u `public` folderu:

1. **`menugo-logo-192x192.png`** - Logo 192x192 piksela
2. **`menugo-logo-512x512.png`** - Logo 512x512 piksela

## 🎨 Preporučene Veličine

- **192x192** - Za ikone, Apple touch icon, shortcuts
- **512x512** - Za PWA ikone, splash screen

## 📝 Kako Dodati Logo

1. **Sačuvaj MenuGo logo** u PNG formatu
2. **Kreiraj dve verzije**:
   - `menugo-logo-192x192.png` (192x192 px)
   - `menugo-logo-512x512.png` (512x512 px)
3. **Postavi ih u `public` folder**
4. **Refresh aplikaciju** - logo će se automatski učitati

## 🔧 Ako Nemaš Logo Slike

Ako još nemaš logo slike, možeš:
1. Koristiti online tool za resize (npr. https://www.iloveimg.com/resize-image)
2. Ili koristiti placeholder dok ne dobiješ finalne slike

## ✅ Provera

Nakon što dodaš logo slike:
1. Otvori aplikaciju u browseru
2. Proveri Chrome DevTools → Application → Manifest
3. Proveri da li se logo učitava
4. Testiraj na telefonu - dodaj na Home Screen i proveri logo

## 🎨 Boje

- **Theme Color**: `#1E3A8A` (tamno plava - odgovara MenuGo brendu)
- **Background Color**: `#FFFFFF` (bela)
