'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';

interface Producto {
  id: string;
  descripcion: string;
  precio: string;
}

export default function ProductoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Id',
      accessor: 'id',
    },
    {
      header: 'Descripcion',
      accessor: 'descripcion',
    },
    {
      header: 'Precio',
      accessor: 'precio',
    }
  ];

  // Datos de ejemplo - En un caso real, estos vendrían de una API
  const ProductoData: Producto[] = [
    {
      id: '1',
      descripcion: 'Producto 1',
      precio: '100',
    },
    {
      id: '2',
      descripcion: 'Producto 2',
      precio: '200',
    },
    {
      id: '3',
      descripcion: 'Producto 3',
      precio: '300',
    },
    // Agrega más datos según necesites
  ];

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
              Productos
            </h1>
          </div>
        </header>

        <main className="h-full pb-16 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => {
                  // Aquí irá la lógica para agregar nuevo producto
                  console.log('Agregar nuevo cliente');
                }}
              >
                Agregar Producto
              </button>
            </div>

            <Table
              columns={columns}
              data={ProductoData}
              title="Lista de Productos"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
