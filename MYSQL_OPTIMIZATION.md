# MySQL Optimizacije za Produkciju

## Lokacija konfiguracije

- **Linux**: `/etc/mysql/my.cnf` ili `/etc/my.cnf`
- **Windows**: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`

## Preporučene postavke za produkciju

Dodaj sledeće u `[mysqld]` sekciju:

```ini
[mysqld]

# ============================================
# InnoDB Buffer Pool (NAJVAŽNIJE!)
# ============================================
# Postavi na 50-70% dostupnog RAM-a
# Za 4GB RAM: 2G
# Za 8GB RAM: 4G
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 2

# ============================================
# InnoDB Log Files
# ============================================
innodb_log_file_size = 256M
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2  # Brže upisi (trade-off: manje sigurnosti)

# ============================================
# Connections
# ============================================
max_connections = 200
max_connect_errors = 10000

# ============================================
# Query Cache (MySQL 5.7 i starije)
# ============================================
# MySQL 8.0 ne podržava query cache
# query_cache_size = 64M
# query_cache_type = 1

# ============================================
# Table Cache
# ============================================
table_open_cache = 2000
table_definition_cache = 1400

# ============================================
# Threads
# ============================================
thread_cache_size = 50
thread_stack = 256K

# ============================================
# InnoDB I/O Threads
# ============================================
innodb_read_io_threads = 4
innodb_write_io_threads = 4

# ============================================
# Temporary Tables
# ============================================
tmp_table_size = 64M
max_heap_table_size = 64M

# ============================================
# Sort Buffer
# ============================================
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 4M

# ============================================
# Slow Query Log (opciono, za debugging)
# ============================================
# slow_query_log = 1
# slow_query_log_file = /var/log/mysql/slow-query.log
# long_query_time = 2
```

## Nakon promene konfiguracije

1. **Restart MySQL**:
   ```bash
   # Linux
   sudo systemctl restart mysql
   
   # Windows
   net stop MySQL80
   net start MySQL80
   ```

2. **Proveri da li radi**:
   ```bash
   mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
   ```

## Monitoring

### Proveri trenutne postavke:
```sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';
```

### Proveri performanse:
```sql
SHOW STATUS LIKE 'Innodb_buffer_pool_read%';
SHOW STATUS LIKE 'Slow_queries';
```

## Napomene

- **innodb_buffer_pool_size**: Najvažnija postavka. Veći buffer = brže čitanje
- **innodb_flush_log_at_trx_commit = 2**: Brže upisi, ali manje sigurno (može izgubiti poslednje transakcije pri padu)
- **max_connections**: Povećaj ako imaš mnogo simultanih korisnika
- **Query Cache**: MySQL 8.0+ ne podržava, koristi Redis umesto toga

## Troubleshooting

### Ako MySQL ne startuje:
- Proveri logove: `/var/log/mysql/error.log`
- Smanji `innodb_buffer_pool_size` ako nema dovoljno RAM-a
- Proveri da li postoje dovoljno resursa

### Ako je sporo:
- Povećaj `innodb_buffer_pool_size`
- Proveri da li postoje indeksi (pogledaj `lib/db-optimization.sql`)
- Analiziraj slow query log
