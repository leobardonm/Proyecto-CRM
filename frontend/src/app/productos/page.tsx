'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';

interface Producto {
  ID: number; // Asegúrate de que coincida con el nombre devuelto por el backend
  Descripcion: string;
  Precio: number;
}

export default function ProductoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);

  const columns = [
    {
      header: 'Id',
      accessor: 'ID', // Coincidir con el backend
    },
    {
      header: 'Descripcion',
      accessor: 'Descripcion',
    },
    {
      header: 'Precio',
      accessor: 'Precio',
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5002/api/productos/productos') // Corrige la URL si es necesario
      .then(response => response.json())
      .then(data => {
        if (data.productos) {
          setProductos(data.productos);
        } else {
          console.error('La respuesta de la API no contiene productos:', data);
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
              Productos
            </h1>
          </div>
        </header>

        <main className="h-full pb-16 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => console.log('Agregar nuevo cliente')}
              >
                Agregar Producto
              </button>
            </div>

            <Table
              columns={columns}
              data={productos}
              title="Lista de Productos"
            />
          </div>
        </main>
      </div>
    </div>
  );
}