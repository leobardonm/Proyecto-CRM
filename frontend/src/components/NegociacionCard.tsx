import { DraggableProvided } from '@hello-pangea/dnd';

interface NegociacionCardProps {
  id: string;
  cliente: string;
  monto: string;
  provided: DraggableProvided;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NegociacionCard({ 
  id, 
  cliente, 
  monto, 
  provided,
  onEdit,
  onDelete 
}: NegociacionCardProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm rounded-border border-gray-200 dark:border-gray-600"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {cliente}
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(id)}
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
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Monto: {monto}
      </p>
    </div>
  );
} 