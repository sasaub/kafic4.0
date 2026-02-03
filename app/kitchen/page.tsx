'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrders, Order } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMenu } from '../context/MenuContext';
import { formatDate } from '../utils/dateFormat';

export default function KitchenPage() {
  const { orders } = useOrders();
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

  // Memoizuj filtrirane narudžbine
  const kitchenOrders = useMemo(() => 
    orders.filter(o => o.destination === 'kitchen'),
    [orders]
  );
  
  // Filtriraj stavke - prikaži samo hranu u kuhinji
  const kitchenOrdersWithFoodOnly = useMemo(() => 
    kitchenOrders.map(order => {
      const foodItems = order.items.filter(item => {
        const category = categories.find(c => c.name === item.category);
        return category?.type === 'Hrana';
      });
      return {
        ...order,
        items: foodItems,
        total: foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }).filter(order => order.items.length > 0),
    [kitchenOrders, categories]
  );
  
  const newOrders = useMemo(() => 
    kitchenOrdersWithFoodOnly.filter(o => 
      o.status === 'Novo' && !markedAsReady.has(o.id)
    ),
    [kitchenOrdersWithFoodOnly, markedAsReady]
  );
  
  const allOrdersRaw = useMemo(() => 
    kitchenOrdersWithFoodOnly.filter(o => 
      o.status !== 'Novo' || markedAsReady.has(o.id)
    ),
    [kitchenOrdersWithFoodOnly, markedAsReady]
  );
  
  const allOrders = useMemo(() => 
    clearDate ? allOrdersRaw.filter(o => o.date > clearDate) : allOrdersRaw,
    [allOrdersRaw, clearDate]
  );

  const displayOrders = useMemo(() => 
    view === 'new' ? newOrders : allOrders,
    [view, newOrders, allOrders]
  );

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

  const handleClearAll = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(CLEAR_KEY, today);
    setClearDate(today);
  }, []);

  const handleResetClear = useCallback(() => {
    localStorage.removeItem(CLEAR_KEY);
    setClearDate(null);
  }, []);

  const acceptOrder = useCallback((order: Order) => {
    // Kuhinja može da označi porudžbinu kao spremno, ali ne sme da promeni status
    // Status ostaje "Potvrđeno" - kuhinja samo potvrđuje da je spremno
    // Označi porudžbinu kao spremno (dodaj u markedAsReady set)
    setMarkedAsReady(prev => new Set(prev).add(order.id));
    // Prebaci na sekciju "Sve" da korisnik vidi da je porudžbina označena
    setView('all');
  }, []);

  const getPriorityBadge = useCallback((priority: Order['priority']) => {
    switch (priority) {
      case 'high': return { label: 'HITNO' };
      case 'medium': return { label: 'Srednje' };
      case 'low': return { label: 'Normalno' };
      default: return { label: '' };
    }
  }, []);

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-4 sticky top-0 z-20 shadow-sm" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Kuhinja</h1>
            <p className="mt-1 text-sm" style={{ color: '#FFFFFF', opacity: 0.8 }}>
              {user.username}
            </p>
          </div>
          <button 
            onClick={logout}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            Odjavi se
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Pristigle porudžbine - PRIORITET */}
        {newOrders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#3B82F6' }}></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Nove Narudžbe
                </h2>
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>
                  {newOrders.length}
                </span>
              </div>
            </div>
            
            <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {newOrders.map(order => {
                const priority = getPriorityBadge(order.priority);
                
                return (
                  <div
                    key={order.id}
                    className="h-full flex flex-col bg-white border-2 rounded-xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 relative"
                    style={{ borderColor: '#2B2E34' }}
                  >
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#3B82F6' }} />
                    
                    {/* Order header */}
                    <div className="p-4 pt-5 bg-white border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {priority.label && (
                              <div className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                {priority.label}
                              </div>
                            )}
                            <span className="text-xs text-gray-500">#{order.id}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-1 text-gray-900">{order.table}</h3>
                          <p className="text-sm text-gray-600">{order.time}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold mb-2 text-gray-900">{order.total} RSD</div>
                          <div className="px-3 py-1.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#3B82F6' }}>
                            NOVA
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="p-5 bg-gray-50 flex-1">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex-1">
                                <span className="font-semibold text-gray-800 text-base block mb-0.5">{item.name}</span>
                                <span className="text-sm text-gray-500">{item.price} RSD</span>
                              </div>
                              <div className="ml-4">
                                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-bold">
                                  ×{item.quantity}
                                </span>
                              </div>
                            </div>
                            {/* Prikaži komentar ako postoji */}
                            {item.comment && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">Komentar:</span>
                                  <span className="text-sm text-gray-700 italic flex-1">{item.comment}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto p-5 bg-white border-t border-gray-100">
                      <button
                        onClick={() => acceptOrder(order)}
                        className="w-full py-3 rounded-lg font-semibold text-base transition-colors shadow-sm hover:shadow-md"
                        style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                      >
                        Označi kao Spremno
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stats - kompaktnije */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Novi</p>
            <p className="text-2xl font-bold text-gray-900">{newOrders.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sve</p>
            <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
        </div>
      </div>

        {/* View tabs - samo ako nema novih porudžbina ili za "Sve" */}
        {newOrders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
            <div className="flex gap-2">
            <button
              onClick={() => setView('new')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                view === 'new'
                    ? 'shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
                style={view === 'new' ? { backgroundColor: '#2B2E34', color: '#FFFFFF' } : {}}
            >
                Novi ({newOrders.length})
            </button>
            <button
              onClick={() => setView('all')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  view === 'all'
                    ? 'shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={view === 'all' ? { backgroundColor: '#2B2E34', color: '#FFFFFF' } : {}}
              >
                Sve ({allOrders.length})
              </button>
            </div>
          </div>
        )}

        {/* Tabs za "Sve" kada ima novih porudžbina */}
        {newOrders.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setView('all')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                view === 'all'
                    ? 'shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
                style={view === 'all' ? { backgroundColor: '#2B2E34', color: '#FFFFFF' } : {}}
            >
                Sve ({allOrders.length})
            </button>
            </div>
          </div>
        )}

        {view === 'all' && (
          <div className="flex items-center gap-2 justify-end mb-4">
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

        {/* Sve narudžbe - samo ako je view === 'all' */}
        {view === 'all' && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Sve Narudžbe</h2>
          </div>
        )}

        {view === 'all' && displayOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base font-semibold text-gray-700 mb-1">Nema narudžbi</p>
            <p className="text-sm text-gray-500">Prihvaćene narudžbine će biti ovde</p>
          </div>
        ) : view === 'all' && (
          <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayOrders.map(order => {
              const priority = getPriorityBadge(order.priority);
              
              return (
                <div
                  key={order.id}
                  className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg hover:border-gray-300 overflow-hidden transition-all duration-200"
                >
                  {/* Order header */}
                  <div className="p-4 bg-white border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {priority.label && (
                            <div className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                              {priority.label}
                            </div>
                          )}
                          <span className="text-xs text-gray-500">#{order.id}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 text-gray-900">{order.table}</h3>
                        <p className="text-sm text-gray-600">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold mb-2 text-gray-900">{order.total} RSD</div>
                        <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-5 bg-gray-50 flex-1">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex-1">
                              <span className="font-semibold text-gray-800 text-base block mb-0.5">{item.name}</span>
                              <span className="text-sm text-gray-500">{item.price} RSD</span>
                            </div>
                            <div className="ml-4">
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-bold">
                                ×{item.quantity}
                              </span>
                            </div>
                          </div>
                          {/* Prikaži komentar ako postoji */}
                          {item.comment && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-start gap-2">
                                <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">Komentar:</span>
                                <span className="text-sm text-gray-700 italic flex-1">{item.comment}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto p-5 bg-white border-t border-gray-100">
                      <div className="flex gap-2">
                      <div className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-lg font-semibold text-sm text-center border border-gray-200">
                          Potvrđeno
                        </div>
                      </div>
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

