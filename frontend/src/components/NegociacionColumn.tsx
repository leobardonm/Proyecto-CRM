'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import NegociacionCard from './NegociacionCard';
import { Cliente, Vendedor, Producto, Negociacion, FormNegociacionData } from '../types/negociaciones'; // Assuming types are moved

interface NegociacionColumnProps {
  droppableId: string;
  title: string;
  icon: React.ReactNode;
  negociacionesList: Negociacion[];
  columnColorClasses: {
    bgGradient: string; // e.g., 'from-white to-blue-50 dark:from-gray-800 dark:to-gray-900'
    border: string; // e.g., 'border-blue-100 dark:border-blue-900'
    headerBg: string; // e.g., 'bg-blue-50/50 dark:bg-blue-900/50'
    headerBorder: string; // e.g., 'border-blue-200 dark:border-blue-800'
    headerText: string; // e.g., 'text-blue-900 dark:text-blue-100'
  };
  onEdit: (id: string, data: FormNegociacionData) => void;
  onDelete: (id: number) => void;
  clientes: Cliente[];
  vendedores: Vendedor[];
  productosDisponibles: Producto[];
}

const NegociacionColumn: React.FC<NegociacionColumnProps> = ({
  droppableId,
  title,
  icon,
  negociacionesList,
  columnColorClasses,
  onEdit,
  onDelete,
  clientes,
  vendedores,
  productosDisponibles,
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${columnColorClasses.bgGradient} rounded-lg shadow-lg border ${columnColorClasses.border} overflow-hidden`}
    >
      <div className={`p-4 border-b ${columnColorClasses.headerBorder} ${columnColorClasses.headerBg}`}>
        <h2 className={`text-lg font-medium ${columnColorClasses.headerText} flex items-center gap-2`}>
          {icon}
          {title}
        </h2>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-6 space-y-6 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
          >
            {negociacionesList.map((negociacion, index) => (
              <Draggable
                key={negociacion.uniqueId || negociacion.IDNegociacion}
                draggableId={negociacion.uniqueId || negociacion.IDNegociacion.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-4"
                  >
                    <NegociacionCard
                      id={negociacion.IDNegociacion.toString()}
                      cliente={negociacion.ClienteNombre}
                      vendedor={negociacion.VendedorNombre}
                      productos={negociacion.Productos || []}
                      total={negociacion.Total}
                      comision={negociacion.Comision}
                      onEdit={onEdit}
                      onDelete={(id) => onDelete(parseInt(id))}
                      clientes={clientes}
                      vendedores={vendedores}
                      productosDisponibles={productosDisponibles}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default NegociacionColumn; 