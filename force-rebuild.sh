#!/bin/bash

echo "=========================================="
echo "Force Rebuild - Clear all caches"
echo "=========================================="
echo ""

# Stop service
echo "1. Stopping qr-restaurant service..."
sudo systemctl stop qr-restaurant
echo ""

# Clear Next.js cache
echo "2. Clearing Next.js cache..."
rm -rf .next
echo "   ✓ .next folder deleted"
echo ""

# Clear node_modules (optional, uncomment if needed)
# echo "3. Clearing node_modules..."
# rm -rf node_modules
# npm install
# echo ""

# Rebuild
echo "3. Building Next.js..."
npm run build
echo ""

# Start service
echo "4. Starting qr-restaurant service..."
sudo systemctl start qr-restaurant
echo ""

# Check status
echo "5. Checking status..."
sudo systemctl status qr-restaurant --no-pager
echo ""

echo "=========================================="
echo "Rebuild completed!"
echo "=========================================="
echo ""
echo "Sada u browser-u:"
echo "1. Zatvori SVE tab-ove"
echo "2. Ctrl + Shift + N (Incognito)"
echo "3. Otvori stranicu"
echo "4. F12 → Console"
echo "5. Klikni Štampaj"
echo "6. Proveri da li vidiš: === NOVA VERZIJA 2024 ==="
echo ""
