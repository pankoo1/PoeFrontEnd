export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    login: `${API_URL}/usuarios/token`,
    usuarios: `${API_URL}/usuarios`,
    supervisor: `${API_URL}/supervisor`,
    supervisor_reponedores: `${API_URL}/supervisor/reponedores`,
    productos: `${API_URL}/productos`,
    profile: `${API_URL}/usuarios/me`,
    muebles_reposicion: `${API_URL}/muebles/reposicion`,
    mapa: `${API_URL}/mapa`,
    mapa_reposicion: `${API_URL}/mapa/reposicion`
} as const;