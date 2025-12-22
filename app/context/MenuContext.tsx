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

  // Učitaj meni sa API-ja
  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'same-origin', // Dodaj credentials za bolju kompatibilnost
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch menu:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      console.error('Error details:', error.message, error.stack);
      setMenuItems([]);
    }
  };

  // Učitaj kategorije sa API-ja
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch categories:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response type from server');
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.message, error.stack);
      setCategories([]);
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
