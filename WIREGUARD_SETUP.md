# WireGuard VPN Setup

WireGuard je brz, moderan i siguran VPN protokol koji omogućava siguran pristup serveru preko interneta.

## Instalacija

### Automatska instalacija

```bash
chmod +x install-wireguard.sh
./install-wireguard.sh
```

Skripta će te pitati:
1. Da li želiš da kopijaš postojeći `.conf` fajl ili da ga uneseš ručno
2. Ime interfejsa (default: `wg0`)

### Ručna instalacija

```bash
# Instaliraj WireGuard
sudo apt update
sudo apt install -y wireguard wireguard-tools

# Kopiraj .conf fajl
sudo cp tvoj-fajl.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf

# Pokreni WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

## Primer .conf fajla

```ini
[Interface]
PrivateKey = tvoj_private_key_ovde
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = server_public_key_ovde
Endpoint = server_ip:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

## Upravljanje WireGuard-om

### Status

```bash
# Proveri status servisa
sudo systemctl status wg-quick@wg0

# Prikaži WireGuard interfejs
sudo wg show

# Detaljni status
sudo wg show wg0
```

### Pokretanje/Zaustavljanje

```bash
# Pokreni
sudo systemctl start wg-quick@wg0

# Zaustavi
sudo systemctl stop wg-quick@wg0

# Restartuj
sudo systemctl restart wg-quick@wg0
```

### Omogući/Onemogući auto-start

```bash
# Omogući auto-start pri boot-u
sudo systemctl enable wg-quick@wg0

# Onemogući auto-start
sudo systemctl disable wg-quick@wg0
```

## Editovanje konfiguracije

```bash
# Edituj konfiguraciju
sudo nano /etc/wireguard/wg0.conf

# Restartuj nakon izmene
sudo systemctl restart wg-quick@wg0
```

## Testiranje konekcije

```bash
# Proveri da li je interfejs aktivan
ip addr show wg0

# Proveri routing
ip route

# Ping WireGuard server (zameni sa tvojom adresom)
ping 10.0.0.1

# Proveri javnu IP adresu (trebalo bi da bude server IP)
curl ifconfig.me
```

## Logovi

```bash
# Prati logove u realnom vremenu
sudo journalctl -u wg-quick@wg0 -f

# Poslednje logove
sudo journalctl -u wg-quick@wg0 -n 50

# Logovi sa greškama
sudo journalctl -u wg-quick@wg0 -p err
```

## Troubleshooting

### WireGuard se ne povezuje

1. Proveri da li je konfiguracija ispravna:
```bash
sudo wg show
```

2. Proveri logove:
```bash
sudo journalctl -u wg-quick@wg0 -n 50
```

3. Proveri da li server sluša na portu:
```bash
# Sa servera
sudo netstat -tulpn | grep 51820
```

4. Proveri firewall:
```bash
# Otvori WireGuard port (ako je potrebno)
sudo ufw allow 51820/udp
```

### Nema internet pristupa preko VPN-a

1. Proveri `AllowedIPs` u konfiguraciji:
```ini
AllowedIPs = 0.0.0.0/0  # Sav saobraćaj kroz VPN
```

2. Proveri DNS:
```ini
DNS = 1.1.1.1, 8.8.8.8
```

3. Proveri routing:
```bash
ip route
```

### Konekcija se prekida

Dodaj `PersistentKeepalive` u konfiguraciju:
```ini
[Peer]
...
PersistentKeepalive = 25
```

## Deinstalacija

```bash
chmod +x uninstall-wireguard.sh
./uninstall-wireguard.sh
```

Ili ručno:

```bash
# Zaustavi i onemogući servis
sudo systemctl stop wg-quick@wg0
sudo systemctl disable wg-quick@wg0

# Ukloni pakete
sudo apt remove -y wireguard wireguard-tools

# Obriši konfiguracione fajlove (opciono)
sudo rm -rf /etc/wireguard/
```

## Sigurnosne preporuke

1. **Čuvaj private key sigurno** - nikada ga ne deli
2. **Koristi jake ključeve** - WireGuard automatski generiše jake ključeve
3. **Ograniči AllowedIPs** - ako ne trebaš sav saobraćaj kroz VPN, ograniči na specifične IP-ove
4. **Koristi firewall** - ograniči pristup WireGuard portu samo na poznate IP-ove
5. **Redovno ažuriraj** - `sudo apt update && sudo apt upgrade`

## Dodatne informacije

- [WireGuard Official Site](https://www.wireguard.com/)
- [WireGuard Quick Start](https://www.wireguard.com/quickstart/)
- [WireGuard Documentation](https://git.zx2c4.com/wireguard-tools/about/src/man/wg.8)
