'use client';

import { useAdmin } from '@/context/AdminContext';
import { IoGameControllerOutline } from 'react-icons/io5';
import { useState } from 'react';

export default function JuegoPage() {
  const { isAdmin } = useAdmin();
  const [gameLoaded, setGameLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
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
                    src="http://localhost:61214/"
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