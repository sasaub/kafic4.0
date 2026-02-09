-- Provera podataka u bazi

USE qr_restaurant;

-- Proveri korisnike
SELECT 'KORISNICI:' AS Info;
SELECT * FROM users;

-- Proveri kategorije
SELECT 'KATEGORIJE:' AS Info;
SELECT * FROM categories;

-- Proveri meni stavke
SELECT 'MENI STAVKE:' AS Info;
SELECT * FROM menu_items;

-- Proveri stolove
SELECT 'STOLOVI:' AS Info;
SELECT * FROM tables;

-- Proveri narudžbine
SELECT 'NARUDŽBINE:' AS Info;
SELECT * FROM orders;

-- Proveri podešavanja štampača
SELECT 'PODEŠAVANJA ŠTAMPAČA:' AS Info;
SELECT * FROM printer_settings;
