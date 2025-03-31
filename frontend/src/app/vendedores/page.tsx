'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
  Telefono: string;
  IdEmpresa: number;
  EmpresaNombre?: string;
}

interface VendedorFormData {
  Nombre: string;
  Email: string;
  Telefono: string;
  IdEmpresa: number;
}

export default function VendedoresPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [empresas, setEmpresas] = useState<{ IDEmpresa: number; Nombre: string; }[]>([]);
  const [formData, setFormData] = useState<VendedorFormData>({
    Nombre: '',
    Email: '',
    Telefono: '',
    IdEmpresa: 0,
  });

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'Nombre',
    },
    {
      header: 'Correo',
      accessor: 'Email',
    },
    {
      header: 'Teléfono',
      accessor: 'Telefono',
    },
    {
      header: 'Empresa',
      accessor: 'EmpresaNombre',
    },
  ];

  // Función para obtener los vendedores
  const fetchVendedores = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/vendedores');
      if (response.ok) {
        const data = await response.json();
        setVendedores(data); // La API ya devuelve el array directamente
      }
    } catch (error) {
      console.error('Error fetching vendedores:', error);
    }
  };

  // Función para obtener las empresas
  const fetchEmpresas = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Error fetching empresas:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchVendedores();
    fetchEmpresas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/vendedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ Nombre: '', Email: '', Telefono: '', IdEmpresa: 0 });
        fetchVendedores(); // Recargar la lista de vendedores
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
                  onClick={() => setIsModalOpen(true)}
                >
                  Agregar vendedor
                </button>
              </div>

              <Table
                columns={columns}
                data={vendedores}
                title="Lista de Vendedores"
              />
            </div>
          </main>
        </div>

        {/* Modal for adding new vendedor */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nuevo Vendedor</h2>
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
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
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
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
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
                    value={formData.Telefono}
                    onChange={(e) => setFormData({ ...formData, Telefono: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Empresa
                  </label>
                  <select
                    value={formData.IdEmpresa}
                    onChange={(e) => setFormData({ ...formData, IdEmpresa: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Seleccione una empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.IDEmpresa} value={empresa.IDEmpresa}>
                        {empresa.Nombre}
                      </option>
                    ))}
                  </select>
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