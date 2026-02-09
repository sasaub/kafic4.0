#!/bin/bash

# Test script za /api/print endpoint

echo "=========================================="
echo "Testing /api/print endpoint"
echo "=========================================="
echo ""

# Test 1: Proveri printer settings
echo "1. Checking printer settings..."
curl -s http://localhost:3000/api/printer-settings | jq .
echo ""

# Test 2: Pošalji test print job
echo "2. Sending test print job..."
curl -X POST http://localhost:3000/api/print \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "content": "TEST STAMPANJE\n\nOvo je test poruka\n\nVreme: '"$(date '+%Y-%m-%d %H:%M:%S')"'\n"
  }' | jq .
echo ""

# Test 3: Proveri print_jobs tabelu
echo "3. Checking print_jobs table..."
mysql -u qr_user -p'>StrongPass123!' qr_restaurant -e "SELECT id, status, attempts, created_at FROM print_jobs ORDER BY id DESC LIMIT 5;"
echo ""

echo "=========================================="
echo "Test completed!"
echo "=========================================="
