# ⚡ Quick Start - Produkcijska Instalacija

## Korak po Korak

### 1️⃣ Priprema (5 minuta)

```bash
# Instaliraj Node.js, MySQL, PM2
# (pogledaj PRODUCTION_README.md za detalje)
```

### 2️⃣ Setup Aplikacije (10 minuta)

```bash
cd /opt/qr-restaurant
npm install
cp env.production.example .env.production
nano .env.production  # Popuni DB podatke
npm run build
```

### 3️⃣ Setup Baze (5 minuta)

```bash
mysql -u root -p
# U MySQL:
CREATE DATABASE qr_restaurant;
CREATE USER 'qr_restaurant_user'@'localhost' IDENTIFIED BY 'lozinka';
GRANT ALL ON qr_restaurant.* TO 'qr_restaurant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

mysql -u qr_restaurant_user -p qr_restaurant < lib/db-schema.sql
mysql -u qr_restaurant_user -p qr_restaurant < lib/db-optimization.sql
```

### 4️⃣ Pokreni (2 minuta)

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 startup
pm2 save
pm2 status
```

### 5️⃣ Testiraj

```bash
# Otvori browser: http://server-ip:3000
# Ili sa Nginx: http://server-ip
```

## ✅ Gotovo!

Aplikacija je sada u produkciji. Proveri `PRODUCTION_CHECKLIST.md` za detaljne provere.
