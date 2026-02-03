'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'waiter' | 'waiter-admin' | 'kitchen';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'qr-restaurant-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          // Proveri da li user data ima sve potrebne polja
          if (userData && userData.id && userData.username && userData.role) {
            setUser(userData);
          } else {
            // Ako nema sve potrebne polja, obriši
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
    
    // Slušaj promene u localStorage (iz drugih tab-ova)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            if (userData && userData.id && userData.username && userData.role) {
              setUser(userData);
            }
          } catch (error) {
            console.error('Error parsing user from storage:', error);
          }
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('AuthContext: Login failed:', errorData);
        return false;
      }
      
      const userData = await response.json();
      
      // Proveri da li userData ima sve potrebne polja
      if (!userData || !userData.id || !userData.username || !userData.role) {
        console.error('AuthContext: Invalid user data received:', userData);
        return false;
      }
      
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('AuthContext: Error during login:', error);
      console.error('AuthContext: Error message:', errorMessage);
      if (errorStack) console.error('AuthContext: Error stack:', errorStack);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
