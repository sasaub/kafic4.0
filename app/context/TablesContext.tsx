'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MonthlyPayment {
  id: number;
  amount: number;
  date: string;
  time: string;
  note?: string;
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: 'Slobodan' | 'Zauzet' | 'Rezervisan';
  qrCode: string;
  monthlyPayment?: boolean;
  monthlyPayments?: MonthlyPayment[];
}

interface TablesContextType {
  tables: Table[];
  addTable: (table: Omit<Table, 'id' | 'qrCode'>) => Promise<void>;
  updateTableStatus: (id: number, status: Table['status']) => Promise<void>;
  updateTableMonthlyPayment: (id: number, monthlyPayment: boolean) => Promise<void>;
  addMonthlyPayment: (tableId: number, payment: Omit<MonthlyPayment, 'id'>) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  refreshTables: () => Promise<void>;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj stolove sa API-ja
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch tables:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      
      // Mapiraj podatke iz baze na Table format
      const mappedTables = data.map((table: any) => ({
        id: table.id,
        number: String(table.number),
        capacity: table.capacity,
        status: table.status,
        qrCode: table.qr_code,
        monthlyPayment: table.monthlyPayment || table.monthly_payment === 1,
        monthlyPayments: table.monthlyPayments || [],
      }));
      
      setTables(mappedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchTables();
    
    // Poll za promene svakih 5 sekundi (stolovi se retko menjaju)
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, []);

  const addTable = async (tableData: Omit<Table, 'id' | 'qrCode'>) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData),
      });
      
      if (!response.ok) throw new Error('Failed to create table');
      await fetchTables();
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  };

  const updateTableStatus = async (id: number, status: Table['status']) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) throw new Error('Failed to update table');
      await fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  };

  const updateTableMonthlyPayment = async (id: number, monthlyPayment: boolean) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, monthlyPayment }),
      });
      
      if (!response.ok) throw new Error('Failed to update table');
      await fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  };

  const addMonthlyPayment = async (tableId: number, payment: Omit<MonthlyPayment, 'id'>) => {
    try {
      const response = await fetch('/api/tables/monthly-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, ...payment }),
      });
      
      if (!response.ok) throw new Error('Failed to add monthly payment');
      await fetchTables();
    } catch (error) {
      console.error('Error adding monthly payment:', error);
      throw error;
    }
  };

  const deleteTable = async (id: number) => {
    try {
      const response = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete table');
      await fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  return (
    <TablesContext.Provider value={{ 
      tables, 
      addTable, 
      updateTableStatus, 
      updateTableMonthlyPayment, 
      addMonthlyPayment, 
      deleteTable,
      refreshTables: fetchTables,
    }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TablesContext);
  if (context === undefined) {
    throw new Error('useTables must be used within a TablesProvider');
  }
  return context;
}
