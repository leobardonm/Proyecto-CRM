'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';

interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  vendedor: string;
}

export default function ClientesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
    },
    {
      header: 'Correo',
      accessor: 'correo',
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
    },
    {
      header: 'Vendedor',
      accessor: 'vendedor',
      // Ejemplo de celda personalizada
      cell: (row: Cliente) => (
        <span className="text-blue-600 dark:text-blue-400">
          {row.vendedor}
        </span>
      ),
    },
  ];

  // Datos de ejemplo - En un caso real, estos vendrían de una API
  const clientesData: Cliente[] = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      correo: 'juan@ejemplo.com',
      telefono: '123-456-7890',
      vendedor: 'Ana García',
    },
    {
      id: '2',
      nombre: 'María López',
      correo: 'maria@ejemplo.com',
      telefono: '098-765-4321',
      vendedor: 'Carlos Ruiz',
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
              Clientes
            </h1>
          </div>
        </header>

        <main className="h-full pb-16 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => {
                  // Aquí irá la lógica para agregar nuevo cliente
                  console.log('Agregar nuevo cliente');
                }}
              >
                Agregar Cliente
              </button>
            </div>

            <Table
              columns={columns}
              data={clientesData}
              title="Lista de Clientes"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
