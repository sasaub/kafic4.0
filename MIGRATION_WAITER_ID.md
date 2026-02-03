# Migracija: Dodavanje waiter_id u orders tabelu

## Opis
Ova migracija dodaje `waiter_id` kolonu u `orders` tabelu kako bi se pratilo koji konobar je kreirao ili potvrdio porudžbinu.

## Kako pokrenuti migraciju

### Opcija 1: Direktno u MySQL konzoli

1. Prijavite se u MySQL:
```bash
mysql -u root -p
```

2. Izaberite bazu:
```sql
USE qr_restaurant;
```

3. Pokrenite migraciju:
```sql
ALTER TABLE orders 
ADD COLUMN waiter_id INT NULL,
ADD FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL;
```

### Opcija 2: Koristeći SQL fajl

```bash
mysql -u root -p qr_restaurant < lib/add-waiter-id.sql
```

## Provera

Nakon migracije, proverite da li je kolona dodata:

```sql
DESCRIBE orders;
```

Trebalo bi da vidite `waiter_id` kolonu u listi.

## Napomena

- Ako kolona već postoji, migracija će vratiti grešku. To je u redu - znači da je migracija već pokrenuta.
- Postojeće porudžbine će imati `waiter_id = NULL` jer nisu kreirane sa ovim poljem.
- Nove porudžbine će automatski imati `waiter_id` postavljen na ID konobara koji ih kreira ili potvrdi.
