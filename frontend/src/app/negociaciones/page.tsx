'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NegociacionCard from '@/components/NegociacionCard';
import AdminMode from '@/components/AdminMode';
import { useAdmin } from '@/context/AdminContext';
import Notification from '@/components/Notification';

interface Cliente {
  Id: number;
  Nombre: string;
  Email: string;
}

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
}

interface Producto {
  IDProducto: number;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

interface ProductoNegociacion {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

interface Negociacion {
  IDNegociacion: number;
  ClienteNombre: string;
  VendedorNombre: string;
  Productos: ProductoNegociacion[];
  Total: number;
  Comision: number;
  Estado: number;
  FechaInicio: string;
  FechaFin: string;
  EstadoDescripcion: string;
  Monto: number;
  IdVendedor: number;
  IdCliente: number;
  uniqueId?: string;
}

interface NegociacionData {
  IDNegociacion: number;
  ClienteNombre: string;
  VendedorNombre: string;
  Productos: ProductoData[];
  Total: number;
  Comision: number;
  Estado: number;
  FechaInicio: string;
  FechaFin: string;
  EstadoDescripcion: string;
  IdVendedor: number;
  IdCliente: number;
}

interface ProductoData {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

interface EstadosNegociacion {
  'en-proceso': Negociacion[];
  'terminada': Negociacion[];
  'cancelada': Negociacion[];
}

interface DraggableProvided {
  draggableProps: any;
  dragHandleProps: any;
  innerRef: (element: HTMLElement | null) => void;
}

interface FormNegociacionData {
  cliente: string;
  vendedor: string;
  productos: ProductoNegociacion[];
  total: number;
  comision: number;
}

interface FormProductoNegociacion {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

export default function NegociacionesPage() {
  const { isAdmin, currentUser } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalComision, setTotalComision] = useState(0);
  const [totalNegocios, setTotalNegocios] = useState(0);
  const [tasaExito, setTasaExito] = useState(0);
  const [negociaciones, setNegociaciones] = useState<EstadosNegociacion>({
    'en-proceso': [],
    'terminada': [],
    'cancelada': []
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [selectedVendedor, setSelectedVendedor] = useState<string>('');
  const [selectedProductos, setSelectedProductos] = useState<ProductoNegociacion[]>([]);
  const [vendedorFilter, setVendedorFilter] = useState<number | null>(null);
  const [currentVendedorName, setCurrentVendedorName] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    show: false
  });

  // Add isDragging state to prevent multiple drag operations
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Get vendedor ID from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const vendedorId = params.get('vendedor');
    if (vendedorId && !isNaN(Number(vendedorId))) {
      setVendedorFilter(Number(vendedorId));
    }
  }, []);

  // Add effect to update vendor name when filter changes
  useEffect(() => {
    if (vendedorFilter) {
      const vendedor = vendedores.find(v => v.Id === vendedorFilter);
      if (vendedor) {
        setCurrentVendedorName(vendedor.Nombre);
      }
    } else {
      setCurrentVendedorName('');
    }
  }, [vendedorFilter, vendedores]);

  const handleVendedorFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const newVendedorId = value === 'all' ? null : Number(value);
    setVendedorFilter(newVendedorId);
    
    // Update URL without reloading the page
    const url = new URL(window.location.href);
    if (newVendedorId) {
      url.searchParams.set('vendedor', newVendedorId.toString());
    } else {
      url.searchParams.delete('vendedor');
    }
    window.history.pushState({}, '', url.toString());
  };

