#!/bin/bash

# WireGuard VPN - Deinstalacija

set -e

# Detektuj da li si root
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo "=========================================="
echo "  WireGuard VPN - Deinstalacija"
echo "=========================================="
echo ""
read -p "Da li si siguran da želiš da deinstaliraš WireGuard? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deinstalacija otkazana."
    exit 0
fi

echo ""
echo "Zaustavljam sve WireGuard interfejse..."
for interface in /etc/wireguard/*.conf; do
    if [ -f "$interface" ]; then
        INTERFACE_NAME=$(basename "$interface" .conf)
        echo "Zaustavljam $INTERFACE_NAME..."
        $SUDO systemctl stop wg-quick@$INTERFACE_NAME 2>/dev/null || true
        $SUDO systemctl disable wg-quick@$INTERFACE_NAME 2>/dev/null || true
    fi
done

echo ""
echo "Uklanjam WireGuard pakete..."
$SUDO apt remove -y wireguard wireguard-tools

echo ""
read -p "Da li želiš da obrišeš i konfiguracione fajlove? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Brišem konfiguracione fajlove..."
    $SUDO rm -rf /etc/wireguard/
    echo "✓ Konfiguracioni fajlovi obrisani"
else
    echo "⊘ Konfiguracioni fajlovi zadržani u /etc/wireguard/"
fi

echo ""
echo "=========================================="
echo "  ✅ WIREGUARD DEINSTALIRAN!"
echo "=========================================="
echo ""
