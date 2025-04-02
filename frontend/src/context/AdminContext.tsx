'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Cargar el estado de admin del localStorage solo en el cliente
    const saved = localStorage.getItem('isAdmin');
    if (saved === 'true') {
      setIsAdmin(true);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.ctrlKey && e.key === '1') {
        const newAdminState = !isAdmin;
        setIsAdmin(newAdminState);
        localStorage.setItem('isAdmin', newAdminState.toString());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  // Evitar el renderizado inicial hasta que el componente esté montado
  if (!isMounted) {
    return null;
  }

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
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