'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';

interface Producto {
  IDProducto: number;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

interface ProductoFormData {
  Descripcion: string;
  Precio: string;
  Stock: string;
}

export default function ProductoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductoFormData>({
    Descripcion: '',
    Precio: '',
    Stock: '',
  });

  const columns = [
    {
      header: 'Descripción',
      accessor: 'Descripcion',
      key: 'descripcion'
    },
    {
      header: 'Precio',
      accessor: 'Precio',
      key: 'precio',
      cell: (row: Producto) => `$${row.Precio.toLocaleString()}`
    },
    {
      header: 'Stock',
      accessor: 'Stock',
      key: 'stock'
    },
    {
      header: 'Acciones',
      accessor: 'IDProducto',
      key: 'acciones',
      cell: (row: Producto) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.IDProducto)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    }
  ];

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al cargar los productos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validación de datos
      if (!formData.Descripcion.trim()) {
        throw new Error('La descripción es requerida');
      }
      if (!formData.Precio || isNaN(parseFloat(formData.Precio)) || parseFloat(formData.Precio) <= 0) {
        throw new Error('El precio debe ser un número mayor a 0');
      }
      if (!formData.Stock || isNaN(parseInt(formData.Stock)) || parseInt(formData.Stock) < 0) {
        throw new Error('El stock debe ser un número mayor o igual a 0');
      }

      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/productos/${selectedProducto?.IDProducto}`
        : `${process.env.NEXT_PUBLIC_API_URL}/productos`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          Precio: parseFloat(formData.Precio),
          Stock: parseInt(formData.Stock)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedProducto(null);
      setFormData({ Descripcion: '', Precio: '', Stock: '' });
      await fetchProductos();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setFormData({
      Descripcion: producto.Descripcion,
      Precio: producto.Precio.toString(),
      Stock: producto.Stock.toString()
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProductos();
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el producto. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedProducto(null);
    setFormData({ Descripcion: '', Precio: '', Stock: '' });
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
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Productos
              </h1>
            </div>
          </header>

          <main className="flex-1 pb-16">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end mb-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Agregar producto'}
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  data={productos}
                  className="w-full"
                />
              )}
            </div>
          </main>
        </div>

        {/* Modal for adding/editing product */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleModalClose();
              }
            }}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={formData.Precio}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setFormData({ ...formData, Precio: value });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="0.00"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.Stock}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*$/.test(value)) {
                        setFormData({ ...formData, Stock: value });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
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