#!/bin/bash

# QR Restaurant - Brza instalacija (sve u jednom)
# Ova skripta instalira Git, klonira repo i pokreće instalaciju

set -e

echo "=========================================="
echo "  QR Restaurant - Brza Instalacija"
echo "=========================================="
echo ""

# Proveri da li je root ili ima sudo
if [[ $EUID -ne 0 ]] && ! sudo -v; then
   echo "❌ Ova skripta zahteva root privilegije ili sudo pristup."
   exit 1
fi

# 1. Instaliraj Git ako nije instaliran
echo "1. Proveravam Git..."
if command -v git &> /dev/null; then
    echo "✓ Git je već instaliran: $(git --version)"
else
    echo "Instaliram Git..."
    sudo apt update
    sudo apt install -y git
    echo "✓ Git instaliran: $(git --version)"
fi

# 2. Kloniraj repozitorijum
echo ""
echo "2. Kloniram repozitorijum..."
INSTALL_DIR="/opt/qr-restaurant"

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠ Folder $INSTALL_DIR već postoji."
    read -p "Da li želiš da obrišeš postojeći folder i instaliraš ponovo? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo rm -rf $INSTALL_DIR
    else
        echo "Instalacija otkazana."
        exit 1
    fi
fi

sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/sasaub/kafic4.0.git qr-restaurant
cd qr-restaurant

echo "✓ Repozitorijum kloniran u $INSTALL_DIR"

# 3. Pokreni glavnu instalacionu skriptu
echo ""
echo "3. Pokrećem glavnu instalaciju..."
echo ""
sudo chmod +x install.sh
sudo ./install.sh

echo ""
echo "=========================================="
echo "  ✅ INSTALACIJA ZAVRŠENA!"
echo "=========================================="
echo ""
