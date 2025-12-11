'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category?: string; // Dodato da bi mogli da odredimo tip
  comment?: string; // Opcioni komentar uz stavku (npr. "Bez luka", "Extra začini")
}

export interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  total: number;
  status: 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Spremno' | 'Dostavljeno';
  time: string;
  date: string; // Format: YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  destination: 'kitchen' | 'waiter'; // Dodato polje za razdvajanje
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'time' | 'date' | 'status' | 'priority' | 'destination'>) => void;
  updateOrderStatus: (id: number, status: Order['status']) => void;
  confirmOrder: (id: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'qr-restaurant-orders';

// Inicijalni podaci
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

const initialOrders: Order[] = [
  { 
    id: 1, 
    table: 'Sto 5', 
    items: [
      { name: 'Ćevapi', quantity: 2, price: 850, category: 'Glavna jela' },
      { name: 'Coca Cola', quantity: 2, price: 200, category: 'Sokovi' }
    ], 
    total: 2100, 
    status: 'Spremno', 
    time: '14:30',
    date: getTodayDate(),
    priority: 'high',
    destination: 'waiter'
  },
  { 
    id: 2, 
    table: 'Sto 3', 
    items: [
      { name: 'Pljeskavica', quantity: 1, price: 750, category: 'Glavna jela' },
      { name: 'Sopska salata', quantity: 1, price: 400, category: 'Salate' }
    ], 
    total: 1150, 
    status: 'U pripremi', 
    time: '14:25',
    date: getTodayDate(),
    priority: 'medium',
    destination: 'kitchen'
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj narudžbine iz localStorage pri mountu
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders(initialOrders);
      }
    } else {
      setOrders(initialOrders);
    }
    setIsLoaded(true);
  }, []);

  // Sačuvaj narudžbine u localStorage pri svakoj promeni
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // Slušaj promene iz drugih tab-ova
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Samo reaguj na promene iz DRUGIH tab-ova
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newOrders = JSON.parse(e.newValue);
          setOrders(newOrders);
        } catch (error) {
          console.error('Error syncing orders:', error);
        }
      }
    };

    // storage event se automatski triggeruje samo iz drugih tab-ova
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addOrder = (orderData: Omit<Order, 'id' | 'time' | 'date' | 'status' | 'priority' | 'destination'>) => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Automatski prioritet na osnovu ukupne cene
    let priority: Order['priority'] = 'low';
    if (orderData.total > 2000) priority = 'high';
    else if (orderData.total > 1000) priority = 'medium';
    
    // Kreiraj porudžbinu za konobara (potvrđivanje i razdvajanje se dešava pri potvrđivanju)
    const newOrder: Order = {
      ...orderData,
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      time,
      date,
      status: 'Novo',
      priority,
      destination: 'waiter',
    };
    
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: number, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };
  
  const confirmOrder = (id: number) => {
    // Ažuriraj status I kreiraj kuhinjsku porudžbinu u jedan setOrders poziv
    setOrders(prev => {
      // Pronađi porudžbinu iz PREVIOUS state
      const order = prev.find(o => o.id === id);
      if (!order) return prev;
      
      // Proveri da li je već potvrđena - spreči duplo potvrđivanje
      if (order.status === 'Potvrđeno') return prev;
      
      // Učitaj kategorije iz localStorage
      const storedCategories = localStorage.getItem('qr-restaurant-categories');
      let categories: { name: string; type: 'Hrana' | 'Piće' }[] = [];
      
      if (storedCategories) {
        try {
          categories = JSON.parse(storedCategories);
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      }
      
      // Razdvoji hranu
      const foodItems: Order['items'] = [];
      let foodTotal = 0;
      
      // Fallback kategorije ako localStorage nije dostupan
      const fallbackCategories = [
        { id: 1, name: 'Glavna jela', type: 'Hrana' as const },
        { id: 2, name: 'Salate', type: 'Hrana' as const },
        { id: 3, name: 'Deserti', type: 'Hrana' as const },
        { id: 4, name: 'Sokovi', type: 'Piće' as const },
        { id: 5, name: 'Kafe', type: 'Piće' as const },
        { id: 6, name: 'Alkohol', type: 'Piće' as const },
      ];
      
      if (!categories || categories.length === 0) {
        categories = fallbackCategories;
      }
      
      order.items.forEach(item => {
        if (!item.category) return;
        
        // Pokušaj da pronađeš kategoriju - proveri tačno poklapanje
        let itemCategory = categories.find(c => c.name === item.category);
        
        // Ako ne pronađeš, pokušaj sa trim i case-insensitive
        if (!itemCategory) {
          itemCategory = categories.find(c => 
            c.name.trim().toLowerCase() === item.category.trim().toLowerCase()
          );
        }
        
        if (itemCategory?.type === 'Hrana') {
          // Dodaj stavku sa komentarom ako postoji
          foodItems.push({
            ...item,
            comment: item.comment // Sačuvaj komentar uz hranu
          });
          foodTotal += item.price * item.quantity;
        }
      });
      
      // Ažuriraj status porudžbine
      const updatedOrders: Order[] = prev.map(o => 
        o.id === id ? { ...o, status: 'Potvrđeno' as const } : o
      );
      
      // Ako ima hrane, kreiraj novu porudžbinu za kuhinju
      if (foodItems.length > 0) {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const date = now.toISOString().split('T')[0];
        
        let foodPriority: Order['priority'] = 'low';
        if (foodTotal > 2000) foodPriority = 'high';
        else if (foodTotal > 1000) foodPriority = 'medium';
        
        // Koristimo ID iz PREVIOUS state da bismo bili sigurni da neće biti duplikata
        const newId = prev.length > 0 ? Math.max(...prev.map(o => o.id)) + 1 : 1;
        
        const kitchenOrder: Order = {
          table: order.table,
          items: foodItems,
          total: foodTotal,
          id: newId,
          time,
          date,
          status: 'Novo',
          priority: foodPriority,
          destination: 'kitchen',
        };
        
        console.log('Creating kitchen order:', kitchenOrder);
        console.log('Kitchen order details:', {
          id: kitchenOrder.id,
          destination: kitchenOrder.destination,
          status: kitchenOrder.status,
          table: kitchenOrder.table,
          itemsCount: kitchenOrder.items.length,
          total: kitchenOrder.total
        });
        
        // Vrati kuhinjsku porudžbinu i ažurirane porudžbine
        const result = [kitchenOrder, ...updatedOrders];
        
        console.log('Total orders after adding kitchen order:', result.length);
        console.log('Kitchen orders in result:', result.filter(o => o.destination === 'kitchen').map(o => ({
          id: o.id,
          destination: o.destination,
          status: o.status,
          table: o.table
        })));
        
        // Proveri da li se kuhinjska porudžbina pravilno dodaje
        const kitchenOrdersInResult = result.filter(o => o.destination === 'kitchen' && o.status === 'Novo');
        console.log('New kitchen orders in result:', kitchenOrdersInResult.length, kitchenOrdersInResult);
        
        // Automatski štampaj kuhinjsku porudžbinu nakon kratke pauze
        // Koristimo setTimeout da osiguramo da se state ažurira pre štampanja
        setTimeout(() => {
          // Importujemo funkcije za štampanje dinamički
          import('../utils/printer').then(({ printToNetworkPrinter, printViaBrowser, getPrinterSettings }) => {
            const printerSettings = getPrinterSettings();
            if (printerSettings && printerSettings.enabled && printerSettings.ipAddress) {
              printToNetworkPrinter(kitchenOrder).catch(() => {
                printViaBrowser(kitchenOrder);
              });
            } else {
              printViaBrowser(kitchenOrder);
            }
          });
        }, 200);
        
        // Sačuvaj u localStorage odmah
        console.log('Saving to localStorage, total orders:', result.length);
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
          console.log('Saved to localStorage');
        }, 0);
        
        return result;
      } else {
        console.log('No food items found, not creating kitchen order');
      }
      
      return updatedOrders;
    });
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, confirmOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
