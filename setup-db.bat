@echo off
echo ========================================
echo QR Restaurant - Database Setup
echo ========================================
echo.
echo Unesite MySQL root lozinku kada se pojavi prompt...
echo.
mysql -u root -p < setup-database.sql
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo Baza podataka uspesno kreirana!
    echo ========================================
) else (
    echo ========================================
    echo GRESKA: Baza nije kreirana!
    echo Proverite lozinku i pokusajte ponovo.
    echo ========================================
)
echo.
pause