  const fetchAllData = useCallback(async () => {
    try {
      const fetchWithErrorHandling = async (endpoint: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Error fetching ${endpoint}`);
        }
        return response.json();
      };

      let [negociacionesData, clientesData, vendedoresData, productosData] = await Promise.all([
        fetchWithErrorHandling('/negociaciones'),
        fetchWithErrorHandling('/clientes'),
        fetchWithErrorHandling('/vendedores'),
        fetchWithErrorHandling('/productos')
      ]);

      // Ensure we have arrays even if empty
      negociacionesData = Array.isArray(negociacionesData) ? negociacionesData : [];
      clientesData = Array.isArray(clientesData) ? clientesData : [];
      vendedoresData = Array.isArray(vendedoresData) ? vendedoresData : [];
      productosData = Array.isArray(productosData) ? productosData : [];

      // Filter negotiations based on vendedor filter or current user
      let relevantNegociaciones = negociacionesData;
      if (vendedorFilter && isAdmin) {
        // If admin is viewing a specific vendedor's negotiations
        relevantNegociaciones = negociacionesData.filter((n: any) => n.IdVendedor === vendedorFilter);
      } else if (!isAdmin && currentUser) {
        // If vendedor is viewing their own negotiations
        relevantNegociaciones = negociacionesData.filter((n: any) => n.IdVendedor === currentUser);
      }

      // Transform and set negociaciones data
      const transformedNegociaciones: Negociacion[] = relevantNegociaciones.map((n: NegociacionData) => ({
        IDNegociacion: n.IDNegociacion || 0,
        ClienteNombre: n.ClienteNombre || '',
        VendedorNombre: n.VendedorNombre || '',
        Productos: Array.isArray(n.Productos) ? n.Productos.map((p: ProductoData) => ({
          IDProducto: p.IDProducto || 0,
          Cantidad: p.Cantidad || 0,
          PrecioUnitario: p.PrecioUnitario || 0,
          Subtotal: p.Subtotal || 0,
          Descripcion: p.Descripcion || ''
        })) : [],
        Total: n.Total || 0,
        Comision: n.Comision || 0,
        Estado: n.Estado || 0,
        FechaInicio: n.FechaInicio || '',
        FechaFin: n.FechaFin || '',
        EstadoDescripcion: n.EstadoDescripcion || '',
        Monto: n.Total || 0,
        IdVendedor: n.IdVendedor || 0,
        IdCliente: n.IdCliente || 0
      }));

      const organizadas: EstadosNegociacion = {
        'en-proceso': transformedNegociaciones.filter(n => n.Estado === 2),
        'cancelada': transformedNegociaciones.filter(n => n.Estado === 1),
        'terminada': transformedNegociaciones.filter(n => n.Estado === 3)
      };

      setNegociaciones(organizadas);
      
      // Filter clients based on vendedor's negotiations if not admin
      if (!isAdmin && currentUser) {
        const vendedorClients = new Set(relevantNegociaciones.map((n: any) => n.IdCliente));
        const filteredClients = clientesData.filter((c: any) => vendedorClients.has(c.Id));
        setClientes(filteredClients);
      } else {
        setClientes(clientesData);
      }
      
      setVendedores(vendedoresData);
      setProductos(productosData);
      
      // Update stats with null checks
      const uniqueClients = !isAdmin && currentUser
        ? new Set(relevantNegociaciones.map((n: any) => n.IdCliente))
        : new Set(clientesData.map((c: any) => c.Id));
      
      setTotalClientes(uniqueClients.size);
      setTotalNegocios(transformedNegociaciones.length);
      const terminadas = transformedNegociaciones.filter(n => n.Estado === 3);
      setTotalComision(terminadas.reduce((sum, n) => sum + (n.Comision || 0), 0));
      setTasaExito(transformedNegociaciones.length > 0 ? (terminadas.length / transformedNegociaciones.length) * 100 : 0);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default empty states on error
      setNegociaciones({
        'en-proceso': [],
        'terminada': [],
        'cancelada': []
      });
      setClientes([]);
      setVendedores([]);
      setProductos([]);
      setTotalClientes(0);
      setTotalNegocios(0);
      setTotalComision(0);
      setTasaExito(0);
    }
  }, [isAdmin, currentUser, vendedorFilter]);

  useEffect(() => {
    setIsMounted(true);
    fetchAllData();
  }, [fetchAllData]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: { source: { droppableId: string; index: number }; destination: { droppableId: string; index: number } | null }) => {
    setIsDragging(false);
    const { source, destination } = result;

    // If there's no destination or it's the same position, do nothing
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    try {
      // Create a deep copy of the current state
      const newNegociaciones = {
        'en-proceso': [...negociaciones['en-proceso']],
        'terminada': [...negociaciones['terminada']],
        'cancelada': [...negociaciones['cancelada']]
      };

      // Get the source and destination lists
      const sourceList = newNegociaciones[source.droppableId as keyof EstadosNegociacion];
      const destList = newNegociaciones[destination.droppableId as keyof EstadosNegociacion];

      // Validate indices
      if (!sourceList || !destList || source.index >= sourceList.length) {
        console.error('Invalid source or destination');
        return;
      }

      // Get the item being moved
      const [movedItem] = sourceList.splice(source.index, 1);
      if (!movedItem) {
        console.error('Item not found');
        return;
      }

      // Check permissions
      if (!isAdmin && movedItem.IdVendedor !== currentUser) {
        console.log('User not authorized to move this card');
        return;
      }

      // Add uniqueId if moving to different column
      if (source.droppableId !== destination.droppableId) {
        movedItem.uniqueId = `${movedItem.IDNegociacion}_${Date.now()}`;
      }

      // Insert the item in the destination
      destList.splice(destination.index, 0, movedItem);

      // Update the state
      setNegociaciones(newNegociaciones);

      // Determine new status
      const newEstado = destination.droppableId === 'en-proceso' ? 2 :
                       destination.droppableId === 'cancelada' ? 1 : 3;

      // Update stats
      const allNegociaciones = [
        ...newNegociaciones['en-proceso'],
        ...newNegociaciones['terminada'],
        ...newNegociaciones['cancelada']
      ];
      const terminadas = newNegociaciones['terminada'];
      
      setTotalNegocios(allNegociaciones.length);
      setTotalComision(terminadas.reduce((sum, n) => sum + (n.Comision || 0), 0));
      setTasaExito(allNegociaciones.length > 0 ? (terminadas.length / allNegociaciones.length) * 100 : 0);

      // Make API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${movedItem.IDNegociacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoID: newEstado
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

    } catch (error) {
      console.error('Error during drag operation:', error);
      // Revert to previous state by re-fetching data
      fetchAllData();
      alert('Error al actualizar la negociación');
    }
  };

  const handleCreateNegociacion = () => {
    setIsModalOpen(true);
  };

  const handleSubmitNegociacion = async (data: FormNegociacionData) => {
    try {
      if (!data.productos || data.productos.length === 0) {
        throw new Error('Debe seleccionar al menos un producto');
      }

      const clienteSeleccionado = clientes.find(c => c.Nombre === data.cliente);
      const vendedorSeleccionado = vendedores.find(v => v.Nombre === data.vendedor);

      if (!clienteSeleccionado) {
        throw new Error(`Cliente no encontrado: ${data.cliente}`);
      }
      if (!vendedorSeleccionado) {
        throw new Error(`Vendedor no encontrado: ${data.vendedor}`);
      }

      const negociacionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoID: 2, // En proceso
          IdVendedor: vendedorSeleccionado.Id,
          IdCliente: clienteSeleccionado.Id,
          FechaInicio: new Date().toISOString().split('T')[0],
          FechaFin: new Date().toISOString().split('T')[0],
          Total: data.total,
          Comision: data.comision
        }),
      });

      if (!negociacionResponse.ok) {
        const errorData = await negociacionResponse.json();
        throw new Error(errorData.error || 'Error al crear la negociación');
      }

      const negociacionData = await negociacionResponse.json();
      
      if (!negociacionData.IDNegociacion) {
        throw new Error('No se recibió el ID de la negociación');
      }

      const idNegociacion = negociacionData.IDNegociacion;

      for (const producto of data.productos) {
        const productoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociacion-productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            IDNegociacion: idNegociacion,
            IDProducto: producto.IDProducto,
            Cantidad: producto.Cantidad,
            Precio: producto.PrecioUnitario,
            Descripcion: producto.Descripcion
          }),
        });

        if (!productoResponse.ok) {
          const errorData = await productoResponse.json();
          throw new Error(errorData.message || errorData.error || 'Error al agregar productos a la negociación');
        }
      }

      setIsModalOpen(false);
      fetchAllData();
      // Update stats after creating new negotiation
      updateStats();
      alert('Negociación creada exitosamente');
    } catch (error) {
      console.error('Error creating negociacion:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la negociación');
    }
  };

  const handleDeleteNegociacion = async (id: number) => {
    if (!isAdmin) {
      showNotification('Solo los administradores pueden eliminar negociaciones', 'error');
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar esta negociación? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAllData();
          updateStats();
          showNotification('Negociación eliminada exitosamente', 'success');
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || 'Error al eliminar la negociación', 'error');
        }
      } catch (error) {
        console.error('Error deleting negociacion:', error);
        showNotification('Error al eliminar la negociación', 'error');
      }
    }
  };

  const handleEditNegociacion = async (id: string, data: FormNegociacionData) => {
    try {
      if (!data.productos || data.productos.length === 0) {
        throw new Error('Debe seleccionar al menos un producto');
      }

      const clienteSeleccionado = clientes.find(c => c.Nombre === data.cliente);
      const vendedorSeleccionado = vendedores.find(v => v.Nombre === data.vendedor);

      if (!clienteSeleccionado) {
        throw new Error(`Cliente no encontrado: ${data.cliente}`);
      }
      if (!vendedorSeleccionado) {
        throw new Error(`Vendedor no encontrado: ${data.vendedor}`);
      }

      // Actualizar la negociación
      const negociacionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IdVendedor: vendedorSeleccionado.Id,
          IdCliente: clienteSeleccionado.Id,
          Total: data.total,
          Comision: data.comision
        }),
      });

      if (!negociacionResponse.ok) {
        const errorData = await negociacionResponse.json();
        throw new Error(errorData.error || 'Error al actualizar la negociación');
      }

      // Eliminar productos existentes
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociacion-productos/${id}`, {
        method: 'DELETE',
      });

      // Agregar nuevos productos
      for (const producto of data.productos) {
        const productoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociacion-productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            IDNegociacion: parseInt(id),
            IDProducto: producto.IDProducto,
            Cantidad: producto.Cantidad,
            Precio: producto.PrecioUnitario,
            Descripcion: producto.Descripcion
          }),
        });

