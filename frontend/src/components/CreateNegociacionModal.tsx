'use client';

import React from 'react';
import NegociacionCard from './NegociacionCard';
import { Cliente, Vendedor, Producto, FormNegociacionData, ProductoNegociacion } from '../types/negociaciones'; // Assuming types are moved

interface CreateNegociacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormNegociacionData) => void;
  clientes: Cliente[];
  vendedores: Vendedor[];
  productosDisponibles: Producto[];
}

const CreateNegociacionModal: React.FC<CreateNegociacionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientes,
  vendedores,
  productosDisponibles,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (id: string, data: {
    cliente: string;
    vendedor: string;
    productos: ProductoNegociacion[];
    total: number;
    comision: number;
  }) => {
    // The id will be 'new' here, we don't need it for creation
    const formData: FormNegociacionData = {
      ...data,
      productos: data.productos.map(p => ({
        IDProducto: p.IDProducto,
        Cantidad: p.Cantidad,
        PrecioUnitario: p.PrecioUnitario,
        Subtotal: p.Subtotal,
        Descripcion: p.Descripcion // Ensure Description is passed
      }))
    };
    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal if backdrop is clicked
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nueva Negociación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Use NegociacionCard for the form content */}
        <NegociacionCard
          id="new" // Special ID for creation mode
          cliente=""
          vendedor="" // Let NegociacionCard handle default vendedor if needed
          productos={[]}
          total={0}
          comision={0}
          onEdit={handleSubmit} // Use onEdit to trigger submit logic
          onDelete={onClose} // Use onDelete as the cancel/close action for the modal
          clientes={clientes}
          vendedores={vendedores}
          productosDisponibles={productosDisponibles}
        />
      </div>
    </div>
  );
};

export default CreateNegociacionModal; 