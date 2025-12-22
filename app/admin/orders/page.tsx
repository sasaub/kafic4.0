'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { user, logout, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  // HOOKS na vrhu! - SVI hooks moraju biti pre bilo kakvih uslovnih return-ova
  const [filter, setFilter] = useState<string>('Sve');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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

  const updateStatus = async (id: number, newStatus: Order['status']) => {
    // Ne dozvoljava menjanje statusa za "Potvrđeno" porudžbine
    const order = orders.find(o => o.id === id);
    if (order && order.status === 'Potvrđeno') {
      showToast('Ne možete menjati status potvrđene porudžbine. Možete je samo obrisati (stornirati) ako je bila greška.', 'warning');
      return;
    }
    await updateOrderStatus(id, newStatus);
  };

  const handleDeleteOrder = async (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: number) => {
    try {
      await deleteOrder(id);
      setShowDeleteConfirm(null);
      showToast('Porudžbina je uspešno obrisana', 'success');
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Greška pri brisanju porudžbine', 'error');
    }
  };

  // Prikaži sve porudžbine (i waiter i kitchen) - admin treba da vidi sve
  const allOrders = orders;
  const filteredOrders = filter === 'Sve' 
    ? allOrders 
    : allOrders.filter(order => order.status === filter);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'U pripremi': return 'bg-yellow-100 text-yellow-800';
      case 'Spremno': return 'bg-green-100 text-green-800';
      case 'Dostavljeno': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Uklonjeni 'U pripremi' i 'Dostavljeno' - nema potrebe za tim
  const statusOptions: Order['status'][] = ['Novo', 'Spremno'];

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
        {/* Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex gap-3 overflow-x-auto">
            {['Sve', 'Novo', 'Potvrđeno', 'Spremno'].map(status => (
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{allOrders.filter(o => o.status === 'Novo').length}</div>
            <div className="text-sm opacity-90">Nove</div>
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{allOrders.filter(o => o.status === 'Potvrđeno').length}</div>
            <div className="text-sm opacity-90">Potvrđeno</div>
          </div>
          <div className="bg-purple-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{allOrders.filter(o => o.status === 'Spremno').length}</div>
            <div className="text-sm opacity-90">Spremno</div>
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

                <div className="flex gap-2 flex-wrap items-center">
                  {order.status === 'Potvrđeno' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                        Potvrđeno - Status se ne može menjati
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Obriši (Storniraj)
                      </button>
                    </div>
                  ) : (
                    <>
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
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Obriši
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Potvrda brisanja</h3>
            <p className="mb-6">Da li ste sigurni da želite da obrišete (stornirate) ovu porudžbinu? Ova akcija je nepovratna.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Otkaži
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 