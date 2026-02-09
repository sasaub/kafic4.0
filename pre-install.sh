#!/bin/bash

# Pre-instalaciona skripta - instalira Git i klonira repozitorijum

echo "=========================================="
echo "  QR Restaurant - Pre-instalacija"
echo "=========================================="
echo ""

# Proveri da li je root ili ima sudo
if [[ $EUID -ne 0 ]] && ! sudo -v; then
   echo "❌ Ova skripta zahteva root privilegije ili sudo pristup."
   exit 1
fi

echo "1. Ažuriranje sistema..."
sudo apt update

echo ""
echo "2. Instalacija Git-a..."
if command -v git &> /dev/null; then
    echo "✓ Git je već instaliran: $(git --version)"
else
    sudo apt install -y git
    echo "✓ Git instaliran: $(git --version)"
fi

echo ""
echo "=========================================="
echo "  ✅ Pre-instalacija završena!"
echo "=========================================="
echo ""
echo "Sada možeš da kloniraš repozitorijum:"
echo ""
echo "  git clone https://github.com/sasaub/kafic4.0.git"
echo "  cd kafic4.0"
echo "  chmod +x install.sh"
echo "  ./install.sh"
echo ""
