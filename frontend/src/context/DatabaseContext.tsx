'use client';

import React, { createContext, useContext, useState } from 'react';

interface Vendedor {
  Id: number;
  Nombre: string;
  Telefono: string;
  Email: string;
  IdEmpresa: number;
  EmpresaNombre: string;
}

interface Cliente {
  Id: number;
  Nombre: string;
  Direccion: string;
  Telefono: string;
  Email: string;
}

interface Negociacion {
  IDNegociacion: number;
  ClienteNombre: string;
  VendedorNombre: string;
  EstadoDescripcion: string;
  Monto: number;
}

interface Producto {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Precio: number;
}

interface Empresa {
  IDEmpresa: number;
  Nombre: string;
}

interface DatabaseContextType {
  // Count functions
  getClientCount: () => Promise<number>;
  getNegotiationCount: () => Promise<number>;
  getVendorCount: () => Promise<number>;
  getProductCount: () => Promise<number>;
  getCompanyCount: () => Promise<number>;
  
  // Data functions
  getVendors: () => Promise<Vendedor[]>;
  getClients: () => Promise<Cliente[]>;
  getNegotiations: () => Promise<Negociacion[]>;
  getProducts: () => Promise<Producto[]>;
  getCompanies: () => Promise<Empresa[]>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  // Count functions
  const getClientCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching client count:', error);
      return 0;
    }
  };

  const getNegotiationCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/negociaciones`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching negotiation count:', error);
      return 0;
    }
  };

  const getVendorCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendedores`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching vendor count:', error);
      return 0;
    }
  };

  const getProductCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching product count:', error);
      return 0;
    }
  };

  const getCompanyCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/empresas`);
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Error fetching company count:', error);
      return 0;
    }
  };

  // Data functions
  const getVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendedores`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  };

  const getClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  };

  const getNegotiations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/negociaciones`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching negotiations:', error);
      return [];
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const getCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/empresas`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        getClientCount,
        getNegotiationCount,
        getVendorCount,
        getProductCount,
        getCompanyCount,
        getVendors,
        getClients,
        getNegotiations,
        getProducts,
        getCompanies,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}