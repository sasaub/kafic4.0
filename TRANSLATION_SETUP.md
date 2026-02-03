# 🌍 Translation Setup Guide

## ✅ Šta je Urađeno

### 1. **Prevod Sistem**
- ✅ Kreiran `app/utils/menuTranslations.ts` sa prevodima za:
  - Kategorije (Glavna jela → Main Courses, itd.)
  - Nazive jela (Ćevapi, Pizza, itd.)
  - Opise (Sveže pripremljeno → Freshly prepared, itd.)

### 2. **API Podrška**
- ✅ API sada vraća i engleske nazive iz baze (ako postoje)
- ✅ Automatska detekcija da li postoje engleske kolone
- ✅ Fallback na prevod sistem ako nema u bazi

### 3. **Frontend Integracija**
- ✅ Meni se automatski prevodi na engleski
- ✅ Kategorije se prevode
- ✅ Nazivi jela se prevode
- ✅ Opisi se prevode
- ✅ Korpa se prevodi

## 🗄️ Database Setup (Opciono)

### Dodaj Engleske Kolone u Bazu

Ako želiš da imaš engleske nazive direktno u bazi (bolje rešenje):

```bash
# Pokreni migraciju
mysql -u root -p qr_restaurant < lib/add-english-translations.sql
```

Ovo će dodati:
- `name_en` kolonu u `categories` tabelu
- `name_en` i `description_en` kolone u `menu_items` tabelu

### Popuni Engleske Nazive

Nakon migracije, možeš ručno da popuniš engleske nazive:

```sql
-- Primer za kategorije
UPDATE categories SET name_en = 'Main Courses' WHERE name = 'Glavna jela';
UPDATE categories SET name_en = 'Salads' WHERE name = 'Salate';
UPDATE categories SET name_en = 'Desserts' WHERE name = 'Deserti';

-- Primer za meni stavke
UPDATE menu_items SET name_en = 'Ćevapi', description_en = 'Traditional grilled meat' WHERE name = 'Ćevapi';
```

## 🔄 Kako Radi

### 1. **Bez Engleskih Kolona u Bazi** (Trenutno)
- Aplikacija koristi prevod sistem iz `menuTranslations.ts`
- Prevod se dešava na frontend-u
- Radi odmah bez promena u bazi

### 2. **Sa Engleskim Kolonama u Bazi** (Preporučeno)
- API vraća i srpske i engleske nazive
- Frontend koristi engleske nazive iz baze ako postoje
- Fallback na prevod sistem ako nema u bazi

## 📝 Dodavanje Novih Prevoda

### U `app/utils/menuTranslations.ts`:

```typescript
// Dodaj novu kategoriju
export const categoryTranslations: Record<string, string> = {
  'Nova Kategorija': 'New Category',
  // ...
};

// Dodaj novo jelo
export const menuItemTranslations: Record<string, string> = {
  'Novo Jelo': 'New Dish',
  // ...
};

// Dodaj novi opis
export const descriptionTranslations: Record<string, string> = {
  'Novi Opis': 'New Description',
  // ...
};
```

## 🧪 Testiranje

1. **Otvori meni** (`/guest`)
2. **Klikni EN dugme** u headeru
3. **Proveri da li se prevodi**:
   - Header ("Meni" → "Menu")
   - Kategorije ("Glavna jela" → "Main Courses")
   - Nazivi jela
   - Opisi
   - Dugmad ("Dodaj u korpu" → "Add to cart")

## 💡 Napomene

- **Ako nema prevoda**: Aplikacija će prikazati originalni naziv
- **Prioritet**: Baza (name_en) > Prevod sistem > Originalni naziv
- **Dodavanje novih jela**: Dodaj ih u prevod sistem ili direktno u bazu sa engleskim nazivima

## 🚀 Sledeći Koraci (Opciono)

1. **Dodaj engleske kolone u bazu** (migracija)
2. **Popuni engleske nazive** za postojeća jela
3. **Ažuriraj admin panel** da omogući unos engleskih naziva pri dodavanju jela
