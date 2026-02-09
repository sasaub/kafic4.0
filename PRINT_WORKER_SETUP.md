# Print Worker Setup za systemd

## Instalacija Print Worker servisa

### 1. Kopiraj service fajl

```bash
# Zameni putanje sa pravim putanjama na tvom serveru
sudo nano /etc/systemd/system/print-worker.service
```

Sadržaj fajla:

```ini
[Unit]
Description=QR Restaurant Print Worker
After=network.target mysql.service

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/path/to/your/app
Environment="NODE_ENV=production"
EnvironmentFile=/path/to/your/app/.env.local
ExecStart=/usr/bin/node /path/to/your/app/scripts/print-worker.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=print-worker

[Install]
WantedBy=multi-user.target
```

**VAŽNO:** Zameni:
- `YOUR_USER` - sa tvojim korisničkim imenom (npr. `ubuntu`, `root`, itd.)
- `/path/to/your/app` - sa punom putanjom do aplikacije (npr. `/home/ubuntu/qr-restaurant`)

### 2. Omogući i pokreni servis

```bash
# Reload systemd da učita novi servis
sudo systemctl daemon-reload

# Omogući servis da se pokreće automatski
sudo systemctl enable print-worker

# Pokreni servis
sudo systemctl start print-worker

# Proveri status
sudo systemctl status print-worker
```

### 3. Proveri logove

```bash
# Prati logove u realnom vremenu
sudo journalctl -u print-worker -f

# Vidi poslednjih 50 linija
sudo journalctl -u print-worker -n 50

# Vidi logove od danas
sudo journalctl -u print-worker --since today
```

## Komande za upravljanje

```bash
# Pokreni worker
sudo systemctl start print-worker

# Zaustavi worker
sudo systemctl stop print-worker

# Restartuj worker
sudo systemctl restart print-worker

# Proveri status
sudo systemctl status print-worker

# Vidi logove
sudo journalctl -u print-worker -f
```

## Provera da li radi

1. Otvori aplikaciju i klikni "Test Štampanje"
2. Proveri logove:
   ```bash
   sudo journalctl -u print-worker -f
   ```
3. Proveri bazu:
   ```sql
   SELECT * FROM print_jobs ORDER BY id DESC LIMIT 5;
   ```

## Troubleshooting

### Worker se ne pokreće

```bash
# Proveri greške
sudo journalctl -u print-worker -n 50

# Proveri da li Node.js postoji
which node

# Proveri da li fajl postoji
ls -la /path/to/your/app/scripts/print-worker.js

# Proveri permisije
chmod +x /path/to/your/app/scripts/print-worker.js
```

### Worker radi ali ne štampa

```bash
# Proveri logove
sudo journalctl -u print-worker -f

# Proveri da li ima poslova u queue-u
mysql -u qr_user -p qr_restaurant -e "SELECT * FROM print_jobs WHERE status='queued'"

# Proveri printer settings
mysql -u qr_user -p qr_restaurant -e "SELECT * FROM printer_settings"
```

### Restartuj sve servise

```bash
sudo systemctl restart qr_restaurant
sudo systemctl restart print-worker
```