        if (!productoResponse.ok) {
          const errorData = await productoResponse.json();
          throw new Error(errorData.message || errorData.error || 'Error al actualizar productos');
        }
      }

      fetchAllData();
      showNotification('Negociación actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error updating negociacion:', error);
      showNotification(error instanceof Error ? error.message : 'Error al actualizar la negociación', 'error');
    }
  };

  // New helper function to update stats based on current state
  const updateStats = () => {
    const allNegociaciones = [
      ...negociaciones['en-proceso'],
      ...negociaciones['terminada'],
      ...negociaciones['cancelada']
    ];
    const terminadas = negociaciones['terminada'];
    
    setTotalNegocios(allNegociaciones.length);
    setTotalComision(terminadas.reduce((sum, n) => sum + (n.Comision || 0), 0));
    setTasaExito(allNegociaciones.length > 0 ? (terminadas.length / allNegociaciones.length) * 100 : 0);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      message,
      type,
      show: true
    });
  };

  if (!isMounted) {
    return null; // Evita el renderizado inicial en el cliente
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <AdminMode />
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentVendedorName ? `Negociaciones de ${currentVendedorName}` : 'Negociaciones'}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Vendor Filter Section */}
            {isAdmin && (
              <div className="mb-6">
                <select
                  value={vendedorFilter || 'all'}
                  onChange={handleVendedorFilterChange}
                  className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="all">Todos los vendedores</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.Id} value={vendedor.Id}>
                      {vendedor.Nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-[#1e293b] overflow-hidden rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-[#3b82f6] rounded-xl p-3 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Total Clientes
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {totalClientes}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] overflow-hidden rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-[#22c55e] rounded-xl p-3 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Total Comisión
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      ${totalComision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] overflow-hidden rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-[#6366f1] rounded-xl p-3 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Total Negocios
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {totalNegocios}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] overflow-hidden rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-[#ca8a04] rounded-xl p-3 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Tasa de Éxito
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {tasaExito.toFixed(1)}%
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleCreateNegociacion}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Nueva Negociación
              </button>
            </div>

            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Columna: En Proceso */}
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-blue-100 dark:border-blue-900 overflow-hidden">
                  <div className="p-4 border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/50">
                    <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      En Proceso
                    </h2>
                  </div>
                  <Droppable droppableId="en-proceso">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
                      >
                        {negociaciones['en-proceso'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                              >
                                <NegociacionCard
                                  id={negociacion.IDNegociacion.toString()}
                                  cliente={negociacion.ClienteNombre}
                                  vendedor={negociacion.VendedorNombre}
                                  productos={negociacion.Productos || []}
                                  total={negociacion.Total}
                                  comision={negociacion.Comision}
                                  onEdit={handleEditNegociacion}
                                  onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                                  clientes={clientes}
                                  vendedores={vendedores}
                                  productosDisponibles={productos}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Columna: Terminada */}
                <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-green-100 dark:border-green-900 overflow-hidden">
                  <div className="p-4 border-b border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/50">
                    <h2 className="text-lg font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Terminada
                    </h2>
                  </div>
                  <Droppable droppableId="terminada">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
                      >
                        {negociaciones['terminada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                              >
                                <NegociacionCard
                                  id={negociacion.IDNegociacion.toString()}
                                  cliente={negociacion.ClienteNombre}
                                  vendedor={negociacion.VendedorNombre}
                                  productos={negociacion.Productos || []}
                                  total={negociacion.Total}
                                  comision={negociacion.Comision}
                                  onEdit={handleEditNegociacion}
                                  onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                                  clientes={clientes}
                                  vendedores={vendedores}
                                  productosDisponibles={productos}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Columna: Cancelada */}
                <div className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-red-100 dark:border-red-900 overflow-hidden">
                  <div className="p-4 border-b border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/50">
                    <h2 className="text-lg font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cancelada
                    </h2>
                  </div>
                  <Droppable droppableId="cancelada">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
                      >
                        {negociaciones['cancelada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                              >
                                <NegociacionCard
                                  id={negociacion.IDNegociacion.toString()}
                                  cliente={negociacion.ClienteNombre}
                                  vendedor={negociacion.VendedorNombre}
                                  productos={negociacion.Productos || []}
                                  total={negociacion.Total}
                                  comision={negociacion.Comision}
                                  onEdit={handleEditNegociacion}
                                  onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                                  clientes={clientes}
                                  vendedores={vendedores}
                                  productosDisponibles={productos}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          </div>
        </main>
      </div>

      {/* Modal para crear nueva negociación */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nueva Negociación
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

            <NegociacionCard
              id="new"
              cliente=""
              vendedor=""
              productos={[]}
              total={0}
              comision={0}
              onEdit={(id, data) => {
                const formData: FormNegociacionData = {
                  ...data,
                  productos: data.productos.map(p => ({
                    IDProducto: p.IDProducto,
                    Cantidad: p.Cantidad,
                    PrecioUnitario: p.PrecioUnitario,
                    Subtotal: p.Subtotal,
                    Descripcion: ''
                  }))
                };
                handleSubmitNegociacion(formData);
              }}
              onDelete={() => setIsModalOpen(false)}
              clientes={clientes}
              vendedores={vendedores}
              productosDisponibles={productos}
            />
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
}