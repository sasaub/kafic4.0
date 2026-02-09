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
    }, 5000); // 5 sekundi timeout

    client.connect(port, ipAddress, () => {
      console.log('Connected to printer');
      client.write(content);
      client.end();
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
