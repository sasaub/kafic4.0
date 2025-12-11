'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const [filter, setFilter] = useState<string>('Sve');

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

  const updateStatus = (id: number, newStatus: Order['status']) => {
    updateOrderStatus(id, newStatus);
  };

  const filteredOrders = filter === 'Sve' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'U pripremi': return 'bg-yellow-100 text-yellow-800';
      case 'Spremno': return 'bg-green-100 text-green-800';
      case 'Dostavljeno': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: Order['status'][] = ['Novo', 'U pripremi', 'Spremno', 'Dostavljeno'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Upravljanje Narudžbama</h1>
            <p className="text-gray-300">Pregled i ažuriranje statusa narudžbi</p>
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
        {/* Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex gap-3 overflow-x-auto">
            {['Sve', 'Novo', 'U pripremi', 'Spremno', 'Dostavljeno'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Novo').length}</div>
            <div className="text-sm opacity-90">Nove</div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'U pripremi').length}</div>
            <div className="text-sm opacity-90">U pripremi</div>
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Spremno').length}</div>
            <div className="text-sm opacity-90">Spremno</div>
          </div>
          <div className="bg-gray-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Dostavljeno').length}</div>
            <div className="text-sm opacity-90">Dostavljeno</div>
          </div>
        </div>

        {/* Lista narudžbi */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-500">
              Nema narudžbi sa izabranim statusom
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">Narudžba #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {order.table} • {order.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{order.total} RSD</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Stavke:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.name} x{item.quantity}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      disabled={order.status === status}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        order.status === status
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 