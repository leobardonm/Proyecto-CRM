'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NegociacionCard from '@/components/NegociacionCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface NegociacionItem {
  id: string;
  cliente: string;
  monto: string;
}

interface EstadosNegociacion {
  [key: string]: NegociacionItem[];
}

export default function Negociaciones() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [negociaciones, setNegociaciones] = useState<EstadosNegociacion>({
    'en-proceso': [
      { id: '1', cliente: 'Cliente A', monto: '$5,000' },
      { id: '2', cliente: 'Cliente B', monto: '$3,200' },
    ],
    'cancelada': [
      { id: '3', cliente: 'Cliente C', monto: '$7,800' },
    ],
    'terminada': [
      { id: '4', cliente: 'Cliente D', monto: '$10,500' },
    ],
  });

  const handleEdit = async (id: string, data: { cliente: string; monto: string }) => {
    try {
      const response = await fetch(`/api/negociaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la negociación');
      }

      // Actualizar el estado local
      setNegociaciones(prevNegociaciones => {
        const newNegociaciones = { ...prevNegociaciones };
        Object.keys(newNegociaciones).forEach(estado => {
          newNegociaciones[estado] = newNegociaciones[estado].map(item => {
            if (item.id === id) {
              return { ...item, ...data };
            }
            return item;
          });
        });
        return newNegociaciones;
      });
    } catch (error) {
      console.error('Error:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/negociaciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la negociación');
      }

      // Actualizar el estado local eliminando la negociación
      setNegociaciones(prevNegociaciones => {
        const newNegociaciones = { ...prevNegociaciones };
        Object.keys(newNegociaciones).forEach(estado => {
          newNegociaciones[estado] = newNegociaciones[estado].filter(item => item.id !== id);
        });
        return newNegociaciones;
      });
    } catch (error) {
      console.error('Error:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const items = Array.from(negociaciones[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setNegociaciones({
        ...negociaciones,
        [source.droppableId]: items,
      });
    } else {
      const sourceItems = Array.from(negociaciones[source.droppableId]);
      const destItems = Array.from(negociaciones[destination.droppableId]);
      const [removedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removedItem);

      setNegociaciones({
        ...negociaciones,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
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
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Negociaciones</h1>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Negociación
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Filtrar
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries({
                    'en-proceso': 'En Proceso',
                    'cancelada': 'Cancelada',
                    'terminada': 'Terminada'
                  }).map(([key, title]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-600">
                          {negociaciones[key].length}
                        </span>
                      </div>
                      <Droppable droppableId={key}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 min-h-[calc(100vh-300px)]"
                          >
                            {negociaciones[key].map((item, index) => (
                              <Draggable 
                                key={item.id} 
                                draggableId={item.id} 
                                index={index}
                              >
                                {(provided) => (
                                  <NegociacionCard
                                    id={item.id}
                                    cliente={item.cliente}
                                    monto={item.monto}
                                    provided={provided}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                  />
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </div>
            </DragDropContext>
          </div>
        </main>
      </div>
    </div>
  );
}
