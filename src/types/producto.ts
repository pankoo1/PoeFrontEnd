export interface Producto {
    id_producto: number;
    nombre: string;
    categoria: string;
    unidad_tipo: string;
    unidad_cantidad: number;
    codigo_unico: string;
    estado: string;
    id_usuario?: number; // supervisor asignado
}

export interface CreateProductoData {
    nombre: string;
    categoria: string;
    unidad_tipo: string;
    unidad_cantidad: number;
    codigo_unico: string;
    id_usuario: number; // supervisor asignado
}

export interface UpdateProductoData {
    nombre?: string;
    categoria?: string;
    codigo_unico?: string;
}