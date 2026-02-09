import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Socket } from 'net';

interface PrinterSettingsRow {
  ip_address: string;
  port: number;
  enabled: boolean | number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Učitaj podešavanja štampača
    const settings = await query(
      'SELECT ip_address, port, enabled FROM printer_settings WHERE id = 1 LIMIT 1'
    ) as PrinterSettingsRow[];

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: 'Printer settings not found' },
        { status: 404 }
      );
    }

    const printerSettings = settings[0];
    const isEnabled = printerSettings.enabled === 1 || printerSettings.enabled === true;

    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Printer is disabled' },
        { status: 400 }
      );
    }

    const ipAddress = printerSettings.ip_address;
    const port = printerSettings.port || 9100;

    if (!ipAddress) {
      return NextResponse.json(
        { error: 'Printer IP address not configured' },
        { status: 400 }
      );
    }

    // Pošalji podatke na mrežni štampač
    const success = await sendToNetworkPrinter(ipAddress, port, content);

    if (success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send to printer' },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Print API error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ESC/POS komande za Birch POS štampač
const ESC = '\x1B';
const GS = '\x1D';

// Funkcija za formatiranje sadržaja sa ESC/POS komandama
function formatESCPOS(content: string): Buffer {
  const commands: number[] = [];
  
  // Inicijalizuj štampač
  commands.push(0x1B, 0x40); // ESC @ - Initialize printer
  
  // Postavi encoding na UTF-8 / Code page
  commands.push(0x1B, 0x74, 0x10); // ESC t 16 - Select character code table (WPC1252)
  
  // Postavi veličinu fonta (normalna)
  commands.push(0x1D, 0x21, 0x00); // GS ! 0 - Normal size
  
  // Dodaj sadržaj
  const contentBytes = Buffer.from(content, 'utf8');
  commands.push(...contentBytes);
  
  // Dodaj nekoliko praznih linija pre sečenja
  commands.push(0x0A, 0x0A, 0x0A); // Line feeds
  
  // Seči papir (full cut)
  commands.push(0x1D, 0x56, 0x00); // GS V 0 - Full cut
  
  // Alternativno: partial cut (ako full cut ne radi)
  // commands.push(0x1D, 0x56, 0x01); // GS V 1 - Partial cut
  
  return Buffer.from(commands);
}

// Funkcija za slanje podataka na mrežni štampač preko TCP socket-a
function sendToNetworkPrinter(
  ipAddress: string,
  port: number,
  content: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const client = new Socket();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.destroy();
        console.error('Printer connection timeout');
        resolve(false);
      }
    }, 10000); // 10 sekundi timeout

    client.connect(port, ipAddress, () => {
      console.log('Connected to printer');
      
      // Formatiraj sadržaj sa ESC/POS komandama
      const escposData = formatESCPOS(content);
      
      // Pošalji podatke
      client.write(escposData, (err) => {
        if (err) {
          console.error('Write error:', err);
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            client.destroy();
            resolve(false);
          }
        } else {
          console.log('Data sent to printer');
          // Sačekaj malo pre zatvaranja konekcije
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
        console.log('Printer connection closed');
        resolve(true);
      }
    });

    client.on('error', (err: Error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.error('Printer connection error:', err);
        resolve(false);
      }
    });
  });
}
