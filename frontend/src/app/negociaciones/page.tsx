'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NegociacionCard from '@/components/NegociacionCard';
import AdminMode from '@/components/AdminMode';
import { useAdmin } from '@/context/AdminContext';

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
  uniqueId?: string; // Add this field
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
  'cancelada': Negociacion[];
  'terminada': Negociacion[];
}

interface Cliente {
  Id: number;
  Nombre: string;
}

interface Vendedor {
  Id: number;
  Nombre: string;
}

interface Producto {
  IDProducto: number;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

interface DraggableProvided {
  draggableProps: any;
  dragHandleProps: any;
  innerRef: (element: HTMLElement | null) => void;
}

interface FormProductoNegociacion {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

interface FormNegociacionData {
  cliente: string;
  vendedor: string;
  productos: FormProductoNegociacion[];
  total: number;
  comision: number;
}

export default function NegociacionesPage() {
  const { isAdmin } = useAdmin();
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

  useEffect(() => {
    setIsMounted(true);
    fetchNegociaciones();
    fetchClientes();
    fetchVendedores();
    fetchProductos();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientesRes, negociacionesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`)
      ]);

      if (clientesRes.ok && negociacionesRes.ok) {
        const clientes = await clientesRes.json();
        const negociaciones = await negociacionesRes.json();
        
        setTotalClientes(clientes.length);
        setTotalNegocios(negociaciones.length);
        
        const terminadas = negociaciones.filter((n: Negociacion) => n.Estado === 3);
        const totalComision = terminadas.reduce((sum: number, n: Negociacion) => sum + (n.Comision || 0), 0);
        setTotalComision(totalComision);
        
        setTasaExito(negociaciones.length > 0 ? (terminadas.length / negociaciones.length) * 100 : 0);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchNegociaciones = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`);
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Transform the data to match our interface
        const negociaciones: Negociacion[] = data.map((n: NegociacionData) => {
          console.log('Processing negotiation:', n);
          return {
            IDNegociacion: n.IDNegociacion,
            ClienteNombre: n.ClienteNombre || '',
            VendedorNombre: n.VendedorNombre || '',
            Productos: (n.Productos || []).map((p: ProductoData) => ({
              IDProducto: p.IDProducto,
              Cantidad: p.Cantidad,
              PrecioUnitario: p.PrecioUnitario,
              Subtotal: p.Subtotal,
              Descripcion: p.Descripcion
            })),
            Total: n.Total || 0,
            Comision: n.Comision || 0,
            Estado: n.Estado,
            FechaInicio: n.FechaInicio,
            FechaFin: n.FechaFin,
            EstadoDescripcion: n.EstadoDescripcion || '',
            Monto: n.Total || 0,
            IdVendedor: n.IdVendedor,
            IdCliente: n.IdCliente
          };
        });

        const organizadas: EstadosNegociacion = {
          'en-proceso': negociaciones.filter(n => n.Estado === 2),
          'cancelada': negociaciones.filter(n => n.Estado === 1),
          'terminada': negociaciones.filter(n => n.Estado === 3)
        };
        
        setNegociaciones(organizadas);
      } else {
        console.error('Error response:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching negociaciones:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

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

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const handleDragEnd = async (result: { source: { droppableId: string; index: number }; destination: { droppableId: string; index: number } | null }) => {
    if (!isAdmin) return;
    const { source, destination } = result;

    if (!destination) return;

    // If dropped in the same position in the same column, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceItems = Array.from(negociaciones[source.droppableId as keyof EstadosNegociacion]);
    const [movedItem] = sourceItems.splice(source.index, 1);

    // Only create a new uniqueId if moving to a different column
    if (source.droppableId !== destination.droppableId) {
      movedItem.uniqueId = `${movedItem.IDNegociacion}_${Date.now()}`;
    }

    const newEstado = destination.droppableId === 'en-proceso' ? 2 :
                     destination.droppableId === 'cancelada' ? 1 : 3;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${movedItem.IDNegociacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoID: newEstado
        }),
      });

      if (response.ok) {
        // Calculate new states before updating UI
        let newSourceItems = sourceItems;
        let newDestItems = Array.from(negociaciones[destination.droppableId as keyof EstadosNegociacion]);
        
        if (source.droppableId === destination.droppableId) {
          // If moving within the same column
          newSourceItems.splice(destination.index, 0, movedItem);
        } else {
          // If moving to a different column
          newDestItems.splice(destination.index, 0, movedItem);
        }

        // Create the new state
        const newNegociaciones = {
          ...negociaciones,
          [source.droppableId]: newSourceItems,
          [destination.droppableId]: source.droppableId === destination.droppableId ? newSourceItems : newDestItems
        };

        // Calculate stats with the new state before updating UI
        const allNegociaciones = [
          ...newNegociaciones['en-proceso'],
          ...newNegociaciones['terminada'],
          ...newNegociaciones['cancelada']
        ];
        const terminadas = newNegociaciones['terminada'];
        
        setTotalNegocios(allNegociaciones.length);
        setTotalComision(terminadas.reduce((sum, n) => sum + (n.Comision || 0), 0));
        setTasaExito(allNegociaciones.length > 0 ? (terminadas.length / allNegociaciones.length) * 100 : 0);

        // Update UI state
        setNegociaciones(newNegociaciones);
      } else {
        const errorText = await response.text();
        console.error('Error al actualizar el estado de la negociación:', errorText);
        // Revertir el cambio en la UI
        sourceItems.splice(source.index, 0, movedItem);
        setNegociaciones(prev => ({
          ...prev,
          [source.droppableId]: sourceItems,
        }));
        alert('Error al actualizar el estado de la negociación');
      }
    } catch (error) {
      console.error('Error al actualizar la negociación:', error);
      // Revertir el cambio en la UI
      sourceItems.splice(source.index, 0, movedItem);
      setNegociaciones(prev => ({
        ...prev,
        [source.droppableId]: sourceItems,
      }));
      alert('Error al actualizar la negociación');
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
      fetchNegociaciones();
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
      alert('Solo los administradores pueden eliminar negociaciones');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar esta negociación?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchNegociaciones();
          // Update stats after deleting negotiation
          updateStats();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error al eliminar la negociación');
        }
      } catch (error) {
        console.error('Error deleting negociacion:', error);
        alert('Error al eliminar la negociación');
      }
    }
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
      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Negociaciones
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Clientes
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalClientes}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Comisión
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            ${totalComision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Negocios
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalNegocios}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Tasa de Éxito
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {tasaExito.toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              {isAdmin && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCreateNegociacion}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Nueva Negociación
                  </button>
                </div>
              )}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Columna: En Proceso */}
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-blue-100 dark:border-blue-900">
                  <div className="p-4 border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/50 rounded-t-lg">
                    <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      En Proceso
                    </h2>
                  </div>
                  <Droppable droppableId="en-proceso" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px]"
                      >
                        {negociaciones['en-proceso'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <NegociacionCard
                                id={negociacion.IDNegociacion.toString()}
                                cliente={negociacion.ClienteNombre}
                                vendedor={negociacion.VendedorNombre}
                                productos={negociacion.Productos || []}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implement edit if needed
                                }}
                                onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Columna: Terminada */}
                <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-green-100 dark:border-green-900">
                  <div className="p-4 border-b border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/50 rounded-t-lg">
                    <h2 className="text-lg font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Terminada
                    </h2>
                  </div>
                  <Droppable droppableId="terminada" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px]"
                      >
                        {negociaciones['terminada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <NegociacionCard
                                id={negociacion.IDNegociacion.toString()}
                                cliente={negociacion.ClienteNombre}
                                vendedor={negociacion.VendedorNombre}
                                productos={negociacion.Productos || []}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implement edit if needed
                                }}
                                onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Columna: Cancelada */}
                <div className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-red-100 dark:border-red-900">
                  <div className="p-4 border-b border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/50 rounded-t-lg">
                    <h2 className="text-lg font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cancelada
                    </h2>
                  </div>
                  <Droppable droppableId="cancelada" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-6 space-y-6 min-h-[200px]"
                      >
                        {negociaciones['cancelada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.uniqueId || negociacion.IDNegociacion}
                            draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <NegociacionCard
                                id={negociacion.IDNegociacion.toString()}
                                cliente={negociacion.ClienteNombre}
                                vendedor={negociacion.VendedorNombre}
                                productos={negociacion.Productos || []}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implement edit if needed
                                }}
                                onDelete={(id) => handleDeleteNegociacion(parseInt(id))}
                              />
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
            />
          </div>
        </div>
      )}
    </div>
  );
}