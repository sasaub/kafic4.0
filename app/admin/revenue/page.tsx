'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../utils/dateFormat';

export default function RevenuePage() {
  const { user, logout, isLoading } = useAuth();
  const { orders } = useOrders();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const today = new Date().toISOString().split('T')[0];
  const [filterType, setFilterType] = useState<'day' | 'period'>('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

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

  // Filter po datumu ili periodu
  const filteredOrders = orders.filter(o => {
    if (o.status !== 'Dostavljeno') return false;
    if (filterType === 'day') {
      return o.date === selectedDate;
    } else {
      return o.date >= dateFrom && o.date <= dateTo;
    }
  });
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  // Grupisi po stolu i izračunaj zaradu po stolu
  const revenueByTable = filteredOrders.reduce((acc, order) => {
    const tableKey = String(order.table).trim();
    if (!acc[tableKey]) {
      acc[tableKey] = { revenue: 0, orders: [] };
    }
    acc[tableKey].revenue += order.total;
    acc[tableKey].orders.push(order);
    return acc;
  }, {} as Record<string, { revenue: number; orders: typeof filteredOrders }>);

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
            <h1 className="text-3xl font-bold">💰 Pregled Pazara</h1>
            <p className="text-gray-300">Zarada po datumu</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              ← Nazad
            </a>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Izaberite datum:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Od datuma:
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do datuma:
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-90 mb-2">Ukupna Zarada</h3>
            <p className="text-3xl font-bold">{totalRevenue.toLocaleString()} RSD</p>
          </div>
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-90 mb-2">Broj Narudžbi</h3>
            <p className="text-3xl font-bold">{filteredOrders.length}</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-90 mb-2">Prosečan Račun</h3>
            <p className="text-3xl font-bold">
              {filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length).toLocaleString() : 0} RSD
            </p>
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
                      ? 'bg-yellow-50 border-yellow-300'
                      : index === 1
                      ? 'bg-gray-50 border-gray-300'
                      : index === 2
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
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
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nema dostavljenih narudžbi za izabrani datum</p>
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
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">{order.time}</td>
                      <td className="px-4 py-3">{order.table}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">{order.total} RSD</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-400 bg-gray-50">
                    <td colSpan={4} className="px-4 py-4 text-right font-bold text-lg">UKUPNO:</td>
                    <td className="px-4 py-4 font-bold text-xl text-green-600">{totalRevenue.toLocaleString()} RSD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 