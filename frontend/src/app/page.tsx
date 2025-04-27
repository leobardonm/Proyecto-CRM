'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import AIAssistantButton from '@/components/AIAssistantButton';
import AdminMode from '@/components/AdminMode';
import Header from '@/components/Header';
import { useAdmin } from '@/context/AdminContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

interface Negociacion {
  Id: number;
  Total: number;
  Estado: number;
  FechaFin: string;
}

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  tension?: number;
}

interface LineChartDataset extends ChartDataset {
  fill?: boolean;
}

interface BarChartDataset extends ChartDataset {
  borderRadius?: number;
}

interface PieChartDataset extends ChartDataset {
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

interface BarChartData {
  labels: string[];
  datasets: BarChartDataset[];
}

interface PieChartData {
  labels: string[];
  datasets: PieChartDataset[];
}

export default function Home() {
  const { isAdmin, currentUser } = useAdmin();
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
  const [salesData, setSalesData] = useState<LineChartData>({
    labels: [],
    datasets: [{
      label: 'Ventas Completadas',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.1,
      fill: true
    }]
  });

  // Add new state for product count
  const [productCount, setProductCount] = useState<number>(0);

  const [ventasMes, setVentasMes] = useState<number>(0);

  // Add new state for additional charts
  const [statusData, setStatusData] = useState<PieChartData>({
    labels: ['En Proceso', 'Terminada', 'Cancelada'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#3b82f6', '#22c55e', '#ef4444'],
      borderWidth: 0
    }]
  });

  const [topProductsData, setTopProductsData] = useState<BarChartData>({
    labels: [],
    datasets: [{
      label: 'Ventas por Producto',
      data: [],
      backgroundColor: '#3b82f6',
      borderRadius: 6
    }]
  });

  const [vendorPerformanceData, setVendorPerformanceData] = useState<BarChartData>({
    labels: [],
    datasets: [{
      label: 'Ventas por Vendedor',
      data: [],
      backgroundColor: '#22c55e',
      borderRadius: 6
    }]
  });

