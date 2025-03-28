'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';

interface Producto {
  ID: number; // Asegúrate de que coincida con el nombre devuelto por el backend
  Descripcion: string;
  Precio: number;
}

interface ProductoFormData {
  Descripcion: string;
  Precio: string;
}

export default function ProductoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductoFormData>({
    Descripcion: '',
    Precio: '',
  });

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
      cell: (row: Producto) => `$${row.Precio.toLocaleString()}`      
    }
  ];

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/productos/productos');
      const data = await response.json();
      if (data.productos) {
        setProductos(data.productos);
      } else {
        console.error('La respuesta de la API no contiene productos:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          Precio: parseFloat(formData.Precio)
        }),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ Descripcion: '', Precio: '' });
        fetchProductos(); // Refresh the list
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
                onClick={() => setIsModalOpen(true)}
              >
                Agregar producto
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

      {/* Modal for adding new product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nuevo Producto</h2>
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
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.Descripcion}
                  onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.Precio}
                  onChange={(e) => setFormData({ ...formData, Precio: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0.00"
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
  );
}