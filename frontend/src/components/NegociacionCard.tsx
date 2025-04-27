import React, { useState, useEffect } from 'react';
import { DraggableProvided } from '@hello-pangea/dnd';
import { useAdmin } from '@/context/AdminContext';
import { DeleteButton } from './DeleteButton';

interface Producto {
  IDProducto: number;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

interface Cliente {
  Id: number;
  Nombre: string;
  Email: string;
}

interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
}

interface ProductoNegociacion {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

interface NegociacionCardProps {
  id: string;
  cliente: string;
  vendedor: string;
  productos: ProductoNegociacion[];
  total: number;
  comision: number;
  provided?: DraggableProvided;
  onEdit?: (id: string, data: {
    cliente: string;
    vendedor: string;
    productos: ProductoNegociacion[];
    total: number;
    comision: number;
  }) => void;
  onDelete?: (id: string) => void;
  clientes?: Cliente[];
  vendedores?: Vendedor[];
  productosDisponibles?: Producto[];
}

const NegociacionCard: React.FC<NegociacionCardProps> = ({
  id,
  cliente: initialCliente,
  vendedor: initialVendedor,
  productos: initialProductos = [],
  total: initialTotal,
  comision: initialComision,
  provided,
  onEdit,
  onDelete,
  clientes = [],
  vendedores = [],
  productosDisponibles = []
}) => {
  const { isAdmin, currentUser } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [cliente, setCliente] = useState(initialCliente);
  const [vendedor, setVendedor] = useState(initialVendedor);
  const [productos, setProductos] = useState<ProductoNegociacion[]>(initialProductos);
  const [total, setTotal] = useState(initialTotal);
  const [comision, setComision] = useState(initialComision);
  const [isExpanded, setIsExpanded] = useState(false);

  // Set vendedor when in vendedor mode or when it changes
  useEffect(() => {
    if (!isAdmin && vendedores.length === 1) {
      const currentVendedor = vendedores[0];
      setVendedor(currentVendedor.Nombre);
    }
  }, [isAdmin, vendedores]);

  const calcularTotal = (productos: ProductoNegociacion[]) => {
    return productos.reduce((sum, prod) => sum + prod.Subtotal, 0);
  };

  const calcularComision = (total: number) => {
    return total * 0.15; // 15% de comisión
  };

  const handleProductoChange = (index: number, cantidad: number) => {
    const nuevosProductos = [...productos];
    const producto = nuevosProductos[index];
    producto.Cantidad = cantidad;
    producto.Subtotal = cantidad * producto.PrecioUnitario;
    
    const nuevoTotal = calcularTotal(nuevosProductos);
    const nuevaComision = calcularComision(nuevoTotal);

    setProductos(nuevosProductos);
    setTotal(nuevoTotal);
    setComision(nuevaComision);
  };

  const handleSave = () => {
    onEdit?.(id, { cliente, vendedor, productos, total, comision });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCliente(initialCliente);
    setVendedor(initialVendedor);
    setProductos(initialProductos);
    setTotal(initialTotal);
    setComision(initialComision);
    setIsEditing(false);
  };

  // Get the parent droppable ID to determine the card color
  const getCardStyle = () => {
    const status = provided?.draggableProps?.['data-rfd-draggable-context-id'] || '';
    // Only add hover effects for draggable cards, not the modal
    let baseStyle = provided ? 'transform transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg' : '';
    
    if (status.includes('en-proceso')) {
      return `${baseStyle} bg-white dark:bg-[#1e293b] border-l-4 border-blue-500`;
    } else if (status.includes('terminada')) {
      return `${baseStyle} bg-white dark:bg-[#1e293b] border-l-4 border-green-500`;
    } else if (status.includes('cancelada')) {
      return `${baseStyle} bg-white dark:bg-[#1e293b] border-l-4 border-red-500`;
    }
    return `${baseStyle} bg-white dark:bg-[#1e293b]`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className={`rounded-xl shadow-md overflow-hidden ${getCardStyle()}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-full">
            {(isEditing || id === "new") ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Cliente
                    </label>
                    <select
                      value={cliente}
                      onChange={(e) => setCliente(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-[#2e3b4e] rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clientes?.map((c) => (
                        <option key={c.Id} value={c.Nombre}>
                          {c.Nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isAdmin ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Vendedor
                      </label>
                      <select
                        value={vendedor}
                        onChange={(e) => setVendedor(e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-[#2e3b4e] rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar Vendedor</option>
                        {vendedores?.map((v) => (
                          <option key={v.Id} value={v.Nombre}>
                            {v.Nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Vendedor
                      </label>
                      <div className="px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-[#2e3b4e] rounded-lg border border-gray-300 dark:border-gray-600">
                        {vendedor}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {cliente}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Vendedor: {vendedor}
                </p>
              </>
            )}
          </div>
          {isAdmin && id !== "new" && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              {onDelete && (
                <DeleteButton 
                  id={parseInt(id)}
                  onDelete={async () => await onDelete(id)} 
                />
              )}
            </div>
          )}
        </div>

        {/* Products Section */}
        {(isEditing || id === "new") && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Productos
              </label>
              <button
                onClick={() => {
                  const firstProduct = productosDisponibles[0];
                  if (firstProduct) {
                    setProductos([...productos, {
                      IDProducto: firstProduct.IDProducto,
                      Cantidad: 1,
                      PrecioUnitario: firstProduct.Precio,
                      Subtotal: firstProduct.Precio,
                      Descripcion: firstProduct.Descripcion
                    }]);
                  }
                }}
                className="px-3 py-1 text-sm text-white bg-blue-600 dark:bg-[#2e3b4e] rounded-lg hover:bg-blue-700 dark:hover:bg-[#3e4b5e] transition-colors flex items-center gap-1"
                disabled={productosDisponibles.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Producto
              </button>
            </div>
            <div className="space-y-3">
              {productos.map((producto, index) => (
                <div key={index} className="flex justify-between items-center mb-3 bg-gray-100 dark:bg-[#2e3b4e] p-3 rounded-lg">
                  <div className="flex-1 mr-3">
                    <select
                      value={producto.IDProducto}
                      onChange={(e) => {
                        const nuevoProducto = productosDisponibles.find(p => p.IDProducto === Number(e.target.value));
                        if (nuevoProducto) {
                          const nuevosProductos = [...productos];
                          nuevosProductos[index] = {
                            IDProducto: nuevoProducto.IDProducto,
                            Cantidad: 1,
                            PrecioUnitario: nuevoProducto.Precio,
                            Subtotal: nuevoProducto.Precio,
                            Descripcion: nuevoProducto.Descripcion
                          };
                          setProductos(nuevosProductos);
                          const nuevoTotal = calcularTotal(nuevosProductos);
                          setTotal(nuevoTotal);
                          setComision(calcularComision(nuevoTotal));
                        }
                      }}
                      className="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-[#1e293b] rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Producto</option>
                      {productosDisponibles.map((p) => (
                        <option key={p.IDProducto} value={p.IDProducto}>
                          {p.Descripcion} - ${p.Precio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={producto.Cantidad}
                      onChange={(e) => handleProductoChange(index, Number(e.target.value))}
                      className="w-20 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-[#1e293b] rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Cant."
                    />
                    <button
                      onClick={() => {
                        const nuevosProductos = productos.filter((_, i) => i !== index);
                        setProductos(nuevosProductos);
                        const nuevoTotal = calcularTotal(nuevosProductos);
                        setTotal(nuevoTotal);
                        setComision(calcularComision(nuevoTotal));
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular card view */}
        {!isEditing && id !== "new" && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Comisión</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(comision)}
                </p>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none flex items-center justify-center gap-1 mt-2"
            >
              {isExpanded ? (
                <>
                  <span>Ocultar productos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Ver productos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {/* Productos List */}
            {isExpanded && productos.length > 0 && (
              <div className="mt-3 space-y-2 ">
                <div className="border-t dark:border-gray-700 pt-2">
                  {productos.map((producto, index) => (
                    <div
                      key={`${producto.IDProducto}-${index}`}
                      className="py-2 flex justify-between items-center text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {producto.Descripcion || `Producto ${producto.IDProducto}`}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {producto.Cantidad} × {formatCurrency(producto.PrecioUnitario)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(producto.Subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Totals Section */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-[#2e3b4e] rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-sm font-medium">Comisión (15%):</span>
            <span className="text-lg font-medium">${comision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {(isEditing || id === "new") && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!cliente || !vendedor || productos.length === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {id === "new" ? "Crear Negociación" : "Guardar Cambios"}
            </button>
            <button
              onClick={id === "new" ? () => onDelete?.(id) : handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2e3b4e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#3e4b5e] focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NegociacionCard;