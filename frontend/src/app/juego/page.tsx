'use client';
import { useEffect, useState } from 'react';
import { IoGameControllerOutline } from "react-icons/io5";
import Sidebar from '@/components/Sidebar';
import AdminProtected from '@/components/AdminProtected';
import AdminMode from '@/components/AdminMode';

export default function JuegoPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <AdminProtected>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <AdminMode />
            <div className="flex-1">
              <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Juego
                  </h1>
                </div>
              </header>
            </div>
          </div>
        </AdminProtected>
    );
}
