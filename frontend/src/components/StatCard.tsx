'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // e.g., 'bg-[#3b82f6]'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-[#1e293b] overflow-hidden rounded-xl p-4 shadow-sm">
      <div className="flex items-center">
        <div className={`${colorClass} rounded-xl p-3 mr-4`}>
          {icon}
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : value}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 