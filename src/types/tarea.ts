export interface ProductoTarea {
  id_producto: number;
  nombre: string | null;
  cantidad: number;
  ubicacion: {
    estanteria: number | null;
    nivel: number | null;
  };
}

export interface UbicacionTarea {
  estanteria: number | null;
  nivel: number | null;
}

export interface TareaSupervisor {
  id_tarea: number;
  estado: string;
  color_estado: string;
  reponedor: string | null;
  productos: ProductoTarea[];
  ubicaciones: UbicacionTarea[];
  fecha_creacion: string;
}