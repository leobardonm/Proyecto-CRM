'use client';
import { useEffect, useState } from 'react';
import { IoGameControllerOutline } from "react-icons/io5";
import Sidebar from '@/components/Sidebar';
import AdminMode from '@/components/AdminMode';
import { useAdmin } from '@/context/AdminContext';

export default function JuegoPage() {
  const { isAdmin } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Juego
            </h1>
          </div>
        </header>

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-4">
                  <IoGameControllerOutline className="mx-auto h-12 w-12 text-gray-400" />
                  <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    Juego de Ventas
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isAdmin ? "México, administrador" : "México, usuario"}
                  </p>
                </div>

                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {!gameLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <div className="animate-pulse text-gray-400">Cargando juego...</div>
                    </div>
                  )}
                  <iframe 
                    frameBorder="0" 
                    src="https://itch.io/embed/3514349" 
                    width="552" 
                    height="167"
                    onLoad={() => setGameLoaded(true)}
                    className="absolute inset-0 w-full h-full"
                  >
                    <a href="https://monserratinfante.itch.io/dealmarketfinal">DealMarketFinal by Monserratinfante</a>
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
