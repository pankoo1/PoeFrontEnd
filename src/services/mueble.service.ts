import { ApiService } from './api';
import { API_URL } from '@/config/api';

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
    const errorMessage = typeof error.detail === 'string' 
      ? error.detail 
      : JSON.stringify(error.detail || error);
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Interfaz para crear un mueble completo
 */
export interface CrearMuebleCompletoRequest {
  nombre: string;
  filas: number;
  columnas: number;
  direccion?: 'T' | 'N' | 'S' | 'E' | 'O'; // T: Todas, N: Norte, S: Sur, E: Este, O: Oeste
}

/**
 * Interfaz para crear un mueble de reposición simple
 */
export interface CrearMuebleReposicionRequest {
  nombre: string;
  tipo: 'Anaquel' | 'Estante' | 'Góndola' | 'Mostrador'; // Tipos comunes de muebles
}

/**
 * Interfaz para la respuesta de un mueble
 */
export interface MuebleResponse {
  id_objeto: number;
  nombre: string;
  tipo: {
    id: number;
    nombre: string;
    nombre_tipo?: string;
    caminable: boolean;
  };
  filas?: number;
  columnas?: number;
  direccion?: string;
  puntos?: PuntoReposicion[];
}

/**
 * Interfaz para un punto de reposición
 */
export interface PuntoReposicion {
  id_punto: number;
  fila: number;
  columna: number;
  id_producto?: number;
  producto?: {
    nombre: string;
    sku: string;
  };
}

/**
 * Servicio para gestionar muebles de reposición
 */
export class MuebleService {
  /**
   * Crea un mueble completo con su matriz de puntos de reposición
   * POST /muebles/completo
   */
  static async crearMuebleCompleto(
    data: CrearMuebleCompletoRequest
  ): Promise<MuebleResponse> {
    const response = await fetchApi('/muebles/completo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Crea un mueble de reposición simple (sin matriz de puntos)
   * POST /muebles/reposicion
   */
  static async crearMuebleReposicion(
    data: CrearMuebleReposicionRequest
  ): Promise<MuebleResponse> {
    const response = await fetchApi('/muebles/reposicion', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Lista todos los muebles de reposición de la empresa
   * GET /muebles/reposicion
   */
  static async listarMueblesReposicion(): Promise<MuebleResponse[]> {
    const response = await fetchApi('/muebles/reposicion', {
      method: 'GET',
    });
    return response;
  }
}
