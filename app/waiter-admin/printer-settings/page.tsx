'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import { getPrinterSettings, savePrinterSettings, setCachedPrinterSettings, PrinterSettings } from '../../utils/printer';

export default function PrinterSettingsPage() {
  const { user, logout, isLoading } = useAuth();
  const { showToast } = useToast();
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
    const loadSettings = async () => {
      const saved = await getPrinterSettings();
      if (saved) {
        setSettings(saved);
        setCachedPrinterSettings(saved);
      }
    };
    loadSettings();
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

  const handleSave = async () => {
    if (settings.enabled && !settings.ipAddress) {
      showToast('Unesite IP adresu štampača', 'warning');
      return;
    }

    const success = await savePrinterSettings(settings);
    if (success) {
      setCachedPrinterSettings(settings);
      showToast('Podešavanja su sačuvana!', 'success');
    } else {
      showToast('Greška pri čuvanju podešavanja', 'error');
    }
  };

  const handleTest = async () => {
    if (!settings.ipAddress) {
      showToast('Unesite IP adresu štampača za test', 'warning');
      return;
    }

    setIsTesting(true);
    setTestResult('Štampanje test stranice...');

    try {
      // Kreiraj test sadržaj
      const testContent = `
========================================
        TEST ŠTAMPE
========================================

OVO NIJE FISKALNI ISEČAK
IP: ${settings.ipAddress}
PORT: ${settings.port}

----------------------------------------
Test Stavka 1       1 x 100 = 100 RSD
Test Stavka 2       2 x 200 = 400 RSD
----------------------------------------

UKUPNO:                      500 RSD

========================================
   Ako vidiš ovo - štampa radi!
========================================
`;

      // Importujemo funkciju za štampanje
      const { printToNetworkPrinter, printViaBrowser } = await import('../../utils/printer');
      
      const success = await printToNetworkPrinter({
        type: 'test',
        content: testContent
      });
      
      if (success) {
        setTestResult('✓ Test štampanje poslato na štampač!');
      } else {
        setTestResult('⚠ Mrežno štampanje nije uspelo. Koristite browser print.');
        // Fallback na browser print
        setTimeout(() => printViaBrowser(testContent), 500);
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
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-4 md:p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-3" style={{ color: '#FFFFFF' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Podešavanje Štampača
            </h1>
            <p className="text-sm md:text-base mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Konfigurišite mrežni štampač za direktno štampanje</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/waiter-admin"
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Nazad
            </a>
            <button 
              onClick={logout}
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Info box */}
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg mb-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informacije
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700">
            <li>Unesite IP adresu vašeg mrežnog štampača</li>
            <li>Standardni port za raw printing je 9100</li>
            <li>Štampač mora biti na istoj mreži kao vaš računar</li>
            <li>Većina ESC/POS štampača podržava raw printing protokol</li>
            <li>Ukoliko mrežno štampanje ne radi, koristiće se browser print dijalog</li>
          </ul>
        </div>

        {/* Settings form */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Podešavanja</h2>
          
          <div className="space-y-4 md:space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 rounded focus:ring-2"
                style={{ accentColor: '#4CAF50' }}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
                style={{ 
                  borderColor: settings.enabled ? '#D1D5DB' : '#E5E7EB',
                }}
                onFocus={(e) => {
                  if (settings.enabled) {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = settings.enabled ? '#D1D5DB' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
                style={{ 
                  borderColor: settings.enabled ? '#D1D5DB' : '#E5E7EB',
                }}
                onFocus={(e) => {
                  if (settings.enabled) {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = settings.enabled ? '#D1D5DB' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={!settings.enabled}
              />
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Standardni port za raw printing je 9100
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.startsWith('✓') 
                  ? 'bg-gray-50 border-gray-200 text-gray-800'
                  : testResult.startsWith('⚠')
                  ? 'bg-gray-50 border-gray-200 text-gray-800'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}>
                <p className="font-semibold flex items-center gap-2">
                  {testResult.startsWith('✓') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {testResult.startsWith('⚠') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#F59E0B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {testResult.startsWith('✗') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {testResult.replace(/^[✓⚠✗]\s*/, '')}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors text-base md:text-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Sačuvaj Podešavanja
              </button>
              <button
                onClick={handleTest}
                disabled={!settings.enabled || !settings.ipAddress || isTesting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors text-base md:text-lg flex items-center justify-center gap-2 ${
                  !settings.enabled || !settings.ipAddress || isTesting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : ''
                }`}
                style={!settings.enabled || !settings.ipAddress || isTesting ? {} : { backgroundColor: '#1F7A5A', color: '#FFFFFF' }}
                onMouseEnter={(e) => {
                  if (!(!settings.enabled || !settings.ipAddress || isTesting)) {
                    e.currentTarget.style.backgroundColor = '#1a6b4f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!settings.enabled || !settings.ipAddress || isTesting)) {
                    e.currentTarget.style.backgroundColor = '#1F7A5A';
                  }
                }}
              >
                {isTesting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Štampanje...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Test Štampanje
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Settings Display */}
        {settings.enabled && settings.ipAddress && (
          <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trenutna Podešavanja
            </h3>
            <div className="space-y-2 text-sm md:text-base">
              <p className="text-gray-700">
                <span className="font-semibold">Status:</span>{' '}
                <span className="flex items-center gap-1" style={{ color: '#4CAF50' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aktivno
                </span>
              </p>
              <p className="text-gray-700"><span className="font-semibold">IP Adresa:</span> {settings.ipAddress}</p>
              <p className="text-gray-700"><span className="font-semibold">Port:</span> {settings.port}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

