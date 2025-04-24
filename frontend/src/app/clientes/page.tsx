'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/Table';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';
import { validateEmail, validatePhone } from '@/utils/validation';

interface Cliente {
  Id: number;
  Nombre: string;
  Direccion: string;
  Telefono: string;
  Email: string;
}

interface ClienteFormData {
  Nombre: string;
  Direccion: string;
  Telefono: string;
  Email: string;
}

export default function ClientesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>({
    Nombre: '',
    Direccion: '',
    Telefono: '',
    Email: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const columns = [
    {
      header: 'Nombre',
      accessor: 'Nombre',
      key: 'nombre'
    },
    {
      header: 'Dirección',
      accessor: 'Direccion',
      key: 'direccion'
    },
    {
      header: 'Teléfono',
      accessor: 'Telefono',
      key: 'telefono'
    },
    {
      header: 'Email',
      accessor: 'Email',
      key: 'email'
    },
    {
      header: 'Acciones',
      accessor: 'Id',
      key: 'acciones',
      cell: (row: Cliente) => (
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
            onClick={() => handleDelete(row.Id)}
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
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        console.error('Error al obtener clientes:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
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

    // Validate phone
    const phoneValidationError = validatePhone(formData.Telefono);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }
    setPhoneError(null);

    try {
      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/clientes/${selectedCliente?.Id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/clientes`;
      
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
        setIsEditMode(false);
        setSelectedCliente(null);
        setFormData({ Nombre: '', Direccion: '', Telefono: '', Email: '' });
        fetchClientes();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      Nombre: cliente.Nombre,
      Direccion: cliente.Direccion,
      Telefono: cliente.Telefono,
      Email: cliente.Email
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          fetchClientes();
          alert(data.message);
        } else {
          alert(data.message || 'Error al eliminar el cliente');
          console.error('Error al eliminar cliente:', data);
        }
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente. Por favor, intente nuevamente.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCliente(null);
    setFormData({ Nombre: '', Direccion: '', Telefono: '', Email: '' });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData({ ...formData, Email: newEmail });
    setEmailError(validateEmail(newEmail));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setFormData({ ...formData, Telefono: newPhone });
    setPhoneError(validatePhone(newPhone));
  };

  return (
    <AdminProtected>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <AdminMode />
        <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Clientes
              </h1>
            </div>
          </header>

          <main className="flex-1 pb-16">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">

                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => setIsModalOpen(true)}
                >
                  Agregar cliente
                </button>
              </div>
              <Table
                columns={columns}
                data={clientes}
                className="w-full"
              />
            </div>
          </main>
        </div>

        {/* Modal for adding/editing client */}
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
                  {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button
                  onClick={handleModalClose}
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
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.Direccion}
                    onChange={(e) => setFormData({ ...formData, Direccion: e.target.value })}
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
                    onChange={handlePhoneChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      phoneError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                  )}
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
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {isEditMode ? 'Actualizar' : 'Guardar'}
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