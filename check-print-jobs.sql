-- Provera print_jobs tabele

USE qr_restaurant;

-- Prikaži strukturu tabele
DESCRIBE print_jobs;

-- Prikaži sve podatke iz tabele
SELECT * FROM print_jobs ORDER BY created_at DESC LIMIT 10;

-- Prikaži broj poslova po statusu
SELECT status, COUNT(*) as count FROM print_jobs GROUP BY status;
