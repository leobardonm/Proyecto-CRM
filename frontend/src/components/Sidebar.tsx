'use client';

import { useAdmin } from '@/context/AdminContext';
import { FiHome, FiUser, FiUserCheck, FiDollarSign, FiBook, FiMenu } from 'react-icons/fi';
import { IoGameControllerOutline } from "react-icons/io5";


interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { isAdmin } = useAdmin();

  const menuItems = [
    {
      href: '/',
      icon: FiHome,
      label: 'Home',
      adminOnly: false
    },
    {
      href: '/clientes',
      icon: FiUser,
      label: 'Clientes',
      adminOnly: true
    },
    {
      href: '/vendedores',
      icon: FiUserCheck,
      label: 'Vendedores',
      adminOnly: true
    },
    {
      href: '/negociaciones',
      icon: FiDollarSign,
      label: 'Negociaciones',
      adminOnly: false
    },
    {
      href: '/productos',
      icon: FiBook,
      label: 'Productos',
      adminOnly: true // Changed from false to true
    },
    {
      href: '/juego',
      icon: IoGameControllerOutline,
      label: 'Juegos',
      adminOnly: false // Changed from false to true
    }
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} min-h-screen fixed left-0 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ease-in-out`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Easy CRM
          </h1>
        )}
        <div className="relative group">
          <button 
            onClick={onToggle} 
            className="p-1.5 rounded-lg transition-all duration-200 relative z-10 group-hover:scale-125"
          >
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200" />
            <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
          </button>
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-sm" />
        </div>
      </div>
      
      <nav className="mt-2 flex-1">
        <div className="px-3 flex flex-col h-[calc(100vh-5rem)]">
          {menuItems.map((item) => (
            (!item.adminOnly || isAdmin) && (
              <a
                key={item.href}
                href={item.href}
                className="relative flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 rounded-md group overflow-hidden
                         transition-all duration-200 ease-out hover:py-4 mb-1 hover:mb-4"
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/5 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                
                {/* Icon container */}
                <div className="relative flex items-center justify-center transition-all duration-200 ease-out group-hover:scale-125
                             group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
                  <item.icon className="w-5 h-5 relative z-10" />
                </div>

                {/* Label with gradient effect */}
                {isOpen && (
                  <div className="relative ml-3 transition-transform duration-200 ease-out group-hover:scale-105">
                    <span className="relative z-10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {item.label}
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 
                                group-hover:w-full transition-all duration-300" />
                  </div>
                )}

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300
                             bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-sm" />
              </a>
            )
          ))}
        </div>
      </nav>
    </aside>
  );
}