# Finalni koraci za deployment - Rešavanje print problema

## Šta je urađeno:

### 1. Konobar stranica (`/waiter`)
- ✅ Promenjena `printReceipt` funkcija da koristi `/api/print` endpoint
- ✅ Dodati emoji logovi za debugging (🖨️ 📤 📥 ✅ ❌)
- ✅ Uklonjen `window.print()` poziv

### 2. Konobar-admin stranica (`/waiter-admin`)
- ✅ Uklonjeno automatsko štampanje pri kreiranju porudžbine
- ✅ Korisnik mora da klikne "Štampaj" dugme

### 3. Print worker
- ✅ Povećan broj praznih linija sa 5 na 8 pre sečenja papira
- ✅ Dodato 2 dodatne linije nakon cut komandi

### 4. Force cache refresh
- ✅ Service Worker cache name promenjen sa `v1` na `v2`
- ✅ Dodata verzija `2.0.0` u manifest.json

## Deployment na serveru:

```bash
# 1. Idi u folder projekta
cd /opt/qr-restaurant/releases/kafic4.0

# 2. Pull najnovije izmene
git pull origin main

# 3. Proveri da li je pull uspeo
git log -1 --oneline
# Trebalo bi da vidiš: f98930c Force cache refresh: Update Service Worker cache name to v2

# 4. Restartuj servise
sudo systemctl restart qr-restaurant
sudo systemctl restart print-worker

# 5. Proveri status
sudo systemctl status qr-restaurant
sudo systemctl status print-worker
```

## Testiranje u browser-u:

### VAŽNO: Moraš da očistiš cache!

Pošto smo promenili Service Worker cache name, stari cache će automatski biti obrisan, ali moraš da:

1. **Zatvori SVE tab-ove** sa aplikacijom
2. **Otvori novu tab-u**
3. **Pritisni Ctrl + Shift + R** (hard refresh)

### Test 1: Konobar stranica

1. Uloguj se kao **obični konobar**
2. Otvori **Console** (F12 → Console tab)
3. Klikni **"Prihvati i Štampaj"** ili **"Štampaj"**
4. **Očekivani output u console-u:**
   ```
   🖨️ printReceipt POZVANA za order: 14
   📤 Šaljem na /api/print...
   📥 Response status: 200
   📥 Response data: { ok: true, message: "Print job queued", jobId: 123 }
   ✅ Štampanje uspešno poslato!
   ```

**Ako vidiš print dialog** → cache nije očišćen, vidi dole "Ako i dalje ne radi"

**Ako vidiš emoji poruke** → RADI! ✅

### Test 2: Konobar-admin stranica

1. Uloguj se kao **konobar-admin**
2. Kreiraj novu porudžbinu
3. Klikni **"Potvrdi"** u dijalogu
4. **Očekivano:** Porudžbina se kreira, **ALI NE štampa automatski**
5. Idi na listu porudžbina
6. Klikni **"Štampaj"** dugme
7. **Očekivano:** Sada štampa

### Test 3: Proveri print_jobs tabelu

```bash
mysql -u qr_user -p'>StrongPass123!' qr_restaurant -e "
SELECT id, status, attempts, created_at 
FROM print_jobs 
ORDER BY id DESC 
LIMIT 5;
"
```

**Očekivano:**
- Status: `queued` → `printing` → `done`
- Ako je `failed`, proveri `last_error`

### Test 4: Proveri print worker logove

```bash
sudo journalctl -u print-worker -f
```

**Očekivano:**
```
→ Processing job #123 (attempt 1)
✓ Connected to printer
✓ Data sent to printer
✓ Printer connection closed
✓ Job #123 completed successfully
```

## Ako i dalje ne radi:

### Opcija 1: Očisti cache ručno

1. **F12** → **Application** tab
2. **Service Workers** → **Unregister** sve
3. **Cache Storage** → Desni klik na sve → **Delete**
4. **Zatvori browser POTPUNO**
5. **Otvori browser ponovo**
6. **Ctrl + Shift + R**

### Opcija 2: Testiraj u Incognito mode

1. **Ctrl + Shift + N** (Chrome) ili **Ctrl + Shift + P** (Firefox)
2. Otvori stranicu konobara
3. Uloguj se
4. Testiraj štampanje

**Ako u Incognito mode-u RADI** → problem je definitivno cache.

### Opcija 3: Proveri da li je server ažuriran

```bash
cd /opt/qr-restaurant/releases/kafic4.0

# Proveri trenutni commit
git log -1 --oneline

# Trebalo bi da vidiš:
# f98930c Force cache refresh: Update Service Worker cache name to v2

# Ako ne vidiš, uradi:
git pull origin main
sudo systemctl restart qr-restaurant
```

### Opcija 4: Proveri da li se učitava novi Service Worker

1. **F12** → **Application** tab
2. **Service Workers**
3. Trebalo bi da vidiš: **Status: activated**
4. Klikni **Update** dugme
5. Refresh stranicu

## Provera da li sečenje papira radi

Nakon što štampanje radi:

1. Štampaj nekoliko računa
2. Proveri da li štampač seče papir nakon svakog računa
3. **Ako ne seče:**
   - Proveri da li print worker koristi novu verziju (8 linija)
   - Restartuj print worker: `sudo systemctl restart print-worker`
   - Proveri logove: `sudo journalctl -u print-worker -n 50`

## Brzi test - sve u jednom

```bash
cd /opt/qr-restaurant/releases/kafic4.0 && \
git pull && \
sudo systemctl restart qr-restaurant && \
sudo systemctl restart print-worker && \
sleep 3 && \
echo "✅ Deployment completed!" && \
echo "" && \
echo "Sada u browser-u:" && \
echo "1. Zatvori SVE tab-ove" && \
echo "2. Otvori novu tab-u" && \
echo "3. Ctrl + Shift + R" && \
echo "4. F12 → Console" && \
echo "5. Klikni Štampaj" && \
echo "6. Proveri da li vidiš 🖨️ emoji"
```

## Očekivani rezultati:

✅ **Konobar** - Klikne "Štampaj" → vidi emoji u console-u → štampa na mrežni štampač
✅ **Konobar-admin** - Klikne "Potvrdi" → NE štampa → Klikne "Štampaj" → štampa
✅ **Print worker** - Procesira job-ove iz queue-a → šalje na štampač → seče papir
✅ **Štampač** - Prima podatke → štampa → seče papir

## Ako ništa ne pomaže:

Pošalji mi screenshot:
1. Browser Console output (F12 → Console)
2. Network tab (F12 → Network) kada klikneš Štampaj
3. Print_jobs tabela: `SELECT * FROM print_jobs ORDER BY id DESC LIMIT 5;`
4. Print worker logovi: `sudo journalctl -u print-worker -n 50`

Javi mi rezultate!
