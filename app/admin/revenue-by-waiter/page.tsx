'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../utils/dateFormat';
import DatePicker from '../../components/DatePicker';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  role: string;
}

interface Order {
  id: number;
  table: string;
  total: number;
  date: string;
  time: string;
  waiter_id: number | null;
}

export default function RevenueByWaiterPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  const [filterType, setFilterType] = useState<'day' | 'period'>('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenueByWaiter, setRevenueByWaiter] = useState<Record<number, { username: string; revenue: number; orderCount: number }>>({});

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Greška pri učitavanju korisnika');
      const data = await response.json();
      const waiterUsers = (Array.isArray(data) ? data : []).filter(
        (u: User) => u.role === 'waiter-admin' || u.role === 'waiter'
      );
      setUsers(waiterUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    if (user && user.role === 'admin' && users.length > 0) {
      const loadOrders = async () => {
        try {
          const response = await fetch('/api/orders');
          if (!response.ok) throw new Error('Greška pri učitavanju porudžbina');
          const data = await response.json();
          const allOrders = Array.isArray(data) ? data : [];
          
          // Filtriraj samo potvrđene porudžbine
          let filteredOrders = allOrders.filter((o: Order) => o.status === 'Potvrđeno');
          
          // Filtriraj po datumu
          if (filterType === 'day') {
            filteredOrders = filteredOrders.filter((o: Order) => {
              const orderDate = typeof o.date === 'string' && o.date.includes('T') 
                ? o.date.split('T')[0] 
                : o.date;
              return orderDate === selectedDate;
            });
          } else {
            filteredOrders = filteredOrders.filter((o: Order) => {
              const orderDate = typeof o.date === 'string' && o.date.includes('T') 
                ? o.date.split('T')[0] 
                : o.date;
              return orderDate >= dateFrom && orderDate <= dateTo;
            });
          }
          
          setOrders(filteredOrders);
          
          // Grupisi po konobaru
          const revenue: Record<number, { username: string; revenue: number; orderCount: number }> = {};
          
          filteredOrders.forEach((order: Order) => {
            const waiterId = order.waiter_id || 0; // Ako nema waiter_id, grupiši pod "Nepoznato"
            const waiter = users.find(u => u.id === waiterId);
            const username = waiter ? waiter.username : 'Nepoznato';
            
            if (!revenue[waiterId]) {
              revenue[waiterId] = { username, revenue: 0, orderCount: 0 };
            }
            
            revenue[waiterId].revenue += order.total;
            revenue[waiterId].orderCount += 1;
          });
          
          setRevenueByWaiter(revenue);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
      
      loadOrders();
    }
  }, [user, selectedDate, dateFrom, dateTo, filterType, users]);

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

  const totalRevenue = Object.values(revenueByWaiter).reduce((sum, w) => sum + w.revenue, 0);
  const sortedWaiters = Object.entries(revenueByWaiter)
    .map(([id, data]) => ({ id: parseInt(id), ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Pazar po Konobaru</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dobrodošli, {user.username}</p>
          </div>
          <div className="flex gap-4">
            <Link
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
            </Link>
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
            {orders.length} {orders.length === 1 ? 'porudžbina' : 'porudžbina'}
          </div>
        </div>

        {/* Revenue by waiter */}
        {sortedWaiters.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Zarada po konobaru</h2>
            <div className="space-y-3">
              {sortedWaiters.map((waiter, index) => (
                <div
                  key={waiter.id}
                  className="flex justify-between items-center p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{waiter.username}</div>
                      <div className="text-sm text-gray-600">{waiter.orderCount} porudžbina</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{waiter.revenue.toLocaleString()} RSD</div>
                    <div className="text-sm text-gray-500">
                      {totalRevenue > 0 ? ((waiter.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-500">
            <p>Nema podataka za izabrani period</p>
          </div>
        )}
      </div>
    </div>
  );
}
