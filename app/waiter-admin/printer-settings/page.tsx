'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getPrinterSettings, savePrinterSettings, PrinterSettings } from '../../utils/printer';

export default function PrinterSettingsPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<PrinterSettings>({
    ipAddress: '',
    port: 9100,
    enabled: false
  });
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'waiter-admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    const saved = getPrinterSettings();
    if (saved) {
      setSettings(saved);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Učitavanje...</div>
      </div>
    );
  }

  if (!user || user.role !== 'waiter-admin') {
    return null;
  }

  const handleSave = () => {
    if (settings.enabled && !settings.ipAddress) {
      alert('Unesite IP adresu štampača');
      return;
    }

    savePrinterSettings(settings);
    setTestResult('Podešavanja su sačuvana!');
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleTest = async () => {
    if (!settings.ipAddress) {
      alert('Unesite IP adresu štampača za test');
      return;
    }

    setIsTesting(true);
    setTestResult('Štampanje test stranice...');

    try {
      // Test narudžba
      const testOrder = {
        id: 999,
        table: 'Test Sto',
        time: new Date().toLocaleTimeString('sr-RS'),
        items: [
          { name: 'Test Stavka 1', quantity: 1, price: 100 },
          { name: 'Test Stavka 2', quantity: 2, price: 200 }
        ],
        total: 500
      };

      // Importujemo funkciju za štampanje
      const { printToNetworkPrinter, printViaBrowser } = await import('../../../utils/printer');
      
      const success = await printToNetworkPrinter(testOrder);
      
      if (success) {
        setTestResult('✓ Test štampanje poslato na štampač!');
      } else {
        setTestResult('⚠ Mrežno štampanje nije uspelo. Koristite browser print.');
        // Fallback na browser print
        setTimeout(() => printViaBrowser(testOrder), 500);
      }
    } catch (error) {
      console.error('Test print error:', error);
      setTestResult('✗ Greška pri štampanju. Proverite IP adresu i konekciju.');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">🖨️ Podešavanje Štampača</h1>
            <p className="text-gray-300 text-sm md:text-base">Konfigurišite mrežni štampač za direktno štampanje</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/waiter-admin"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
            >
              ← Nazad
            </a>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Info box */}
        <div className="bg-blue-50 border-2 border-blue-200 p-4 md:p-6 rounded-lg mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-2 text-blue-800">ℹ️ Informacije</h2>
          <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-blue-700">
            <li>Unesite IP adresu vašeg mrežnog štampača</li>
            <li>Standardni port za raw printing je 9100</li>
            <li>Štampač mora biti na istoj mreži kao vaš računar</li>
            <li>Većina ESC/POS štampača podržava raw printing protokol</li>
            <li>Ukoliko mrežno štampanje ne radi, koristiće se browser print dijalog</li>
          </ul>
        </div>

        {/* Settings form */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Podešavanja</h2>
          
          <div className="space-y-4 md:space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="enabled" className="text-base md:text-lg font-semibold text-gray-700">
                Omogući mrežno štampanje
              </label>
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                IP Adresa Štampača *
              </label>
              <input
                type="text"
                value={settings.ipAddress}
                onChange={(e) => setSettings({ ...settings, ipAddress: e.target.value })}
                placeholder="npr. 192.168.1.100"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-base"
                disabled={!settings.enabled}
              />
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Unesite IP adresu vašeg mrežnog štampača
              </p>
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Port
              </label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: Number(e.target.value) || 9100 })}
                placeholder="9100"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-base"
                disabled={!settings.enabled}
              />
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Standardni port za raw printing je 9100
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.startsWith('✓') 
                  ? 'bg-green-50 border-2 border-green-200 text-green-800'
                  : testResult.startsWith('⚠')
                  ? 'bg-yellow-50 border-2 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-2 border-red-200 text-red-800'
              }`}>
                <p className="font-semibold">{testResult}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-base md:text-lg"
              >
                💾 Sačuvaj Podešavanja
              </button>
              <button
                onClick={handleTest}
                disabled={!settings.enabled || !settings.ipAddress || isTesting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors text-base md:text-lg ${
                  !settings.enabled || !settings.ipAddress || isTesting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isTesting ? '⏳ Štampanje...' : '🖨️ Test Štampanje'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Settings Display */}
        {settings.enabled && settings.ipAddress && (
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border-2 border-gray-200">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800">Trenutna Podešavanja</h3>
            <div className="space-y-2 text-sm md:text-base">
              <p><span className="font-semibold">Status:</span> <span className="text-green-600">✓ Aktivno</span></p>
              <p><span className="font-semibold">IP Adresa:</span> {settings.ipAddress}</p>
              <p><span className="font-semibold">Port:</span> {settings.port}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

