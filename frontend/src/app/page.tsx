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
        setVendorCount(data.totalVendedores.length);
      } else {
        console.error('Invalid JSON response for vendor count');
      }
    } catch (error) {
      console.error('Error fetching vendor count:', error);
    }
  };

  // Fetch client count when the component mounts
  useEffect(() => {
    fetchClientCount();
    fetchNegotiationCount();
    fetchSalesData();
    fetchVendorCount();
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
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 490.01 490.01" 
                      fill="currentColor"
                    >
                      <g>
                        <g>
                          <rect 
                            transform="matrix(0.3244 -0.9459 0.9459 0.3244 -125.6895 185.1588)" 
                            x="-14.319" 
                            y="147.421" 
                            width="162.194" 
                            height="66.298" 
                            fill="#A7A9AC" 
                          />
                          <path d="M169.994,106.097l-6.1,3c-7.6,3.7-16.5,4.2-24.4,1.4l-10.2-3.6c-0.6-0.4-1.2-0.7-1.8-0.9l-62.8-21.5c-4.7-1.6-9.9,0.9-11.5,5.6l-52.7,153.5c-0.8,2.3-0.6,4.8,0.4,6.9s2.9,3.8,5.2,4.6l62.7,21.5c1,0.3,2,0.5,2.9,0.5c3.8,0,7.3-2.4,8.6-6.1l49.7-144.6l3.4,1.2c12.5,4.4,26.5,3.6,38.5-2.2l6.1-3c7.5-3.7,16.3-4.2,24.2-1.5l115.3,39.7c-1.2,4.8-3.6,10.5-8,13.6c-4.9,3.4-12.2,3.4-21.8,0.1l-51.4-17.6c-2.4-0.8-5-0.6-7.2,0.6c-2.2,1.2-3.8,3.3-4.5,5.7c-0.1,0.3-7.2,26.9-29.9,39.1c-14.3,7.7-32.1,8-53,0.9c-4.7-1.6-9.9,0.9-11.5,5.6c-1.6,4.7,0.9,9.9,5.6,11.5c12,4.1,23.3,6.2,33.8,6.2c12.2,0,23.4-2.7,33.6-8.2c20.3-10.9,30.8-30,35.6-41.4l42.9,14.7c15.3,5.3,28.1,4.5,38-2.4c15.9-11,16.7-33.3,16.8-34.3c0.1-4-2.4-7.5-6.1-8.8l-122.4-42.2C195.694,99.497,181.794,100.397,169.994,106.097z M66.194,256.497l-45.6-15.6l46.7-136.3l45.6,15.6L66.194,256.497z"/>
                          <rect 
                            transform="matrix(-0.4395 -0.8982 0.8982 -0.4395 434.9314 634.4379)" 
                            x="334.311" 
                            y="148.377" 
                            width="162.188" 
                            height="66.294" 
                            fill="#3C92CA" 
                          />
                          <path d="M410.194,266.797l-21.5,19.8c-19.5,17.9-41.5,33-65.3,44.6l-114.1,55.8c-5,2.5-11.1,0.4-13.6-4.7c-2.5-5-0.4-11.1,4.7-13.6l1.4-0.7l0,0l62.4-30.5c4.5-2.2,6.4-7.6,4.2-12.1c-2.2-4.5-7.6-6.4-12.1-4.2l-62.4,30.5l0,0l-31.4,15.4c-5,2.5-11.1,0.4-13.6-4.7c-1.2-2.4-1.4-5.2-0.5-7.7c0.9-2.6,2.7-4.6,5.1-5.8l23.7-11.6l0,0l67.8-33.2c4.5-2.2,6.4-7.6,4.2-12.1s-7.6-6.4-12.1-4.2l-67.9,33.3l0,0l-2.6,1.3l-32.4,15.9c-2.4,1.2-5.2,1.4-7.7,0.5c-2.6-0.9-4.6-2.7-5.8-5.1c-2.5-5-0.4-11.1,4.7-13.6l11.2-5.5l0,0l22.9-11.2l6.4-3.1l0,0l52.6-25.8c4.5-2.2,6.4-7.6,4.2-12.1s-7.6-6.4-12.1-4.2l-57,27.9l-24.9,12.2c-5,2.4-11.1,0.4-13.6-4.7c-1.2-2.4-1.4-5.2-0.5-7.7c0.9-2.6,2.7-4.6,5.1-5.8l43.5-21.3c4.5-2.2,6.4-7.6,4.2-12.1s-7.6-6.4-12.1-4.2l-43.5,21.3c-6.8,3.3-11.9,9.1-14.3,16.2s-2,14.8,1.3,21.6c2.1,4.2,5.1,7.7,8.7,10.3c-6.3,8.3-7.9,19.7-3,29.7c3.3,6.8,9.1,11.9,16.2,14.3c3,1,6,1.5,9,1.5c-0.1,4.5,0.8,9,2.9,13.1c4.9,10,15,15.8,25.4,15.8c4.2,0,8.4-0.9,12.4-2.9l6.4-3.1c0.3,3.4,1.2,6.7,2.7,9.9c4.9,10,15,15.8,25.4,15.8c4.2,0,8.4-0.9,12.4-2.9l114.1-55.8c25.4-12.4,48.8-28.4,69.6-47.5l25.5-23.5l58.4-28.6c4.5-2.2,6.4-7.6,4.2-12.1l-71.4-145.5c-1.1-2.2-2.9-3.8-5.2-4.6c-2.3-0.8-4.8-0.6-6.9,0.4l-59.6,29.1c-4.5,2.2-6.4,7.6-4.2,12.1L410.194,266.797z M405.394,106.197l63.3,129.5l-43.3,21.2l-63.3-129.5L405.394,106.197z"/>
                        </g>
                      </g>
                    </svg>

                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Negociaciones</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{negotiationCount}</span>
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
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendedores</h3>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
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