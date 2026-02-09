# QR Restaurant - Sistem za naručivanje hrane

Kompletan sistem za upravljanje restoranom sa QR kodom za naručivanje, administracijom, kuhinjom i štampanjem računa.

## 🚀 Brza instalacija (Debian/Ubuntu)

```bash
# 1. Kloniraj repozitorijum
git clone https://github.com/sasaub/kafic4.0.git
cd kafic4.0

# 2. Pokreni instalacionu skriptu
chmod +x install.sh
./install.sh
```

Skripta će automatski instalirati i konfigurisati:
- ✅ Node.js i npm
- ✅ MySQL server i bazu podataka
- ✅ Next.js aplikaciju
- ✅ Print worker servis
- ✅ Avahi (mDNS) za lokalni pristup
- ✅ Nginx reverse proxy (opciono)
- ✅ Systemd servise

## 📋 Ručna instalacija

Ako želiš ručnu instalaciju, pogledaj [SETUP.md](SETUP.md)

## 🎯 Funkcionalnosti

### Za goste
- 📱 Skeniranje QR koda za pristup meniju
- 🍽️ Pregled menija sa kategorijama (Hrana/Piće)
- 🛒 Dodavanje stavki u korpu
- 💬 Dodavanje komentara uz stavke
- 📝 Kreiranje porudžbine

### Za konobare
- 📋 Pregled pristiglih porudžbina
- ✅ Potvrđivanje porudžbina
- 🖨️ Štampanje računa
- 📊 Pregled svih porudžbina

### Za konobar-admin
- ➕ Kreiranje porudžbina direktno
- 📋 Upravljanje stolovima
- 🖨️ Štampanje računa
- ⚙️ Podešavanje štampača

### Za kuhinju
- 👨‍🍳 Pregled porudžbina za kuhinju (samo hrana)
- ✅ Označavanje porudžbina kao spremno
- 📝 Pregled komentara uz stavke

### Za administratore
- 👥 Upravljanje korisnicima
- 🍽️ Upravljanje menijem
- 📊 Kategorije (Hrana/Piće)
- 🪑 Upravljanje stolovima
- 📈 Izveštaji o prihodima
- 💰 Prihodi po konobarima
- 📋 Pregled svih porudžbina

## 🖨️ Štampanje

Sistem podržava automatsko štampanje na mrežni termalni štampač (ESC/POS):
- Birch POS štampač (testiran)
- Drugi ESC/POS kompatibilni štampači
- Automatsko sečenje papira
- Queue sistem za pouzdano štampanje

## 🌐 Pristup aplikaciji

Nakon instalacije:

**Sa Nginx-om:**
- `http://IP_ADRESA`
- `http://menikod.local` (ako je Avahi instaliran)

**Bez Nginx-a:**
- `http://IP_ADRESA:3000`
- `http://menikod.local:3000` (ako je Avahi instaliran)

## 👤 Default nalozi

**Administrator:**
- Username: `admin`
- Password: `admin123`

**Konobar-admin:**
- Username: `waiter-admin`
- Password: `waiter123`

**Konobar:**
- Username: `waiter`
- Password: `waiter123`

**Kuhinja:**
- Username: `kitchen`
- Password: `kitchen123`

⚠️ **VAŽNO:** Promeni lozinke nakon prvog logovanja!

## 🔧 Upravljanje servisima

```bash
# Status
sudo systemctl status qr-restaurant
sudo systemctl status print-worker

# Restart
sudo systemctl restart qr-restaurant
sudo systemctl restart print-worker

# Logovi
sudo journalctl -u qr-restaurant -f
sudo journalctl -u print-worker -f

# Rebuild aplikacije
./force-rebuild.sh
```

## 📚 Dokumentacija

- [QUICK_START.md](QUICK_START.md) - Brzi start
- [SETUP.md](SETUP.md) - Ručna instalacija
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment uputstva
- [PRINT_WORKER_SETUP.md](PRINT_WORKER_SETUP.md) - Print worker setup
- [AVAHI_SETUP.md](AVAHI_SETUP.md) - mDNS setup
- [DEBUG_PRINT_ISSUE.md](DEBUG_PRINT_ISSUE.md) - Debugging štampanja

## 🛠️ Tehnologije

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Baza:** MySQL
- **Štampanje:** ESC/POS, TCP Socket
- **PWA:** Service Worker, Manifest
- **mDNS:** Avahi
- **Reverse Proxy:** Nginx

## 📦 Struktura projekta

```
kafic4.0/
├── app/                    # Next.js aplikacija
│   ├── admin/             # Admin panel
│   ├── waiter/            # Konobar interfejs
│   ├── waiter-admin/      # Konobar-admin interfejs
│   ├── kitchen/           # Kuhinja interfejs
│   ├── guest/             # Gost interfejs (QR)
│   ├── api/               # API routes
│   ├── components/        # React komponente
│   ├── context/           # React context
│   └── utils/             # Utility funkcije
├── lib/                   # Database i konfiguracija
├── scripts/               # Skripte (print-worker)
├── public/                # Statički fajlovi
└── docs/                  # Dokumentacija
```

## 🔒 Sigurnost

- Session-based autentifikacija
- Role-based access control (RBAC)
- SQL injection zaštita (prepared statements)
- XSS zaštita
- HTTPS ready (sa Nginx)

## 🐛 Troubleshooting

### Štampač ne štampa
1. Proveri printer settings u admin panelu
2. Proveri da li je štampač dostupan: `ping IP_ADRESA`
3. Proveri print worker logove: `sudo journalctl -u print-worker -f`
4. Proveri print_jobs tabelu: `SELECT * FROM print_jobs ORDER BY id DESC LIMIT 10;`

### Aplikacija ne radi nakon git pull
```bash
./force-rebuild.sh
```

### Browser prikazuje staru verziju
1. Ctrl + Shift + R (hard refresh)
2. Očisti cache i Service Worker
3. Testiraj u Incognito mode

## 📝 Licenca

MIT License

## 👨‍💻 Autor

Sasa Subotic

## 🤝 Doprinos

Pull requests su dobrodošli! Za veće izmene, prvo otvori issue da diskutujemo šta želiš da promeniš.

## 📞 Podrška

Za pitanja i podršku, otvori issue na GitHub-u.
