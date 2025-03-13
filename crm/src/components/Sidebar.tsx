'use client';
import { useState } from 'react';
import { 
  FiUsers, 
  FiUserCheck,
  FiDollarSign,
  FiCheckCircle,
  FiChevronLeft,
  FiHome, 
  FiUser,
  FiEdit2,
  FiMenu,
  FiBook
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <aside className={`${isOpen ? 'w-64' : ''} transition-width duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Easy CRM</h1>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiMenu
            className={`w-6 h-6 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
      <nav className="mt-2">
        <div className="px-3 space-y-1">
          <a href="/" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <FiHome className="w-5 h-5" />
            {isOpen && <span className="ml-3">Home</span>}
          </a>
          <a href="/clientes" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <FiUser className="w-5 h-5" />
            {isOpen && <span className="ml-3">Clientes</span>}
          </a>
          <a href="/vendedores" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <FiUserCheck className="w-5 h-5" />
            {isOpen && <span className="ml-3">Vendedores</span>}
          </a>
          <a href="/negociaciones" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <FiDollarSign className="w-5 h-5" />
            {isOpen && <span className="ml-3">Negociaciones</span>}
          </a>
          <a href="/productos" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <FiBook className="w-5 h-5" />
            {isOpen && <span className="ml-3">Productos</span>}
          </a>
        </div>
      </nav>
    </aside>
  );
}