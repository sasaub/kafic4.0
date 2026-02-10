'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  waiter_id?: number | null;
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Učitaj porudžbine sa API-ja - memoizovano sa useCallback sa retry logikom
  const fetchOrders = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2; // Manje retry-jeva za polling
    const RETRY_DELAY = 500;
    
    try {
      // Kreiraj URL sa parametrima za filtriranje
      let url = '/api/orders';
      const params = new URLSearchParams();
      
      // Ako je waiter-admin, filtriraj po waiter_id
      if (user && user.role === 'waiter-admin') {
        params.append('waiter_id', user.id.toString());
      }
      // Ako je waiter, ne dodavaj filter (vidi sve)
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      // Kreiraj timeout signal (fallback za starije browsere)
      let abortController: AbortController | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      
      if (typeof AbortController !== 'undefined') {
        abortController = new AbortController();
        timeoutId = setTimeout(() => {
          abortController?.abort();
        }, 8000); // 8 sekundi timeout
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'same-origin',
        signal: abortController?.signal,
      });
      
      // Očisti timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', response.status, response.statusText, errorText);
        
        // Retry samo za 5xx greške
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return fetchOrders(retryCount + 1);
        }
        
        // Za 4xx greške, ne retry-uj
        if (response.status < 500) {
          return;
        }
        
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setOrders(prevOrders => {
        const newOrders = Array.isArray(data) ? data : [];
        // Ažuriraj samo ako se promenilo
        if (JSON.stringify(prevOrders) !== JSON.stringify(newOrders)) {
          return newOrders;
        }
        return prevOrders;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Retry samo za network greške
      if ((errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch') || errorMessage.includes('timeout')) && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchOrders(retryCount + 1);
      }
      
      const errorName = error instanceof Error ? error.name : '';
      
      // Ne loguj grešku ako je samo timeout, abort ili network error (normalno za mobile)
      if (!errorMessage.includes('timeout') && 
          !errorMessage.includes('Failed to fetch') && 
          errorName !== 'AbortError') {
        console.error('Error fetching orders:', error);
        console.error('Error details:', errorMessage);
        if (errorStack) console.error('Error stack:', errorStack);
      }
      
      // Ne resetuj orders na prazan array ako je network error (zadrži stare)
      // setOrders([]); // Komentarisano - zadrži stare porudžbine
    } finally {
      // Orders loaded
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    
    // Optimizovan polling - 3 sekunde u produkciji, 2 sekunde u dev
    const pollInterval = process.env.NODE_ENV === 'production' ? 3000 : 2000;
    const interval = setInterval(fetchOrders, pollInterval);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'time' | 'date' | 'status' | 'priority' | 'destination'>) => {
    try {
      const waiterId = (user && (user.role === 'waiter-admin' || user.role === 'waiter')) ? user.id : null;
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, waiter_id: waiterId }),
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [user, fetchOrders]);

  const updateOrderStatus = useCallback(async (id: number, status: Order['status']) => {
    try {
      // Optimistički update - ažuriraj lokalno odmah
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === id ? { ...order, status } : order
        )
      );
      
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) {
        // Rollback ako ne uspe
        await fetchOrders();
        throw new Error('Failed to update order');
      }
      
      // Refresh orders za konzistentnost
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      // Rollback
      await fetchOrders();
      throw error;
    }
  }, [fetchOrders]);

  const confirmOrder = useCallback(async (id: number) => {
    try {
      const waiterId = (user && (user.role === 'waiter-admin' || user.role === 'waiter')) ? user.id : null;
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, waiter_id: waiterId }),
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to confirm order');
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      
      // Refresh orders
      await fetchOrders();
      
      return result;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }, [user, fetchOrders]);

  const deleteOrder = useCallback(async (id: number) => {
    try {
      // Optimistički delete
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      const response = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Rollback ako ne uspe
        await fetchOrders();
        throw new Error('Failed to delete order');
      }
      
      // Refresh orders za konzistentnost
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      // Rollback
      await fetchOrders();
      throw error;
    }
  }, [fetchOrders]);

  // Memoizuj context value da se ne kreira novi objekat na svakom renderu
  const contextValue = useMemo(() => ({
    orders,
    addOrder,
    updateOrderStatus,
    confirmOrder,
    deleteOrder,
    refreshOrders: fetchOrders
  }), [orders, addOrder, updateOrderStatus, confirmOrder, deleteOrder, fetchOrders]);

  return (
    <OrderContext.Provider value={contextValue}>
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
