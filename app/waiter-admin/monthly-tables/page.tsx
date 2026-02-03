'use client';

import { useEffect } from 'react';
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
      case 'Slobodan': return 'bg-gray-100 text-gray-800';
      case 'Zauzet': return 'bg-gray-100 text-gray-800';
      case 'Rezervisan': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-4 md:p-6 sticky top-0 z-20 shadow-lg" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: '#FFFFFF' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Mesečni Stolovi
            </h1>
            <p className="text-sm md:text-base mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>
              Stolovi koji plaćaju na mesečnom nivou
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
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

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-gray-800">{monthlyTables.length}</div>
            <div className="text-sm md:text-base text-gray-600">Ukupno mesečnih stolova</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-gray-800">
              {monthlyTables.filter(t => t.status === 'Slobodan').length}
            </div>
            <div className="text-sm md:text-base text-gray-600">Slobodni</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-gray-800">
              {monthlyTables.filter(t => t.status === 'Zauzet').length}
            </div>
            <div className="text-sm md:text-base text-gray-600">Zauzeti</div>
          </div>
        </div>

        {/* Lista mesečnih stolova */}
        {monthlyTables.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Sto {table.number}</h3>
                    <p className="text-gray-600 text-sm">Kapacitet: {table.capacity} osoba</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-700 font-semibold text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Mesečno
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-sm text-gray-600">{table.qrCode}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 font-semibold mb-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Način plaćanja:
                  </p>
                  <p className="text-sm text-gray-800">Mesečno plaćanje</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    Klikni za detalje
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

