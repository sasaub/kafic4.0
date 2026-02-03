-- Dodaj waiter_id kolonu u orders tabelu
ALTER TABLE orders 
ADD COLUMN waiter_id INT NULL,
ADD FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL;
