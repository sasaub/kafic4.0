# Debugging Mobile Access Issues

## Problem: Bela stranica na telefonu

### Mogući uzroci:

1. **Next.js dev server ne sluša na svim interfejsima**
   - Rešenje: Pokreni server sa `-H 0.0.0.0` flagom
   - Komanda: `npm run dev -- -H 0.0.0.0`

2. **Firewall blokira pristup**
   - Proveri Windows Firewall da dozvoljava pristup na portu 3000
   - Ili privremeno isključi firewall za testiranje

3. **Telefon i računar nisu na istoj mreži**
   - Proveri da li su oba na istom WiFi-u
   - Proveri IP adresu računara: `ipconfig` u Command Prompt

4. **API pozivi ne rade**
   - Proveri konzolu u browseru na telefonu (Chrome Remote Debugging)
   - Proveri Network tab da vidiš da li se API pozivi šalju

### Kako proveriti:

1. **Na računaru:**
   ```bash
   ipconfig
   # Pronađi IPv4 Address (npr. 192.168.1.100)
   ```

2. **Na telefonu:**
   - Otvori browser
   - Idi na: `http://192.168.1.100:3000/guest?table=1`
   - Ako vidiš belu stranicu, otvori Developer Tools (Chrome Remote Debugging)

3. **Chrome Remote Debugging:**
   - Na računaru: `chrome://inspect`
   - Poveži telefon preko USB-a
   - Omogući USB debugging na telefonu
   - Vidi konzolu i Network tab

### Rešenje:

1. **Pokreni server sa pravilnim hostom:**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

2. **Ili izmeni package.json:**
   ```json
   "dev": "next dev -H 0.0.0.0 --turbopack"
   ```

3. **Proveri firewall:**
   - Windows: Control Panel → Windows Defender Firewall → Allow an app
   - Dodaj Node.js ili Next.js

4. **Proveri da li telefon može da pristupi:**
   - Otvori browser na telefonu
   - Idi na: `http://[TVOJA_IP]:3000`
   - Trebalo bi da vidiš početnu stranicu


