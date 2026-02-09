# Kako kreirati bazu podataka za QR Restaurant

## Opcija 1: Koristi postojeći MySQL klijent

Ako imaš **phpMyAdmin**, **MySQL Workbench**, ili neki drugi MySQL alat:

1. Otvori alat i uloguj se
2. Otvori SQL tab/editor
3. Kopiraj i pokreni sadržaj iz `setup-database.sql` fajla

## Opcija 2: Komandna linija (ako znaš root lozinku)

```cmd
mysql -u root -p < setup-database.sql
```

Unesi lozinku kada te pita.

## Opcija 3: Ručno kreiranje (ako ne možeš da se uloguješ kao root)

Ako već imaš pristup MySQL-u sa nekim drugim korisnikom koji ima privilegije:

```sql
-- 1. Kreiraj bazu
CREATE DATABASE qr_restaurant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Kreiraj korisnika
CREATE USER 'qr_user'@'localhost' IDENTIFIED BY '>StrongPass123!';

-- 3. Dodeli privilegije
GRANT ALL PRIVILEGES ON qr_restaurant.* TO 'qr_user'@'localhost';
FLUSH PRIVILEGES;

-- 4. Koristi bazu
USE qr_restaurant;

-- 5. Kopiraj i pokreni ostatak SQL-a iz setup-database.sql fajla
```

## Opcija 4: Koristi postojeću bazu

Ako već imaš MySQL bazu i korisnika koji radi:

1. Otvori `.env.local` fajl
2. Promeni kredencijale na one koji rade:
   ```
   DB_USER=tvoj_korisnik
   DB_PASSWORD=tvoja_lozinka
   DB_NAME=tvoja_baza
   ```
3. Pokreni tabele iz `setup-database.sql` (bez CREATE USER dela)

## Provera da li radi

Nakon kreiranja baze, pokreni:

```cmd
npm run dev
```

I otvori http://localhost:3000
