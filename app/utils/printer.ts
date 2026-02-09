"use client";

export type PrintPayload = {
  type: "test" | "order";
  content: string;
};

export type PrinterSettings = {
  ipAddress: string;
  port: number;
  enabled: boolean;
};

let cachedSettings: PrinterSettings | null = null;

export function setCachedPrinterSettings(settings: PrinterSettings) {
  cachedSettings = settings;
}

export async function getPrinterSettings(): Promise<PrinterSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  const res = await fetch("/api/printer-settings", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Ne mogu da učitam podešavanja štampača");
  }

  const data = await res.json();
  cachedSettings = data;
  return data;
}

export async function savePrinterSettings(settings: PrinterSettings): Promise<boolean> {
  try {
    const res = await fetch("/api/printer-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!res.ok) {
      return false;
    }

    cachedSettings = settings;
    return true;
  } catch (err) {
    console.error("Failed to save printer settings", err);
    return false;
  }
}

export async function printToNetworkPrinter(
  payload: PrintPayload,
): Promise<boolean> {
  try {
    const res = await fetch("/api/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("PRINT API ERROR", await res.text());
      return false;
    }

    const data = await res.json();
    return data?.ok === true;
  } catch (err) {
    console.error("PRINT FETCH FAILED", err);
    return false;
  }
}

/**
 * Browser fallback – UVEK radi
 */
export function printViaBrowser(content: string) {
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Štampa</title>
        <style>
          body { font-family: monospace; white-space: pre; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
  win.close();
}
