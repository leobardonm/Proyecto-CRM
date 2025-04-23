'use client';

import { useAdmin } from '@/context/AdminContext';
import { useDatabase } from '@/context/DatabaseContext';
import { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
  Telefono: string;
  EmpresaNombre: string;
}

export default function CurrentVendorInfo() {
  const { isAdmin, currentUser } = useAdmin();
  const { getVendors } = useDatabase();
  const [currentVendor, setCurrentVendor] = useState<Vendedor | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (!isAdmin && currentUser) {
        try {
          const vendors = await getVendors();
          if (!Array.isArray(vendors)) {
            setError('Invalid vendor data received');
            setCurrentVendor(null);
            return;
          }
          const vendor = vendors.find(v => v.Id === currentUser);
          if (!vendor) {
            setError('Current vendor not found');
            setCurrentVendor(null);
            return;
          }
          setError(null);
          setCurrentVendor(vendor);
        } catch (err) {
          console.error('Error fetching vendor info:', err);
          setError('Error loading vendor information');
          setCurrentVendor(null);
        }
      }
    };

    fetchVendorInfo();
    setIsMounted(true);
  }, [isAdmin, currentUser, getVendors]);

  if (!isMounted || isAdmin || !currentVendor) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
      <FiUser className="w-4 h-4" />
      <span>Vendedor actual: {currentVendor.Nombre} - {currentVendor.EmpresaNombre}</span>
      {error && <span className="text-red-500 ml-2">{error}</span>}
    </div>
  );
} 