'use client';
import { useEffect, useState } from 'react';
import { IoGameControllerOutline } from "react-icons/io5";
import Sidebar from '@/components/Sidebar';
import AdminMode from '@/components/AdminMode';
import { useAdmin } from '@/context/AdminContext';

export default function JuegoPage() {
  const { isAdmin } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            {/* Add your game content here */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="text-center">
                <IoGameControllerOutline className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Juego de Ventas
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isAdmin 
                    ? "Modo administrador" 
                    : "Modo usuario"}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
