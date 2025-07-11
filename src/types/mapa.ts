export interface ObjetoMapa {
    nombre: string;
    tipo: string;
    caminable: boolean | null;
}

export interface MuebleReposicion {
    id_mueble: number;
    nivel: number;
    estanteria: number;  // Corregido: debería ser number, no string
    producto: ProductoAsociado | null;
    filas: number;
    columnas: number;
    puntos_reposicion?: PuntoReposicion[];
}

export interface ProductoAsociado {
    id_producto: number;
    nombre: string;
    categoria: string;
    unidad_tipo: string;
    unidad_cantidad: number;
}

export interface PuntoReposicion {
    id_punto: number;
    id_mueble: number;
    nivel: number;
    estanteria: number;  // Corregido: debería ser number, no string
    producto: ProductoAsociado | null;
}

export interface UbicacionFisica {
    x: number;
    y: number;
    objeto: ObjetoMapa | null;
    mueble: MuebleReposicion | null;
    punto: PuntoReposicion | null;
}

export interface Mapa {
    id: number;
    nombre: string;
    ancho: number;
    alto: number;
}

export interface MapaResponse {
    mensaje: string;
    mapa: Mapa | null;
    ubicaciones: UbicacionFisica[];
}
