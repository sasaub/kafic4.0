# 🍽️ QR Restoran - Moderan Sistem Naručivanja

Kompletan sistem za naručivanje hrane u restoranima putem QR koda, izgrađen sa Next.js 15.5.4, React 19 i Tailwind CSS.

## 🚀 Pokretanje Projekta

```bash
npm install
npm run dev
```

Aplikacija će biti dostupna na **http://localhost:3000**

## 📱 Funkcionalnosti

### Za Goste (`/guest`)
- **QR kod sistem** - Skeniranje stola za pristup meniju
- **Interaktivan meni** - Pregled jela po kategorijama
- **Korpa za naručivanje** - Dodavanje/uklanjanje stavki
- **Instant naručivanje** - Direktno slanje narudžbine konobaru
- **Prilagođljiv broj stola** - Mogućnost promene broja stola

### Za Konobare (`/waiter`)
- **Real-time narudžbine** - Automatsko prikazivanje novih narudžbina
- **Upravljanje statusom** - Novo → U pripremi → Spremno → Dostavljeno
- **Prioritet narudžbina** - 🔴 Visok, 🟡 Srednji, 🟢 Nizak (automatski na osnovu cene)
- **Filter opcije** - Aktivne ili sve narudžbine
- **Statistika u realnom vremenu** - Pregled broja narudžbina po statusu
- **Štampanje računa** - Print funkcionalnost za svaku narudžbinu
- **Mobilna optimizacija** - Prilagođen za telefon/tablet

### Admin Panel (`/admin`)
- **Dashboard** - Pregled statistike i aktivnosti
- **Upravljanje menijem** (`/admin/menu`)
  - Dodavanje novih jela
  - Izmena postojećih
  - Brisanje jela
  - Organizacija po kategorijama
- **Upravljanje narudžbama** (`/admin/orders`)
  - Pregled svih narudžbina
  - Ažuriranje statusa
  - Filter po statusu
- **Upravljanje stolovima** (`/admin/tables`)
  - Pregled svih stolova
  - QR kodovi za svaki sto
  - Status stolova (Slobodan/Zauzet/Rezervisan)
  - Preuzimanje QR kodova

## 🎯 Kako Funkcioniše Sistem

1. **Gost skenira QR kod** → otvara se `/guest` stranica sa menijem
2. **Gost bira jela** → dodaje u korpu i klikne "Naruči"
3. **Narudžbina se automatski pojavljuje** na konobar panelu (`/waiter`)
4. **Konobar upravlja narudžbinom**:
   - Prihvata narudžbu
   - Označi kao spremno kada je jelo gotovo
   - Štampa račun
   - Dostavi gostima
5. **Admin prati sve** kroz Admin Panel

## 🛠️ Tehnologije

- **Next.js 15.5.4** - React framework sa App Router
- **React 19.1.0** - UI biblioteka
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Context API** - State management za narudžbine
- **Turbopack** - Ultra-brz bundler

## 📂 Struktura Projekta

```
qr-restaurant/
├── app/
│   ├── context/
│   │   └── OrderContext.tsx      # Globalni state za narudžbine
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── menu/page.tsx         # Upravljanje menijem
│   │   ├── orders/page.tsx       # Upravljanje narudžbama
│   │   └── tables/page.tsx       # Upravljanje stolovima
│   ├── guest/
│   │   └── page.tsx              # Stranica za goste
│   ├── waiter/
│   │   └── page.tsx              # Konobar panel
│   ├── layout.tsx                # Root layout sa OrderProvider
│   ├── page.tsx                  # Početna stranica
│   └── globals.css               # Globalni stilovi
├── package.json
└── README.md
```

## 🎨 Design

- **Responsivni dizajn** - Radi na svim uređajima
- **Moderna UI** - Čist i intuitivan interfejs
- **Brze animacije** - Smooth transitions
- **Jasna navigacija** - Lako snalaženje

## 💡 Napomene

- **State Management**: Koristi React Context API za deljenje narudžbina
- **Real-time sinhronizacija**: Sve stranice dele isti state
- **Print funkcionalnost**: Browser native print sa formatiranim računom
- **Automatski prioritet**: Narudžbine > 2000 RSD = visok, > 1000 RSD = srednji

## 📄 Licenca

Projekat je kreiran za potrebe QR restoran sistema.

---

**Napravljen sa ❤️ koristeći Next.js i React**
