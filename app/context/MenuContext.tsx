'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'Hrana' | 'Piće';
}

interface MenuContextType {
  menuItems: MenuItem[];
  categories: Category[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: number, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: number) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const STORAGE_KEY_MENU = 'qr-restaurant-menu';
const STORAGE_KEY_CATEGORIES = 'qr-restaurant-categories';

const initialCategories: Category[] = [
  { id: 1, name: 'Glavna jela', type: 'Hrana' },
  { id: 2, name: 'Salate', type: 'Hrana' },
  { id: 3, name: 'Deserti', type: 'Hrana' },
  { id: 4, name: 'Sokovi', type: 'Piće' },
  { id: 5, name: 'Kafe', type: 'Piće' },
  { id: 6, name: 'Alkohol', type: 'Piće' },
];

const initialMenu: MenuItem[] = [
  { id: 1, name: 'Ćevapi', description: '10 komada sa lukom i lepinjom', price: 850, category: 'Glavna jela' },
  { id: 2, name: 'Pljeskavica', description: 'Velika sa kajmakom', price: 750, category: 'Glavna jela' },
  { id: 3, name: 'Grčka salata', description: 'Svježe povrće sa feta sirom', price: 450, category: 'Salate' },
  { id: 4, name: 'Sopska salata', description: 'Paradajz, krastavac, paprika', price: 400, category: 'Salate' },
  { id: 5, name: 'Coca Cola', description: '0.33l', price: 200, category: 'Sokovi' },
  { id: 6, name: 'Voda', description: '0.5l', price: 150, category: 'Sokovi' },
  { id: 7, name: 'Espresso', description: 'Jaka kafa', price: 180, category: 'Kafe' },
];

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj meni i kategorije iz localStorage
  useEffect(() => {
    const storedMenu = localStorage.getItem(STORAGE_KEY_MENU);
    const storedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (storedMenu) {
      try {
        setMenuItems(JSON.parse(storedMenu));
      } catch (error) {
        console.error('Error loading menu:', error);
        setMenuItems(initialMenu);
      }
    } else {
      setMenuItems(initialMenu);
    }

    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(initialCategories);
      }
    } else {
      setCategories(initialCategories);
    }
    
    setIsLoaded(true);
  }, []);

  // Sačuvaj meni u localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menuItems));
    }
  }, [menuItems, isLoaded]);

  // Sačuvaj kategorije u localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  // Slušaj promene iz drugih tab-ova
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_MENU && e.newValue) {
        try {
          const newMenu = JSON.parse(e.newValue);
          setMenuItems(newMenu);
        } catch (error) {
          console.error('Error syncing menu:', error);
        }
      }
      if (e.key === STORAGE_KEY_CATEGORIES && e.newValue) {
        try {
          const newCategories = JSON.parse(e.newValue);
          setCategories(newCategories);
        } catch (error) {
          console.error('Error syncing categories:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
    const newItem: MenuItem = { ...item, id: newId };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: number, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCategory: Category = { ...category, id: newId };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: number) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (categoryToDelete) {
      // Prvo obriši sva jela u toj kategoriji
      setMenuItems(prev => prev.filter(item => item.category !== categoryToDelete.name));
      // Zatim obriši kategoriju
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      categories,
      addMenuItem, 
      updateMenuItem, 
      deleteMenuItem,
      addCategory,
      deleteCategory
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