'use client';

import { useAdmin } from '@/context/AdminContext';
import { useEffect, useState } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';

export default function AdminMode() {
  const { isAdmin } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 transition-all duration-300 ease-in-out flex items-center space-x-2 z-[100]">
      <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-sm border border-gray-200/20 rounded-full shadow-sm">
        {isAdmin ? (
          <FiUnlock className="w-4 h-4 text-blue-500 transition-all duration-300" />
        ) : (
          <FiLock className="w-4 h-4 text-gray-400 transition-all duration-300" />
        )}
      </div>

      {isAdmin && (
        <button className="text-sm px-3 py-1 bg-green-700 text-white rounded-md shadow-md hover:bg-green-800 transition">
          Admin mode
        </button>
      )}
    </div>
  );
}