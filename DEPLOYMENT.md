# Vodič za postavljanje aplikacije na lokalni server

## 📋 Glavni fajlovi i struktura

### **Obavezni fajlovi za postavljanje:**

1. **`package.json`** - Dependencies i skripte
2. **`lib/db-schema.sql`** - SQL skripta za kreiranje baze podataka
3. **`lib/db.ts`** - Konfiguracija MySQL konekcije
4. **`.env.local`** - Environment varijable (kreira se ručno)
5. **`next.config.ts`** - Next.js konfiguracija

### **Struktura projekta:**

```
qr-restaurant/
├── app/                    # Next.js aplikacija
│   ├── api/               # Backend API routes
│   ├── admin/             # Admin panel
│   ├── waiter-admin/      # Konobar-admin panel
│   ├── waiter/            # Konobar panel
│   ├── kitchen/           # Kuhinja panel
│   ├── guest/             # Gost panel (QR kod)
│   ├── context/           # React Context providers
│   └── components/        # UI komponente
├── lib/
│   ├── db.ts              # MySQL konekcija
│   └── db-schema.sql      # SQL skripta za bazu
├── package.json           # Dependencies
├── next.config.ts         # Next.js config
└── .env.local             # Environment varijable (kreira se)
```

---

## 🚀 Koraci za postavljanje na novu mašinu

### **Korak 1: Instaliraj Node.js i MySQL**

**Node.js:**
- Preuzmi sa https://nodejs.org/ (LTS verzija)
- Instaliraj i proveri: `node --version` i `npm --version`

**MySQL:**
- Windows: Preuzmi MySQL Installer sa https://dev.mysql.com/downloads/installer/
- Linux: `sudo apt-get install mysql-server` (Ubuntu/Debian)
- Proveri da li radi: `mysql --version`

---

### **Korak 2: Kloniraj ili kopiraj projekat**

```bash
# Ako koristiš Git:
git clone https://github.com/sasaub/kafic3.0.git
cd qr-restaurant

# Ili jednostavno kopiraj ceo folder projekta
```

---

### **Korak 3: Instaliraj dependencies**

```bash
npm install
```

Ovo će instalirati sve potrebne pakete iz `package.json`:
- `next` - Next.js framework
- `react` i `react-dom` - React biblioteke
- `mysql2` - MySQL driver
- `tailwindcss` - CSS framework
- i ostale dependencies

---

### **Korak 4: Postavi MySQL bazu podataka**

**4.1. Pokreni MySQL server**

- **Windows:** Otvori Services → pronađi MySQL → Start
- **Linux:** `sudo systemctl start mysql`

**4.2. Prijavi se u MySQL**

```bash
mysql -u root -p
# Unesi MySQL root lozinku (ili Enter ako nema lozinku)
```

**4.3. Pokreni SQL skriptu**

```sql
-- U MySQL konzoli:
source lib/db-schema.sql
```

**Ili ručno:**

1. Otvori `lib/db-schema.sql` u editoru
2. Kopiraj ceo sadržaj
3. Zalepi u MySQL konzolu i izvrši

**4.4. Proveri da li je baza kreirana**

```sql
SHOW DATABASES;
USE qr_restaurant;
SHOW TABLES;
```

Trebalo bi da vidiš tabele:
- `users`
- `categories`
- `menu_items`
- `tables`
- `orders`
- `order_items`
- `monthly_payments`

---

### **Korak 5: Kreiraj `.env.local` fajl**

**5.1. Kreiraj fajl u root folderu projekta:**

```bash
# Windows PowerShell:
New-Item .env.local

# Linux/Mac:
touch .env.local
```

**5.2. Dodaj sledeći sadržaj u `.env.local`:**

```env
# MySQL konfiguracija
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tvoja_mysql_lozinka_ovde
DB_NAME=qr_restaurant

# Next.js konfiguracija
NODE_ENV=development
PORT=3000
```

**VAŽNO:**
- Ako MySQL root **nema lozinku**, ostavi `DB_PASSWORD=` prazno
- Ako **ima lozinku**, unesi je u `DB_PASSWORD=`
- Ako koristiš **drugog MySQL korisnika**, promeni `DB_USER` i `DB_PASSWORD`

**Primer ako MySQL nema lozinku:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=qr_restaurant
```

**Primer ako MySQL ima lozinku:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mojaLozinka123
DB_NAME=qr_restaurant
```

---

### **Korak 6: Pokreni aplikaciju**

