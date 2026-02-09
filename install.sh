#!/bin/bash

# QR Restaurant - Automatska instalacija za Debian/Ubuntu
# Ova skripta instalira sve potrebne komponente i podešava sistem

set -e  # Zaustavi skriptu ako bilo koja komanda ne uspe

echo "=========================================="
echo "  QR Restaurant - Automatska Instalacija"
echo "=========================================="
echo ""
echo "Ova skripta će instalirati:"
echo "  - Node.js i npm"
echo "  - MySQL server"
echo "  - Nginx (opciono)"
echo "  - Avahi (mDNS)"
echo "  - Konfigurisati bazu podataka"
echo "  - Instalirati dependencies"
echo "  - Kreirati systemd servise"
echo ""
read -p "Da li želiš da nastaviš? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Instalacija otkazana."
    exit 1
fi

# Proveri da li je root ili ima sudo
if [[ $EUID -ne 0 ]] && ! sudo -v; then
   echo "❌ Ova skripta zahteva root privilegije ili sudo pristup."
   exit 1
fi

echo ""
echo "=========================================="
echo "1. Ažuriranje sistema i instalacija Git"
echo "=========================================="
sudo apt update
sudo apt upgrade -y

# Instaliraj Git ako nije instaliran
if command -v git &> /dev/null; then
    echo "✓ Git je već instaliran: $(git --version)"
else
    echo "Instaliram Git..."
    sudo apt install -y git
    echo "✓ Git instaliran: $(git --version)"
fi

echo ""
echo "=========================================="
echo "2. Instalacija Node.js i npm"
echo "=========================================="
if command -v node &> /dev/null; then
    echo "✓ Node.js je već instaliran: $(node --version)"
else
    echo "Instaliram Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✓ Node.js instaliran: $(node --version)"
fi

echo ""
echo "=========================================="
echo "3. Instalacija MySQL servera"
echo "=========================================="
if command -v mysql &> /dev/null; then
    echo "✓ MySQL je već instaliran"
else
    echo "Instaliram MySQL server..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    echo "✓ MySQL instaliran"
fi

echo ""
echo "=========================================="
echo "4. Konfiguracija MySQL baze"
echo "=========================================="
echo ""
echo "Unesite MySQL root lozinku (ostavite prazno ako nema lozinke):"
read -s MYSQL_ROOT_PASSWORD
echo ""

echo "Unesite podatke za novu bazu:"
read -p "Ime baze (default: qr_restaurant): " DB_NAME
DB_NAME=${DB_NAME:-qr_restaurant}

read -p "Korisničko ime (default: qr_user): " DB_USER
DB_USER=${DB_USER:-qr_user}

read -p "Lozinka (default: StrongPass123!): " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-StrongPass123!}

echo ""
echo "Kreiram bazu i korisnika..."

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_CMD="sudo mysql"
else
    MYSQL_CMD="mysql -u root -p$MYSQL_ROOT_PASSWORD"
fi

$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✓ Baza kreirana: $DB_NAME"
echo "✓ Korisnik kreiran: $DB_USER"

echo ""
echo "Importujem šemu baze..."
if [ -f "lib/db-schema.sql" ]; then
    if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
        sudo mysql $DB_NAME < lib/db-schema.sql
    else
        mysql -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME < lib/db-schema.sql
    fi
    echo "✓ Šema importovana"
else
    echo "⚠ lib/db-schema.sql ne postoji - preskačem import šeme"
fi

echo ""
echo "=========================================="
echo "5. Kreiranje .env.local fajla"
echo "=========================================="

cat > .env.local <<EOF
# Database Configuration
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Next.js Configuration
NODE_ENV=production
PORT=3000

# Session Secret (generiši random string)
SESSION_SECRET=$(openssl rand -base64 32)
EOF

echo "✓ .env.local kreiran"

echo ""
echo "=========================================="
echo "6. Instalacija npm dependencies"
echo "=========================================="
npm install
echo "✓ Dependencies instalirani"

echo ""
echo "=========================================="
echo "7. Build Next.js aplikacije"
echo "=========================================="
npm run build
echo "✓ Build završen"

echo ""
echo "=========================================="
echo "8. Konfiguracija printer settings"
echo "=========================================="
echo ""
read -p "IP adresa štampača (default: 192.168.1.100): " PRINTER_IP
PRINTER_IP=${PRINTER_IP:-192.168.1.100}

read -p "Port štampača (default: 9100): " PRINTER_PORT
PRINTER_PORT=${PRINTER_PORT:-9100}

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    sudo mysql $DB_NAME <<EOF
INSERT INTO printer_settings (id, ip_address, port, enabled) 
VALUES (1, '$PRINTER_IP', $PRINTER_PORT, 1)
ON DUPLICATE KEY UPDATE 
  ip_address = '$PRINTER_IP',
  port = $PRINTER_PORT,
  enabled = 1;
EOF
else
    mysql -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME <<EOF
INSERT INTO printer_settings (id, ip_address, port, enabled) 
VALUES (1, '$PRINTER_IP', $PRINTER_PORT, 1)
ON DUPLICATE KEY UPDATE 
  ip_address = '$PRINTER_IP',
  port = $PRINTER_PORT,
  enabled = 1;
