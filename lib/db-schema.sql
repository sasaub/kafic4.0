-- Database schema za QR Restaurant aplikaciju

CREATE DATABASE IF NOT EXISTS qr_restaurant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_restaurant;

-- Tabela za korisnike
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'waiter', 'waiter-admin', 'kitchen') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela za kategorije
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Hrana', 'Piće') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela za meni stavke
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tabela za stolove
CREATE TABLE IF NOT EXISTS tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  status ENUM('Slobodan', 'Zauzet', 'Rezervisan') DEFAULT 'Slobodan',
  qr_code VARCHAR(100) NOT NULL,
  monthly_payment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela za mesečna plaćanja
CREATE TABLE IF NOT EXISTS monthly_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);

-- Tabela za porudžbine
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('Novo', 'Potvrđeno', 'U pripremi', 'Spremno', 'Dostavljeno') DEFAULT 'Novo',
  time TIME NOT NULL,
  date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'low',
  destination ENUM('kitchen', 'waiter') DEFAULT 'waiter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_destination (destination)
);

-- Tabela za stavke porudžbine
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert default korisnike
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('konobar', 'konobar123', 'waiter'),
('konobaradmin', 'konobaradmin123', 'waiter-admin'),
('kuhinja', 'kuhinja123', 'kitchen')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default kategorije
INSERT INTO categories (name, type) VALUES
('Glavna jela', 'Hrana'),
('Salate', 'Hrana'),
('Deserti', 'Hrana'),
('Sokovi', 'Piće'),
('Kafe', 'Piće'),
('Alkohol', 'Piće')
ON DUPLICATE KEY UPDATE name=name;


