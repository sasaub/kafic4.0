@echo off
echo ==========================================
echo Testing /api/print endpoint
echo ==========================================
echo.

echo 1. Checking printer settings...
curl -s http://localhost:3000/api/printer-settings
echo.
echo.

echo 2. Sending test print job...
curl -X POST http://localhost:3000/api/print -H "Content-Type: application/json" -d "{\"type\":\"test\",\"content\":\"TEST STAMPANJE\n\nOvo je test poruka\n\"}"
echo.
echo.

echo ==========================================
echo Test completed!
echo ==========================================
pause
