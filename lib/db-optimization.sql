-- Database Optimization Script
-- Pokreni ovaj script nakon što je baza kreirana
-- Ovo će poboljšati performanse za veliki broj porudžbina

-- Indeksi za orders tabelu
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_destination ON orders(destination);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_destination ON orders(status, destination);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(date, status);

-- Indeksi za order_items tabelu
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON order_items(category);

-- Indeksi za menu_items tabelu
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);

-- Indeksi za categories tabelu
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Indeksi za tables tabelu
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(number);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

-- Indeksi za monthly_payments tabelu
CREATE INDEX IF NOT EXISTS idx_monthly_payments_table_id ON monthly_payments(table_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_date ON monthly_payments(date);

-- Indeksi za users tabelu
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Analiza tabela za optimizaciju query planera
ANALYZE TABLE orders;
ANALYZE TABLE order_items;
ANALYZE TABLE menu_items;
ANALYZE TABLE categories;
ANALYZE TABLE tables;
ANALYZE TABLE monthly_payments;
ANALYZE TABLE users;
