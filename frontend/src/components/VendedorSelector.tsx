'use client';

import { useAdmin } from '@/context/AdminContext';
import { useDatabase } from '@/context/DatabaseContext';
import { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
  Telefono: string;
  EmpresaNombre: string;
}

export default function VendedorSelector() {
  const { isAdmin, currentUser, setCurrentUser } = useAdmin();
  const { getVendors } = useDatabase();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchVendedores = async () => {
      if (!isAdmin) {
        const data = await getVendors();
        setVendedores(data);
      }
    };
    fetchVendedores();
  }, [isAdmin, getVendors]);

  if (isAdmin || vendedores.length === 0) {
    return null;
  }

  const currentVendedor = vendedores.find(v => v.Id === currentUser);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
      >
        <FiUser className="w-4 h-4" />
        <span>Vendedor actual: {currentVendedor?.Nombre || 'Cargando...'}</span>
        <span className="text-xs text-gray-400">
          (Ctrl+Alt+0 / ⌘+Alt+0 para cambiar)
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
          <div className="py-1">
            {vendedores.map((vendedor) => (
              <button
                key={vendedor.Id}
                onClick={() => {
                  setCurrentUser(vendedor.Id);
                  localStorage.setItem('currentUser', vendedor.Id.toString());
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 text-sm text-left ${
                  currentUser === vendedor.Id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {vendedor.Nombre} - {vendedor.EmpresaNombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 