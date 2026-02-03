# 📋 Checklist za Produkcijsku Instalaciju

## 🔧 Pre-Instalacija

### 1. Server Setup
- [ ] Instalirati Node.js 18+ na server
- [ ] Instalirati MySQL 8.0+ na server
- [ ] Instalirati phpMyAdmin (opciono, za lakše upravljanje)
- [ ] Instalirati Nginx (opciono, za reverse proxy)
- [ ] Instalirati PM2 globalno: `npm install -g pm2`
- [ ] Podesiti firewall (otvoriti portove 3000, 80, 443, 3306)

### 2. MySQL Konfiguracija
- [ ] Kreirati MySQL korisnika sa privilegijama
- [ ] Kreirati bazu podataka `qr_restaurant`
- [ ] Importovati SQL schema (`lib/db-schema.sql`)
- [ ] Podesiti MySQL optimizacije u `my.cnf` (pogledaj `MYSQL_OPTIMIZATION.md`)
- [ ] Testirati konekciju sa bazom

### 3. Aplikacija Setup
- [ ] Klonirati/kopirati kod na server
- [ ] Instalirati dependencies: `npm install`
- [ ] Kreirati `.env.production` fajl (koristi `.env.production.example`)
- [ ] Testirati konekciju sa bazom: `npm run test-db` (ako postoji)

## 🚀 Deployment

### 4. Build i Start
- [ ] Build aplikacije: `npm run build`
- [ ] Testirati build: `npm start` (privremeno)
- [ ] Zaustaviti test server (Ctrl+C)
- [ ] Pokrenuti sa PM2: `pm2 start ecosystem.config.js`
- [ ] Podesiti auto-start: `pm2 startup` i `pm2 save`
- [ ] Proveriti status: `pm2 status`

### 5. Nginx Setup (Opciono)
- [ ] Konfigurisati Nginx (pogledaj `nginx.conf.example`)
- [ ] Testirati konfiguraciju: `nginx -t`
- [ ] Restartovati Nginx: `systemctl restart nginx`
- [ ] Testirati pristup preko Nginx

### 6. Security
- [ ] Promeniti default MySQL root lozinku
- [ ] Kreirati jaku lozinku za aplikaciju DB user
- [ ] Ograničiti phpMyAdmin pristup (samo localhost)
- [ ] Podesiti firewall pravila
- [ ] Ako koristiš HTTPS, instalirati SSL sertifikat (Let's Encrypt)

## 📊 Optimizacije

### 7. Database Optimizacije
- [ ] Kreirati indekse (pogledaj `lib/db-optimization.sql`)
- [ ] Podesiti MySQL buffer pool size
- [ ] Omogućiti query cache
- [ ] Testirati performanse upita

### 8. Monitoring
- [ ] Podesiti PM2 monitoring: `pm2 monit`
- [ ] Podesiti log rotaciju
- [ ] Podesiti disk space monitoring
- [ ] Podesiti MySQL slow query log

## 🔄 Backup i Održavanje

### 9. Backup Strategija
- [ ] Kreirati backup script (pogledaj `scripts/backup.sh`)
- [ ] Podesiti cron job za dnevne backup-e
- [ ] Testirati restore proces
- [ ] Dokumentovati backup proceduru

### 10. Dokumentacija
- [ ] Dokumentovati pristupne podatke (bezbedno čuvanje)
- [ ] Dokumentovati IP adrese i portove
- [ ] Kreirati quick start guide za nove instalacije

## ✅ Finalna Provera

### 11. Testiranje
- [ ] Testirati login funkcionalnost
- [ ] Testirati kreiranje porudžbine
- [ ] Testirati potvrdu porudžbine
- [ ] Testirati kuhinjski prikaz
- [ ] Testirati konobarski prikaz
- [ ] Testirati admin panel
- [ ] Testirati sa više simultanih korisnika
- [ ] Proveriti performanse pod opterećenjem

### 12. Finalne Provere
- [ ] Proveriti da se ne vidi "Next.js" u browser dev tools
- [ ] Proveriti da nema dev indikatora
- [ ] Proveriti da favicon radi
- [ ] Proveriti da sve rute rade
- [ ] Proveriti da API endpoints rade
- [ ] Proveriti da logovi rade ispravno

## 📝 Napomene

- **Backup**: Uvek napravi backup pre bilo kakvih promena
- **Monitoring**: Prati logove prvih nekoliko dana
- **Performance**: Testiraj sa realnim opterećenjem pre puštanja u produkciju
- **Security**: Redovno ažuriraj Node.js i MySQL
- **Updates**: Planiraj maintenance window za update-e

---

**Datum instalacije**: _______________
**Instalirao**: _______________
**Server IP**: _______________
**MySQL User**: _______________
