import { DraggableProvided } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';

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
}

interface NegociacionCardProps {
  id: string;
  cliente: string;
  vendedor: string;
  productos: ProductoNegociacion[];
  total: number;
  comision: number;
  provided?: DraggableProvided;
  onEdit: (id: string, data: {
    cliente: string;
    vendedor: string;
    productos: ProductoNegociacion[];
    total: number;
    comision: number;
  }) => void;
  onDelete: (id: string) => void;
}

export default function NegociacionCard({ 
  id, 
  cliente: initialCliente, 
  vendedor: initialVendedor,
  productos: initialProductos = [],
  total: initialTotal,
  comision: initialComision,
  provided,
  onEdit,
  onDelete 
}: NegociacionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cliente, setCliente] = useState(initialCliente);
  const [vendedor, setVendedor] = useState(initialVendedor);
  const [productos, setProductos] = useState<ProductoNegociacion[]>(initialProductos);
  const [total, setTotal] = useState(initialTotal);
  const [comision, setComision] = useState(initialComision);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);

  useEffect(() => {
    // Cargar datos necesarios
    const fetchData = async () => {
      try {
        const [clientesRes, vendedoresRes, productosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedores`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`)
        ]);

        const [clientesData, vendedoresData, productosData] = await Promise.all([
          clientesRes.json(),
          vendedoresRes.json(),
          productosRes.json()
        ]);

        setClientes(clientesData);
        setVendedores(vendedoresData);
        setProductosDisponibles(productosData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
    onEdit(id, { cliente, vendedor, productos, total, comision });
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

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-600"
    >
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <div className="w-full space-y-2">
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white dark:border-gray-600"
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.map((c) => (
                <option key={c.Id} value={c.Nombre}>{c.Nombre}</option>
              ))}
            </select>
            <select
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white dark:border-gray-600"
            >
              <option value="">Seleccionar Vendedor</option>
              {vendedores.map((v) => (
                <option key={v.Id} value={v.Nombre}>{v.Nombre}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Cliente: {cliente || 'No asignado'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vendedor: {vendedor || 'No asignado'}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
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

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-2">
            {productos.map((producto, index) => (
              <div key={index} className="flex items-center gap-2">
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
                        Subtotal: nuevoProducto.Precio
                      };
                      setProductos(nuevosProductos);
                      const nuevoTotal = calcularTotal(nuevosProductos);
                      setTotal(nuevoTotal);
                      setComision(calcularComision(nuevoTotal));
                    }
                  }}
                  className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white dark:border-gray-600"
                >
                  <option value="">Seleccionar Producto</option>
                  {productosDisponibles.map((p) => (
                    <option key={p.IDProducto} value={p.IDProducto}>
                      {p.Descripcion} - ${p.Precio}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={producto.Cantidad}
                  onChange={(e) => handleProductoChange(index, Number(e.target.value))}
                  className="w-20 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ${producto.Subtotal}
                </span>
                <button
                  onClick={() => {
                    const nuevosProductos = productos.filter((_, i) => i !== index);
                    setProductos(nuevosProductos);
                    const nuevoTotal = calcularTotal(nuevosProductos);
                    setTotal(nuevoTotal);
                    setComision(calcularComision(nuevoTotal));
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setProductos([...productos, {
                  IDProducto: 0,
                  Cantidad: 1,
                  PrecioUnitario: 0,
                  Subtotal: 0
                }]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              + Agregar Producto
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Productos:
            </p>
            {productos.map((producto, index) => {
              const productoInfo = productosDisponibles.find(p => p.IDProducto === producto.IDProducto);
              return (
                <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  {productoInfo?.Descripcion || 'Producto no encontrado'} 
                  - Cantidad: {producto.Cantidad} 
                  - ${producto.Subtotal}
                </p>
              );
            })}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-medium">
                <span className="text-sm">Comisión (15%):</span>
                <span className="text-sm">${comision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}