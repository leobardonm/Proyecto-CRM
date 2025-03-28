'use client';

import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      if (!isAdmin) {
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    };

    // Small delay to ensure admin state is loaded from localStorage
    const timer = setTimeout(checkAdmin, 100);
    return () => clearTimeout(timer);
  }, [isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
}
