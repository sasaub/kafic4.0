# Debug Print Issue - Konobar ne štampa

## Problem
- **Konobar-admin** - štampa ✅
- **Obični konobar** - NE štampa ❌
- **Kuhinja** - ne treba da štampa (samo označava kao spremno)

## Koraci za debugging na serveru

### 1. Deploy najnovije verzije

```bash
cd /opt/qr-restaurant/releases/kafic4.0
git pull origin main
sudo systemctl restart qr-restaurant
sudo systemctl restart print-worker
```

### 2. Proveri da li servisi rade

```bash
# Proveri Next.js aplikaciju
sudo systemctl status qr-restaurant

# Proveri print worker
sudo systemctl status print-worker

# Proveri logove print worker-a
sudo journalctl -u print-worker -f
```

### 3. Testiraj /api/print endpoint

```bash
# Daj execute permission
chmod +x test-print-api.sh

# Pokreni test
./test-print-api.sh
```

Očekivani rezultat:
```json
{
  "ok": true,
  "message": "Print job queued",
  "jobId": 123
}
```

### 4. Proveri print_jobs tabelu

```bash
mysql -u qr_user -p'>StrongPass123!' qr_restaurant -e "
SELECT id, status, attempts, last_error, created_at 
FROM print_jobs 
ORDER BY id DESC 
LIMIT 10;
"
```

Očekivano:
- Status: `queued` → `printing` → `done`
- Ako je `failed`, pogledaj `last_error` kolonu

### 5. Testiraj iz browser-a (konobar stranica)

1. Otvori browser Developer Tools (F12)
2. Idi na tab **Console**
3. Uloguj se kao obični konobar
4. Klikni "Prihvati i Štampaj"
5. Pogledaj console output:

**Očekivani output:**
```
Šaljem na /api/print...
Response status: 200
Response data: { ok: true, message: "Print job queued", jobId: 123 }
Štampanje uspešno poslato!
```

**Ako vidiš grešku:**
```
Response status: 400
Response data: { error: "Printer is disabled" }
```
→ Proveri printer settings u bazi

```
Response status: 404
Response data: { error: "Printer settings not found" }
```
→ Nema printer_settings u bazi

```
Response status: 500
Response data: { error: "..." }
```
→ Greška u bazi ili kodu

### 6. Proveri printer settings u bazi

```bash
mysql -u qr_user -p'>StrongPass123!' qr_restaurant -e "
SELECT * FROM printer_settings WHERE id = 1;
"
```

Očekivano:
- `enabled` = 1
- `ip_address` = IP adresa štampača (npr. 192.168.1.100)
- `port` = 9100

### 7. Proveri Next.js logove

```bash
# Ako koristiš systemctl
sudo journalctl -u qr-restaurant -f

# Ili ako koristiš PM2
pm2 logs qr-restaurant
```

Traži:
```
Adding print job to queue...
Payload length: 456
Print job added to queue, ID: 123
```

## Moguće greške i rešenja

### Greška 1: "Printer settings not found"

**Uzrok:** Nema reda u `printer_settings` tabeli

**Rešenje:**
```sql
INSERT INTO printer_settings (id, ip_address, port, enabled) 
VALUES (1, '192.168.1.100', 9100, 1)
ON DUPLICATE KEY UPDATE 
  ip_address = '192.168.1.100',
  port = 9100,
  enabled = 1;
```

### Greška 2: "Printer is disabled"

**Uzrok:** `enabled` = 0 u bazi

**Rešenje:**
```sql
UPDATE printer_settings SET enabled = 1 WHERE id = 1;
```

### Greška 3: Print job ostaje u statusu "queued"

**Uzrok:** Print worker ne radi ili ne može da se poveže na štampač

**Rešenje:**
```bash
# Restartuj worker
sudo systemctl restart print-worker

# Proveri logove
sudo journalctl -u print-worker -n 50

# Proveri da li worker vidi job
sudo journalctl -u print-worker | grep "Processing job"
```

### Greška 4: Print job ide u status "failed"

**Uzrok:** Štampač nije dostupan ili pogrešna IP adresa

**Rešenje:**
```bash
# Proveri da li štampač odgovara
ping 192.168.1.100

# Proveri da li port 9100 radi
nc -zv 192.168.1.100 9100

# Proveri last_error u bazi
mysql -u qr_user -p'>StrongPass123!' qr_restaurant -e "
SELECT id, status, last_error 
FROM print_jobs 
WHERE status = 'failed' 
ORDER BY id DESC 
LIMIT 5;
"
```

### Greška 5: Browser console pokazuje CORS error

**Uzrok:** Next.js API route nije dostupan

**Rešenje:**
```bash
# Proveri da li Next.js radi
curl http://localhost:3000/api/printer-settings

# Restartuj aplikaciju
sudo systemctl restart qr-restaurant
```

## Razlika između konobar-admin i obični konobar

### Konobar-admin (`app/waiter-admin/page.tsx`)
- Koristi `printToNetworkPrinter()` funkciju iz `utils/printer.ts`
- Ta funkcija poziva `/api/print` endpoint
- **Radi** ✅

### Obični konobar (`app/waiter/page.tsx`)
- Takođe koristi `fetch('/api/print')` direktno
- **Ne radi** ❌

**Obe stranice koriste isti endpoint!**

Moguće razlike:
1. **Autorizacija** - možda API proverava role?
2. **Browser cache** - možda konobar stranica koristi staru verziju?
3. **Network error** - možda fetch ne prolazi?

## Provera autorizacije

Proveri da li `/api/print/route.ts` proverava user role:

```bash
grep -n "role\|auth\|user" app/api/print/route.ts
```

Ako nema rezultata → autorizacija nije problem.

## Provera browser cache

Na konobar stranici:
1. Otvori Developer Tools (F12)
2. Idi na **Network** tab
3. Klikni "Disable cache" checkbox
4. Refresh stranicu (Ctrl+Shift+R)
5. Pokušaj ponovo da štampaš

## Sledeći koraci

1. Deploy najnoviju verziju
2. Pokreni `test-print-api.sh` na serveru
3. Testiraj iz browser-a sa otvorenim Developer Tools
4. Pošalji mi screenshot console output-a
5. Pošalji mi rezultat iz `print_jobs` tabele

## Brzi test komande

```bash
# Sve u jednom
cd /opt/qr-restaurant/releases/kafic4.0 && \
git pull && \
sudo systemctl restart qr-restaurant && \
sudo systemctl restart print-worker && \
sleep 3 && \
./test-print-api.sh
```
