import { DraggableProvided } from '@hello-pangea/dnd';
import { useState } from 'react';

interface NegociacionCardProps {
  id: string;
  cliente: string;
  monto: string;
  provided: DraggableProvided;
  onEdit: (id: string, data: { cliente: string; monto: string }) => void;
  onDelete: (id: string) => void;
}

export default function NegociacionCard({ 
  id, 
  cliente: initialCliente, 
  monto: initialMonto, 
  provided,
  onEdit,
  onDelete 
}: NegociacionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cliente, setCliente] = useState(initialCliente);
  const [monto, setMonto] = useState(initialMonto);

  const handleSave = () => {
    onEdit(id, { cliente, monto });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCliente(initialCliente);
    setMonto(initialMonto);
    setIsEditing(false);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm rounded-border border-gray-200 dark:border-gray-600"
    >
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
        ) : (
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {cliente}
          </p>
        )}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => onDelete(id)}
                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
        />
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Monto: {monto}
        </p>
      )}
    </div>
  );
} 