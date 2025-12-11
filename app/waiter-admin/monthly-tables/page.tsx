'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTables, Table } from '../../context/TablesContext';
import { useRouter } from 'next/navigation';

export default function MonthlyTablesPage() {
  const { user, logout, isLoading } = useAuth();
  const { tables } = useTables();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'waiter-admin')) {
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

  if (!user || user.role !== 'waiter-admin') {
    return null;
  }

  // Filtriraj samo stolove sa mesečnim plaćanjem
  const monthlyTables = tables.filter(table => table.monthlyPayment === true);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'Slobodan': return 'bg-green-100 text-green-800';
      case 'Zauzet': return 'bg-red-100 text-red-800';
      case 'Rezervisan': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 md:p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">📅 Mesečni Stolovi</h1>
            <p className="text-gray-300 text-sm md:text-base">
              Stolovi koji plaćaju na mesečnom nivou
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
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

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="text-3xl md:text-4xl font-bold">{monthlyTables.length}</div>
            <div className="text-sm md:text-base opacity-90">Ukupno mesečnih stolova</div>
          </div>
          <div className="bg-green-500 text-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="text-3xl md:text-4xl font-bold">
              {monthlyTables.filter(t => t.status === 'Slobodan').length}
            </div>
            <div className="text-sm md:text-base opacity-90">Slobodni</div>
          </div>
          <div className="bg-red-500 text-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="text-3xl md:text-4xl font-bold">
              {monthlyTables.filter(t => t.status === 'Zauzet').length}
            </div>
            <div className="text-sm md:text-base opacity-90">Zauzeti</div>
          </div>
        </div>

        {/* Lista mesečnih stolova */}
        {monthlyTables.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-semibold mb-2">Nema mesečnih stolova</p>
            <p className="text-sm">
              Admin može da označi stolove kao mesečne u sekciji za upravljanje stolovima
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monthlyTables.map(table => (
              <a
                key={table.id}
                href={`/waiter-admin/monthly-tables/${table.id}`}
                className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Sto {table.number}</h3>
                    <p className="text-gray-600 text-sm">Kapacitet: {table.capacity} osoba</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-blue-600 font-semibold text-xs bg-blue-100 px-2 py-1 rounded">
                        📅 Mesečno
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-gray-600">{table.qrCode}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 font-semibold mb-1">💳 Način plaćanja:</p>
                  <p className="text-sm text-blue-900">Mesečno plaćanje</p>
                  <p className="text-xs text-blue-700 mt-1">Klikni za detalje →</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

