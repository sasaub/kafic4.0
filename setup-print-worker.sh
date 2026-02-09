#!/bin/bash

# Setup script za print-worker servis

echo "=========================================="
echo "Setting up Print Worker Service"
echo "=========================================="
echo ""

# Proveri da li je Node.js instaliran
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nije instaliran!"
    echo "Instaliraj Node.js prvo: sudo apt install nodejs npm"
    exit 1
fi

echo "✓ Node.js verzija: $(node --version)"
echo ""

# Proveri da li postoji scripts/print-worker.js
if [ ! -f "scripts/print-worker.js" ]; then
    echo "❌ scripts/print-worker.js ne postoji!"
    exit 1
fi

echo "✓ scripts/print-worker.js postoji"
echo ""

# Proveri da li postoji .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local ne postoji!"
    echo "Kreiraj .env.local sa database credentials"
    exit 1
fi

echo "✓ .env.local postoji"
echo ""

# Instaliraj dependencies ako nisu instalirani
if [ ! -d "node_modules" ]; then
    echo "📦 Instaliram dependencies..."
    npm install
    echo ""
fi

# Kreiraj systemd service file
SERVICE_FILE="/etc/systemd/system/print-worker.service"
CURRENT_DIR=$(pwd)

echo "📝 Kreiram systemd service file..."

sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=QR Restaurant Print Worker
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/node $CURRENT_DIR/scripts/print-worker.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=print-worker

# Environment
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Service file kreiran: $SERVICE_FILE"
echo ""

# Reload systemd
echo "🔄 Reload systemd daemon..."
sudo systemctl daemon-reload
echo ""

# Enable service
echo "✅ Enable print-worker service..."
sudo systemctl enable print-worker
echo ""

# Start service
echo "🚀 Start print-worker service..."
sudo systemctl start print-worker
echo ""

# Check status
echo "📊 Status:"
sudo systemctl status print-worker --no-pager
echo ""

echo "=========================================="
echo "Setup completed!"
echo "=========================================="
echo ""
echo "Korisne komande:"
echo "  sudo systemctl status print-worker    # Proveri status"
echo "  sudo systemctl restart print-worker   # Restartuj"
echo "  sudo systemctl stop print-worker      # Zaustavi"
echo "  sudo journalctl -u print-worker -f    # Prati logove"
echo ""
