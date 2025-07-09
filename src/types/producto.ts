export interface Producto {
    id_producto: number;
    nombre: string;
    categoria: string;
    unidad_tipo: string;
    unidad_cantidad: number;
    codigo_unico: string;
    estado: string;
    id_usuario?: string;
}

export interface CreateProductoData {
    nombre: string;
    categoria: string;
    unidad_tipo: string;
    unidad_cantidad: number;
    codigo_unico: string;
}

export interface UpdateProductoData {
    nombre?: string;
    categoria?: string;
    codigo_unico?: string;
    unidad_tipo?: string;
    unidad_cantidad?: number;
    id_usuario?: number;
}