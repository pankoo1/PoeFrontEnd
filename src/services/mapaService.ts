import { MapaResponse } from '@/types/mapa';
import { ApiService } from './api';
import { API_URL } from '../config/api';

export const MapaService = {
    // Obtener el mapa de reposición
    async getMapaReposicion(idMapa?: number): Promise<MapaResponse> {
        return await ApiService.getMapaReposicion(idMapa);
    },

    // Obtener el mapa del supervisor
    async getMapaSupervisor(idMapa?: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const params = idMapa ? `?id_mapa=${idMapa}` : '';
        try {
            const response = await fetch(`${API_URL}/mapa/supervisor${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const data = await response.json();

            if (data.mensaje && !data.mapa) {
                return { mensaje: data.mensaje };
            }

            if (!data.mapa || typeof data.mapa.ancho !== 'number' || typeof data.mapa.alto !== 'number') {
                throw new Error('La respuesta del servidor no tiene el formato esperado');
            }

            return data;
        } catch (error) {
            console.error('Error obteniendo el mapa del supervisor:', error);
            if (error instanceof Error) {
                throw new Error(`No se pudo obtener el mapa del supervisor: ${error.message}`);
            }
            throw new Error('No se pudo obtener el mapa del supervisor');
        }
    },

    // Obtener la vista del mapa del supervisor
    async getMapaSupervisorVista(idMapa?: number): Promise<MapaResponse> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const params = idMapa ? `?id_mapa=${idMapa}` : '';
        try {
            const response = await fetch(`${API_URL}/mapa/supervisor/vista${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const data = await response.json();

            if (data.mensaje && !data.mapa) {
                return { mensaje: data.mensaje, mapa: null, ubicaciones: [] };
            }

            return data;
        } catch (error) {
            console.error('Error obteniendo la vista del mapa del supervisor:', error);
            if (error instanceof Error) {
                throw new Error(`No se pudo obtener la vista del mapa del supervisor: ${error.message}`);
            }
            throw new Error('No se pudo obtener la vista del mapa del supervisor');
        }
    },

    // Obtener la vista del mapa del reponedor
    async getMapaReponedorVista(idMapa?: number): Promise<MapaResponse> {
        const token = localStorage.getItem('token');
        console.log('Token encontrado:', !!token);
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const params = idMapa ? `?id_mapa=${idMapa}` : '';
        const url = `${API_URL}/mapa/reponedor/vista${params}`;
        console.log('URL del mapa del reponedor:', url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Status de respuesta:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const data = await response.json();
            console.log('Datos recibidos del servidor:', data);

            if (data.mensaje && !data.mapa) {
                return { mensaje: data.mensaje, mapa: null, ubicaciones: [] };
            }

            return data;
        } catch (error) {
            console.error('Error obteniendo la vista del mapa del reponedor:', error);
            if (error instanceof Error) {
                throw new Error(`No se pudo obtener la vista del mapa del reponedor: ${error.message}`);
            }
            throw new Error('No se pudo obtener la vista del mapa del reponedor');
        }
    },

    // Asignar producto a punto de reposición
    async asignarProductoAPunto(idProducto: number, idPunto: number, idUsuario: number) {
        return await ApiService.asignarProductoAPunto(idProducto, idPunto, idUsuario);
    },

    // Desasignar producto de punto de reposición
    async desasignarProductoDePunto(idPunto: number) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${API_URL}/puntos/${idPunto}/desasignar-producto`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            return await response.json();
        } catch (error) {
            console.error('Error desasignando producto:', error);
            throw error instanceof Error ? error : new Error('Error desconocido al desasignar producto');
        }
    }
};
