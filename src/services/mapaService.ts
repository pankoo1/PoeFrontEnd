import { MapaResponse } from '@/types/mapa';
import { ApiService } from './api';

export const MapaService = {
    // Obtener el mapa de reposición
    async getMapaReposicion(idMapa?: number): Promise<MapaResponse> {
        return await ApiService.getMapaReposicion(idMapa);
    },

    // Asignar producto a punto de reposición
    async asignarProductoAPunto(idProducto: number, idPunto: number) {
        return await ApiService.asignarProductoAPunto(idProducto, idPunto);
    },

    // Desasignar producto de punto de reposición
    async desasignarProductoDePunto(idProducto: number) {
        // Si tienes un endpoint específico, usa fetch aquí, si no, puedes dejarlo como estaba
        return await fetch(`${ApiService.API_URL}/productos/${idProducto}/desasignar-punto`, {
            method: 'DELETE',
            headers: ApiService.getHeaders(true),
        }).then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.json();
        });
    }
};
