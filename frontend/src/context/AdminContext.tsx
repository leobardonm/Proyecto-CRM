'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  currentUser: number;
  setCurrentUser: (value: number) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load admin state from localStorage
    const saved = localStorage.getItem('isAdmin');
    if (saved === 'true') {
      setIsAdmin(true);
    }
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(parseInt(savedUser));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.ctrlKey) {
        if (e.key === '1') {
          // Admin mode toggle
          const newAdminState = !isAdmin;
          setIsAdmin(newAdminState);
          localStorage.setItem('isAdmin', newAdminState.toString());
        } else if (e.key === '0' && !isAdmin) {
          // Cycle through vendedores (1 to 5)
          const newUser = currentUser >= 5 ? 1 : currentUser + 1;
          setCurrentUser(newUser);
          localStorage.setItem('currentUser', newUser.toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, currentUser]);

  if (!isMounted) {
    return null;
  }

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, currentUser, setCurrentUser }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}