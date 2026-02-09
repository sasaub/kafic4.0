"use client";

import { useEffect, useState } from "react";
import {
  getPrinterSettings,
  printToNetworkPrinter,
  printViaBrowser,
} from "@/app/utils/printer";

export default function PrinterSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [ip, setIp] = useState("");
  const [port, setPort] = useState(9100);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getPrinterSettings();
      setEnabled(Boolean(data.enabled));
      setIp(data.ipAddress || "");
      setPort(data.port || 9100);
    } catch (e) {
      console.error(e);
    }
  }

  async function saveSettings() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/printer-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          ipAddress: ip,
          port,
        }),
      });

      if (!res.ok) throw new Error("Greška pri čuvanju");

      setMessage("✅ Podešavanja sačuvana");
    } catch (e) {
      setMessage("❌ Neuspešno čuvanje podešavanja");
    } finally {
      setLoading(false);
    }
  }

  async function testPrint() {
    setLoading(true);
    setMessage(null);

    const content =
      "=== TEST ŠTAMPE ===\n" +
      "QR RESTAURANT\n" +
      "IP: " +
      ip +
      "\nPORT: " +
      port +
      "\n\nAko vidiš ovo – mrežna štampa radi.\n\n";

    const ok = await printToNetworkPrinter({
      type: "test",
      content,
    });

    if (ok) {
      setMessage("✅ Test štampa poslata na mrežni štampač");
    } else {
      setMessage("⚠️ Mrežna štampa nije uspela – otvaram browser print");
      printViaBrowser(content);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Podešavanje Štampača</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Omogući mrežno štampanje
        </label>

        <div>
          <label className="block font-medium">IP Adresa Štampača</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.50"
          />
        </div>

        <div>
          <label className="block font-medium">Port</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Sačuvaj Podešavanja
          </button>

          <button
            onClick={testPrint}
            disabled={loading}
            className="bg-emerald-700 text-white px-4 py-2 rounded"
          >
            Test Štampanje
          </button>
        </div>

        {message && <div className="text-sm">{message}</div>}
      </div>
    </div>
  );
}
