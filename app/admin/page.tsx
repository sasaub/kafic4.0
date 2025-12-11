'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useMenu } from '../context/MenuContext';
import { useTables } from '../context/TablesContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, logout, isLoading } = useAuth();
  const { orders } = useOrders();
  const { menuItems } = useMenu();
  const { tables } = useTables();
  const router = useRouter();

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

  // Realne statistike
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today);
  const activeOrders = todayOrders.filter(o => o.status !== 'Dostavljeno');
  const deliveredToday = todayOrders.filter(o => o.status === 'Dostavljeno');
  const totalRevenueToday = deliveredToday.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { title: 'Aktivne narudžbe', value: activeOrders.length.toString(), color: 'bg-blue-500' },
    { title: 'Zarada danas', value: `${totalRevenueToday.toLocaleString()} RSD`, color: 'bg-green-500' },
    { title: 'Dostavljeno danas', value: deliveredToday.length.toString(), color: 'bg-purple-500' },
    { title: 'Ukupno narudžbi danas', value: todayOrders.length.toString(), color: 'bg-orange-500' },
  ];

  // Poslednje narudžbine
  const recentOrders = todayOrders.slice(0, 5).map(order => ({
    id: order.id,
    table: order.table,
    items: order.items.map(item => `${item.name} x${item.quantity}`).join(', '),
    total: order.total,
    status: order.status,
    time: order.time
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">⚙️ Admin Panel</h1>
            <p className="text-gray-300">Dobrodošli, {user.username}</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Odjavi se
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} text-white p-6 rounded-lg shadow-lg`}>
              <h3 className="text-lg opacity-90 mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Dodatna statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-cyan-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-90 mb-2">Broj Stolova</h3>
            <p className="text-3xl font-bold">{tables.length}</p>
          </div>
          <div className="bg-pink-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-90 mb-2">Jela na Meniju</h3>
            <p className="text-3xl font-bold">{menuItems.length}</p>
          </div>
        </div>

        {/* Brzi pristup */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <a
            href="/admin/menu"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="text-xl font-bold mb-2">Meni</h3>
            <p className="text-gray-600">Jela i pića</p>
          </a>

          <a
            href="/admin/categories"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📑</div>
            <h3 className="text-xl font-bold mb-2">Kategorije</h3>
            <p className="text-gray-600">Sekcije menija</p>
          </a>

          <a
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2">Narudžbe</h3>
            <p className="text-gray-600">Sve narudžbine</p>
          </a>

          <a
            href="/admin/revenue"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold mb-2">Pazar</h3>
            <p className="text-gray-600">Zarada</p>
          </a>

          <a
            href="/admin/tables"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">🪑</div>
            <h3 className="text-xl font-bold mb-2">Stolovi</h3>
            <p className="text-gray-600">QR kodovi</p>
          </a>
        </div>

        {/* Poslednje narudžbe */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Poslednje narudžbe</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Vreme</th>
                  <th className="px-4 py-3 text-left">Sto</th>
                  <th className="px-4 py-3 text-left">Stavke</th>
                  <th className="px-4 py-3 text-left">Ukupno</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nema narudžbi danas
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">{order.time}</td>
                      <td className="px-4 py-3">{order.table}</td>
                      <td className="px-4 py-3 text-sm">{order.items}</td>
                      <td className="px-4 py-3 font-semibold">{order.total} RSD</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'Dostavljeno' ? 'bg-gray-100 text-gray-800' :
                          order.status === 'Spremno' ? 'bg-green-100 text-green-800' :
                          order.status === 'U pripremi' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 