EOF
fi

echo "✓ Printer settings konfigurisani"

echo ""
echo "=========================================="
echo "9. Kreiranje systemd servisa za Next.js"
echo "=========================================="

CURRENT_DIR=$(pwd)
CURRENT_USER=$(whoami)

sudo tee /etc/systemd/system/qr-restaurant.service > /dev/null <<EOF
[Unit]
Description=QR Restaurant Next.js Application
After=network.target mysql.service

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=qr-restaurant

Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

echo "✓ qr-restaurant.service kreiran"

echo ""
echo "=========================================="
echo "10. Kreiranje systemd servisa za Print Worker"
echo "=========================================="

sudo tee /etc/systemd/system/print-worker.service > /dev/null <<EOF
[Unit]
Description=QR Restaurant Print Worker
After=network.target mysql.service

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/node $CURRENT_DIR/scripts/print-worker.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=print-worker

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "✓ print-worker.service kreiran"

echo ""
echo "=========================================="
echo "11. Instalacija Avahi (mDNS)"
echo "=========================================="
read -p "Da li želiš da instaliraš Avahi za lokalni DNS (menikod.local)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt install -y avahi-daemon avahi-utils
    sudo systemctl start avahi-daemon
    sudo systemctl enable avahi-daemon
    
    read -p "Hostname za mDNS (default: menikod): " HOSTNAME
    HOSTNAME=${HOSTNAME:-menikod}
    
    # Dodaj hostname u /etc/hosts
    if ! grep -q "$HOSTNAME" /etc/hosts; then
        sudo sed -i "s/127.0.1.1.*/& $HOSTNAME/" /etc/hosts
        echo "✓ Hostname $HOSTNAME dodat u /etc/hosts"
    fi
    
    sudo systemctl restart avahi-daemon
    echo "✓ Avahi instaliran - pristup preko: http://$HOSTNAME.local:3000"
else
    echo "⊘ Avahi preskočen"
fi

echo ""
echo "=========================================="
echo "12. Instalacija Nginx (opciono)"
echo "=========================================="
read -p "Da li želiš da instaliraš Nginx reverse proxy (uklanja :3000 iz URL-a)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt install -y nginx
    
    sudo tee /etc/nginx/sites-available/qr-restaurant > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/qr-restaurant /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✓ Nginx instaliran i konfigurisan"
else
    echo "⊘ Nginx preskočen"
fi

echo ""
echo "=========================================="
echo "13. Pokretanje servisa"
echo "=========================================="

sudo systemctl daemon-reload
sudo systemctl enable qr-restaurant
sudo systemctl enable print-worker
sudo systemctl start qr-restaurant
sudo systemctl start print-worker

echo "✓ Servisi pokrenuti"

echo ""
echo "=========================================="
echo "14. Provera statusa"
echo "=========================================="

sleep 3

echo ""
echo "Status qr-restaurant:"
sudo systemctl status qr-restaurant --no-pager | head -n 10

echo ""
echo "Status print-worker:"
sudo systemctl status print-worker --no-pager | head -n 10

echo ""
echo "=========================================="
echo "  ✅ INSTALACIJA ZAVRŠENA!"
echo "=========================================="
echo ""
echo "📋 Informacije:"
echo "  Baza: $DB_NAME"
echo "  Korisnik: $DB_USER"
echo "  Lozinka: $DB_PASSWORD"
echo "  Štampač: $PRINTER_IP:$PRINTER_PORT"
echo ""
echo "🌐 Pristup aplikaciji:"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  http://$(hostname -I | awk '{print $1}')"
    if [ ! -z "$HOSTNAME" ]; then
        echo "  http://$HOSTNAME.local"
    fi
else
    echo "  http://$(hostname -I | awk '{print $1}'):3000"
    if [ ! -z "$HOSTNAME" ]; then
        echo "  http://$HOSTNAME.local:3000"
    fi
fi
echo ""
echo "👤 Default admin nalog:"
echo "  Username: admin"
echo "  Password: admin123"
echo "  (Promeni lozinku nakon prvog logovanja!)"
echo ""
echo "📝 Korisne komande:"
echo "  sudo systemctl status qr-restaurant    # Status aplikacije"
echo "  sudo systemctl restart qr-restaurant   # Restartuj aplikaciju"
echo "  sudo systemctl status print-worker     # Status print worker-a"
echo "  sudo journalctl -u qr-restaurant -f    # Prati logove aplikacije"
echo "  sudo journalctl -u print-worker -f     # Prati logove print worker-a"
echo "  ./force-rebuild.sh                     # Rebuild aplikacije"
echo ""
echo "📚 Dokumentacija:"
echo "  README.md                  # Opšte informacije"
echo "  QUICK_START.md             # Brzi start"
echo "  DEPLOYMENT.md              # Deployment uputstva"
echo "  PRINT_WORKER_SETUP.md      # Print worker setup"
echo "  AVAHI_SETUP.md             # mDNS setup"
echo ""
echo "🎉 Aplikacija je spremna za korišćenje!"
echo ""
