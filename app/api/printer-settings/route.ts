import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TableRow {
  TABLE_NAME: string;
}

interface PrinterSettingsRow {
  id: number;
  ip_address: string;
  port: number;
  enabled: boolean | number;
}

// Funkcija za proveru i kreiranje printer_settings tabele ako ne postoji
async function ensurePrinterSettingsTable() {
  try {
    // Proveri da li tabela postoji
    const tables = await query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'printer_settings'`
    ) as TableRow[];
    
    if (!Array.isArray(tables) || tables.length === 0) {
      // Tabela ne postoji, kreiraj je
      console.log('printer_settings tabela ne postoji, kreiram je...');
      
      await query(`
        CREATE TABLE printer_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          ip_address VARCHAR(255) NOT NULL DEFAULT '',
          port INT NOT NULL DEFAULT 9100,
          enabled BOOLEAN NOT NULL DEFAULT FALSE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // Ubaci default vrednosti
      await query(`
        INSERT INTO printer_settings (id, ip_address, port, enabled) 
        VALUES (1, '', 9100, FALSE)
      `);
      
      console.log('printer_settings tabela je uspešno kreirana');
    } else {
      // Proveri da li postoji red sa id=1
      const existing = await query(
        'SELECT id FROM printer_settings WHERE id = 1'
      ) as Array<{ id: number }>;
      
      if (!Array.isArray(existing) || existing.length === 0) {
        // Nema reda, dodaj ga
        await query(`
          INSERT INTO printer_settings (id, ip_address, port, enabled) 
          VALUES (1, '', 9100, FALSE)
        `);
      }
    }
  } catch (error) {
    console.error('Error checking/creating printer_settings table:', error);
  }
}

// GET - Uzmi podešavanja štampača
export async function GET() {
  try {
    await ensurePrinterSettingsTable();
    
    const result = await query(
      'SELECT ip_address, port, enabled FROM printer_settings WHERE id = 1 LIMIT 1'
    ) as PrinterSettingsRow[];
    
    if (Array.isArray(result) && result.length > 0) {
      return NextResponse.json({
        ipAddress: result[0].ip_address || '',
        port: result[0].port || 9100,
        enabled: result[0].enabled === 1 || result[0].enabled === true,
      });
    }
    
    // Ako nema rezultata, vrati default vrednosti
    return NextResponse.json({
      ipAddress: '',
      port: 9100,
      enabled: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching printer settings:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Sačuvaj podešavanja štampača
export async function POST(request: NextRequest) {
  try {
    await ensurePrinterSettingsTable();
    
    const body = await request.json();
    const { ipAddress, port, enabled } = body;
    
    // Ažuriraj postojeći red (id=1) ili kreiraj novi ako ne postoji
    await query(
      `INSERT INTO printer_settings (id, ip_address, port, enabled) 
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         ip_address = VALUES(ip_address),
         port = VALUES(port),
         enabled = VALUES(enabled)`,
      [ipAddress || '', port || 9100, enabled === true || enabled === 1]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving printer settings:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
