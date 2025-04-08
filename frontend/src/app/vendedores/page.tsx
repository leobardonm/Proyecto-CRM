'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';
import { validateEmail } from '@/utils/validation';

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
  Telefono: string;
  EmpresaNombre: string;
  IdEmpresa: number;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [formData, setFormData] = useState<VendedorFormData>({
    Nombre: '',
    Email: '',
    Telefono: '',
    IdEmpresa: 1
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  const columns = [
    {
      header: 'Nombre',
      accessor: 'Nombre',
      key: 'nombre'
    },
    {
      header: 'Email',
      accessor: 'Email',
      key: 'email'
    },
    {
      header: 'Teléfono',
      accessor: 'Telefono',
      key: 'telefono'
    },
    {
      header: 'Empresa',
      accessor: 'EmpresaNombre',
      key: 'empresa'
    },
    {
      header: 'Acciones',
      accessor: 'Id',
      key: 'acciones',
      cell: (row: Vendedor) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEditVendedor(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteVendedor(row.Id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Eliminar
          </button>
        </div>
      ),
    }
  ];

  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedores`);
      if (response.ok) {
        const data = await response.json();
        setVendedores(data);
      }
    } catch (error) {
      console.error('Error fetching vendedores:', error);
    }
  };

  const handleCreateVendedor = () => {
    setIsEditMode(false);
    setSelectedVendedor(null);
    setFormData({
      Nombre: '',
      Email: '',
      Telefono: '',
      IdEmpresa: 1
    });
    setIsModalOpen(true);
  };

  const handleEditVendedor = (vendedor: Vendedor) => {
    setIsEditMode(true);
    setSelectedVendedor(vendedor);
    setFormData({
      Nombre: vendedor.Nombre,
      Email: vendedor.Email,
      Telefono: vendedor.Telefono,
      IdEmpresa: 1
    });
    setIsModalOpen(true);
  };

  const handleDeleteVendedor = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vendedor?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedores/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchVendedores();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error al eliminar el vendedor');
        }
      } catch (error) {
        console.error('Error deleting vendedor:', error);
        alert('Error al eliminar el vendedor');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailValidationError = validateEmail(formData.Email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    setEmailError(null);

    try {
      const url = isEditMode && selectedVendedor
        ? `${process.env.NEXT_PUBLIC_API_URL}/vendedores/${selectedVendedor.Id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/vendedores`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          Nombre: '',
          Email: '',
          Telefono: '',
          IdEmpresa: 1
        });
        fetchVendedores();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al guardar el vendedor');
      }
    } catch (error) {
      console.error('Error saving vendedor:', error);
      alert('Error al guardar el vendedor');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData({ ...formData, Email: newEmail });
    setEmailError(validateEmail(newEmail));
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
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Vendedores
                </h1>
              </div>
            </div>
          </header>

          <main className="h-full pb-16 overflow-y-auto">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Agregar vendedor
                </button>
              </div>
              <Table
                columns={columns}
                data={vendedores}
                className="w-full"
              />
            </div>
          </main>
        </div>
      </div>

      {/* Modal para crear/editar vendedor */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h2>
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={handleEmailChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
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
                  {isEditMode ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminProtected>
  );
}