#!/bin/bash

# Deinstalacija Avahi (mDNS)

echo "=========================================="
echo "  Avahi (mDNS) Deinstalacija"
echo "=========================================="
echo ""
echo "Ova skripta će:"
echo "  - Zaustaviti Avahi servis"
echo "  - Deinstalirati Avahi pakete"
echo "  - Očistiti konfiguraciju"
echo ""
read -p "Da li želiš da nastaviš? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deinstalacija otkazana."
    exit 0
fi

# Detektuj da li si root
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo ""
echo "1. Zaustavljam Avahi servis..."
$SUDO systemctl stop avahi-daemon
$SUDO systemctl disable avahi-daemon

echo ""
echo "2. Deinstaliram Avahi pakete..."
$SUDO apt remove --purge avahi-daemon avahi-utils -y

echo ""
echo "3. Čistim zaostale pakete..."
$SUDO apt autoremove -y
$SUDO apt autoclean

echo ""
echo "4. Provera statusa..."
if systemctl is-active --quiet avahi-daemon; then
    echo "⚠ Avahi je još uvek aktivan"
else
    echo "✓ Avahi je zaustavljen"
fi

if command -v avahi-daemon &> /dev/null; then
    echo "⚠ Avahi paketi su još uvek instalirani"
else
    echo "✓ Avahi paketi su uklonjeni"
fi

echo ""
echo "=========================================="
echo "  ✅ Avahi deinstaliran!"
echo "=========================================="
echo ""
echo "Sada možeš pristupiti aplikaciji samo preko IP adrese:"
echo "  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Ili ako imaš Nginx:"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
