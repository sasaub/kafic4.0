'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatDate } from '../utils/dateFormat';

export default function WaiterPage() {
  const { orders, updateOrderStatus, confirmOrder } = useOrders();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const [view, setView] = useState<'new' | 'all'>('new');
  const [clearDate, setClearDate] = useState<string | null>(null);

  const CLEAR_KEY = 'qr-waiter-clear-date';

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLEAR_KEY);
      if (stored) setClearDate(stored);
    } catch {}
  }, []);

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

  if (!user) {
    return null;
  }
  
  const printReceipt = (order: Order) => {
    const receiptContent = `
      ========================================
              QR RESTORAN
      ========================================
      
      Narudžba #${order.id}
      ${order.table}
      Vreme: ${order.time}
      
      ----------------------------------------
                  STAVKE
      ----------------------------------------
      ${order.items.map(item => `
      ${item.name}
      ${item.quantity} x ${item.price} RSD = ${item.quantity * item.price} RSD
      `).join('')}
      ----------------------------------------
      
      UKUPNO:                    ${order.total} RSD
      
      ========================================
           Hvala na poverenju!
      ========================================
    `;

    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Račun #' + order.id + '</title>');
      printWindow.document.write('<style>');
      printWindow.document.write('body { font-family: monospace; padding: 20px; }');
      printWindow.document.write('pre { white-space: pre-wrap; }');
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<pre>' + receiptContent + '</pre>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const acceptOrder = (order: Order) => {
    // Prvo prihvati (promeni status)
    updateOrderStatus(order.id, 'Dostavljeno');
    // Odmah štampaj slip
    setTimeout(() => printReceipt(order), 100);
  };

  // Samo nove narudžbine (ne potvrđene) koje su za konobara
  const newOrders = orders.filter(o => o.status === 'Novo' && o.destination === 'waiter');
  const allOrdersRaw = orders.filter(o => o.status !== 'Novo' && o.destination === 'waiter');
  const allOrders = clearDate
    ? allOrdersRaw.filter(o => o.date > clearDate)
    : allOrdersRaw;

  const displayOrders = view === 'new' ? newOrders : allOrders;

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
            <h1 className="text-2xl font-bold">Konobar +Šank</h1>
            <p className="text-gray-300 text-sm">
              Dobrodošli, Šank
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
            <div className="text-sm text-red-800 font-semibold">Pristigle Narudžbe</div>
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
            🔔 Pristigle ({newOrders.length})
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
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{item.price} RSD</span>
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-auto p-4 bg-white">
                  {isNew ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => confirmOrder(order.id)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        ✓ Potvrdi porudžbinu
                      </button>
                      <button
                        onClick={() => acceptOrder(order)}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        ✅ Prihvati i Štampaj
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-center">
                        ✓ {order.status === 'Potvrđeno' ? 'Potvrđeno' : order.status}
                      </div>
                      <button
                        onClick={() => printReceipt(order)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        🖨️ Štampaj
                      </button>
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