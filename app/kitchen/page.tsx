'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMenu } from '../context/MenuContext';
import { formatDate } from '../utils/dateFormat';

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { user, logout, isLoading } = useAuth();
  const { categories } = useMenu();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const [view, setView] = useState<'new' | 'all'>('new');
  const [clearDate, setClearDate] = useState<string | null>(null);
  const [markedAsReady, setMarkedAsReady] = useState<Set<number>>(new Set());

  const CLEAR_KEY = 'qr-kitchen-clear-date';

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'kitchen')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLEAR_KEY);
      if (stored) setClearDate(stored);
    } catch {}
  }, []);

  // Samo nove narudžbine koje su namenjene kuhinji
  const kitchenOrders = orders.filter(o => o.destination === 'kitchen');
  
  // Filtriraj stavke - prikaži samo hranu u kuhinji
  const kitchenOrdersWithFoodOnly = kitchenOrders.map(order => {
    const foodItems = order.items.filter(item => {
      const category = categories.find(c => c.name === item.category);
      return category?.type === 'Hrana';
    });
    return {
      ...order,
      items: foodItems,
      total: foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }).filter(order => order.items.length > 0); // Samo porudžbine sa hranom
  
  const newOrders = kitchenOrdersWithFoodOnly.filter(o => 
    o.status === 'Novo' && !markedAsReady.has(o.id)
  );
  // Za "Sve" prikaži sve porudžbine koje nisu "Novo" (uključujući "Potvrđeno")
  // Takođe, uključi porudžbine koje su označene kao spremno
  const allOrdersRaw = kitchenOrdersWithFoodOnly.filter(o => 
    o.status !== 'Novo' || markedAsReady.has(o.id)
  );
  const allOrders = clearDate
    ? allOrdersRaw.filter(o => o.date > clearDate)
    : allOrdersRaw;

  const displayOrders = view === 'new' ? newOrders : allOrders;

  // Debug - prikaži sve porudžbine u konzoli
  useEffect(() => {
    console.log('=== KITCHEN PAGE DEBUG ===');
    console.log('All orders count:', orders.length);
    console.log('Kitchen orders count:', kitchenOrders.length);
    console.log('New kitchen orders count:', newOrders.length);
    console.log('Display orders count:', displayOrders.length);
    console.log('All orders:', orders.map(o => ({
      id: o.id,
      destination: o.destination,
      status: o.status,
      table: o.table,
      itemsCount: o.items.length,
      items: o.items.map(i => i.name)
    })));
    console.log('Kitchen orders:', kitchenOrders.map(o => ({
      id: o.id,
      destination: o.destination,
      status: o.status,
      table: o.table,
      itemsCount: o.items.length
    })));
    console.log('New kitchen orders:', newOrders.map(o => ({
      id: o.id,
      destination: o.destination,
      status: o.status,
      table: o.table,
      itemsCount: o.items.length
    })));
    console.log('Display orders:', displayOrders.map(o => ({
      id: o.id,
      destination: o.destination,
      status: o.status,
      table: o.table,
      itemsCount: o.items.length
    })));
    console.log('=== END KITCHEN PAGE DEBUG ===');
  }, [orders, kitchenOrders, newOrders, displayOrders]);

  const handleClearAll = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(CLEAR_KEY, today);
    setClearDate(today);
  };

  const handleResetClear = () => {
    localStorage.removeItem(CLEAR_KEY);
    setClearDate(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Učitavanje...</div>
      </div>
    );
  }

  if (!user || user.role !== 'kitchen') {
    return null;
  }

  const acceptOrder = (order: Order) => {
    // Kuhinja može da označi porudžbinu kao spremno, ali ne sme da promeni status
    // Status ostaje "Potvrđeno" - kuhinja samo potvrđuje da je spremno
    // Označi porudžbinu kao spremno (dodaj u markedAsReady set)
    setMarkedAsReady(prev => new Set(prev).add(order.id));
    // Prebaci na sekciju "Sve" da korisnik vidi da je porudžbina označena
    setView('all');
  };

  const getPriorityBadge = (priority: Order['priority']) => {
    switch (priority) {
      case 'high': return { icon: '🔴', label: 'HITNO' };
      case 'medium': return { icon: '🟡', label: 'Srednje' };
      case 'low': return { icon: '🟢', label: 'Normalno' };
      default: return { icon: '', label: '' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 sticky top-0 z-20 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Kuhinja</h1>
            <p className="text-gray-300 text-sm">
              Dobrodošli, {user.username}
            </p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors"
          >
            Odjavi se
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b p-4 sticky top-[88px] z-10 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg text-center border-2 border-red-200">
            <div className="text-4xl font-bold text-red-600">{newOrders.length}</div>
            <div className="text-sm text-red-800 font-semibold">Novih Narudžbi</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border-2 border-gray-200">
            <div className="text-4xl font-bold text-gray-600">{allOrders.length}</div>
            <div className="text-sm text-gray-800 font-semibold">Sve Narudžbe</div>
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-2 w-full md:flex-1">
            <button
              onClick={() => setView('new')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                view === 'new'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔔 Novi ({newOrders.length})
            </button>
            <button
              onClick={() => setView('all')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                view === 'all'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Sve ({allOrders.length})
            </button>
          </div>

          {view === 'all' && (
            <div className="flex items-center gap-2 justify-end md:w-auto">
              {clearDate && (
                <span className="text-xs md:text-sm text-gray-600 bg-gray-50 border px-2 py-1 rounded">
                  Prikaz od: {formatDate(clearDate)} nadalje
                </span>
              )}
              {allOrdersRaw.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-sm"
                  title="Sakrij sve do današnjeg datuma"
                >
                  Clear
                </button>
              )}
              {clearDate && (
                <button
                  onClick={handleResetClear}
                  className="px-3 py-2 bg-white border hover:bg-gray-50 text-gray-700 rounded font-semibold text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Orders list */}
      <div className="p-4 pb-24">
        {displayOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow-sm">
            <div className="text-6xl mb-4">
              {view === 'new' ? '🔔' : '📋'}
            </div>
            <p className="text-lg font-semibold">
              {view === 'new' ? 'Nema novih narudžbi' : 'Nema narudžbi'}
            </p>
            <p className="text-sm">
              {view === 'new' ? 'Nove narudžbine će se pojaviti ovde' : 'Prihvaćene narudžbine će biti ovde'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayOrders.map(order => {
              const priority = getPriorityBadge(order.priority);
              const isNew = order.status === 'Novo';
              
              return (
                <div
                  key={order.id}
                  className={`h-full flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    isNew ? 'ring-4 ring-red-400 animate-pulse' : ''
                  }`}
                >
                  {/* Order header */}
                  <div className={`${isNew ? 'bg-red-500' : 'bg-gray-500'} text-white p-4`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{priority.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold">{order.table}</h3>
                          <p className="text-sm opacity-90">#{order.id} • {order.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{order.total} RSD</div>
                        <div className="text-xs opacity-90 font-semibold uppercase">
                          {isNew ? 'NOVA' : order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-4 bg-gray-50">
                    <div className="grid gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-800">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{item.price} RSD</span>
                              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                                ×{item.quantity}
                              </span>
                            </div>
                          </div>
                          {/* Prikaži komentar ako postoji */}
                          {item.comment && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-start gap-2">
                                <span className="text-blue-600 font-semibold text-sm">💬 Komentar:</span>
                                <span className="text-sm text-gray-700 italic">{item.comment}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto p-4 bg-white">
                    {isNew ? (
                      <button
                        onClick={() => acceptOrder(order)}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        ✅ Označi kao Spremno
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-center">
                          Potvrđeno
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

