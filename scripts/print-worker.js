#!/usr/bin/env node

/**
 * Print Worker - Procesira print_jobs queue i šalje na štampač
 * 
 * Pokreni sa: node scripts/print-worker.js
 * Ili dodaj u PM2: pm2 start scripts/print-worker.js --name print-worker
 */

const mysql = require('mysql2/promise');
const net = require('net');
require('dotenv').config({ path: '.env.local' });

// Database konfiguracija
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'qr_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qr_restaurant',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

let pool;
let isProcessing = false;

// Konverzija srpskih karaktera u ASCII (bez kvačica)
function convertToASCII(text) {
  const asciiMap = {
    'Č': 'C', 'č': 'c',
    'Ć': 'C', 'ć': 'c',
    'Š': 'S', 'š': 's',
    'Ž': 'Z', 'ž': 'z',
    'Đ': 'Dj', 'đ': 'dj'
  };
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += asciiMap[char] || char;
  }
  return result;
}

// Inicijalizuj database pool
async function initDatabase() {
  pool = mysql.createPool(dbConfig);
  console.log('✓ Database pool initialized');
}

// ESC/POS komande za Birch POS štampač
function formatESCPOS(content) {
  const commands = [];
  
  // Inicijalizuj štampač
  commands.push(0x1B, 0x40); // ESC @ - Initialize printer
  
  // Postavi encoding na standardni ASCII
  commands.push(0x1B, 0x74, 0x00); // ESC t 0 - PC437 (USA, Standard Europe)
  
  // Postavi veličinu fonta (normalna)
  commands.push(0x1D, 0x21, 0x00); // GS ! 0 - Normal size
  
  // Konvertuj srpske karaktere u ASCII
  const convertedContent = convertToASCII(content);
  const contentBytes = Buffer.from(convertedContent, 'ascii');
  commands.push(...contentBytes);
  
  // Dodaj više praznih linija pre sečenja (da se sadržaj ne iseče prerano)
  commands.push(0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A); // 8 line feeds
  
  // Samo jedna komanda za sečenje - GS V 0 (Full cut)
  commands.push(0x1D, 0x56, 0x00);
  
  // Dodaj još praznih linija nakon cut komande
  commands.push(0x0A, 0x0A);
  
  return Buffer.from(commands);
}

// Pošalji na mrežni štampač
function sendToNetworkPrinter(ipAddress, port, content) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.destroy();
        console.error('✗ Printer connection timeout');
        resolve({ success: false, error: 'Connection timeout' });
      }
    }, 10000);

    client.connect(port, ipAddress, () => {
      console.log('✓ Connected to printer');
      
      const escposData = formatESCPOS(content);
      
      client.write(escposData, (err) => {
        if (err) {
          console.error('✗ Write error:', err);
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            client.destroy();
            resolve({ success: false, error: err.message });
          }
        } else {
          console.log('✓ Data sent to printer');
          setTimeout(() => {
            client.end();
          }, 500);
        }
      });
    });

    client.on('close', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.log('✓ Printer connection closed');
        resolve({ success: true });
      }
    });

    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.error('✗ Printer connection error:', err.message);
        resolve({ success: false, error: err.message });
      }
    });
  });
}

// Procesuj jedan print job
async function processJob(job) {
  const { id, payload_json, attempts } = job;
  
  try {
    console.log(`\n→ Processing job #${id} (attempt ${attempts + 1})`);
    
    // Parse payload
    const payload = JSON.parse(payload_json);
    const { type, content } = payload;
    
    if (!content) {
      throw new Error('No content in payload');
    }
    
    // Učitaj printer settings
    const [settings] = await pool.query(
      'SELECT ip_address, port, enabled FROM printer_settings WHERE id = 1 LIMIT 1'
    );
    
    if (!settings || settings.length === 0) {
      throw new Error('Printer settings not found');
    }
    
    const printerSettings = settings[0];
    const isEnabled = printerSettings.enabled === 1 || printerSettings.enabled === true;
    
    if (!isEnabled) {
      throw new Error('Printer is disabled');
    }
    
    const ipAddress = printerSettings.ip_address;
    const port = printerSettings.port || 9100;
    
    if (!ipAddress) {
      throw new Error('Printer IP address not configured');
    }
    
    // Ažuriraj status na 'printing'
    await pool.query(
      'UPDATE print_jobs SET status = ?, updated_at = NOW() WHERE id = ?',
      ['printing', id]
    );
    
    // Pošalji na štampač
    const result = await sendToNetworkPrinter(ipAddress, port, content);
    
    if (result.success) {
      // Uspešno - označi kao 'done'
      await pool.query(
        'UPDATE print_jobs SET status = ?, updated_at = NOW() WHERE id = ?',
        ['done', id]
      );
      console.log(`✓ Job #${id} completed successfully`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send to printer');
    }
    
  } catch (error) {
    console.error(`✗ Job #${id} failed:`, error.message);
    
    // Ažuriraj attempts i error
    const newAttempts = attempts + 1;
    const maxAttempts = 3;
    
    if (newAttempts >= maxAttempts) {
      // Previše pokušaja - označi kao 'failed'
      await pool.query(
        'UPDATE print_jobs SET status = ?, attempts = ?, last_error = ?, updated_at = NOW() WHERE id = ?',
        ['failed', newAttempts, error.message, id]
      );
      console.log(`✗ Job #${id} marked as failed after ${newAttempts} attempts`);
    } else {
      // Pokušaj ponovo za 5 sekundi
      await pool.query(
        'UPDATE print_jobs SET status = ?, attempts = ?, last_error = ?, next_run_at = DATE_ADD(NOW(), INTERVAL 5 SECOND), updated_at = NOW() WHERE id = ?',
        ['queued', newAttempts, error.message, id]
      );
      console.log(`→ Job #${id} will retry in 5 seconds (attempt ${newAttempts}/${maxAttempts})`);
    }
    
    return false;
  }
}

// Procesuj queue
async function processQueue() {
  if (isProcessing) {
    return; // Već procesira
  }
  
  isProcessing = true;
  
  try {
    // Uzmi sledeći job koji je 'queued' i spreman za izvršenje
    const [jobs] = await pool.query(
      `SELECT * FROM print_jobs 
       WHERE status = 'queued' 
       AND (next_run_at IS NULL OR next_run_at <= NOW())
       ORDER BY created_at ASC 
       LIMIT 1`
    );
    
    if (jobs && jobs.length > 0) {
      await processJob(jobs[0]);
    }
    
  } catch (error) {
    console.error('Queue processing error:', error);
  } finally {
    isProcessing = false;
  }
}

// Glavna funkcija
async function main() {
  console.log('=================================');
  console.log('  Print Worker Started');
  console.log('=================================');
  console.log(`Database: ${dbConfig.database}@${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log('=================================\n');
  
  try {
    await initDatabase();
    
    // Procesuj queue svake 2 sekunde
    setInterval(processQueue, 2000);
    
    console.log('✓ Worker is running...\n');
    console.log('Press Ctrl+C to stop\n');
    
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nShutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Pokreni worker
main();
