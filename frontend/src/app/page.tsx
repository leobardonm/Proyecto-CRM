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
  const [vendorCount, setVendorCount] = useState<number>(0);
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

  // Add new state for product count
  const [productCount, setProductCount] = useState<number>(0);

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

  // Utility function to check if a response is JSON
  const isJSON = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return true;
    }
    return false;
  };

  // Fetch the client count from the backend API
  const fetchClientCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/clientes');
      if (await isJSON(response)) {
        const data = await response.json();
        setClientCount(data.length);
      } else {
        console.error('Invalid JSON response for client count');
      }
    } catch (error) {
      console.error('Error fetching client count:', error);
    }
  };

  const fetchNegotiationCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/negociaciones');
      if (await isJSON(response)) {
        const data = await response.json();
        setNegotiationCount(data.length);
      } else {
        console.error('Invalid JSON response for negotiation count');
      }
    } catch (error) {
      console.error('Error fetching negotiation count:', error);
    }
  };

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/negociaciones');
      if (await isJSON(response)) {
        const data = await response.json();
        
        // Filtrar solo las negociaciones completadas (Estado = 3)
        const completedSales = data.filter((n: any) => n.Estado === 3);
        
        // Agrupar por mes
        const monthlySales = completedSales.reduce((acc: { [key: string]: number }, sale: any) => {
          const date = new Date(sale.FechaFin);
          const month = date.toLocaleString('es-ES', { month: 'short' });
          const amount = sale.Total;
          
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += amount;
          return acc;
        }, {});

        // Convertir a formato para el gráfico
        const months = Object.keys(monthlySales);
        const sales = Object.values(monthlySales) as number[];

        setSalesData({
          labels: months,
          datasets: [
            {
              label: 'Ventas Completadas',
              data: sales,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } else {
        console.error('Invalid JSON response for sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // Fetch vendedores count
  const fetchVendorCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/vendedores');
      if (await isJSON(response)) {
        const data = await response.json();
        setVendorCount(data.length);
      } else {
        console.error('Invalid JSON response for vendor count');
      }
    } catch (error) {
      console.error('Error fetching vendor count:', error);
    }
  };

  // Add new function to fetch product count
  const fetchProductCount = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/productos');
      if (await isJSON(response)) {
        const data = await response.json();
        setProductCount(data.length);
      } else {
        console.error('Invalid JSON response for product count');
      }
    } catch (error) {
      console.error('Error fetching product count:', error);
    }
  };

  // Update useEffect to include product count
  useEffect(() => {
    fetchClientCount();
    fetchNegotiationCount();
    fetchSalesData();
    fetchVendorCount();
    fetchProductCount();
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
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <svg 
                        className="w-6 h-6 text-blue-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clientes</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{clientCount}</span>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/negociaciones" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <svg 
                        className="w-6 h-6 text-green-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas del mes</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</span>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/productos" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <svg 
                        className="w-6 h-6 text-purple-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Productos</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{productCount}</span>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/vendedores" className="block">
                <div className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <svg 
                        className="w-6 h-6 text-orange-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendedores</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{vendorCount}</span>
                    </div>
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