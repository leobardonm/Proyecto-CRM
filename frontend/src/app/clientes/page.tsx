'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AIAssistantButton from '@/components/AIAssistantButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  // State for client count and sales data
  const [clientCount, setClientCount] = useState<number>(0);
  const [negotiationCount, setNegotiationCount] = useState<number>(0);
  const [salesData, setSalesData] = useState({
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas Completadas',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas Completadas por Mes',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(this: any, tickValue: number | string) {
            return '$' + Number(tickValue).toLocaleString();
          }
        }
      }
    }
  };

  // Fetch the client count from the backend API
  const fetchClientCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/clientes/count');
      const data = await response.json();
      setClientCount(data.totalClientes);
    } catch (error) {
      console.error('Error fetching client count:', error);
    }
  };

  const fetchNegotiationCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/negociaciones/count');
      const data = await response.json();
      setNegotiationCount(data.totalNegociacion);
    } catch (error) {
      console.error('Error fetching negotiation count:', error);
    }
  };

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/ventas/mensuales');
      const data = await response.json();
      setSalesData({
        labels: data.meses,
        datasets: [
          {
            label: 'Ventas Completadas',
            data: data.ventas,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // Fetch client count when the component mounts
  useEffect(() => {
    fetchClientCount();
    fetchNegotiationCount();
    fetchSalesData();
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
              <Link href="/clientes" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clientes</h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{clientCount}</span>
                  </div>
                </div>
              </Link>
              <Link href="/negociaciones" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Negociaciones</h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{negotiationCount}</span>
                  </div>
                </div>
              </Link>
              <Link href="/productos" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas del mes</h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</span>
                  </div>
                </div>
              </Link>
              <Link href="/vendedores" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendedores</h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Sales Chart */}
            <div className="mt-8">
              <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800">
                <Line options={chartOptions} data={salesData} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant Button */}
      <AIAssistantButton />
    </div>
  );
}