# 📤 GitHub Push Instrukcije

## ⚠️ Problem sa Permisijama

Greška: `Permission to sasaub/kafic4.0.git denied to Damjan1319`

Ovo znači da pokušavaš da push-uješ sa `Damjan1319` nalogom na `sasaub` repozitorijum.

## ✅ Rešenja

### Opcija 1: GitHub CLI (Preporučeno)

1. **Instaliraj GitHub CLI** (ako nemaš):
   ```bash
   winget install GitHub.cli
   ```

2. **Autentifikuj se sa sasaub nalogom**:
   ```bash
   gh auth login
   ```
   - Izaberi "GitHub.com"
   - Izaberi "HTTPS"
   - Izaberi "Login with a web browser"
   - Kopiraj kod i prati instrukcije

3. **Push-uj projekat**:
   ```bash
   git push sasaub main
   ```

### Opcija 2: Personal Access Token

1. **Kreiraj Personal Access Token**:
   - Idi na: https://github.com/settings/tokens
   - Klikni "Generate new token" → "Generate new token (classic)"
   - Daj mu ime: "kafic4.0-push"
   - Izaberi scope: `repo` (sve)
   - Klikni "Generate token"
   - **KOPIRAJ TOKEN** (nećeš ga više videti!)

2. **Koristi token umesto lozinke**:
   ```bash
   git push sasaub main
   ```
   - Username: `sasaub`
   - Password: `[tvoj-token]` (ne lozinka!)

### Opcija 3: SSH Key

1. **Kreiraj SSH key** (ako nemaš):
   ```bash
   ssh-keygen -t ed25519 -C "sasaub@github.com"
   ```

2. **Dodaj SSH key na GitHub**:
   - Kopiraj sadržaj `~/.ssh/id_ed25519.pub`
   - Idi na: https://github.com/settings/keys
   - Klikni "New SSH key"
   - Nalepi key i sačuvaj

3. **Promeni remote na SSH**:
   ```bash
   git remote set-url sasaub git@github.com:sasaub/kafic4.0.git
   ```

4. **Push-uj**:
   ```bash
   git push sasaub main
   ```

## 🔄 Alternativno: Push preko origin

Ako želiš da push-uješ na svoj nalog prvo, pa onda da sasaub fork-uje:

```bash
git push origin main
```

Zatim na GitHub-u:
1. Idi na https://github.com/sasaub/kafic4.0
2. Klikni "Fork" ili "Sync fork"
3. Ili ručno kopiraj fajlove

## ✅ Provera

Nakon uspešnog push-a:
```bash
git remote -v
git log --oneline -5
```

Proveri na GitHub-u: https://github.com/sasaub/kafic4.0
