# 🚀 Production Deployment Guide

## Brzi Start

### 1. Priprema Servera

```bash
# Instaliraj Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instaliraj MySQL
sudo apt-get install mysql-server

# Instaliraj PM2
sudo npm install -g pm2

# Instaliraj Nginx (opciono)
sudo apt-get install nginx
```

### 2. Setup Aplikacije

```bash
# Kloniraj/kopiraj kod
cd /opt  # ili gde god želiš
git clone <repo> qr-restaurant
cd qr-restaurant

# Instaliraj dependencies
npm install

# Kreiraj .env.production
cp .env.production.example .env.production
nano .env.production  # Popuni vrednosti

# Build aplikacije
npm run build
```

### 3. Setup Baze

```bash
# Konektuj se na MySQL
mysql -u root -p

# U MySQL shell-u:
CREATE DATABASE qr_restaurant;
CREATE USER 'qr_restaurant_user'@'localhost' IDENTIFIED BY 'JAKA_LOZINKA';
GRANT ALL PRIVILEGES ON qr_restaurant.* TO 'qr_restaurant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importuj schema
mysql -u qr_restaurant_user -p qr_restaurant < lib/db-schema.sql

# Dodaj optimizacije
mysql -u qr_restaurant_user -p qr_restaurant < lib/db-optimization.sql
```

### 4. Pokreni sa PM2

```bash
# Kreiraj logs direktorijum
mkdir -p logs

# Pokreni aplikaciju
pm2 start ecosystem.config.js

# Podesi auto-start
pm2 startup
pm2 save

# Proveri status
pm2 status
pm2 logs
```

### 5. Setup Nginx (Opciono)

```bash
# Kopiraj konfiguraciju
sudo cp nginx.conf.example /etc/nginx/sites-available/qr-restaurant
sudo nano /etc/nginx/sites-available/qr-restaurant  # Prilagodi

# Aktiviraj
sudo ln -s /etc/nginx/sites-available/qr-restaurant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup Backup

```bash
# Kreiraj backup direktorijum
sudo mkdir -p /var/backups/qr-restaurant
sudo chown $USER:$USER /var/backups/qr-restaurant

# Edituj backup script
nano scripts/backup.sh  # Popuni DB_USER i DB_PASSWORD

# Daj izvršne dozvole
chmod +x scripts/backup.sh

# Testiraj backup
./scripts/backup.sh

# Dodaj u cron (dnevni backup u 2:00)
crontab -e
# Dodaj: 0 2 * * * /path/to/qr-restaurant/scripts/backup.sh
```

## Korisne Komande

### PM2 Komande

```bash
pm2 status              # Status aplikacije
pm2 logs                # Prikaži logove
pm2 logs --lines 100    # Poslednjih 100 linija
pm2 restart qr-restaurant # Restart
pm2 stop qr-restaurant   # Zaustavi
pm2 delete qr-restaurant # Obriši
pm2 monit               # Monitoring dashboard
```

### MySQL Komande

```bash
# Backup
mysqldump -u qr_restaurant_user -p qr_restaurant > backup.sql

# Restore
mysql -u qr_restaurant_user -p qr_restaurant < backup.sql

# Konekcija
mysql -u qr_restaurant_user -p qr_restaurant
```

### Nginx Komande

```bash
sudo nginx -t           # Test konfiguracije
sudo systemctl restart nginx  # Restart
sudo systemctl status nginx   # Status
```

## Monitoring

### Proveri da li aplikacija radi

```bash
# Proveri PM2 status
pm2 status

# Proveri logove
pm2 logs --lines 50

# Proveri da li port sluša
netstat -tulpn | grep 3000

# Testiraj API
curl http://localhost:3000/api/test-db
```

### Proveri MySQL

```bash
# Proveri da li radi
sudo systemctl status mysql

# Proveri konekcije
mysql -u root -p -e "SHOW PROCESSLIST;"

# Proveri performanse
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

## Troubleshooting

### Aplikacija se ne pokreće

1. Proveri logove: `pm2 logs`
2. Proveri .env.production fajl
3. Proveri da li je port 3000 slobodan
4. Proveri konekciju sa bazom

### Spore performanse

1. Proveri MySQL optimizacije (pogledaj `MYSQL_OPTIMIZATION.md`)
2. Proveri da li postoje indeksi: `SHOW INDEX FROM orders;`
3. Proveri PM2 memory usage: `pm2 monit`
4. Proveri MySQL slow queries

### Backup ne radi

1. Proveri dozvole: `ls -la /var/backups/qr-restaurant`
2. Testiraj manualno: `./scripts/backup.sh`
3. Proveri cron logove: `grep CRON /var/log/syslog`

## Security Checklist

- [ ] Promenjena default MySQL root lozinka
- [ ] Jak password za aplikaciju DB user
- [ ] Firewall podešen (samo potrebni portovi)
- [ ] phpMyAdmin ograničen na localhost
- [ ] .env.production fajl ima dobre dozvole (chmod 600)
- [ ] Regularne backup-e
- [ ] SSL sertifikat (ako koristiš HTTPS)

## Update Proces

```bash
# 1. Backup baze
./scripts/backup.sh

# 2. Pull novi kod
git pull

# 3. Instaliraj nove dependencies
npm install

# 4. Build
npm run build

# 5. Restart PM2
pm2 restart qr-restaurant

# 6. Proveri da li radi
pm2 logs --lines 20
```

## Support

Za probleme, proveri:
1. PM2 logove: `pm2 logs`
2. Nginx logove: `/var/log/nginx/qr-restaurant-error.log`
3. MySQL logove: `/var/log/mysql/error.log`
4. System logove: `journalctl -u mysql` ili `journalctl -u nginx`
