#!/bin/bash

# MySQL Backup Script za QR Restaurant
# Pokreni: chmod +x scripts/backup.sh
# Dodaj u cron: 0 2 * * * /path/to/scripts/backup.sh

# Konfiguracija
DB_USER="qr_restaurant_user"
DB_PASSWORD="JAKA_LOZINKA_OVDE"
DB_NAME="qr_restaurant"
BACKUP_DIR="/var/backups/qr-restaurant"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Kreiraj backup direktorijum ako ne postoji
mkdir -p $BACKUP_DIR

# Kreiraj backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Obriši stare backup-e (starije od RETENTION_DAYS dana)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Loguj rezultat
if [ $? -eq 0 ]; then
    echo "$(date): Backup uspešan - backup_$DATE.sql.gz" >> $BACKUP_DIR/backup.log
else
    echo "$(date): Backup NEUSPEŠAN!" >> $BACKUP_DIR/backup.log
fi
