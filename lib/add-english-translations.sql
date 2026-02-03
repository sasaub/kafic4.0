-- Migracija za dodavanje engleskih prevoda u bazu
-- Pokreni ovaj script da dodaš engleske kolone za kategorije i meni stavke

USE qr_restaurant;

-- Dodaj engleske kolone u categories tabelu
ALTER TABLE categories 
ADD COLUMN name_en VARCHAR(100) NULL AFTER name;

-- Dodaj engleske kolone u menu_items tabelu
ALTER TABLE menu_items 
ADD COLUMN name_en VARCHAR(200) NULL AFTER name,
ADD COLUMN description_en TEXT NULL AFTER description;

-- Update postojećih kategorija sa engleskim prevodima (opciono)
-- Možeš ručno da popuniš ili koristiš prevod sistem u aplikaciji
UPDATE categories SET name_en = 'Main Courses' WHERE name = 'Glavna jela';
UPDATE categories SET name_en = 'Salads' WHERE name = 'Salate';
UPDATE categories SET name_en = 'Desserts' WHERE name = 'Deserti';
UPDATE categories SET name_en = 'Juices' WHERE name = 'Sokovi';
UPDATE categories SET name_en = 'Coffee' WHERE name = 'Kafe';
UPDATE categories SET name_en = 'Alcohol' WHERE name = 'Alkohol';

-- Napomena: name_en i description_en za menu_items ćeš popuniti ručno ili kroz admin panel
