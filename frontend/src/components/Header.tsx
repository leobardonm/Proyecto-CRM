'use client';

import { useAdmin } from '@/context/AdminContext';
import VendedorSelector from './VendedorSelector';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { isAdmin } = useAdmin();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          {!isAdmin && <VendedorSelector />}
        </div>
      </div>
    </header>
  );
} 