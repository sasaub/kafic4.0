'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MenuItem {
  id: number;
  name: string;
  name_en?: string | null;
  description: string;
  description_en?: string | null;
  price: number;
  category: string;
  category_en?: string | null;
}

export interface Category {
  id: number;
  name: string;
  name_en?: string | null;
  type: 'Hrana' | 'Piće';
}

interface MenuContextType {
  menuItems: MenuItem[];
  categories: Category[];
  isLoaded: boolean;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: number, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  refreshMenu: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Učitaj meni sa API-ja sa retry logikom
  const fetchMenu = async (retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 sekunda
    
    try {
      // Kreiraj timeout signal (fallback za starije browsere)
      let abortController: AbortController | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      
      if (typeof AbortController !== 'undefined') {
        abortController = new AbortController();
        timeoutId = setTimeout(() => {
          abortController?.abort();
        }, 10000); // 10 sekundi timeout
      }
      
      const response = await fetch('/api/menu', {
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
        console.error('Failed to fetch menu:', response.status, response.statusText, errorText);
        
        // Retry za 5xx greške
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return fetchMenu(retryCount + 1);
        }
        
        throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
      setError(null); // Očisti grešku ako je uspešno
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : '';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Ako je network error, abort ili timeout i ima retry-jeva, probaj ponovo
      const isNetworkError = errorMessage.includes('fetch') || 
                            errorMessage.includes('network') || 
                            errorMessage.includes('Failed to fetch') ||
                            errorName === 'AbortError' ||
                            errorMessage.includes('timeout');
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchMenu(retryCount + 1);
      }
      
      // Ne loguj timeout greške kao error (normalno za mobile)
      if (!errorMessage.includes('timeout') && errorName !== 'AbortError') {
        console.error('Error fetching menu:', error);
        console.error('Error details:', errorMessage);
        if (errorStack) console.error('Error stack:', errorStack);
        // Postavi error samo ako nije network error (možda je server greška)
        if (!isNetworkError) {
          setError('Greška pri učitavanju menija. Pokušajte ponovo.');
        }
      }
      
      // Ne resetuj meni na prazan array ako je network error (zadrži stare podatke)
      // setMenuItems([]); // Komentarisano
    }
  };

  // Učitaj kategorije sa API-ja sa retry logikom
  const fetchCategories = async (retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    try {
      // Kreiraj timeout signal (fallback za starije browsere)
      let abortController: AbortController | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      
      if (typeof AbortController !== 'undefined') {
        abortController = new AbortController();
        timeoutId = setTimeout(() => {
          abortController?.abort();
        }, 10000); // 10 sekundi timeout
      }
      
      const response = await fetch('/api/categories', {
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
        console.error('Failed to fetch categories:', response.status, response.statusText, errorText);
        
        // Retry za 5xx greške
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return fetchCategories(retryCount + 1);
        }
        
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data.map((cat: { id: number; name: string; name_en?: string | null; type: string }) => ({
        id: cat.id,
        name: cat.name,
        name_en: cat.name_en || null,
        type: cat.type,
      })) : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : '';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Retry za network greške, abort ili timeout
      const isNetworkError = errorMessage.includes('fetch') || 
                            errorMessage.includes('network') || 
                            errorMessage.includes('Failed to fetch') ||
                            errorName === 'AbortError' ||
                            errorMessage.includes('timeout');
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchCategories(retryCount + 1);
      }
      
      // Ne loguj timeout greške kao error
      if (!errorMessage.includes('timeout') && errorName !== 'AbortError') {
        console.error('Error fetching categories:', error);
        console.error('Error details:', errorMessage);
        if (errorStack) console.error('Error stack:', errorStack);
      }
      
      // Ne resetuj kategorije na prazan array ako je network error
      // setCategories([]); // Komentarisano
    }
  };

  useEffect(() => {
    // Učitaj podatke samo ako već nisu učitani
    if (!isLoaded) {
      const loadData = async () => {
        await Promise.all([fetchMenu(), fetchCategories()]);
        setIsLoaded(true);
      };
      loadData();
    }
  }, [isLoaded]);

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) throw new Error('Failed to create menu item');
      await fetchMenu();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id: number, updates: Partial<MenuItem>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) throw new Error('Failed to update menu item');
      await fetchMenu();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: number) => {
    try {
      const response = await fetch(`/api/menu?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete menu item');
      await fetchMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) throw new Error('Failed to create category');
      await fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete category');
      await Promise.all([fetchCategories(), fetchMenu()]);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      categories,
      isLoaded,
      error,
      addMenuItem, 
      updateMenuItem, 
      deleteMenuItem,
      addCategory,
      deleteCategory,
      refreshMenu: fetchMenu,
      refreshCategories: fetchCategories,
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
