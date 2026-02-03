USE qr_restaurant;

-- Kreiraj tabelu za podešavanja štampača
CREATE TABLE IF NOT EXISTS printer_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ip_address VARCHAR(255) NOT NULL DEFAULT '',
  port INT NOT NULL DEFAULT 9100,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ubaci default vrednosti (jedan red)
INSERT INTO printer_settings (id, ip_address, port, enabled) 
VALUES (1, '', 9100, FALSE)
ON DUPLICATE KEY UPDATE ip_address = ip_address;
