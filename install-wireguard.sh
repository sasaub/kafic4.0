#!/bin/bash

# WireGuard VPN - Automatska instalacija i konfiguracija
# Ova skripta instalira WireGuard i konfiguriše ga sa tvojim .conf fajlom

set -e  # Zaustavi skriptu ako bilo koja komanda ne uspe

# Detektuj da li si root
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo "=========================================="
echo "  WireGuard VPN - Instalacija"
echo "=========================================="
echo ""
echo "Ova skripta će:"
echo "  - Instalirati WireGuard"
echo "  - Konfigurisati VPN konekciju"
echo "  - Omogućiti auto-start pri boot-u"
echo ""
read -p "Da li želiš da nastaviš? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Instalacija otkazana."
    exit 1
fi

echo ""
echo "=========================================="
echo "1. Instalacija WireGuard paketa"
echo "=========================================="

if command -v wg &> /dev/null; then
    echo "✓ WireGuard je već instaliran: $(wg --version)"
else
    echo "Instaliram WireGuard..."
    $SUDO apt update
    $SUDO apt install -y wireguard wireguard-tools
    echo "✓ WireGuard instaliran"
fi

echo ""
echo "=========================================="
echo "2. Konfiguracija WireGuard konekcije"
echo "=========================================="
echo ""
echo "Opcije za konfiguraciju:"
echo "  1) Kopiraj postojeći .conf fajl"
echo "  2) Unesi sadržaj .conf fajla ručno"
echo ""
read -p "Izaberi opciju (1 ili 2): " CONFIG_OPTION

if [ "$CONFIG_OPTION" = "1" ]; then
    echo ""
    read -p "Putanja do .conf fajla (npr. /home/user/wg0.conf): " CONF_PATH
    
    if [ ! -f "$CONF_PATH" ]; then
        echo "❌ Fajl ne postoji: $CONF_PATH"
        exit 1
    fi
    
    # Izvuci ime interfejsa iz imena fajla (npr. wg0.conf -> wg0)
    INTERFACE_NAME=$(basename "$CONF_PATH" .conf)
    
    echo "Kopiram konfiguraciju..."
    $SUDO cp "$CONF_PATH" /etc/wireguard/$INTERFACE_NAME.conf
    $SUDO chmod 600 /etc/wireguard/$INTERFACE_NAME.conf
    
elif [ "$CONFIG_OPTION" = "2" ]; then
    echo ""
    read -p "Ime interfejsa (default: wg0): " INTERFACE_NAME
    INTERFACE_NAME=${INTERFACE_NAME:-wg0}
    
    echo ""
    echo "Unesi sadržaj .conf fajla (završi sa Ctrl+D):"
    echo "Primer:"
    echo "[Interface]"
    echo "PrivateKey = tvoj_private_key"
    echo "Address = 10.0.0.2/24"
    echo ""
    echo "[Peer]"
    echo "PublicKey = server_public_key"
    echo "Endpoint = server_ip:51820"
    echo "AllowedIPs = 0.0.0.0/0"
    echo "PersistentKeepalive = 25"
    echo ""
    
    CONF_CONTENT=$(cat)
    
    echo "$CONF_CONTENT" | $SUDO tee /etc/wireguard/$INTERFACE_NAME.conf > /dev/null
    $SUDO chmod 600 /etc/wireguard/$INTERFACE_NAME.conf
    
else
    echo "❌ Nepoznata opcija"
    exit 1
fi

echo "✓ Konfiguracija sačuvana: /etc/wireguard/$INTERFACE_NAME.conf"

echo ""
echo "=========================================="
echo "3. Omogućavanje i pokretanje WireGuard"
echo "=========================================="

# Omogući auto-start pri boot-u
$SUDO systemctl enable wg-quick@$INTERFACE_NAME

# Pokreni WireGuard
echo "Pokrećem WireGuard..."
$SUDO systemctl start wg-quick@$INTERFACE_NAME

echo "✓ WireGuard pokrenut"

echo ""
echo "=========================================="
echo "4. Provera statusa"
echo "=========================================="

sleep 2

echo ""
echo "Status WireGuard servisa:"
$SUDO systemctl status wg-quick@$INTERFACE_NAME --no-pager | head -n 10

echo ""
echo "WireGuard interfejs:"
$SUDO wg show

echo ""
echo "=========================================="
echo "  ✅ WIREGUARD INSTALIRAN!"
echo "=========================================="
echo ""
echo "📋 Informacije:"
echo "  Interfejs: $INTERFACE_NAME"
echo "  Konfiguracija: /etc/wireguard/$INTERFACE_NAME.conf"
echo ""
echo "📝 Korisne komande:"
echo "  $SUDO systemctl status wg-quick@$INTERFACE_NAME    # Status"
echo "  $SUDO systemctl restart wg-quick@$INTERFACE_NAME   # Restartuj"
echo "  $SUDO systemctl stop wg-quick@$INTERFACE_NAME      # Zaustavi"
echo "  $SUDO wg show                                       # Prikaži status"
echo "  $SUDO wg show $INTERFACE_NAME                      # Detaljni status"
echo ""
echo "🔧 Editovanje konfiguracije:"
echo "  $SUDO nano /etc/wireguard/$INTERFACE_NAME.conf"
echo "  $SUDO systemctl restart wg-quick@$INTERFACE_NAME   # Nakon izmene"
echo ""
echo "🎉 WireGuard VPN je spreman!"
echo ""
