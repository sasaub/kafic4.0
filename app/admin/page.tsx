'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useMenu } from '../context/MenuContext';
import { useTables } from '../context/TablesContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  role: string;
}

export default function AdminPage() {
  const { user, logout, isLoading } = useAuth();
  const { orders } = useOrders();
  const { menuItems } = useMenu();
  const { tables } = useTables();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Greška pri učitavanju korisnika');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getWaiterName = (waiterId: number | null | undefined) => {
    if (!waiterId) return 'Gost (QR kod)';
    const waiter = users.find(u => u.id === waiterId);
    return waiter ? waiter.username : 'Nepoznato';
  };

  // Realne statistike - samo originalne porudžbine (waiter), ne kuhinjske duplikate
  // Hook-ovi moraju biti pozvani pre uslovnih return-ova
  // Koristi lokalno vreme (ne UTC) za današnji datum
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  
  // Funkcija za normalizaciju datuma (izvučena van useMemo da se ne kreira na svakom renderu)
  const normalizeDate = (date: string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }
    return date;
  };
  
  
  // Izračunaj statistike koristeći useMemo da se ažuriraju kada se orders promene
  const stats = useMemo(() => {
    
    // Za prikaz poslednjih porudžbina - prikaži sve porudžbine za danas (bez obzira na status)
    // Filtriraj waiter porudžbine (originalne i kopije koje su kreirane pri potvrđivanju)
    // Takođe uključi i originalne porudžbine koje su waiter-admin kreirao (čak i ako su sada kitchen)
    const todayOrdersRaw = orders.filter(o => {
      const orderDate = normalizeDate(o.date);
      // Prikaži waiter porudžbine (originalne i kopije)
      if (orderDate === today && o.destination === 'waiter') {
        return true;
      }
      // Takođe prikaži originalne porudžbine koje je waiter-admin kreirao (čak i ako su sada kitchen)
      // Ovo pokriva slučaj kada waiter-admin kreira i potvrdi porudžbinu sa hranom
      if (orderDate === today && o.destination === 'kitchen' && o.waiter_id && o.status === 'Novo') {
        return true;
      }
      return false;
    });
    
    // Grupisi po ID-u da ne dupliramo (ako postoji kopija porudžbine)
    // Takođe, ako postoji originalna porudžbina (kitchen) i kopija (waiter), prikaži samo waiter kopiju
    const todayOrdersMap = new Map();
    todayOrdersRaw.forEach(order => {
      // Ako je waiter porudžbina (kopija), prioritetno je prikaži
      if (order.destination === 'waiter') {
        todayOrdersMap.set(order.id, order);
      } else if (order.destination === 'kitchen' && !todayOrdersMap.has(order.id)) {
        // Ako je kitchen porudžbina (originalna) i nema waiter kopije, prikaži originalnu
        todayOrdersMap.set(order.id, order);
      }
    });
    const todayOrders = Array.from(todayOrdersMap.values());
    
    // Za statistike - sve porudžbine sa statusom "Potvrđeno" za danas
    const allTodayOrdersRaw = orders.filter(o => {
      const orderDate = normalizeDate(o.date);
      return orderDate === today && o.status === 'Potvrđeno';
    });
    
    // Grupisi po ID-u da izbegnemo duplikate (ako postoji kopija porudžbine)
    const uniqueTodayOrders = allTodayOrdersRaw.reduce((acc, order) => {
      if (!acc[order.id]) {
        acc[order.id] = order;
      }
      return acc;
    }, {} as Record<number, typeof allTodayOrdersRaw[0]>);
    
    const uniqueTodayOrdersArray = Object.values(uniqueTodayOrders);
    
    // Aktivne narudžbe = sve porudžbine sa statusom "Novo" za danas (naručene ali još nisu potvrđene)
    // Filtriraj samo waiter porudžbine (originalne), ne kuhinjske duplikate
    const activeOrders = orders.filter(o => {
      const orderDate = normalizeDate(o.date);
      return orderDate === today && 
             o.status === 'Novo' && 
             o.destination === 'waiter';
    });
    
    // Ukupno dostavljeno = sve porudžbine sa statusom "Potvrđeno" za danas
    const deliveredToday = uniqueTodayOrdersArray;
    
    // Ukupna zarada = suma svih porudžbina sa statusom "Potvrđeno" za danas
    const totalRevenueToday = uniqueTodayOrdersArray.reduce((sum, o) => sum + o.total, 0);
    
    // Ukupno narudžbi danas = SVE porudžbine za danas (bez obzira na status i destination)
    // Uključi sve porudžbine za danas i ukloni duplikate po ID-u
    const allTodayOrdersForStats = orders.filter(o => {
      const orderDate = normalizeDate(o.date);
      return orderDate === today;
    });
    
    // Grupisi po ID-u da uklonimo duplikate
    const uniqueAllTodayOrders = allTodayOrdersForStats.reduce((acc, order) => {
      if (!acc[order.id]) {
        acc[order.id] = order;
      }
      return acc;
    }, {} as Record<number, typeof allTodayOrdersForStats[0]>);
    
    const totalTodayOrders = Object.values(uniqueAllTodayOrders);

    return {
      activeOrders,
      deliveredToday,
      totalRevenueToday,
      uniqueTodayOrdersArray,
      todayOrders,
      totalTodayOrders
    };
  }, [orders, today]);

  const statsArray = useMemo(() => [
    { title: 'Aktivne narudžbe', value: stats.activeOrders.length.toString() },
    { title: 'Zarada danas', value: `${stats.totalRevenueToday.toLocaleString()} RSD` },
    { title: 'Dostavljeno danas', value: stats.deliveredToday.length.toString() },
    { title: 'Ukupno narudžbi danas', value: stats.totalTodayOrders.length.toString() },
  ], [stats]);

  // Najprodavanije jela - analiziraj sve porudžbine za danas
  const topSellingItems = useMemo(() => {
    // Uzmi sve porudžbine za danas (bez obzira na status)
    const allTodayOrders = orders.filter(o => {
      const orderDate = normalizeDate(o.date);
      return orderDate === today;
    });

    // Grupisi sve stavke po imenu i saberi količine
    const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    allTodayOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const itemName = item.name;
          if (!itemCounts[itemName]) {
            itemCounts[itemName] = {
              name: itemName,
              quantity: 0,
              revenue: 0
            };
          }
          itemCounts[itemName].quantity += item.quantity || 1;
          itemCounts[itemName].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    // Sortiraj po količini (najprodavanije prvo)
    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10
  }, [orders, today]);

  // Uslovni return-ovi MORAJU biti posle svih hook-ova
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Admin Panel</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dobrodošli, {user.username}</p>
          </div>
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Naslov sekcije - Statistika */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Pregled Statistike</h2>
          <p className="text-sm text-gray-500">Statistika za današnji dan</p>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsArray.map((stat, index) => {
            const icons = [
              <svg key="active" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              <svg key="revenue" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              <svg key="delivered" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>,
              <svg key="total" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ];
            
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Subtle accent bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: index === 1 ? '#4CAF50' : '#2B2E34' }}
                />
                
                {/* Subtle background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle, #2B2E34 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: index === 1 ? '#E8F5E9' : '#F3F4F6' }}>
                      <div style={{ color: index === 1 ? '#4CAF50' : '#2B2E34' }}>
                        {icons[index] || icons[0]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 leading-none">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Naslov sekcije - Dodatna statistika */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Dodatne Informacije</h2>
          <p className="text-sm text-gray-500">Pregled sistema</p>
        </div>

        {/* Dodatna statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative overflow-hidden group">
            {/* Subtle accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: '#2B2E34' }} />
            
            {/* Subtle background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, #2B2E34 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: '#F3F4F6' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#2B2E34' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Broj Stolova</p>
                <p className="text-3xl font-bold text-gray-900 leading-none">{tables.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative overflow-hidden group">
            {/* Subtle accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: '#2B2E34' }} />
            
            {/* Subtle background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, #2B2E34 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: '#F3F4F6' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#2B2E34' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jela na Meniju</p>
                <p className="text-3xl font-bold text-gray-900 leading-none">{menuItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Naslov sekcije - Brzi pristup */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Brzi Pristup</h2>
          <p className="text-sm text-gray-500">Navigacija kroz sistem</p>
        </div>

        {/* Brzi pristup */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/admin/menu"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Meni</h3>
              <p className="text-gray-600">Jela i pića</p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Kategorije</h3>
              <p className="text-gray-600">Sekcije menija</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Narudžbe</h3>
              <p className="text-gray-600">Sve narudžbine</p>
            </div>
          </Link>

          <Link
            href="/admin/revenue"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Pazar</h3>
              <p className="text-gray-600">Zarada</p>
            </div>
          </Link>

          <Link
            href="/admin/tables"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Stolovi</h3>
              <p className="text-gray-600">QR kodovi</p>
            </div>
          </Link>
          </div>
        </div>

        {/* Naslov sekcije - Dodatne opcije */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Upravljanje</h2>
          <p className="text-sm text-gray-500">Dodatne opcije sistema</p>
        </div>

        {/* Dodatne opcije */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
          <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Korisnici</h3>
              <p className="text-gray-600">Upravljanje nalozima</p>
            </div>
          </Link>

          <Link
            href="/admin/revenue-by-waiter"
            className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-start gap-3"
          >
            <svg className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Pazar po konobaru</h3>
              <p className="text-gray-600">Statistika po korisniku</p>
            </div>
          </Link>
          </div>
        </div>

        {/* Najprodavanije jela */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Najprodavanije jela danas</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Naziv jela</th>
                  <th className="px-4 py-3 text-left">Količina</th>
                  <th className="px-4 py-3 text-left">Ukupna zarada</th>
                </tr>
              </thead>
              <tbody>
                {topSellingItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Nema prodaje danas
                    </td>
                  </tr>
                ) : (
                  topSellingItems.map((item, index) => (
                    <tr key={item.name} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                             style={{ backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#2B2E34' }}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {item.quantity} {item.quantity === 1 ? 'komad' : 'komada'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.revenue.toLocaleString()} RSD
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