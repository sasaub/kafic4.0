# Avahi mDNS Setup - Lokalni DNS za QR Restaurant

## Šta je Avahi?

Avahi omogućava pristup serveru preko imena umesto IP adrese.
Umesto: `http://192.168.1.100:3000`
Koristiš: `http://menikod.local:3000`

## Instalacija

### 1. Instaliraj Avahi

```bash
sudo apt update
sudo apt install avahi-daemon avahi-utils -y
```

### 2. Proveri da li radi

```bash
sudo systemctl status avahi-daemon
```

Trebalo bi da vidiš: `active (running)`

### 3. Proveri hostname

```bash
hostname
```

Ako je hostname `menikod`, onda možeš pristupiti sa `menikod.local:3000`

### 4. Promeni hostname (opciono)

Ako želiš da promeniš hostname u `menikod`:

```bash
# Promeni hostname
sudo hostnamectl set-hostname menikod

# Ažuriraj /etc/hosts
sudo nano /etc/hosts
```

U `/etc/hosts` fajlu, promeni:
```
127.0.0.1       localhost
127.0.1.1       staro-ime
```

U:
```
127.0.0.1       localhost
127.0.1.1       menikod
```

Sačuvaj (Ctrl+O, Enter, Ctrl+X)

### 5. Restartuj Avahi

```bash
sudo systemctl restart avahi-daemon
```

### 6. Testiraj sa drugog uređaja

Sa telefona ili računara na istoj mreži:

```
http://menikod.local:3000
```

## Provera da li radi

### Sa servera:

```bash
# Proveri da li Avahi objavljuje hostname
avahi-browse -a -t

# Proveri da li možeš da ping-uješ
ping menikod.local
```

### Sa drugog uređaja (Linux/Mac):

```bash
ping menikod.local
```

### Sa Windows računara:

Windows podržava mDNS ako imaš:
- iTunes instaliran, ili
- Bonjour Print Services

Alternativno, instaliraj: https://support.apple.com/kb/DL999

### Sa Android/iOS telefona:

Jednostavno otvori browser i ukucaj:
```
http://menikod.local:3000
```

## Troubleshooting

### Avahi ne radi

```bash
# Proveri status
sudo systemctl status avahi-daemon

# Proveri logove
sudo journalctl -u avahi-daemon -n 50

# Restartuj
sudo systemctl restart avahi-daemon
```

### Ne može da se poveže sa drugog uređaja

1. **Proveri da li su na istoj mreži:**
   ```bash
   # Na serveru
   ip addr show
   
   # Na klijentu
   # Proveri da li je isti subnet (npr. 192.168.1.x)
   ```

2. **Proveri firewall:**
   ```bash
   # Dozvoli mDNS (port 5353)
   sudo ufw allow 5353/udp
   
   # Dozvoli HTTP (port 3000)
   sudo ufw allow 3000/tcp
   ```

3. **Proveri da li Avahi sluša:**
   ```bash
   sudo netstat -tulpn | grep avahi
   ```

### Windows ne prepoznaje .local

Instaliraj Bonjour:
- https://support.apple.com/kb/DL999
- Ili instaliraj iTunes (dolazi sa Bonjour-om)

## Alternativa: Koristi IP + hosts fajl

Ako Avahi ne radi, možeš ručno dodati u hosts fajl na svakom uređaju:

### Linux/Mac:
```bash
sudo nano /etc/hosts
```

Dodaj:
```
192.168.1.100   menikod.local
```

### Windows:
```
notepad C:\Windows\System32\drivers\etc\hosts
```

Dodaj:
```
192.168.1.100   menikod.local
```

### Android:
Potreban root pristup, ili koristi aplikaciju kao što je "Hosts Editor"

### iOS:
Nije moguće bez jailbreak-a

## Nginx Reverse Proxy (Bonus)

Ako želiš da ukloniš `:3000` iz URL-a, možeš koristiti Nginx:

```bash
sudo apt install nginx -y
```

Kreiraj config:
```bash
sudo nano /etc/nginx/sites-available/qr-restaurant
```

Sadržaj:
```nginx
server {
    listen 80;
    server_name menikod.local;

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

Omogući:
```bash
sudo ln -s /etc/nginx/sites-available/qr-restaurant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Sada možeš pristupiti sa:
```
http://menikod.local
```

(bez `:3000`)

## Preporuka

Za restoran, **Avahi je odličan izbor** jer:
- ✅ Automatski radi na svim uređajima
- ✅ Nema potrebe za konfiguracijom na klijentima
- ✅ Radi čak i ako se IP promeni
- ✅ Jednostavno za korišćenje

Kombinuj sa Nginx-om da ukloniš `:3000` iz URL-a!
