'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../utils/dateFormat';
import DatePicker from '../../components/DatePicker';

export default function RevenuePage() {
  const { user, logout, isLoading } = useAuth();
  const { orders } = useOrders();
  const router = useRouter();
  
  // HOOKS na vrhu!
  // Koristi lokalno vreme (Srbija) za današnji datum
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`; // YYYY-MM-DD format za input
  const [filterType, setFilterType] = useState<'day' | 'period'>('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  
  // Ne menjaj automatski datum - uvek prikazuj današnji datum osim ako korisnik ne promeni

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Pristup odbijen</div>
      </div>
    );
  }

  // Prikaži porudžbine za današnji datum (bilo koji status)
  const todayOrders = orders.filter(o => {
    let orderDate = o.date;
    if (orderDate && typeof orderDate === 'string' && orderDate.includes('T')) {
      orderDate = orderDate.split('T')[0];
    }
    return orderDate === today;
  });
  
  // Prikaži sve datume koji imaju "Potvrđeno" porudžbine
  const confirmedOrdersDates = orders
    .filter(o => o.status === 'Potvrđeno')
    .map(o => {
      let date = o.date;
      if (date && date.includes('T')) {
        date = date.split('T')[0];
      }
      return date;
    })
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort()
    .reverse();

  // Filtriraj samo porudžbine sa statusom "Potvrđeno" (samo konobar i konobar-admin potvrđuju)
  // Datumi iz baze su u YYYY-MM-DD formatu, selectedDate je takođe u YYYY-MM-DD formatu
  const filteredOrders = orders.filter(o => {
    // Status mora biti "Potvrđeno"
    if (o.status !== 'Potvrđeno') {
      return false;
    }
    
    // Proveri datum - normalizuj datum iz baze (može biti ISO string sa vremenom)
    let orderDate = o.date;
    if (orderDate && typeof orderDate === 'string' && orderDate.includes('T')) {
      orderDate = orderDate.split('T')[0];
    }
    
    // Proveri da li je orderDate string
    if (typeof orderDate !== 'string') {
      return false;
    }
    
    let dateMatch = false;
    if (filterType === 'day') {
      dateMatch = orderDate === selectedDate;
    } else {
      dateMatch = orderDate >= dateFrom && orderDate <= dateTo;
    }
    
    return dateMatch;
  });

  // Grupisi po ID-u da izbegnemo duplikate (ako postoji kopija porudžbine)
  // Prikaži sve potvrđene porudžbine, nebitno da li je waiter ili waiter-admin potvrdio
  const ordersById = filteredOrders.reduce((acc, order) => {
    if (!acc[order.id]) {
      acc[order.id] = order;
    }
    return acc;
  }, {} as Record<number, typeof filteredOrders[0]>);
  
  const uniqueOrders = Object.values(ordersById);

  // Računaj zaradu - suma svih uniqueOrders
  const totalRevenue = uniqueOrders.reduce((sum, o) => sum + o.total, 0);

  console.log('Total revenue:', totalRevenue);

  // Grupisi po stolu i izračunaj zaradu po stolu
  const revenueByTable = uniqueOrders.reduce((acc, order) => {
    const tableKey = String(order.table).trim();
    if (!acc[tableKey]) {
      acc[tableKey] = { revenue: 0, orders: [] };
    }
    acc[tableKey].revenue += order.total;
    acc[tableKey].orders.push(order);
    return acc;
  }, {} as Record<string, { revenue: number; orders: typeof uniqueOrders }>);

  // Sortiraj stolove po zaradi (najviše prvo)
  const topTables = Object.entries(revenueByTable)
    .map(([table, data]) => ({ table, revenue: data.revenue, orderCount: data.orders.length }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Pregled Zarade</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dobrodošli, {user.username}</p>
          </div>
          <div className="flex gap-4">
            <a
              href="/admin"
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filter type toggle */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setFilterType('day')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'day'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={filterType === 'day' ? { backgroundColor: '#2B2E34' } : {}}
            >
              Dan
            </button>
            <button
              onClick={() => setFilterType('period')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'period'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={filterType === 'period' ? { backgroundColor: '#2B2E34' } : {}}
            >
              Period
            </button>
          </div>

          {filterType === 'day' ? (
            <DatePicker
              value={selectedDate}
              onChange={(value) => setSelectedDate(value)}
              label="Izaberite datum:"
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <DatePicker
                value={dateFrom}
                onChange={(value) => setDateFrom(value)}
                label="Od datuma:"
                className="w-full"
              />
              <DatePicker
                value={dateTo}
                onChange={(value) => setDateTo(value)}
                label="Do datuma:"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Total revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Ukupna zarada {filterType === 'day' ? `za ${formatDate(selectedDate)}` : `od ${formatDate(dateFrom)} do ${formatDate(dateTo)}`}
          </h2>
          <div className="text-4xl font-bold text-gray-800">
            {totalRevenue.toLocaleString()} RSD
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {uniqueOrders.length} {uniqueOrders.length === 1 ? 'porudžbina' : 'porudžbina'}
          </div>
        </div>

        {/* Top tables by revenue */}
        {topTables.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Stolovi po zaradi</h2>
            <div className="space-y-3">
              {topTables.map((item, index) => (
                <div
                  key={item.table}
                  className="flex justify-between items-center p-4 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Sto {item.table}</div>
                        <div className="text-sm text-gray-600">{item.orderCount} porudžbina</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">{item.revenue.toLocaleString()} RSD</div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            Narudžbe {filterType === 'day' ? `za ${formatDate(selectedDate)}` : `od ${formatDate(dateFrom)} do ${formatDate(dateTo)}`}
          </h2>
          {uniqueOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Nema potvrđenih narudžbi za izabrani datum
              <br />
              <span className="text-sm">Proverite da li su porudžbine potvrđene i da li je izabran ispravan datum</span>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Vreme</th>
                    <th className="px-4 py-3 text-left">Sto</th>
                    <th className="px-4 py-3 text-left">Stavke</th>
                    <th className="px-4 py-3 text-left">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueOrders
                    .sort((a, b) => {
                      // Sortiraj po vremenu (najnovije prvo)
                      const timeA = a.time.split(':').map(Number);
                      const timeB = b.time.split(':').map(Number);
                      if (timeA[0] !== timeB[0]) return timeB[0] - timeA[0];
                      return timeB[1] - timeA[1];
                    })
                    .map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3">#{order.id}</td>
                        <td className="px-4 py-3 text-gray-600">{order.time}</td>
                        <td className="px-4 py-3">{order.table}</td>
                        <td className="px-4 py-3 text-sm">
                          {order.items && order.items.length > 0
                            ? order.items.map(item => `${item.name} x${item.quantity}`).join(', ')
                            : 'Nema stavki'}
                        </td>
                        <td className="px-4 py-3 font-semibold">{order.total.toLocaleString()} RSD</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
