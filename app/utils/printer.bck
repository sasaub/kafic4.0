// Utility funkcije za mrežno štampanje

export interface PrinterSettings {
  ipAddress: string;
  port: number;
  enabled: boolean;
}

// Funkcije za učitavanje i čuvanje podešavanja iz baze preko API-ja

export async function getPrinterSettings(): Promise<PrinterSettings | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/printer-settings');
    if (!response.ok) {
      console.error('Error loading printer settings from API');
      return null;
    }
    const data = await response.json();
    return {
      ipAddress: data.ipAddress || '',
      port: data.port || 9100,
      enabled: data.enabled || false,
    };
  } catch (error) {
    console.error('Error loading printer settings:', error);
    return null;
  }
}

export async function savePrinterSettings(settings: PrinterSettings): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/printer-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      console.error('Error saving printer settings to API');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving printer settings:', error);
    return false;
  }
}

// Synchronous wrapper za backward compatibility (koristi cache)
let cachedSettings: PrinterSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 sekundi cache

export function getPrinterSettingsSync(): PrinterSettings | null {
  // Ako je cache star, vrati null (neće raditi sync, ali će se koristiti async verzija)
  if (Date.now() - lastFetchTime > CACHE_DURATION) {
    return null;
  }
  return cachedSettings;
}

export function setCachedPrinterSettings(settings: PrinterSettings | null) {
  cachedSettings = settings;
  lastFetchTime = Date.now();
}

// ESC/POS komande za formatiranje
const ESC = '\x1B';
const GS = '\x1D';

export function formatReceipt(order: {
  id: number;
  table: string;
  time: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}): Uint8Array {
  const lines: string[] = [];
  
  // Inicijalizacija štampača
  lines.push(`${ESC}@`); // Reset
  
  // Header
  lines.push(`${ESC}a${1}`); // Centriranje
  lines.push('================================');
  lines.push('Ovo nije fiskalni isecak');
  lines.push('================================');
  lines.push(`${ESC}a${0}`); // Levo poravnanje
  
  // Informacije o narudžbi
  lines.push('');
  lines.push(`Narudžba #${order.id}`);
  lines.push(order.table);
  lines.push(`Vreme: ${order.time}`);
  lines.push('');
  lines.push('--------------------------------');
  lines.push('            STAVKE');
  lines.push('--------------------------------');
  
  // Stavke
  order.items.forEach(item => {
    lines.push(item.name);
    lines.push(`${item.quantity} x ${item.price} RSD = ${item.quantity * item.price} RSD`);
    lines.push('');
  });
  
  lines.push('--------------------------------');
  lines.push('');
  lines.push(`UKUPNO:                    ${order.total} RSD`);
  lines.push('');
  lines.push('================================');
  lines.push('');
  lines.push(`${ESC}a${1}`); // Centriranje
  lines.push('  ╔═══════════╗');
  lines.push('  ║   🍽️   ║');
  lines.push('  ║ RESTORAN  ║');
  lines.push('  ╚═══════════╝');
  lines.push('');
  lines.push('Hvala na poverenju!');
  lines.push('================================');
  lines.push(`${ESC}a${0}`); // Levo poravnanje
  lines.push('');
  lines.push('');
  lines.push('');
  
  // Cut paper
  lines.push(`${GS}V${66}${0}`); // Full cut
  
  // Konvertuj u bytes
  const text = lines.join('\n');
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

// Funkcija za štampanje na mrežni štampač
export async function printToNetworkPrinter(
  order: {
    id: number;
    table: string;
    time: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  }
): Promise<boolean> {
  const settings = await getPrinterSettings();
  
  if (!settings || !settings.enabled || !settings.ipAddress) {
    console.error('Printer settings not configured');
    return false;
  }
  
  try {
    const receiptData = formatReceipt(order);
    
    // Pokušaj direktno štampanje preko raw printing protokola
    // Većina mrežnih štampača podržava raw printing na portu 9100
    const url = `http://${settings.ipAddress}:${settings.port || 9100}`;
    
    // Koristimo fetch sa POST zahtevom za raw printing
    // Napomena: Browser ne dozvoljava direktno slanje na mrežni štampač zbog CORS-a
    // no-cors mode ne dozvoljava čitanje response-a, ali pokušaj se šalje
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // Bypass CORS za lokalnu mrežu (ne možemo proveriti response)
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: receiptData,
      });
      
      // Sa no-cors mode, ne možemo proveriti response, ali pokušaj je poslat
      // Pretpostavljamo da je uspešno ako nema greške
      return true;
    } catch (fetchError) {
      // Ako fetch baca grešku, to znači da zahtev nije poslat
      console.error('Fetch error (likely CORS or network issue):', fetchError);
      return false;
    }
  } catch (error) {
    console.error('Error preparing print data:', error);
    return false;
  }
}

// Alternativna metoda - koristi browser print ako mrežno štampanje ne radi
export function printViaBrowser(order: {
  id: number;
  table: string;
  time: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}): void {
  const receiptContent = `
========================================
        Ovo nije fiskalni isecak
========================================

Narudžba #${order.id}
${order.table}
Vreme: ${order.time}

----------------------------------------
                STAVKE
----------------------------------------
${order.items.map(item => `
${item.name}
${item.quantity} x ${item.price} RSD = ${item.quantity * item.price} RSD
`).join('')}
----------------------------------------

UKUPNO:                    ${order.total} RSD

========================================
        ╔═══════════╗
        ║   🍽️   ║
        ║ RESTORAN  ║
        ╚═══════════╝

      Hvala na poverenju!
========================================
  `;

  const printWindow = window.open('', '', 'height=600,width=400');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Račun #' + order.id + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@page { size: 80mm auto; margin: 0; }');
    printWindow.document.write('body { font-family: monospace; padding: 20px; }');
    printWindow.document.write('pre { white-space: pre-wrap; }');
    printWindow.document.write('@media print { body { margin: 0; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<pre>' + receiptContent + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
}

