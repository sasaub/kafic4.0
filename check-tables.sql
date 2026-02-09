-- Provera svih tabela u bazi

USE qr_restaurant;

-- Prikaži sve tabele
SHOW TABLES;

-- Prikaži strukturu svake tabele
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'qr_restaurant'
ORDER BY 
    TABLE_NAME;

-- Proveri da li postoji print_queue tabela
SELECT 
    COUNT(*) as table_exists
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'qr_restaurant' 
    AND TABLE_NAME = 'print_queue';