**Development mod (za razvoj):**
```bash
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:3000**

**Production mod (za produkciju):**
```bash
npm run build
npm start
```

**VAŽNO:** Ako želiš da pristupaš sa drugih uređaja na mreži (npr. telefon), server već sluša na `0.0.0.0`, tako da možeš pristupiti preko:
- **http://[IP_ADRESA_KOMPJUTERA]:3000**
- Na primer: `http://192.168.1.100:3000`

---

### **Korak 7: Testiraj aplikaciju**

1. Otvori browser: `http://localhost:3000`
2. Prijavi se sa default korisnicima:
   - **admin** / admin123
   - **konobar** / konobar123
   - **konobaradmin** / konobaradmin123
   - **kuhinja** / kuhinja123

---

## 🔧 Troubleshooting (Rešavanje problema)

### **Problem: "Access denied for user 'root'@'localhost'"**

**Rešenje:**
1. Proveri da li je lozinka tačna u `.env.local`
2. Ili kreiraj novog MySQL korisnika:

```sql
CREATE USER 'qr_user'@'localhost' IDENTIFIED BY 'nova_lozinka';
GRANT ALL PRIVILEGES ON qr_restaurant.* TO 'qr_user'@'localhost';
FLUSH PRIVILEGES;
```

Zatim u `.env.local`:
```env
DB_USER=qr_user
DB_PASSWORD=nova_lozinka
```

---

### **Problem: "Can't connect to MySQL server"**

**Rešenje:**
- **Windows:** Otvori Services → MySQL → Start
- **Linux:** `sudo systemctl start mysql`
- Proveri da li MySQL radi: `mysql --version`

---

### **Problem: "Unknown database 'qr_restaurant'"**

**Rešenje:**
- Baza nije kreirana - vrati se na **Korak 4** i pokreni `lib/db-schema.sql`

---

### **Problem: "Port 3000 is already in use"**

**Rešenje:**
1. Pronađi proces koji koristi port 3000:
   ```bash
   # Windows:
   netstat -ano | findstr :3000
   
   # Linux:
   lsof -i :3000
   ```

2. Zatvori proces ili promeni port u `.env.local`:
   ```env
   PORT=3001
   ```

---

### **Problem: "Module not found" ili "Cannot find module"**

**Rešenje:**
```bash
# Obriši node_modules i reinstaliraj:
rm -rf node_modules package-lock.json
npm install
```

---

### **Problem: Ne može da se pristupi sa telefona/mreže**

**Rešenje:**
1. Proveri da li je firewall blokira port 3000
2. Proveri da li je server pokrenut sa `-H 0.0.0.0` (već je u `package.json`)
3. Proveri IP adresu kompjutera:
   ```bash
   # Windows:
   ipconfig
   
   # Linux:
   ifconfig
   ```
4. Pristupi sa telefona: `http://[IP_ADRESA]:3000`

---

## 📝 Checklist za postavljanje

- [ ] Node.js instaliran (`node --version`)
- [ ] MySQL instaliran i pokrenut (`mysql --version`)
- [ ] Projekat kloniran/kopiran
- [ ] Dependencies instalirani (`npm install`)
- [ ] MySQL baza kreirana (`lib/db-schema.sql` izvršen)
- [ ] `.env.local` fajl kreiran sa tačnim podacima
- [ ] Aplikacija pokrenuta (`npm run dev`)
- [ ] Login radi sa default korisnicima
- [ ] Baza podataka se povezuje uspešno

---

## 🔐 Default korisnici

Nakon postavljanja baze, ovi korisnici su automatski kreirani:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| konobar | konobar123 | waiter |
| konobaradmin | konobaradmin123 | waiter-admin |
| kuhinja | kuhinja123 | kitchen |

**VAŽNO:** Promeni lozinke u produkciji!

---

## 🚀 Produkcija (Production)

Za produkciju na serveru:

1. **Build aplikacije:**
   ```bash
   npm run build
   ```

2. **Pokreni sa PM2 (process manager):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "qr-restaurant" -- start
   pm2 save
   pm2 startup
   ```

3. **Konfiguriši Nginx kao reverse proxy** (opciono):
   ```nginx
   server {
       listen 80;
       server_name tvoj-domen.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 📞 Podrška

Ako imaš problema:
1. Proveri da li su svi koraci izvršeni
2. Proveri console logove u browseru (F12)
3. Proveri server logove u terminalu
4. Proveri MySQL logove

---

**Srećno sa postavljanjem! 🎉**

