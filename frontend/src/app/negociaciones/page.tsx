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
  FechaFin: string | null;
}

interface EstadosNegociacion {
  [key: string]: Negociacion[];
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
      const response = await fetch('http://localhost:5002/api/negociaciones');
      if (response.ok) {
        const data: Negociacion[] = await response.json();
        
        // Organizar negociaciones por estado
        const organizadas: EstadosNegociacion = {
          'en-proceso': data.filter(n => n.Estado === 2),
          'cancelada': data.filter(n => n.Estado === 1),
          'terminada': data.filter(n => n.Estado === 3)
        };
        
        setNegociaciones(organizadas);
      }
    } catch (error) {
      console.error('Error fetching negociaciones:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/clientes');
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
      const response = await fetch('http://localhost:5002/api/vendedores');
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
      const response = await fetch('http://localhost:5002/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!isAdmin) return;
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      // Reordenar dentro de la misma columna
      const items = Array.from(negociaciones[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setNegociaciones({
        ...negociaciones,
        [source.droppableId]: items,
      });
    } else {
      // Mover entre columnas
      const sourceItems = Array.from(negociaciones[source.droppableId]);
      const destItems = Array.from(negociaciones[destination.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      // Determinar el nuevo estado basado en la columna de destino
      let nuevoEstado = 2; // Por defecto "en proceso"
      if (destination.droppableId === 'cancelada') nuevoEstado = 1;
      if (destination.droppableId === 'terminada') nuevoEstado = 3;

      // Actualizar en la base de datos
      try {
        const response = await fetch(`http://localhost:5002/api/negociaciones/${movedItem.IDNegociacion}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...movedItem,
            Estado: nuevoEstado,
            FechaFin: nuevoEstado === 3 ? new Date().toISOString() : null
          }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el estado de la negociación');
        }

        setNegociaciones({
          ...negociaciones,
          [source.droppableId]: sourceItems,
          [destination.droppableId]: destItems,
        });
      } catch (error) {
        console.error('Error updating negociacion:', error);
        alert('Error al actualizar el estado de la negociación');
      }
    }
  };

  const handleCreateNegociacion = () => {
    if (!isAdmin) {
      alert('Solo los administradores pueden crear negociaciones');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitNegociacion = async (data: {
    cliente: string;
    vendedor: string;
    productos: ProductoNegociacion[];
    total: number;
    comision: number;
  }) => {
    try {
      // Encontrar los IDs correspondientes
      const clienteSeleccionado = clientes.find(c => c.Nombre === data.cliente);
      const vendedorSeleccionado = vendedores.find(v => v.Nombre === data.vendedor);

      if (!clienteSeleccionado || !vendedorSeleccionado) {
        alert('Error al seleccionar cliente o vendedor');
        return;
      }

      // Crear la negociación
      const negociacionResponse = await fetch('http://localhost:5002/api/negociaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IdCliente: clienteSeleccionado.Id,
          IdVendedor: vendedorSeleccionado.Id,
          Total: data.total,
          Comision: data.comision,
          Estado: 2, // En proceso
          FechaInicio: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
          FechaFin: new Date().toISOString().split('T')[0] // La base de datos requiere una fecha inicial
        }),
      });

      if (!negociacionResponse.ok) {
        const errorData = await negociacionResponse.json();
        throw new Error(errorData.message || 'Error al crear la negociación');
      }

      const negociacionData = await negociacionResponse.json();
      
      if (!negociacionData.IDNegociacion) {
        throw new Error('No se recibió el ID de la negociación');
      }

      const idNegociacion = negociacionData.IDNegociacion;

      // Agregar los productos a la negociación
      for (const producto of data.productos) {
        const productoSeleccionado = productos.find(p => p.IDProducto === producto.IDProducto);
        if (!productoSeleccionado) {
          throw new Error(`Producto no encontrado: ${producto.IDProducto}`);
        }

        const productoResponse = await fetch(`http://localhost:5002/api/negociacion-productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            IDNegociacion: idNegociacion,
            IDProducto: producto.IDProducto,
            Cantidad: producto.Cantidad,
            Precio: producto.PrecioUnitario,
            Descripcion: productoSeleccionado.Descripcion
          }),
        });

        if (!productoResponse.ok) {
          const errorData = await productoResponse.json();
          throw new Error(errorData.message || 'Error al agregar productos a la negociación');
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
        const response = await fetch(`http://localhost:5002/api/negociaciones/${id}`, {
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
          </div>
        </header>

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                                productos={negociacion.Productos}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implementar edición si es necesario
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
                                productos={negociacion.Productos}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implementar edición si es necesario
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
                                productos={negociacion.Productos}
                                total={negociacion.Total}
                                comision={negociacion.Comision}
                                provided={provided}
                                onEdit={(id, data) => {
                                  // Implementar edición si es necesario
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
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
              onEdit={(id, data) => handleSubmitNegociacion(data)}
              onDelete={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}