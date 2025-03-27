'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';

interface Vendedor {
  Nombre: string;
  Email: string;
  Comision: number;
  Telefono: string;
}

export default function VendedorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]); // Cambiado el nombre de setVendedor a setVendedores

  const columns = [
    {
      header: 'Nombre',
      accessor: 'Nombre',
    },
    {
      header: 'Correo',
      accessor: 'Email', // Coincide con la API
    },
    {
      header: 'Comision',
      accessor: 'Comision',
    },
    {
      header: 'Teléfono',
      accessor: 'Telefono',
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5002/api/vendedores')
      .then(response => response.json())
      .then(data => {
        if (data.totalVendedores) { // Cambiado de vendedores a totalVendedores
          setVendedores(data.totalVendedores);
        } else {
          console.error('La respuesta de la API no contiene vendedores:', data);
        }
      })
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Vendedores
            </h1>
          </div>
        </header>

        <main className="h-full pb-16 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => console.log('Agregar nuevo vendedor')}
              >
                Agregar Vendedor
              </button>
            </div>

            <Table
              columns={columns}
              data={vendedores} // Cambiado de productos a vendedores
              title="Lista de Vendedores"
            />
          </div>
        </main>
      </div>
    </div>
  );
}