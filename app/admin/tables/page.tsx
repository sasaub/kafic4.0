'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTables, Table } from '../../context/TablesContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

export default function AdminTablesPage() {
  const { user, logout, isLoading } = useAuth();
  const { tables, addTable: addTableToContext, updateTableStatus, updateTableMonthlyPayment } = useTables(); // Koristi globalni context
  const { showToast } = useToast();
  const router = useRouter();
  
  // HOOKS moraju biti na vrhu UVEK!
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, monthlyPayment: false });
  const [showQRDialog, setShowQRDialog] = useState<{ tableNumber: string | number; qrURL: string } | null>(null);

  // Auth check - POSLE svih hooks!
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Učitavanje...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const updateStatus = (id: number, newStatus: Table['status']) => {
    updateTableStatus(id, newStatus);
  };

  const handleAddTable = async () => {
    if (!newTable.number || newTable.number.trim() === '') {
      showToast('Unesite naziv/broj stola', 'warning');
      return;
    }

    // Proveri da li sto već postoji (case-insensitive)
    // Konvertuj u string jer stari podaci mogu imati number kao number
    if (tables.find(t => String(t.number).toLowerCase().trim() === newTable.number.toLowerCase().trim())) {
      showToast(`Sto "${newTable.number}" već postoji!`, 'warning');
      return;
    }

    try {
      await addTableToContext({
        number: newTable.number.trim(),
        capacity: newTable.capacity,
        status: 'Slobodan',
        monthlyPayment: newTable.monthlyPayment
      });
      
      setNewTable({ number: '', capacity: 4, monthlyPayment: false });
      setShowAddForm(false);
      showToast('Sto je uspešno dodat', 'success');
    } catch (error) {
      console.error('Error adding table:', error);
      showToast('Greška pri dodavanju stola', 'error');
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'Slobodan': return 'bg-green-100 text-green-800';
      case 'Zauzet': return 'bg-red-100 text-red-800';
      case 'Rezervisan': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadQR = (tableNumber: string | number, qrCode: string) => {
    // Enkoduj tableNumber za URL (rukuje razmacima i specijalnim karakterima)
    const tableStr = String(tableNumber);
    const encodedTable = encodeURIComponent(tableStr);
    
    // Generiši URL - koristi window.location.origin ili fallback
    let origin = '';
    if (typeof window !== 'undefined' && window.location) {
      origin = window.location.origin;
    } else {
      // Fallback za server-side rendering
      origin = 'http://localhost:3000';
    }
    
    const qrURL = `${origin}/guest?table=${encodedTable}`;
    setShowQRDialog({ tableNumber: tableStr, qrURL });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Upravljanje Stolovima</h1>
            <p className="text-gray-300">Pregled stolova i QR kodova</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              ← Nazad
            </Link>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dodaj sto dugme */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            + Dodaj novi sto
          </button>
        </div>

        {/* Forma za dodavanje stola */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Novi sto</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Naziv/Broj stola</label>
                <input
                  type="text"
                  value={newTable.number}
                  onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Npr. 9, VIP 1, Terasa A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kapacitet (broj osoba)</label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value) || 4})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="4"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTable.monthlyPayment}
                  onChange={(e) => setNewTable({...newTable, monthlyPayment: e.target.checked})}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mesečno plaćanje (ne plaća odmah)
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddTable}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sačuvaj
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Otkaži
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              QR kod će biti automatski kreiran: QR-{newTable.number.padStart(3, '0')}
            </p>
          </div>
        )}

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{tables.filter(t => t.status === 'Slobodan').length}</div>
            <div className="text-sm opacity-90">Slobodni stolovi</div>
          </div>
          <div className="bg-red-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{tables.filter(t => t.status === 'Zauzet').length}</div>
            <div className="text-sm opacity-90">Zauzeti stolovi</div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{tables.filter(t => t.status === 'Rezervisan').length}</div>
            <div className="text-sm opacity-90">Rezervisani stolovi</div>
          </div>
        </div>

        {/* Grid stolova */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Sto {table.number}</h3>
                  <p className="text-gray-600">Kapacitet: {table.capacity} osoba</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-600">{table.qrCode}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => downloadQR(table.number, table.qrCode)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Preuzmi QR Kod
                </button>
                
                <select
                  value={table.status}
                  onChange={(e) => updateStatus(table.id, e.target.value as Table['status'])}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Slobodan">Slobodan</option>
                  <option value="Zauzet">Zauzet</option>
                  <option value="Rezervisan">Rezervisan</option>
                </select>
                
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={table.monthlyPayment || false}
                    onChange={async (e) => {
                      try {
                        await updateTableMonthlyPayment(table.id, e.target.checked);
                      } catch (error) {
                        console.error('Error updating monthly payment:', error);
                      }
                    }}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mesečno plaćanje
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Akcije */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">QR Kodovi</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Preuzmi sve QR kodove
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Štampaj QR kodove
            </button>
          </div>
        </div>
      </div>

      {/* QR Dialog */}
      {showQRDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">QR kod za Sto {showQRDialog.tableNumber}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">URL:</label>
              <input
                type="text"
                value={showQRDialog.qrURL}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Kreirajte QR kod koji vodi na ovaj URL koristeći bilo koji QR generator.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowQRDialog(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 