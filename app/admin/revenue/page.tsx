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

  // DEBUG: Prikaži sve porudžbine
  console.log('=== REVENUE PAGE DEBUG ===');
  console.log('Total orders from API:', orders.length);
  console.log('Today date:', today);
  console.log('Selected date:', selectedDate);
  console.log('Filter type:', filterType);
  
  // Prikaži SVE porudžbine i njihove statuse
  console.log('\n=== ALL ORDERS ===');
  orders.forEach(o => {
    let orderDate = o.date;
    if (orderDate && typeof orderDate === 'string' && orderDate.includes('T')) {
      orderDate = orderDate.split('T')[0];
    }
    console.log(`Order ${o.id}: status="${o.status}", date="${orderDate}", table="${o.table}", total=${o.total}`);
  });
  
  // Prikaži porudžbine za današnji datum (bilo koji status)
  const todayOrders = orders.filter(o => {
    let orderDate = o.date;
    if (orderDate && typeof orderDate === 'string' && orderDate.includes('T')) {
      orderDate = orderDate.split('T')[0];
    }
    return orderDate === today;
  });
  console.log(`\n=== ORDERS FOR TODAY (${today}) ===`);
  console.log(`Count: ${todayOrders.length}`);
  todayOrders.forEach(o => {
    console.log(`  Order ${o.id}: status="${o.status}", table="${o.table}", total=${o.total}`);
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
  console.log('\nAvailable dates with "Potvrđeno" orders:', confirmedOrdersDates);

  // Filtriraj samo porudžbine sa statusom "Potvrđeno" (samo konobar i konobar-admin potvrđuju)
  // Datumi iz baze su u YYYY-MM-DD formatu, selectedDate je takođe u YYYY-MM-DD formatu
  console.log('=== FILTERING ORDERS ===');
  console.log('Selected date:', selectedDate);
  console.log('Today date:', today);
  console.log('Total orders:', orders.length);
  
  const filteredOrders = orders.filter(o => {
    console.log(`\nOrder ${o.id}:`);
    console.log(`  - Status: "${o.status}"`);
    console.log(`  - Date (raw): "${o.date}" (type: ${typeof o.date})`);
    console.log(`  - Table: "${o.table}"`);
    console.log(`  - Total: ${o.total}`);
    
    // Status mora biti "Potvrđeno"
    if (o.status !== 'Potvrđeno') {
      console.log(`  → Filtered out: status is "${o.status}", not "Potvrđeno"`);
      return false;
    }
    
    // Proveri datum - normalizuj datum iz baze (može biti ISO string sa vremenom)
    let orderDate = o.date;
    if (orderDate && typeof orderDate === 'string' && orderDate.includes('T')) {
      orderDate = orderDate.split('T')[0];
      console.log(`  - Date (after T split): "${orderDate}"`);
    }
    
    // Proveri da li je orderDate string
    if (typeof orderDate !== 'string') {
      console.warn(`  → Filtered out: invalid date type:`, typeof orderDate);
      return false;
    }
    
    let dateMatch = false;
    if (filterType === 'day') {
      dateMatch = orderDate === selectedDate;
      console.log(`  - Date match: "${orderDate}" === "${selectedDate}" = ${dateMatch}`);
    } else {
      dateMatch = orderDate >= dateFrom && orderDate <= dateTo;
      console.log(`  - Date match (period): "${orderDate}" >= "${dateFrom}" && "${orderDate}" <= "${dateTo}" = ${dateMatch}`);
    }
    
    if (dateMatch) {
      console.log(`  → ✓ INCLUDED`);
    } else {
      console.log(`  → Filtered out: date doesn't match`);
    }
    
    return dateMatch;
  });

  console.log('\n=== FILTERING RESULTS ===');
  console.log('Filtered orders count:', filteredOrders.length);
  console.log('Filtered orders:', filteredOrders.map(o => ({
    id: o.id,
    date: o.date,
    table: o.table,
    total: o.total
  })));

  // Grupisi po ID-u da izbegnemo duplikate (ako postoji kopija porudžbine)
  // Prikaži sve potvrđene porudžbine, nebitno da li je waiter ili waiter-admin potvrdio
  const ordersById = filteredOrders.reduce((acc, order) => {
    if (!acc[order.id]) {
      acc[order.id] = order;
    }
    return acc;
  }, {} as Record<number, typeof filteredOrders[0]>);
  
  const uniqueOrders = Object.values(ordersById);

  console.log('Unique orders (by table):', uniqueOrders.length);
  console.log('Unique orders:', uniqueOrders);

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">💰 Pregled Zarade</h1>
            <p className="text-gray-300">Dobrodošli, {user.username}</p>
          </div>
          <div className="flex gap-4">
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Nazad
            </a>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 Dan
            </button>
            <button
              onClick={() => setFilterType('period')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'period'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📆 Period
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
          <div className="text-4xl font-bold text-green-600">
            {totalRevenue.toLocaleString()} RSD
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {uniqueOrders.length} {uniqueOrders.length === 1 ? 'porudžbina' : 'porudžbina'}
          </div>
        </div>

        {/* Top tables by revenue */}
        {topTables.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">🏆 Stolovi po zaradi</h2>
            <div className="space-y-3">
              {topTables.map((item, index) => (
                <div
                  key={item.table}
                  className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-500'
                      : index === 2
                      ? 'bg-orange-500'
                      : 'bg-gray-400'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-500'
                          : index === 2
                          ? 'bg-orange-500'
                          : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Sto {item.table}</div>
                        <div className="text-sm text-gray-600">{item.orderCount} porudžbina</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{item.revenue.toLocaleString()} RSD</div>
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
