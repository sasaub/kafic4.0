'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MonthlyPayment {
  id: number;
  amount: number;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm
  note?: string;
}

export interface Table {
  id: number;
  number: string; // Može biti tekst (npr. "Sto 1", "VIP 1", "Terasa A")
  capacity: number;
  status: 'Slobodan' | 'Zauzet' | 'Rezervisan';
  qrCode: string;
  monthlyPayment?: boolean; // Označava da li sto plaća na mesečnom nivou
  monthlyPayments?: MonthlyPayment[]; // Istorija uplata za mesečni sto
}

interface TablesContextType {
  tables: Table[];
  addTable: (table: Omit<Table, 'id' | 'qrCode'>) => void;
  updateTableStatus: (id: number, status: Table['status']) => void;
  updateTableMonthlyPayment: (id: number, monthlyPayment: boolean) => void;
  addMonthlyPayment: (tableId: number, payment: Omit<MonthlyPayment, 'id'>) => void;
  deleteTable: (id: number) => void;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

const STORAGE_KEY = 'qr-restaurant-tables';

const initialTables: Table[] = [
  { id: 1, number: '1', capacity: 4, status: 'Slobodan', qrCode: 'QR-001' },
  { id: 2, number: '2', capacity: 2, status: 'Zauzet', qrCode: 'QR-002' },
  { id: 3, number: '3', capacity: 6, status: 'Slobodan', qrCode: 'QR-003' },
  { id: 4, number: '4', capacity: 4, status: 'Rezervisan', qrCode: 'QR-004' },
  { id: 5, number: '5', capacity: 2, status: 'Zauzet', qrCode: 'QR-005' },
  { id: 6, number: '6', capacity: 8, status: 'Slobodan', qrCode: 'QR-006' },
  { id: 7, number: '7', capacity: 4, status: 'Slobodan', qrCode: 'QR-007' },
  { id: 8, number: '8', capacity: 4, status: 'Zauzet', qrCode: 'QR-008' },
];

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj stolove iz localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedTables = JSON.parse(stored);
        // Migracija: konvertuj number u string ako je potrebno
        const migratedTables = parsedTables.map((table: any) => ({
          ...table,
          number: String(table.number) // Osiguraj da je number uvek string
        }));
        setTables(migratedTables);
      } catch (error) {
        console.error('Error loading tables:', error);
        setTables(initialTables);
      }
    } else {
      setTables(initialTables);
    }
    setIsLoaded(true);
  }, []);

  // Sačuvaj stolove u localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    }
  }, [tables, isLoaded]);

  // Slušaj promene iz drugih tab-ova
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newTables = JSON.parse(e.newValue);
          setTables(newTables);
        } catch (error) {
          console.error('Error syncing tables:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addTable = (tableData: Omit<Table, 'id' | 'qrCode'>) => {
    const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    // Generiši QR kod na osnovu broja stola (može biti tekst)
    const tableNumberStr = tableData.number.toString().replace(/\s+/g, '-');
    const qrCode = `QR-${tableNumberStr.padStart(3, '0')}`;
    const newTable: Table = {
      ...tableData,
      id: newId,
      qrCode,
      monthlyPayments: tableData.monthlyPayment ? [] : undefined
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTableStatus = (id: number, status: Table['status']) => {
    setTables(prev => prev.map(table => 
      table.id === id ? { ...table, status } : table
    ));
  };

  const updateTableMonthlyPayment = (id: number, monthlyPayment: boolean) => {
    setTables(prev => prev.map(table => 
      table.id === id ? { 
        ...table, 
        monthlyPayment,
        monthlyPayments: monthlyPayment && !table.monthlyPayments ? [] : table.monthlyPayments
      } : table
    ));
  };

  const addMonthlyPayment = (tableId: number, payment: Omit<MonthlyPayment, 'id'>) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const newPaymentId = table.monthlyPayments && table.monthlyPayments.length > 0
          ? Math.max(...table.monthlyPayments.map(p => p.id)) + 1
          : 1;
        const newPayment: MonthlyPayment = {
          ...payment,
          id: newPaymentId
        };
        return {
          ...table,
          monthlyPayments: [...(table.monthlyPayments || []), newPayment]
        };
      }
      return table;
    }));
  };

  const deleteTable = (id: number) => {
    setTables(prev => prev.filter(table => table.id !== id));
  };

  return (
    <TablesContext.Provider value={{ tables, addTable, updateTableStatus, updateTableMonthlyPayment, addMonthlyPayment, deleteTable }}>
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