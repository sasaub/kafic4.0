// Utility funkcije za mrežno štampanje

export interface PrinterSettings {
  ipAddress: string;
  port: number;
  enabled: boolean;
}

const STORAGE_KEY = 'qr-restaurant-printer-settings';

export function getPrinterSettings(): PrinterSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading printer settings:', error);
  }
  
  return null;
}

export function savePrinterSettings(settings: PrinterSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving printer settings:', error);
  }
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
  lines.push('        RACUN');
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
    const itemTotal = item.quantity * item.price;
    lines.push(item.name);
    lines.push(`${item.quantity} x ${item.price} RSD = ${itemTotal} RSD`);
    lines.push('');
  });
  
  lines.push('--------------------------------');
  lines.push('');
  lines.push(`UKUPNO:                    ${order.total} RSD`);
  lines.push('');
  lines.push('================================');
  lines.push('     Hvala na poverenju!');
  lines.push('================================');
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
  const settings = getPrinterSettings();
  
  if (!settings || !settings.enabled || !settings.ipAddress) {
    console.error('Printer settings not configured');
    return false;
  }
  
  try {
    const receiptData = formatReceipt(order);
    
    // Pokušaj direktno štampanje preko raw printing protokola
    // Većina mrežnih štampača podržava raw printing na portu 9100
    const url = `http://${settings.ipAddress}:${settings.port || 9100}`;
    
    console.log('Attempting to print to network printer:', url);
    
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
      console.log('Print request sent (no-cors mode - cannot verify success)');
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
            QR RESTORAN
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
         Hvala na poverenju!
========================================
  `;

  const printWindow = window.open('', '', 'height=600,width=400');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Račun #' + order.id + '</title>');
    printWindow.document.write('<style>');
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

