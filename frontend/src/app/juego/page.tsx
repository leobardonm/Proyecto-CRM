'use client';

import { useAdmin } from '@/context/AdminContext';
import { IoGameControllerOutline } from 'react-icons/io5';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AdminMode from '@/components/AdminMode';

export default function JuegoPage() {
  const { isAdmin } = useAdmin();
  const [gameLoaded, setGameLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <AdminMode />
        <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Juego de Ventas
              </h1>
            </div>
          </header>

          <main className="flex-1 pb-16">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                      src="https://itch.io/embed/3514349/"
                      className="absolute top-0 left-0 w-full h-full border-0"
                      allow="autoplay; fullscreen"
                      title="Juego de Ventas"
                      onLoad={() => setGameLoaded(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
    </div>
  );
}


