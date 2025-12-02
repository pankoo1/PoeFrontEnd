// Tipos para el sistema de mapas y editor

export interface Mapa {
  id_mapa: number;
  nombre: string;
  ancho: number;
  alto: number;
  activo?: boolean;
  id_empresa?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrearMapaRequest {
  nombre: string;
  ancho: number;
  alto: number;
}

export interface ObjetoMapa {
  id_objeto: number;
  nombre: string;
  tipo: 'mueble' | 'muro' | 'salida' | 'suelo';
  es_caminable: boolean;
  ancho?: number;
  alto?: number;
  filas?: number;
  columnas?: number;
  id_empresa: number;
}

export interface ObjetoNuevo {
  nombre: string;
  tipo: 'mueble';
  ancho: number;
  alto: number;
  filas: number;
  columnas: number;
}

export interface UbicacionObjeto {
  x: number;
  y: number;
  id_objeto_real?: number;
  id_temporal?: string;
  nombre_objeto?: string;
  tipo_objeto?: string;
  ancho?: number;
  alto?: number;
}

export interface GuardarLayoutRequest {
  objetos_nuevos?: ObjetoNuevo[];
  ubicaciones: UbicacionObjeto[];
}

export interface CeldaMapa {
  x: number;
  y: number;
  tipo: string;
  id_objeto?: number;
  nombre_objeto?: string;
  es_caminable: boolean;
}

export interface VistaGraficaMapa {
  id_mapa: number;
  nombre: string;
  ancho: number;
  alto: number;
  celdas: CeldaMapa[];
}

// Tipos para rutas optimizadas

export interface CoordenadasRuta {
  secuencia: number;
  x: number;
  y: number;
}

export interface PuntoVisita {
  nombre_producto: string;
  x_acceso: number;
  y_acceso: number;
  cantidad?: number;
}

export interface RutaVisual {
  coordenadas_ruta: CoordenadasRuta[];
  puntos_visita: PuntoVisita[];
}

export interface GenerarRutaRequest {
  id_tarea: number;
  algoritmo?: 'vecino_mas_cercano';
}

// Estados del editor

export interface EditorState {
  mapa: VistaGraficaMapa | null;
  objetosPaleta: ObjetoMapa[];
  objetosNuevos: ObjetoNuevo[];
  ubicaciones: UbicacionObjeto[];
  objetoSeleccionado: ObjetoMapa | ObjetoNuevo | null;
  isDragging: boolean;
  hasChanges: boolean;
}

export interface DraggedObject {
  objeto: ObjetoMapa | ObjetoNuevo;
  offsetX: number;
  offsetY: number;
  isNew: boolean;
  idTemporal?: string;
}
