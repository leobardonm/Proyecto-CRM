export interface Cliente {
  Id: number;
  Nombre: string;
  Email: string;
}

export interface Vendedor {
  Id: number;
  Nombre: string;
  Email: string;
}

export interface Producto {
  IDProducto: number;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

export interface ProductoNegociacion {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

export interface Negociacion {
  IDNegociacion: number;
  ClienteNombre: string;
  VendedorNombre: string;
  Productos: ProductoNegociacion[];
  Total: number;
  Comision: number;
  Estado: number;
  FechaInicio: string;
  FechaFin: string;
  EstadoDescripcion: string;
  Monto: number; // Consider removing if always same as Total
  IdVendedor: number;
  IdCliente: number;
  uniqueId?: string; // Used for optimistic UI updates during drag-and-drop
}

// Data structure specifically for forms/editing
export interface FormNegociacionData {
  cliente: string; // Name for selection
  vendedor: string; // Name for selection
  productos: ProductoNegociacion[];
  total: number;
  comision: number;
}

// Raw data structure from API (example)
export interface NegociacionData {
  IDNegociacion: number;
  ClienteNombre: string;
  VendedorNombre: string;
  Productos: ProductoData[];
  Total: number;
  Comision: number;
  Estado: number;
  FechaInicio: string;
  FechaFin: string;
  EstadoDescripcion: string;
  IdVendedor: number;
  IdCliente: number;
}

// Raw product data within negotiation from API (example)
export interface ProductoData {
  IDProducto: number;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  Descripcion: string;
}

export interface EstadosNegociacion {
  'en-proceso': Negociacion[];
  'terminada': Negociacion[];
  'cancelada': Negociacion[];
}

// Type for the notification state
export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
} 