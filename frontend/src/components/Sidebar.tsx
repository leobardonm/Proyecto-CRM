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
    <aside className={`${isOpen ? 'w-64' : ''} transition-width duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold text-gray-900 dark:text-white">Easy CRM</h1>}
        <button onClick={onToggle} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <FiMenu className={`w-6 h-6 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <nav className="mt-2">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => (
            (!item.adminOnly || isAdmin) && (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <item.icon className="w-5 h-5" />
                {isOpen && <span className="ml-3">{item.label}</span>}
              </a>
            )
          ))}
        </div>
      </nav>
    </aside>
  );
}