'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';

interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  vendedor: string;
}

interface ClienteFormData {
  nombre: string;
  correo: string;
  telefono: string;
  vendedor: string;
}

export default function ClientesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    vendedor: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ nombre: '', correo: '', telefono: '', vendedor: '' });
        // You might want to refresh the clients data here
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AdminProtected>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <AdminMode />
        <div className="flex-1">
          {/* ... existing header ... */}

          <main className="h-full pb-16 overflow-y-auto">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex justify-end mb-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => setIsModalOpen(true)}
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

        {/* Modal for adding new client */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agregar Nuevo Cliente</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vendedor
                  </label>
                  <input
                    type="text"
                    value={formData.vendedor}
                    onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminProtected>
  );
}