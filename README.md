# QR Restaurant Management System

Sistem za upravljanje restoranom sa QR kodovima, porudžbinama i mesečnim plaćanjima.

## Tehnologije

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **MySQL** - Baza podataka
- **Tailwind CSS** - Styling

## Instalacija

### 1. Kloniraj repozitorijum

```bash
git clone https://github.com/sasaub/kafic2.1.git
cd kafic2.1
```

### 2. Instaliraj dependencies

```bash
npm install
```

### 3. Postavi MySQL bazu podataka

```bash
# Prijavite se u MySQL
mysql -u root -p

# Pokrenite SQL skriptu
source lib/db-schema.sql
```

Ili ručno:

```sql
CREATE DATABASE qr_restaurant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_restaurant;
-- Zatim kopirajte SQL iz lib/db-schema.sql
```

### 4. Konfiguriši environment varijable

Kreiraj `.env.local` fajl:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=qr_restaurant

NODE_ENV=development
PORT=3000
```

### 5. Pokreni aplikaciju

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Struktura projekta

```
app/
├── api/              # API routes (backend)
│   ├── orders/       # Porudžbine
│   ├── menu/         # Meni stavke
│   ├── categories/   # Kategorije
│   ├── tables/       # Stolovi
│   └── auth/         # Autentifikacija
├── admin/            # Admin panel
├── waiter-admin/     # Konobar-admin panel
├── waiter/           # Konobar panel
├── kitchen/          # Kuhinja panel
├── guest/            # Gost panel (QR kod)
└── context/          # React Context providers

lib/
└── db.ts             # MySQL konekcija
```

## Funkcionalnosti

### Admin
- Upravljanje menijem (dodavanje, izmena, brisanje)
- Upravljanje kategorijama
- Upravljanje stolovima
- Pregled zarade (po danu ili periodu)
- Statistika stolova po zaradi

### Konobar-Admin
- Kreiranje porudžbina
- Potvrđivanje pristiglih porudžbina
- Automatsko prosleđivanje hrane na kuhinju
- Podešavanje štampača
- Upravljanje mesečnim stolovima
- Unos uplata za mesečne stolove

### Konobar
- Pregled novih i svih porudžbina
- Ažuriranje statusa porudžbina
- Štampanje računa

### Kuhinja
- Pregled novih porudžbina sa hranom
- Prihvatanje porudžbina
- Prikaz komentara uz hranu

### Gost (QR kod)
- Pregled menija
- Kreiranje porudžbine

## Mesečni stolovi

Stolovi mogu biti označeni kao "mesečni" (ne plaćaju odmah). Za te stolove:
- Konobar-admin može da unese uplate
- Prikazuje se istorija porudžbina i uplata
- Automatski se računa ostatak (duguje/preplaćeno)

## Štampanje

Sistem podržava:
- Mrežno štampanje (ESC/POS štampači preko IP adrese)
- Browser štampanje (fallback)

## Baza podataka

Baza podataka se automatski kreira prilikom pokretanja SQL skripte. Tabele:
- `users` - Korisnici sistema
- `categories` - Kategorije jela/pića
- `menu_items` - Stavke menija
- `tables` - Stolovi
- `monthly_payments` - Mesečna plaćanja
- `orders` - Porudžbine
- `order_items` - Stavke porudžbina

## Default korisnici

- **admin** / admin123
- **konobar** / konobar123
- **konobaradmin** / konobaradmin123
- **kuhinja** / kuhinja123

## Produkcija

Za produkciju:
1. Postavi environment varijable na serveru
2. Build aplikacije: `npm run build`
3. Pokreni sa PM2: `pm2 start npm --name "qr-restaurant" -- start`
4. Konfiguriši Nginx kao reverse proxy

## Licenca

Privatni projekat
