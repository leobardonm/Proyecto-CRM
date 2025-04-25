'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import AdminMode from '@/components/AdminMode';
import { useAdmin } from '@/context/AdminContext';
import Notification from '@/components/Notification';
import StatCard from '@/components/StatCard';
import NegociacionColumn from '@/components/NegociacionColumn';
import CreateNegociacionModal from '@/components/CreateNegociacionModal';
import { 
  Cliente, 
  Vendedor, 
  Producto, 
  Negociacion, 
  EstadosNegociacion, 
  FormNegociacionData, 
  NotificationState,
  NegociacionData // Assuming NegociacionData is the raw API response type
} from '@/types/negociaciones';

// Helper to safely parse JSON
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return { error: 'Invalid JSON response from server', details: text };
  }
}

export default function NegociacionesPage() {
  const { isAdmin, currentUser } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Stats State
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalComision, setTotalComision] = useState(0);
  const [totalNegocios, setTotalNegocios] = useState(0);
  const [tasaExito, setTasaExito] = useState(0);

  // Data State
  const [negociaciones, setNegociaciones] = useState<EstadosNegociacion>({
    'en-proceso': [],
    'terminada': [],
    'cancelada': []
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  
  // Filter State
  const [vendedorFilter, setVendedorFilter] = useState<number | null>(null);
  const [currentVendedorName, setCurrentVendedorName] = useState<string>('');

  // UI State
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    show: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false); // Prevent updates while dragging

  // --- Utility Functions ---
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, show: true });
  };

  const updateStats = useCallback((currentNegociaciones: EstadosNegociacion, allClientes: Cliente[]) => {
    const all = [
      ...currentNegociaciones['en-proceso'],
      ...currentNegociaciones['terminada'],
      ...currentNegociaciones['cancelada']
    ];
    const terminadas = currentNegociaciones['terminada'];
    
    setTotalNegocios(all.length);
    setTotalComision(terminadas.reduce((sum, n) => sum + (n.Comision || 0), 0));
    setTasaExito(all.length > 0 ? (terminadas.length / all.length) * 100 : 0);

    // Update client count based on available clients if admin, or related negotiations if not
    const uniqueClients = !isAdmin && currentUser
      ? new Set(all.map((n) => n.IdCliente))
      : new Set(allClientes.map((c) => c.Id));
    setTotalClientes(uniqueClients.size);

  }, [isAdmin, currentUser]);

  // --- Data Fetching --- 
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [negociacionesRes, clientesRes, vendedoresRes, productosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedores`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`)
      ]);

      // Log the responses for debugging
      console.log('Clientes response:', clientesRes);

      const [negociacionesData, clientesData, vendedoresData, productosData] = await Promise.all([
        negociacionesRes.ok ? negociacionesRes.json() : [],
        clientesRes.ok ? clientesRes.json() : [],
        vendedoresRes.ok ? vendedoresRes.json() : [],
        productosRes.ok ? productosRes.json() : []
      ]);

      // Log the parsed data for debugging
      console.log('Parsed clientes data:', clientesData);

      if (!Array.isArray(clientesData)) {
        console.error('Clientes data is not an array:', clientesData);
        throw new Error('Invalid clientes data format');
      }

      setClientes(clientesData);
      setProductos(productosData);

      // Filter vendedores based on admin status
      if (!isAdmin && currentUser) {
        const currentVendedor = vendedoresData.find((v: Vendedor) => v.Id === currentUser);
        setVendedores(currentVendedor ? [currentVendedor] : []);
      } else {
        setVendedores(vendedoresData);
      }
      
      // Filter and transform negociaciones
      const relevantNegociacionesRaw = !isAdmin && currentUser
        ? negociacionesData.filter((n: NegociacionData) => n.IdVendedor === currentUser)
        : vendedorFilter
          ? negociacionesData.filter((n: NegociacionData) => n.IdVendedor === vendedorFilter)
          : negociacionesData;

      const transformedNegociaciones: Negociacion[] = relevantNegociacionesRaw.map((n: NegociacionData): Negociacion => ({
        IDNegociacion: n.IDNegociacion || 0,
        ClienteNombre: n.ClienteNombre || '',
        VendedorNombre: n.VendedorNombre || '',
        Productos: Array.isArray(n.Productos) ? n.Productos.map(p => ({
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
        IdCliente: n.IdCliente || 0,
        uniqueId: String(n.IDNegociacion) // Initial unique ID
      }));

      const organizadas: EstadosNegociacion = {
        'en-proceso': transformedNegociaciones.filter(n => n.Estado === 2),
        'cancelada': transformedNegociaciones.filter(n => n.Estado === 1),
        'terminada': transformedNegociaciones.filter(n => n.Estado === 3)
      };

      setNegociaciones(organizadas);
      updateStats(organizadas, clientesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error al cargar los datos. Intente de nuevo.', 'error');
      // Set default empty states on error
      setNegociaciones({ 'en-proceso': [], 'terminada': [], 'cancelada': [] });
      setClientes([]);
      setVendedores([]);
      setProductos([]);
      updateStats({ 'en-proceso': [], 'terminada': [], 'cancelada': [] }, []);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, currentUser, vendedorFilter, updateStats]);

  // --- Effects --- 
  useEffect(() => {
    setIsMounted(true);
    // Get vendedor ID from URL query parameter on initial mount
    const params = new URLSearchParams(window.location.search);
    const vendedorId = params.get('vendedor');
    if (vendedorId && !isNaN(Number(vendedorId))) {
      setVendedorFilter(Number(vendedorId));
    } else {
      fetchAllData(); // Fetch data if no filter initially
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (isMounted) {
        fetchAllData(); // Fetch data when filter changes (or user changes)
    }
  }, [vendedorFilter, isAdmin, currentUser, fetchAllData, isMounted]);

  useEffect(() => {
    // Update vendor name display when filter or vendors list changes
    if (vendedorFilter) {
      const vendedor = vendedores.find(v => v.Id === vendedorFilter);
      setCurrentVendedorName(vendedor ? vendedor.Nombre : '');
    } else {
      setCurrentVendedorName('');
    }
  }, [vendedorFilter, vendedores]);

  // --- Event Handlers ---
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;

    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return; // No move occurred
    }

    // --- Optimistic UI Update --- 
    const sourceDroppableId = source.droppableId as keyof EstadosNegociacion;
    const destDroppableId = destination.droppableId as keyof EstadosNegociacion;
    const negociacionId = parseInt(draggableId.split('_')[0]); // Get original ID

    // Create a deep copy for manipulation
    const currentNegociaciones = JSON.parse(JSON.stringify(negociaciones)) as EstadosNegociacion;
    const sourceList = currentNegociaciones[sourceDroppableId];
    const destList = currentNegociaciones[destDroppableId];

    // Find and remove the item from source
    const itemIndex = sourceList.findIndex(n => (n.uniqueId || n.IDNegociacion.toString()) === draggableId);
    if (itemIndex === -1) {
      console.error('Draggable item not found in source list');
      return;
    }
    const [movedItem] = sourceList.splice(itemIndex, 1);

    // Check permissions (redundant if fetch filters correctly, but good practice)
    if (!isAdmin && movedItem.IdVendedor !== currentUser) {
      showNotification('No tienes permiso para mover esta negociación.', 'error');
      return; // Prevent unauthorized move
    }

    // Add to destination at the correct index
    destList.splice(destination.index, 0, movedItem);

    // Update state immediately for smooth UI
    setNegociaciones(currentNegociaciones);
    updateStats(currentNegociaciones, clientes); // Update stats optimistically
    // --- End Optimistic UI Update ---

    // --- API Call --- 
    const newEstado = destDroppableId === 'en-proceso' ? 2 :
                     destDroppableId === 'cancelada' ? 1 : 3;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${negociacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EstadoID: newEstado }),
      });

      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        throw new Error(errorData.error || 'Error response from server');
      }
      // Success - UI is already updated optimistically.
      // Optional: Re-fetch for consistency, though maybe not needed if API is reliable.
      // fetchAllData(); 

    } catch (error) {
      console.error('Error updating negotiation status:', error);
      showNotification(`Error al mover negociación: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
      // Revert UI on failure by re-fetching original data
      fetchAllData(); 
    }
  };

  const handleCreateNegociacion = () => {
    setIsModalOpen(true);
  };

  const handleSubmitNewNegociacion = async (data: FormNegociacionData) => {
    setIsModalOpen(false); // Close modal immediately
    setIsLoading(true);
    try {
      // Basic frontend validation (already done in modal, but good practice)
      if (!data.cliente || !data.vendedor) {
        throw new Error('Cliente y Vendedor son requeridos');
      }
      if (!data.productos || data.productos.length === 0) {
        throw new Error('Debe seleccionar al menos un producto');
      }

      const clienteSeleccionado = clientes.find(c => c.Nombre === data.cliente);
      const vendedorSeleccionado = vendedores.find(v => v.Nombre === data.vendedor);

      if (!clienteSeleccionado) throw new Error(`Cliente no encontrado: ${data.cliente}`);
      if (!vendedorSeleccionado) throw new Error(`Vendedor no encontrado: ${data.vendedor}`);

      // Prepare products in the expected format
      const productosParaEnviar = data.productos.map(p => ({
        IDProducto: p.IDProducto,
        Cantidad: p.Cantidad,
        PrecioUnitario: p.PrecioUnitario,
        Subtotal: p.Cantidad * p.PrecioUnitario, // Calculate subtotal frontend
        Descripcion: p.Descripcion
      }));

      // 1. Create the main negotiation record including products
      const negociacionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EstadoID: 2, // Default to 'En proceso'
          IdVendedor: vendedorSeleccionado.Id,
          IdCliente: clienteSeleccionado.Id,
          FechaInicio: new Date().toISOString().split('T')[0],
          FechaFin: new Date().toISOString().split('T')[0], // Default end date
          Total: data.total,
          Comision: data.comision,
          productos: productosParaEnviar // lowercase 'productos' to match backend expectation
        }),
      });

      if (!negociacionResponse.ok) {
        const errorData = await safeJsonParse(negociacionResponse);
        // Check for specific error messages from backend
        const errorMessage = errorData.message || errorData.error || 'Error al crear la negociación';
        // Throw the specific message if available
        throw new Error(errorMessage);
      }


      showNotification('Negociación creada exitosamente', 'success');
      fetchAllData(); // Refresh data list

    } catch (error) {
      console.error('Error creating negociacion:', error);
      showNotification(`Error al crear negociación: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNegociacion = async (id: string, data: FormNegociacionData) => {
    setIsLoading(true);
    const negociacionId = parseInt(id);
    try {
      // Validations
      if (!data.cliente || !data.vendedor) throw new Error('Cliente y Vendedor son requeridos');
      if (!data.productos || data.productos.length === 0) throw new Error('Debe seleccionar al menos un producto');

      const clienteSeleccionado = clientes.find(c => c.Nombre === data.cliente);
      const vendedorSeleccionado = vendedores.find(v => v.Nombre === data.vendedor);

      if (!clienteSeleccionado) throw new Error(`Cliente no encontrado: ${data.cliente}`);
      if (!vendedorSeleccionado) throw new Error(`Vendedor no encontrado: ${data.vendedor}`);

      // Prepare products in the expected format for update
      const productosParaEnviar = data.productos.map(p => ({
        IDProducto: p.IDProducto,
        Cantidad: p.Cantidad,
        PrecioUnitario: p.PrecioUnitario,
        Subtotal: p.Cantidad * p.PrecioUnitario, // Calculate subtotal frontend
        Descripcion: p.Descripcion
      }));

      // 1. Update the main negotiation record including products
      const negociacionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${negociacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Update editable fields
          IdVendedor: vendedorSeleccionado.Id,
          IdCliente: clienteSeleccionado.Id,
          Total: data.total,
          Comision: data.comision,
          productos: productosParaEnviar // lowercase 'productos' to match backend expectation
          // EstadoID is updated via drag-and-drop
        }),
      });

      if (!negociacionResponse.ok) {
        const errorData = await safeJsonParse(negociacionResponse);
        throw new Error(errorData.message || errorData.error || 'Error al actualizar la negociación');
      }

      // 2. Remove logic for replacing associated products separately
      /*
      const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociacion-productos/${negociacionId}`, {
        method: 'DELETE',
      });
      // Don't necessarily throw if delete fails (e.g., if no products existed), but log it.
      if (!deleteResponse.ok) {
          console.warn(`Could not delete existing products for negotiation ${negociacionId}. Proceeding to add new ones.`);
      }

      const addProductPromises = data.productos.map(producto => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociacion-productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            IDNegociacion: negociacionId,
            IDProducto: producto.IDProducto,
            Cantidad: producto.Cantidad,
            Precio: producto.PrecioUnitario, // API expects 'Precio'
            Descripcion: producto.Descripcion
          }),
        })
      );

      const addProductResponses = await Promise.all(addProductPromises);
      const failedAddProductResponse = addProductResponses.find(res => !res.ok);

      if (failedAddProductResponse) {
          const errorData = await safeJsonParse(failedAddProductResponse);
          throw new Error(errorData.message || errorData.error || 'Error al actualizar uno o más productos');
      }
      */

      showNotification('Negociación actualizada exitosamente', 'success');
      fetchAllData(); // Refresh data list

    } catch (error) {
      console.error('Error updating negociacion:', error);
      showNotification(`Error al actualizar negociación: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
      // Consider if a partial revert or just re-fetching is appropriate
      fetchAllData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNegociacion = async (id: number) => {
    if (!isAdmin) {
      showNotification('Solo los administradores pueden eliminar negociaciones', 'error');
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar esta negociación? Esta acción no se puede deshacer.')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showNotification('Negociación eliminada exitosamente', 'success');
          fetchAllData(); // Refresh data
        } else {
          const errorData = await safeJsonParse(response);
          showNotification(errorData.message || 'Error al eliminar la negociación', 'error');
        }
      } catch (error) {
        console.error('Error deleting negociacion:', error);
        showNotification(`Error al eliminar negociación: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Render Logic --- 
  if (!isMounted) {
    // Prevent rendering mismatch during SSR/hydration
    // Optionally show a basic loading skeleton here
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
             <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
             <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    );
  }

  // Define icons and colors for columns/stats
  const icons = {
    cliente: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    comision: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    negocios: (
       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
         <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
       </svg>
    ),
    tasaExito: (
       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
         <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
       </svg>
    ),
    enProceso: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    terminada: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cancelada: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const columnStyles = {
    'en-proceso': {
      bgGradient: 'from-white to-blue-50 dark:from-gray-800 dark:to-gray-900',
      border: 'border-blue-100 dark:border-blue-900',
      headerBg: 'bg-blue-50/50 dark:bg-blue-900/50',
      headerBorder: 'border-blue-200 dark:border-blue-800',
      headerText: 'text-blue-900 dark:text-blue-100'
    },
    'terminada': {
      bgGradient: 'from-white to-green-50 dark:from-gray-800 dark:to-gray-900',
      border: 'border-green-100 dark:border-green-900',
      headerBg: 'bg-green-50/50 dark:bg-green-900/50',
      headerBorder: 'border-green-200 dark:border-green-800',
      headerText: 'text-green-900 dark:text-green-100'
    },
    'cancelada': {
      bgGradient: 'from-white to-red-50 dark:from-gray-800 dark:to-gray-900',
      border: 'border-red-100 dark:border-red-900',
      headerBg: 'bg-red-50/50 dark:bg-red-900/50',
      headerBorder: 'border-red-200 dark:border-red-800',
      headerText: 'text-red-900 dark:text-red-100'
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <AdminMode />
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentVendedorName ? `Negociaciones de ${currentVendedorName}` : 'Negociaciones'}
              </h1>
              {/* Optional: Add Header actions here if needed */}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Vendor Filter Section */}
            {isAdmin && (
              <div className="mb-6 flex justify-between items-center">
                <select
                  value={vendedorFilter || 'all'}
                  onChange={handleVendedorFilterChange}
                  className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  disabled={isLoading}
                >
                  <option value="all">Todos los vendedores</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.Id} value={vendedor.Id}>
                      {vendedor.Nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateNegociacion}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  Nueva Negociación
                </button>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard 
                title="Total Clientes" 
                value={isLoading ? '...' : totalClientes} 
                icon={icons.cliente} 
                colorClass="bg-[#3b82f6]"
              />
              <StatCard 
                title="Total Comisión" 
                value={isLoading ? '...' : `$${totalComision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
                icon={icons.comision} 
                colorClass="bg-[#22c55e]"
              />
              <StatCard 
                title="Total Negocios" 
                value={isLoading ? '...' : totalNegocios} 
                icon={icons.negocios} 
                colorClass="bg-[#6366f1]"
              />
              <StatCard 
                title="Tasa de Éxito" 
                value={isLoading ? '...' : `${tasaExito.toFixed(1)}%`} 
                icon={icons.tasaExito} 
                colorClass="bg-[#ca8a04]"
              />
            </div>

            {/* Button for non-admins */} 
            {!isAdmin && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleCreateNegociacion}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    Nueva Negociación
                  </button>
                </div>
            )}

            {/* Drag and Drop Area */} 
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                 <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <NegociacionColumn
                    droppableId="en-proceso"
                    title="En Proceso"
                    icon={icons.enProceso}
                    negociacionesList={negociaciones['en-proceso']}
                    columnColorClasses={columnStyles['en-proceso']}
                    onEdit={handleEditNegociacion}
                    onDelete={handleDeleteNegociacion}
                    clientes={clientes}
                    vendedores={vendedores}
                    productosDisponibles={productos}
                  />
                  <NegociacionColumn
                    droppableId="terminada"
                    title="Terminada"
                    icon={icons.terminada}
                    negociacionesList={negociaciones['terminada']}
                    columnColorClasses={columnStyles['terminada']}
                    onEdit={handleEditNegociacion}
                    onDelete={handleDeleteNegociacion}
                    clientes={clientes}
                    vendedores={vendedores}
                    productosDisponibles={productos}
                  />
                  <NegociacionColumn
                    droppableId="cancelada"
                    title="Cancelada"
                    icon={icons.cancelada}
                    negociacionesList={negociaciones['cancelada']}
                    columnColorClasses={columnStyles['cancelada']}
                    onEdit={handleEditNegociacion}
                    onDelete={handleDeleteNegociacion}
                    clientes={clientes}
                    vendedores={vendedores}
                    productosDisponibles={productos}
                  />
                </div>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <CreateNegociacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitNewNegociacion}
        clientes={clientes}
        vendedores={vendedores}
        productosDisponibles={productos}
      />

      {/* Notification */} 
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