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
  const [negociaciones, setNegociaciones] = useState<EstadosNegociacion>({
    'en-proceso': [],
    'cancelada': [],
    'terminada': []
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
  }, []);

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

    const sourceItems = Array.from(negociaciones[source.droppableId as keyof EstadosNegociacion]);
    const [movedItem] = sourceItems.splice(source.index, 1);

    const newEstado = destination.droppableId === 'en-proceso' ? 2 :
                     destination.droppableId === 'cancelada' ? 1 : 3;

    console.log('Moving item:', movedItem);
    console.log('New state:', newEstado);

    try {
      const updateData = {
        EstadoID: newEstado,
        IdVendedor: movedItem.IdVendedor,
        IdCliente: movedItem.IdCliente,
        FechaInicio: movedItem.FechaInicio
      };
      console.log('Sending update data:', updateData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones/${movedItem.IDNegociacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update the estado property of the moved item
        const updatedItem = { ...movedItem, Estado: newEstado };
        
        // Get the destination items and insert the moved item
        const destItems = Array.from(negociaciones[destination.droppableId as keyof EstadosNegociacion]);
        destItems.splice(destination.index, 0, updatedItem);

        // Update the state with both source and destination changes
        setNegociaciones(prev => ({
          ...prev,
          [source.droppableId]: sourceItems,
          [destination.droppableId]: destItems,
        }));

        // Refresh the negotiations to ensure we have the latest data
        fetchNegociaciones();
      } else {
        const errorText = await response.text();
        console.error('Failed to update negotiation state:', errorText);
        console.error('Response status:', response.status);
        // Revert the UI if the API call fails
        sourceItems.splice(source.index, 0, movedItem);
        setNegociaciones(prev => ({
          ...prev,
          [source.droppableId]: sourceItems,
          [destination.droppableId]: negociaciones[destination.droppableId as keyof EstadosNegociacion],
        }));
      }
    } catch (error) {
      console.error('Error updating negotiation:', error);
      // Revert the UI if there's an error
      sourceItems.splice(source.index, 0, movedItem);
      setNegociaciones(prev => ({
        ...prev,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: negociaciones[destination.droppableId as keyof EstadosNegociacion],
      }));
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
      fetchNegociaciones();
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

        <main className="h-full pb-16 overflow-y-auto">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Columna: Cancelada */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Cancelada
                    </h2>
                  </div>
                  <Droppable droppableId="cancelada" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-4 space-y-4"
                      >
                        {negociaciones['cancelada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.IDNegociacion}
                            draggableId={negociacion.IDNegociacion.toString()}
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
                {/* Columna: En Proceso */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      En Proceso
                    </h2>
                  </div>
                  <Droppable droppableId="en-proceso" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-4 space-y-4"
                      >
                        {negociaciones['en-proceso'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.IDNegociacion}
                            draggableId={negociacion.IDNegociacion.toString()}
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Terminada
                    </h2>
                  </div>
                  <Droppable droppableId="terminada" isDropDisabled={!isAdmin}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-4 space-y-4"
                      >
                        {negociaciones['terminada'].map((negociacion, index) => (
                          <Draggable
                            key={negociacion.IDNegociacion}
                            draggableId={negociacion.IDNegociacion.toString()}
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