#!/bin/bash

# QR Restaurant - Automatska instalacija za Debian/Ubuntu
# Ova skripta instalira sve potrebne komponente i podešava sistem

set -e  # Zaustavi skriptu ako bilo koja komanda ne uspe

# Detektuj da li si root
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
    # Proveri da li sudo postoji
    if ! command -v sudo &> /dev/null; then
        echo "❌ sudo nije instaliran. Pokreni skriptu kao root ili instaliraj sudo."
        exit 1
    fi
fi

echo "=========================================="
echo "  QR Restaurant - Automatska Instalacija"
echo "=========================================="
echo ""
echo "Ova skripta će instalirati:"
echo "  - Node.js i npm"
echo "  - MariaDB server"
echo "  - Nginx (opciono)"
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

echo ""
echo "=========================================="
echo "1. Ažuriranje sistema i instalacija Git"
echo "=========================================="
$SUDO apt update
$SUDO apt upgrade -y

# Instaliraj Git ako nije instaliran
if command -v git &> /dev/null; then
    echo "✓ Git je već instaliran: $(git --version)"
else
    echo "Instaliram Git..."
    $SUDO apt install -y git
    echo "✓ Git instaliran: $(git --version)"
fi

# Instaliraj curl ako nije instaliran
if command -v curl &> /dev/null; then
    echo "✓ curl je već instaliran"
else
    echo "Instaliram curl..."
    $SUDO apt install -y curl
    echo "✓ curl instaliran"
fi

echo ""
echo "=========================================="
echo "2. Instalacija Node.js i npm"
echo "=========================================="
if command -v node &> /dev/null; then
    echo "✓ Node.js je već instaliran: $(node --version)"
else
    echo "Instaliram Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
    $SUDO apt install -y nodejs
    echo "✓ Node.js instaliran: $(node --version)"
fi

echo ""
echo "=========================================="
echo "3. Instalacija MariaDB servera"
echo "=========================================="
if command -v mariadb &> /dev/null || command -v mysql &> /dev/null; then
    echo "✓ MariaDB/MySQL je već instaliran"
else
    echo "Instaliram MariaDB server..."
    $SUDO apt install -y mariadb-server
    $SUDO systemctl start mariadb
    $SUDO systemctl enable mariadb
    echo "✓ MariaDB instaliran"
fi

echo ""
echo "=========================================="
echo "4. Konfiguracija MariaDB baze"
echo "=========================================="
echo ""
echo "Unesite MariaDB root lozinku (ostavite prazno ako nema lozinke):"
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
    MYSQL_CMD="$SUDO mariadb"
else
    MYSQL_CMD="mariadb -u root -p$MYSQL_ROOT_PASSWORD"
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
        $SUDO mariadb $DB_NAME < lib/db-schema.sql
    else
        mariadb -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME < lib/db-schema.sql
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
    $SUDO mariadb $DB_NAME <<EOF
INSERT INTO printer_settings (id, ip_address, port, enabled) 
VALUES (1, '$PRINTER_IP', $PRINTER_PORT, 1)
ON DUPLICATE KEY UPDATE 
  ip_address = '$PRINTER_IP',
  port = $PRINTER_PORT,
  enabled = 1;
EOF
else
    mariadb -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME <<EOF
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

$SUDO tee /etc/systemd/system/qr-restaurant.service > /dev/null <<EOF
[Unit]
Description=QR Restaurant Next.js Application
After=network.target mariadb.service

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

$SUDO tee /etc/systemd/system/print-worker.service > /dev/null <<EOF
[Unit]
Description=QR Restaurant Print Worker
After=network.target mariadb.service

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
echo "11. Instalacija Nginx (opciono)"
echo "=========================================="
read -p "Da li želiš da instaliraš Nginx reverse proxy (uklanja :3000 iz URL-a)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    $SUDO apt install -y nginx
    
    $SUDO tee /etc/nginx/sites-available/qr-restaurant > /dev/null <<EOF
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

    $SUDO ln -sf /etc/nginx/sites-available/qr-restaurant /etc/nginx/sites-enabled/
    $SUDO rm -f /etc/nginx/sites-enabled/default
    $SUDO nginx -t
    $SUDO systemctl restart nginx
    $SUDO systemctl enable nginx
    echo "✓ Nginx instaliran i konfigurisan"
    NGINX_INSTALLED=true
else
    echo "⊘ Nginx preskočen"
    NGINX_INSTALLED=false
fi

echo ""
echo "=========================================="
echo "12. Pokretanje servisa"
echo "=========================================="

$SUDO systemctl daemon-reload
$SUDO systemctl enable qr-restaurant
$SUDO systemctl enable print-worker
$SUDO systemctl start qr-restaurant
$SUDO systemctl start print-worker

echo "✓ Servisi pokrenuti"

echo ""
echo "=========================================="
echo "13. Provera statusa"
echo "=========================================="

sleep 3

echo ""
echo "Status qr-restaurant:"
$SUDO systemctl status qr-restaurant --no-pager | head -n 10

echo ""
echo "Status print-worker:"
$SUDO systemctl status print-worker --no-pager | head -n 10

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
if [ "$NGINX_INSTALLED" = true ]; then
    echo "  http://$(hostname -I | awk '{print $1}')"
else
    echo "  http://$(hostname -I | awk '{print $1}'):3000"
fi
echo ""
echo "👤 Default admin nalog:"
echo "  Username: admin"
echo "  Password: admin123"
echo "  (Promeni lozinku nakon prvog logovanja!)"
echo ""
echo "📝 Korisne komande:"
echo "  $SUDO systemctl status qr-restaurant    # Status aplikacije"
echo "  $SUDO systemctl restart qr-restaurant   # Restartuj aplikaciju"
echo "  $SUDO systemctl status print-worker     # Status print worker-a"
echo "  $SUDO journalctl -u qr-restaurant -f    # Prati logove aplikacije"
echo "  $SUDO journalctl -u print-worker -f     # Prati logove print worker-a"
echo "  ./force-rebuild.sh                      # Rebuild aplikacije"
echo ""
echo "🎉 Aplikacija je spremna za korišćenje!"
echo ""
