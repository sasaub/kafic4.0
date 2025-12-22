'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  comment?: string;
}

export interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  total: number;
  status: 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Spremno' | 'Dostavljeno';
  time: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  destination: 'kitchen' | 'waiter';
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'time' | 'date' | 'status' | 'priority' | 'destination'>) => Promise<void>;
  updateOrderStatus: (id: number, status: Order['status']) => Promise<void>;
  confirmOrder: (id: number) => Promise<{ success: boolean; message?: string }>;
  deleteOrder: (id: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj porudžbine sa API-ja
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'same-origin', // Dodaj credentials za bolju kompatibilnost
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.message, error.stack);
      // Postavi prazan array umesto da ostane undefined
      setOrders([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Optimizovan polling - 1 sekund za brži odziv
    const interval = setInterval(fetchOrders, 1000);
    return () => clearInterval(interval);
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'time' | 'date' | 'status' | 'priority' | 'destination'>) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: number, status: Order['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) throw new Error('Failed to update order');
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const confirmOrder = async (id: number) => {
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        // Proveri da li je response JSON ili HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to confirm order');
        } else {
          // Ako nije JSON, verovatno je HTML error page
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      
      // Refresh orders
      await fetchOrders();
      
      // Vrati result da waiter-admin može da štampa
      return result;
    } catch (error: any) {
      console.error('Error confirming order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete order');
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, confirmOrder, deleteOrder, refreshOrders: fetchOrders }}>
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
