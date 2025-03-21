'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface NegociacionItem {
  id: string;
  cliente: string;
  monto: string;
}

interface EstadosNegociacion {
  [key: string]: NegociacionItem[];
}

export default function Home() {
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

  // State for client count
  const [clientCount, setClientCount] = useState<number>(0);
  const [negotiationCount, setNegotiationCount] = useState<number>(0);

  // Fetch the client count from the backend API
  const fetchClientCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clientes/count');
      const data = await response.json();
      setClientCount(data.totalClientes);
    } catch (error) {
      console.error('Error fetching client count:', error);
    }
  };

  const fetchNegotiationCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/negociaciones/count');
      const data = await response.json();
      setNegotiationCount(data.totalNegociacion);
    } catch (error) {
      console.error('Error fetching negotiation count:', error);
    }
  };

  // Fetch client count when the component mounts
  useEffect(() => {
    fetchClientCount();
  }, []);

  useEffect(() => {
    fetchNegotiationCount();
  }, []);

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

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
        </header>

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clientes</h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{clientCount}</span>
                </div>
              </div>
              <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Negociaciones</h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{negotiationCount}</span>
                </div>
              </div>
              <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Comisiones</h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</span>
                </div>
              </div>
              <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendedores</h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
                </div>
              </div>
            </div>

            {/* Recent Activities & Tasks */}
            {/* Recent Clients Table */}
            <div className="mt-8">
              <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white text-center">Clientes Recientes</h2>
                </div>
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                          Cliente
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Correo
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                          Vendedor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Replace with dynamic rows */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">
                          Juan Pérez
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          juan.perez@email.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          +52 555-123-4567
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          Ana García
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