  // Add new state for commission chart
  const [commissionData, setCommissionData] = useState<LineChartData>({
    labels: [],
    datasets: [{
      label: 'Comisiones',
      data: [],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.5)',
      tension: 0.1,
      fill: true
    }]
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>({
    negociaciones: [],
    clientes: [],
    vendedores: [],
    productos: []
  });

  // Combine all fetch calls into one function
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [negociacionesRes, clientesRes, vendedoresRes, productosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/negociaciones`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedores`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`)
      ]);

      const [negociaciones, clientes, vendedores, productos] = await Promise.all([
        negociacionesRes.json(),
        clientesRes.json(),
        vendedoresRes.json(),
        productosRes.json()
      ]);

      setData({
        negociaciones,
        clientes,
        vendedores,
        productos
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays as fallback
      setData({
        negociaciones: [],
        clientes: [],
        vendedores: [],
        productos: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use useMemo to cache computed values
  const filteredNegociaciones = useMemo(() => {
    if (!data || !data.negociaciones) {
      return {
        all: [],
        completed: [],
        inProcess: [],
        canceled: []
      };
    }
    
    const negociacionesArray = Array.isArray(data.negociaciones) ? data.negociaciones : [];
    const relevantNegociaciones = !isAdmin
      ? negociacionesArray.filter((n: any) => n.IdVendedor === currentUser)
      : negociacionesArray;
    return {
      all: relevantNegociaciones,
      completed: relevantNegociaciones.filter((n: any) => n.Estado === 3),
      inProcess: relevantNegociaciones.filter((n: any) => n.Estado === 2),
      canceled: relevantNegociaciones.filter((n: any) => n.Estado === 1)
    };
  }, [data, isAdmin, currentUser]);

  // Update all data processing functions to use the cached data
  const processChartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12;
      labels.push(months[monthIndex]);
    }

    // Process sales data
    const salesByMonth: { [key: string]: number } = {};
    const commissionsByMonth: { [key: string]: number } = {};
    
    filteredNegociaciones.completed.forEach((sale: any) => {
      const date = new Date(sale.FechaFin);
      const monthKey = months[date.getMonth()];
      salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + sale.Total;
      commissionsByMonth[monthKey] = (commissionsByMonth[monthKey] || 0) + (sale.Comision || 0);
    });

    const salesData = {
      labels,
      datasets: [{
        label: 'Ventas Completadas',
        data: labels.map(month => salesByMonth[month] || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: true
      }]
    };

    const commissionData = {
      labels,
      datasets: [{
        label: 'Comisiones',
        data: labels.map(month => commissionsByMonth[month] || 0),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0.1,
        fill: true
      }]
    };

    // Process status distribution data
    const statusData = {
      labels: ['En Proceso', 'Terminada', 'Cancelada'],
      datasets: [{
        data: [
          filteredNegociaciones.inProcess.length,
          filteredNegociaciones.completed.length,
          filteredNegociaciones.canceled.length
        ],
        backgroundColor: ['#3b82f6', '#22c55e', '#ef4444'],
        borderWidth: 0
      }]
    };

    // Process top products data
    const productSales: { [key: string]: number } = {};
    filteredNegociaciones.completed.forEach((neg: any) => {
      if (neg.Productos && Array.isArray(neg.Productos)) {
        neg.Productos.forEach((prod: any) => {
          const product = data.productos.find((p: any) => p.IDProducto === prod.IDProducto);
          if (product) {
            const total = prod.Cantidad * prod.PrecioUnitario;
            productSales[product.Descripcion] = (productSales[product.Descripcion] || 0) + total;
          }
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Array of distinct colors for products
    const productColors = [
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f97316', // Orange
      '#8b5cf6', // Violet
    ];

    const topProductsData = {
      labels: topProducts.map(([name]) => name),
      datasets: [{
        label: 'Ventas por Producto',
        data: topProducts.map(([,value]) => value),
        backgroundColor: topProducts.map((_, index) => productColors[index % productColors.length]),
        borderRadius: 6
      }]
    };

    // Process vendor performance data
    const vendorSales: { [key: string]: number } = {};
    if (isAdmin) {
      data.negociaciones
        .filter((neg: any) => neg.Estado === 3)
        .forEach((neg: any) => {
          const vendor = data.vendedores.find((v: any) => v.Id === neg.IdVendedor);
          if (vendor) {
            vendorSales[vendor.Nombre] = (vendorSales[vendor.Nombre] || 0) + neg.Total;
          }
        });
    }

    // Array de colores para los vendedores
    const vendorColors = [
      '#3b82f6', // Azul
      '#22c55e', // Verde
      '#ef4444', // Rojo
      '#f59e0b', // Amarillo
      '#8b5cf6', // Púrpura
      '#ec4899', // Rosa
      '#14b8a6', // Turquesa
      '#f97316', // Naranja
      '#6366f1', // Índigo
      '#10b981', // Esmeralda
    ];

    const vendorPerformanceData = {
      labels: Object.keys(vendorSales),
      datasets: [{
        label: 'Ventas por Vendedor',
        data: Object.values(vendorSales),
        backgroundColor: Object.keys(vendorSales).map((_, index) => vendorColors[index % vendorColors.length]),
        borderRadius: 6
      }]
    };

    return {
      salesData,
      commissionData,
      statusData,
      topProductsData,
      vendorPerformanceData,
      clientCount: !isAdmin 
        ? new Set(filteredNegociaciones.all.map((n: any) => n.IdCliente)).size
        : data.clientes.length,
      negotiationCount: filteredNegociaciones.all.length,
      vendorCount: data.vendedores.length,
      productCount: data.productos.length,
      ventasMes: filteredNegociaciones.completed
        .filter((sale: any) => {
          const saleDate = new Date(sale.FechaFin);
          const today = new Date();
          return saleDate.getMonth() === today.getMonth() && 
                 saleDate.getFullYear() === today.getFullYear();
        })
        .reduce((total: number, sale: any) => total + sale.Total, 0)
    };
  }, [data, filteredNegociaciones, isAdmin]);

  // Update state setters to use processed data
  useEffect(() => {
    setSalesData(processChartData.salesData);
    setCommissionData(processChartData.commissionData);
    setStatusData(processChartData.statusData);
    setTopProductsData(processChartData.topProductsData);
    setVendorPerformanceData(processChartData.vendorPerformanceData);
    setClientCount(processChartData.clientCount);
    setNegotiationCount(processChartData.negotiationCount);
    setVendorCount(processChartData.vendorCount);
    setProductCount(processChartData.productCount);
    setVentasMes(processChartData.ventasMes);
  }, [processChartData]);

  // Fetch data on component mount and when admin/user changes
  useEffect(() => {
    fetchAllData();
  }, [isAdmin, currentUser]);

  // Update chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(75, 85, 99)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Ventas Completadas por Mes',
        color: 'rgb(75, 85, 99)',
        font: {
          size: 14,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)',
          callback: function(this: any, tickValue: number | string) {
            return '$' + Number(tickValue).toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(75, 85, 99)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Negociaciones',
        color: 'rgb(75, 85, 99)',
        font: {
          size: 14,
          weight: 'normal' as const
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(75, 85, 99)',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)',
          callback: function(this: any, tickValue: number | string) {
            return '$' + Number(tickValue).toLocaleString('es-MX');
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)'
        }
      }
    }
  };

  // Utility function to check if a response is JSON
  const isJSON = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('application/json');
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

  // Add commission chart options
  const commissionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(75, 85, 99)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Comisiones por Mes',
        color: 'rgb(75, 85, 99)',
        font: {
          size: 14,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)',
          callback: function(this: any, tickValue: number | string) {
            return '$' + Number(tickValue).toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: 'rgb(75, 85, 99)'
        }
      }
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
        <Header title="Dashboard" />

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
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
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${ventasMes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
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

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Sales Trend Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Tendencia de Ventas</h3>
                    <div className="h-80">
                      <Line options={chartOptions} data={salesData} />
                    </div>
                  </div>

                  {/* Commission Trend Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Tendencia de Comisiones</h3>
                    <div className="h-80">
                      <Line options={commissionChartOptions} data={commissionData} />
                    </div>
                  </div>

                  {/* Status Distribution Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Estado de Negociaciones</h3>
                    <div className="h-80">
                      <Pie options={pieOptions} data={statusData} />
                    </div>
                  </div>

                  {/* Top Products Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Top 5 Productos</h3>
                    <div className="h-80">
                      <Bar options={barOptions} data={topProductsData} />
                    </div>
                  </div>

                  {/* Vendor Performance Chart (only shown in admin mode) */}
                  {isAdmin && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Desempeño de Vendedores</h3>
                      <div className="h-80">
                        <Bar options={barOptions} data={vendorPerformanceData} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* AI Assistant Button */}
      <AIAssistantButton />
    </div>
  );
}