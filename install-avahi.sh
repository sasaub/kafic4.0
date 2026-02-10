#!/bin/bash

# Instalacija Avahi (mDNS) za lokalni pristup

echo "=========================================="
echo "  Avahi (mDNS) Instalacija"
echo "=========================================="
echo ""
echo "Avahi omogućava pristup preko:"
echo "  http://menikod.local:3000"
echo ""
read -p "Da li želiš da nastaviš? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Instalacija otkazana."
    exit 0
fi

# Detektuj da li si root
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo ""
echo "1. Instaliram Avahi pakete..."
$SUDO apt update
$SUDO apt install -y avahi-daemon avahi-utils

echo ""
echo "2. Pokrećem Avahi servis..."
$SUDO systemctl start avahi-daemon
$SUDO systemctl enable avahi-daemon

echo ""
echo "3. Konfigurisanje hostname-a..."
read -p "Hostname za mDNS (default: menikod): " HOSTNAME
HOSTNAME=${HOSTNAME:-menikod}

# Dodaj hostname u /etc/hosts ako već nije tu
if ! grep -q "$HOSTNAME" /etc/hosts; then
    $SUDO sed -i "s/127.0.1.1.*/& $HOSTNAME/" /etc/hosts
    echo "✓ Hostname $HOSTNAME dodat u /etc/hosts"
else
    echo "✓ Hostname $HOSTNAME već postoji u /etc/hosts"
fi

echo ""
echo "4. Restartovanje Avahi servisa..."
$SUDO systemctl restart avahi-daemon

echo ""
echo "5. Provera statusa..."
$SUDO systemctl status avahi-daemon --no-pager | head -n 10

echo ""
echo "=========================================="
echo "  ✅ Avahi instaliran!"
echo "=========================================="
echo ""
echo "Sada možeš pristupiti aplikaciji preko:"
echo "  http://$HOSTNAME.local:3000"
echo ""
echo "Ili ako imaš Nginx:"
echo "  http://$HOSTNAME.local"
echo ""
echo "Testiranje:"
echo "  ping $HOSTNAME.local"
echo ""
echo "Ako ne radi, pokreni: ./uninstall-avahi.sh"
echo ""
