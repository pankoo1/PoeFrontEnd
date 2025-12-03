import { ApiService } from './api';
import { API_URL } from '@/config/api';
import type { 
  Mapa, 
  CrearMapaRequest, 
  ObjetoMapa, 
  VistaGraficaMapa, 
  UbicacionObjeto,
  GuardarLayoutRequest,
  RutaVisual,
  GenerarRutaRequest 
} from '@/types/mapa.types';

const BASE_URL = '';

/**
 * Helper para hacer peticiones autenticadas
 */
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = ApiService.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construir URL completa
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Mejorar el manejo de errores para mostrar detalles completos
    const errorMessage = typeof error.detail === 'string' 
      ? error.detail 
      : JSON.stringify(error.detail || error);
    throw new Error(errorMessage);
  }

  return response.json();
};

export class MapaService {
  /**
   * Crear un nuevo mapa (lienzo)
   */
  static async crearMapa(data: CrearMapaRequest): Promise<Mapa> {
    const response = await fetchApi(`/mapas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Obtener catálogo de objetos (paleta) para el editor
   */
  static async obtenerPaleta(): Promise<ObjetoMapa[]> {
    const response = await fetchApi(`/objetos`, {
      method: 'GET',
    });
    // Mapear la respuesta del backend al formato esperado por el frontend
    return response.map((obj: any) => ({
      id_objeto: obj.id_objeto,
      nombre: obj.nombre,
      tipo: obj.tipo.nombre.toLowerCase(), // 'mueble', 'muro', 'salida', etc.
      es_caminable: obj.tipo.caminable ?? false,
      id_tipo: obj.tipo.id, // Guardar el id_tipo para uso posterior
      ancho: 1, // Por defecto
      alto: 1,
      id_empresa: 0
    }));
  }

  /**
   * Obtener vista gráfica del mapa con celdas
   * Transforma la respuesta del backend en el formato que MapCanvas necesita
   */
  static async obtenerVistaGrafica(idMapa: number): Promise<{ vistaGrafica: VistaGraficaMapa; ubicaciones: UbicacionObjeto[] }> {
    const response = await fetchApi(`/vista-grafica?id_mapa=${idMapa}`, {
      method: 'GET',
    });

    const { mapa, objetos } = response;

    // Construir grilla de celdas SOLO con celdas vacías
    // Los objetos se manejan por separado en 'ubicaciones'
    const celdas: any[] = [];
    for (let y = 0; y < mapa.alto; y++) {
      for (let x = 0; x < mapa.ancho; x++) {
        // Todas las celdas son "pasillo" por defecto
        // Los objetos se dibujarán encima usando 'ubicaciones'
        celdas.push({
          x,
          y,
          tipo: 'pasillo',
          es_caminable: true
        });
      }
    }

    // Construir VistaGraficaMapa
    const vistaGrafica: VistaGraficaMapa = {
      id_mapa: mapa.id,
      nombre: mapa.nombre,
      ancho: mapa.ancho,
      alto: mapa.alto,
      celdas
    };

    // Construir ubicaciones CON información completa para renderizado
    // IMPORTANTE: Filtrar objetos tipo "pasillo" ya que son solo el fondo
    const ubicaciones: UbicacionObjeto[] = objetos
      .filter((obj: any) => obj.objeto.tipo.nombre_tipo.toLowerCase() !== 'pasillo')
      .map((obj: any) => ({
        x: obj.x,
        y: obj.y,
        id_objeto: obj.objeto.id, // Para matching con objetosDisponibles
        id_objeto_real: obj.objeto.id,
        nombre_objeto: obj.objeto.nombre,
        tipo_objeto: obj.objeto.tipo.nombre_tipo.toLowerCase(), // 'mueble', 'muro', 'salida'
        ancho: 1, // Por defecto 1x1, el backend debería enviar dimensiones visuales
        alto: 1
      }));

    return { vistaGrafica, ubicaciones };
  }

  /**
   * Guardar layout completo del mapa (guardado masivo)
   * Valida que exista exactamente 1 salida
   */
  static async guardarLayoutCompleto(idMapa: number, data: GuardarLayoutRequest): Promise<void> {
    await fetchApi(`/${idMapa}/guardar-layout-completo`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Listar todos los mapas de la empresa (solo activos por ahora)
   */
  static async listarMapas(): Promise<Mapa[]> {
    const response = await fetchApi(`/todos`, {
      method: 'GET',
    });
    // Mapear la respuesta del backend (id -> id_mapa)
    return response.map((mapa: any) => ({
      id_mapa: mapa.id,
      nombre: mapa.nombre,
      ancho: mapa.ancho,
      alto: mapa.alto,
      activo: mapa.activo, // ✅ Usar el valor del backend
      id_empresa: 0,
    }));
  }

  /**
   * Activar un mapa específico (desactiva automáticamente los demás)
   */
  static async activarMapa(idMapa: number): Promise<Mapa> {
    const response = await fetchApi(`/${idMapa}/activar`, {
      method: 'PUT',
    });
    return {
      id_mapa: response.id,
      nombre: response.nombre,
      ancho: response.ancho,
      alto: response.alto,
      activo: response.activo, // ✅ Usar el valor del backend
      id_empresa: 0,
    };
  }

  /**
   * Obtener el mapa activo actual
   */
  static async obtenerMapaActivo(): Promise<Mapa | null> {
    try {
      const response = await fetchApi(`/activo`, {
        method: 'GET',
      });
      if (!response || !response.id) return null;
      return {
        id_mapa: response.id,
        nombre: response.nombre,
        ancho: response.ancho,
        alto: response.alto,
        activo: true,
        id_empresa: 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener un mapa específico por ID
   */
  static async obtenerMapa(idMapa: number): Promise<Mapa> {
    const response = await fetchApi(`${BASE_URL}/mapas/${idMapa}`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Eliminar un mapa
   */
  static async eliminarMapa(idMapa: number): Promise<void> {
    await fetchApi(`${BASE_URL}/mapas/${idMapa}`, {
      method: 'DELETE',
    });
  }

  // ==================== RUTAS ====================

  /**
   * Generar ruta optimizada para una tarea
   * Usa TSP Global + A* Inteligente
   */
  static async generarRutaOptimizada(data: GenerarRutaRequest): Promise<any> {
    const { id_tarea, algoritmo } = data;
    const url = algoritmo 
      ? `${BASE_URL}/tareas/${id_tarea}/ruta-optimizada?algoritmo=${algoritmo}`
      : `${BASE_URL}/tareas/${id_tarea}/ruta-optimizada`;
    
    const response = await fetchApi(url, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Obtener ruta visual (formato nuevo, plano)
   * Ideal para componentes de mapa nuevos
   */
  static async obtenerRutaVisual(idTarea: number): Promise<RutaVisual> {
    const response = await fetchApi(`${BASE_URL}/tareas/${idTarea}/ruta-visual`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Obtener ruta optimizada visual (formato legacy)
   * Compatibilidad con frontend antiguo
   */
  static async obtenerRutaOptimizadaVisual(idTarea: number): Promise<any> {
    const response = await fetchApi(`${BASE_URL}/tareas/${idTarea}/ruta-optimizada-visual`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Asignar un producto a un punto de reposición
   */
  static async asignarProductoAPunto(idPunto: number, idProducto: number): Promise<any> {
    const response = await fetchApi(`/puntos/${idPunto}/asignar-producto`, {
      method: 'PUT',
      body: JSON.stringify({ id_producto: idProducto }),
    });
    return response;
  }

  /**
   * Desasignar producto de un punto de reposición
   */
  static async desasignarProductoDePunto(idPunto: number): Promise<void> {
    await fetchApi(`/puntos/${idPunto}/desasignar-producto`, {
      method: 'DELETE',
    });
  }

  /**
   * Obtener vista de reposición con puntos completos
   */
  static async obtenerVistaReposicion(idMapa?: number): Promise<any> {
    const url = idMapa ? `/reposicion?id_mapa=${idMapa}` : `/reposicion`;
    const response = await fetchApi(url, {
      method: 'GET',
    });
    return response;
  }
}
