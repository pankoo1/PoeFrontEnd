import { API_ENDPOINTS, API_URL } from '@/config/api';

// Tipos
export interface LoginCredentials {
    correo: string;
    contraseña: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user_info: {
        id: string;
        nombre: string;
        correo: string;
        rol: string;
        estado: string;
    };
}

export interface Usuario {
    id_usuario: number;
    nombre: string;
    correo: string;
    rol: string;
    estado: string;
}

export interface CreateUsuarioData {
    nombre: string;
    correo: string;
    contraseña: string;
    rol: string;
    estado: string;
    supervisor_id?: number; // ID del supervisor que crea el reponedor
}

export interface UpdateUsuarioData {
    nombre?: string;
    correo?: string;
    rol?: string;
    estado?: string;
}

export interface CreateReponedorData {
    nombre: string;
    correo: string;
    contraseña: string;
}

export interface MapaResponse {
    ubicaciones: Ubicacion[];
}

export interface Ubicacion {
    x: number;
    y: number;
    objeto: any;
    mueble: any;
    punto: any;
}

// Interfaces para tareas
export interface Tarea {
    id_tarea: number;
    fecha_creacion: string;
    estado: string;
    color_estado: string;
    reponedor: string | null;
    productos: {
        id_producto: number;
        nombre: string;
        cantidad: number;
        ubicacion: {
            id_punto: number;
            estanteria: string;
            nivel: number;
        };
    }[];
}

export interface CrearTareaData {
    id_reponedor: number;
    estado_id: number;
    puntos: {
        id_punto: number;
        cantidad: number;
    }[];
}

// Interfaces para reponedores
export interface Reponedor {
    id_usuario: number;
    nombre: string;
    correo: string;
    estado: string;
}

// Interfaces para ruta optimizada
export interface CoordenadaResponse {
    x: number;
    y: number;
}

// Interface para coordenadas con secuencia (ruta-visual)
export interface CoordenadaSecuenciaResponse {
    secuencia: number;
    x: number;
    y: number;
}

// Interface para puntos de visita (ruta-visual)
export interface PuntoVisitaResponse {
    orden: number;
    x_acceso: number;
    y_acceso: number;
    nombre_producto: string;
    nombre_mueble: string;
    estanteria: number;
    nivel: number;
}

// Interface para la respuesta del endpoint /ruta-visual (NUEVO)
export interface RutaVisualResponse {
    id_ruta: number;
    tiempo_estimado_min: number;
    distancia_total: number;
    coordenadas_ruta: CoordenadaSecuenciaResponse[];
    puntos_visita: PuntoVisitaResponse[];
}

export interface MuebleRutaResponse {
    id_mueble: number;
    nombre_objeto: string;
    coordenadas: CoordenadaResponse;
    nivel: number;
    estanteria: number;
}

export interface ProductoRutaResponse {
    id_producto: number;
    nombre: string;
    categoria: string;
    cantidad: number;
}

export interface PuntoRutaResponse {
    id_punto: number;
    mueble: MuebleRutaResponse;
    producto: ProductoRutaResponse;
    orden_visita: number;
}

export interface AlgoritmoResponse {
    nombre: string;
    descripcion: string;
}

// Interface para respuesta legacy de ruta-optimizada (mantener compatibilidad)
export interface RutaOptimizadaResponse {
    id_tarea: number;
    reponedor: string;
    fecha_creacion: string;
    puntos_reposicion: PuntoRutaResponse[];
    coordenadas_ruta: CoordenadaResponse[];
    algoritmo_utilizado: AlgoritmoResponse;
    distancia_total: number;
    tiempo_estimado_minutos: number;
    estado_tarea: string;
    // Campos opcionales para compatibilidad con estructura híbrida
    muebles_rutas?: any[];
    coordenadas_ruta_global?: CoordenadaResponse[];
}

// Interfaces para reportes
export interface ReponedorReporte {
    id_usuario: number;
    nombre: string;
    email: string;
    estado: string;
}

export interface ListaReponedoresResponse {
    total: number;
    reponedores: ReponedorReporte[];
}

export interface TareaHistorial {
    id_tarea: number;
    fecha_creacion: string;
    fecha_completado?: string;
    estado: string;
    total_productos: number;
    tiempo_completado?: string;
    puntos_visitados: number;
}

export interface HistorialReponedorResponse {
    reponedor: {
        id: number;
        nombre: string;
        email: string;
    };
    periodo: {
        fecha_inicio?: string;
        fecha_fin?: string;
    };
    estadisticas: {
        total_tareas: number;
        tareas_completadas: number;
        tareas_pendientes: number;
        tiempo_promedio?: string;
        eficiencia: number;
    };
    tareas: TareaHistorial[];
    paginacion: {
        total: number;
        limit: number;
        offset: number;
        pagina_actual: number;
        total_paginas: number;
    };
}

export interface EstadisticasGenerales {
    periodo: {
        fecha_inicio?: string;
        fecha_fin?: string;
    };
    total_tareas: number;
    estadisticas_por_estado: Record<string, number>;
    estadisticas_por_reponedor: Record<string, number>;
}

export interface ProductoMasRepuesto {
    producto: {
        id: number;
        nombre: string;
        categoria: string;
        unidad_tipo: string;
    };
    cantidad_total: number;
    numero_tareas: number;
    promedio_por_tarea: number;
    porcentaje_total: number;
}

export interface ProductosRepuestosResponse {
    periodo: {
        fecha_inicio: string;
        fecha_fin: string;
    };
    estadisticas: {
        total_productos_diferentes: number;
        cantidad_total_repuesta: number;
        promedio_por_producto: number;
    };
    productos: ProductoMasRepuesto[];
    categorias: Record<string, {
        cantidad_total: number;
        numero_productos: number;
        porcentaje: number;
    }>;
    metadatos: {
        fecha_generacion: string;
        total_registros: number;
        limit_aplicado: number;
    };
}

export interface ProductosReportRequest {
    fecha_inicio: string; // YYYY-MM-DD
    fecha_fin: string; // YYYY-MM-DD
    limit?: number;
}

// Interfaces para dashboard
export interface DashboardResumen {
    tareas: {
        total: number;
        pendientes: number;
        en_progreso: number;
        completadas: number;
    };
    top_productos: Array<{
        nombre: string;
        cantidad_repuesta: number;
    }>;
    actividad_usuarios: Array<{
        nombre: string;
        tareas_completadas: number;
        tiempo_total_minutos: number;
    }>;
    periodo: string;
    fecha_inicio: string;
    fecha_fin: string;
}

// Tipo para el resumen semanal de estadísticas
export interface ResumenSemanalEstadisticas {
    success: boolean;
    message: string;
    data: {
        total_tareas: number;
        total_productos_repuestos: number;
        tareas_por_estado: Record<string, number>;
        periodo_actividad: {
            fecha_primera_tarea: string | null;
            fecha_ultima_tarea: string | null;
        };
        promedio_productos_por_tarea: number;
    };
}

// Tipo para el rendimiento de reponedores del supervisor
export interface RendimientoReponedores {
    success: boolean;
    message: string;
    data: {
        reponedores: Array<{
            id: number;
            nombre: string;
            correo: string;
            tareas_totales: number;
            tareas_completadas: number;
            tasa_completacion: number;
            tiempo_promedio_horas: number;
        }>;
        filtros_aplicados: {
            fecha_inicio: string | null;
            fecha_fin: string | null;
        };
    };
}

// Tipo para las estadísticas de productos del supervisor
export interface EstadisticasProductos {
    success: boolean;
    message: string;
    data: {
        productos: Array<{
            id: number;
            nombre: string;
            codigo_unico: string;
            unidad_tipo: string;
            total_reposiciones: number;
            total_cantidad: number;
            puntos_diferentes: number;
            cantidad_promedio: number;
        }>;
        productos_mas_frecuentes: Array<{
            id: number;
            nombre: string;
            frecuencia_reposicion: number;
        }>;
        resumen: {
            total_productos: number;
            total_reposiciones: number;
            total_cantidad: number;
        };
        filtros_aplicados: {
            fecha_inicio: string | null;
            fecha_fin: string | null;
        };
    };
}

// ============================================================
// TIPOS PARA BACKOFFICE (SUPERADMIN)
// ============================================================

export interface EmpresaBackoffice {
    id_empresa: number;
    nombre_empresa: string;
    rut_empresa: string;
    direccion?: string;
    ciudad?: string;
    region?: string;
    estado: string;
    email?: string;
    telefono?: string;
    fecha_registro?: string;
    tiene_plan_activo: boolean;
    nombre_plan?: string;
    estado_plan?: string;
    fecha_vencimiento_plan?: string;
}

export interface MetricasSistema {
    total_empresas: number;
    empresas_activas: number;
    empresas_inactivas: number;
    empresas_suspendidas: number;
    empresas_en_prueba: number;
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_por_rol: Record<string, number>;
    planes_activos: number;
    planes_vencidos: number;
    planes_por_vencer_30d: number;
    facturas_pendientes: number;
    facturas_pagadas_mes: number;
    ingresos_mes_actual: number;
    ingresos_mes_anterior: number;
    cotizaciones_pendientes: number;
    cotizaciones_aprobadas: number;
    cotizaciones_rechazadas: number;
    actividades_soporte_abiertas: number;
    actividades_soporte_cerradas: number;
}

export interface ResumenEmpresa {
    id_empresa: number;
    nombre_empresa: string;
    rut_empresa: string;
    estado: string;
    tiene_plan: boolean;
    plan_activo: boolean;
    precio_mensual: number | null;
    fecha_vencimiento: string | null;
    total_usuarios: number;
    usuarios_activos: number;
    ultima_factura_pagada: string | null;
    facturas_pendientes: number;
    actividades_pendientes: number;
    ultima_actividad: string | null;
}

export interface ConsumoRecursos {
    id_empresa: number;
    nombre_empresa: string;
    supervisores_limite: number;
    supervisores_uso: number;
    supervisores_disponibles: number;
    reponedores_limite: number;
    reponedores_uso: number;
    reponedores_disponibles: number;
    total_usuarios: number;
    almacenamiento_usado_mb: number | null;
    api_calls_mes: number | null;
}

export interface LogAuditoria {
    id_log: number;
    usuario_id?: number;
    usuario_nombre?: string;
    usuario_rol?: string;
    empresa_id?: number;
    empresa_nombre?: string;
    entidad: string;
    id_entidad: number;
    accion: string;
    valores_anteriores?: Record<string, any>;
    valores_nuevos?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    descripcion?: string;
}

export interface EstadisticasAuditoria {
    total_logs: number;
    logs_ultimas_24h: number;
    logs_ultima_semana?: number;
    acciones_por_tipo: Record<string, number>;  // Agregado para compatibilidad
    acciones_mas_frecuentes: Record<string, number>;
    usuarios_mas_activos: Array<{
        id_usuario?: number;
        usuario_id?: number;
        nombre: string;
        total_acciones: number;
    }>;
    entidades_mas_modificadas: Array<{
        entidad: string;
        total_modificaciones: number;
    }>;
}

// ============================================================
// TIPOS PARA COTIZACIONES
// ============================================================

export interface CotizacionSolicitar {
    nombre_contacto: string;
    empresa: string;
    email: string;
    telefono?: string;
    cargo?: string;
    cantidad_supervisores: number;
    cantidad_reponedores: number;
    cantidad_productos?: number;
    integraciones_requeridas?: string;
    comentarios?: string;
}

export interface CotizacionResponse {
    id_cotizacion: number;
    nombre_contacto: string;
    empresa: string;
    email: string;
    telefono?: string;
    cargo?: string;
    cantidad_supervisores: number;
    cantidad_reponedores: number;
    cantidad_productos?: number;
    integraciones_requeridas?: string;
    comentarios?: string;
    precio_sugerido?: number;
    precio_final?: number;
    features_sugeridos?: any;
    estado: string;
    notas_internas?: string;
    fecha_validez?: string;
    id_empresa_creada?: number;
    id_plan_creado?: number;
    fecha_conversion?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    atendido_por?: number;
}

export interface CotizacionListItem {
    id_cotizacion: number;
    nombre_contacto: string;
    empresa: string;
    email: string;
    cantidad_supervisores: number;
    cantidad_reponedores: number;
    cantidad_productos?: number;
    estado: string;
    precio_sugerido?: number;
    precio_final?: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface CotizacionUpdate {
    nombre_contacto?: string;
    email_contacto?: string;
    telefono_contacto?: string;
    empresa_solicitante?: string;
    plan_id?: number;
    cantidad_usuarios?: number;
    cantidad_tareas?: number;
    cantidad_proyectos?: number;
    precio_mensual?: number;
    precio_sugerido?: number;
    features_sugeridos?: string;
    notas_internas?: string;
    estado?: string;
}

export interface CotizacionStats {
    total_cotizaciones: number;
    pendientes: number;
    en_revision: number;
    aprobadas: number;
    rechazadas: number;
    convertidas: number;
    por_estado: Record<string, number>;
    tasa_conversion: number;
    valor_total_pendiente: number;
    valor_total_aprobado: number;
}

export interface CotizacionConvertidaResponse {
    id_empresa: number;
    id_plan: number;
    id_usuario_admin: number;
    mensaje: string;
}

// ============================================================
// TIPOS PARA FACTURACIÓN
// ============================================================

export interface FacturaItem {
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface FacturaResponse {
    id_factura: number;
    id_empresa: number;
    nombre_empresa?: string;
    numero_factura: string;
    concepto: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    items: FacturaItem[];
    subtotal: number;
    impuestos: number;
    descuentos: number;
    iva: number;
    monto_total: number;
    total: number;  // Alias para monto_total
    notas?: string;
    fecha_pago?: string;
    metodo_pago?: string;
    referencia_pago?: string;
    motivo_anulacion?: string;
}

export interface FacturaListItem {
    id_factura: number;
    id_empresa?: number;
    nombre_empresa?: string;
    numero_factura: string;
    concepto?: string;
    periodo_facturado?: string;  // El backend devuelve esto en lugar de concepto
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    monto_total?: number;
    total: number;  // Alias
}

export interface FacturaGenerar {
    id_empresa: number;
    periodo_facturado: string;
    fecha_vencimiento: string;
    descripcion?: string;
}

export interface FacturaCreate {
    id_empresa: number;
    concepto: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    items: Array<{
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
    }>;
    notas?: string;
}

export interface FacturaUpdate {
    concepto?: string;
    fecha_vencimiento?: string;
    estado?: string;
    notas?: string;
}

export interface FacturaRegistrarPago {
    fecha_pago: string;
    metodo_pago: string;
    referencia_pago?: string;
}

export interface FacturaStats {
    total_facturas: number;
    pendientes?: number;
    facturas_pendientes: number;  // Alias
    pagadas?: number;
    facturas_pagadas: number;  // Alias
    vencidas?: number;
    facturas_vencidas: number;  // Alias
    anuladas?: number;
    facturas_anuladas: number;  // Alias
    total_facturado?: number;
    monto_total_facturado?: number;  // Backend devuelve este nombre
    total_cobrado?: number;
    monto_total_cobrado?: number;  // Backend devuelve este nombre
    total_pendiente?: number;
    monto_pendiente: number;  // Alias
    monto_vencido: number;
    tasa_cobranza?: number;
    ingresos_mes?: number;
}

// Clase principal para manejar las llamadas a la API
export class ApiService {
    // Completar múltiples detalles de tarea (para un mueble completo)
    static async completarDetallesTareaMueble(detalles: Array<{ id_detalle_tarea: number }>): Promise<{
        completados: number[];
        errores: Array<{ id_detalle: number; error: string }>;
    }> {
        const resultados = {
            completados: [] as number[],
            errores: [] as Array<{ id_detalle: number; error: string }>
        };

        // Procesar cada detalle individualmente
        for (const detalle of detalles) {
            try {
                await this.completarDetalleTarea(detalle.id_detalle_tarea);
                resultados.completados.push(detalle.id_detalle_tarea);
            } catch (error: any) {
                resultados.errores.push({
                    id_detalle: detalle.id_detalle_tarea,
                    error: error.message || 'Error desconocido'
                });
            }
        }

        return resultados;
    }

    // Completar un detalle de tarea específico
    static async completarDetalleTarea(idDetalle: number): Promise<{ mensaje: string; id_detalle: number; estado: string }> {
        return await this.fetchApi<{ mensaje: string; id_detalle: number; estado: string }>(
            `/detalles-tarea/${idDetalle}/completar`,
            { method: 'PUT' }
        );
    }
    private static token: string | null = null;
    static getMapa: any;

    // Método para establecer el token
    static setToken(token: string): void {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Método para obtener el token
    static getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    // Método para obtener el ID del usuario actual
    static getCurrentUserId(): number | null {
        const userId = localStorage.getItem('userId');
        return userId ? parseInt(userId) : null;
    }

    // Método para limpiar el token (logout)
    static clearToken(): void {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId'); // ← Limpiar también el ID del usuario
    }

    // Headers por defecto para las peticiones autenticadas
    private static getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Método genérico para hacer peticiones
    private static async fetchApi<T>(
        endpoint: string,
        options: RequestInit = {},
        requiresAuth: boolean = true
    ): Promise<T> {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            if (requiresAuth) {
                const token = this.getToken();
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Asegurarse de que el endpoint comienza con la URL base si no es una URL completa
            const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

            console.log('🔍 fetchApi llamada:', {
                url,
                method: options.method || 'GET',
                headers,
                body: options.body
            });

            const response = await fetch(url, {
                ...options,
                headers,
            });

            console.log('📡 Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error en respuesta:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Si la respuesta está vacía, retornar null
            const text = await response.text();
            console.log('📄 Texto de respuesta:', text);
            
            if (!text) {
                return null as T;
            }

            // Intentar parsear la respuesta como JSON
            try {
                return JSON.parse(text);
            } catch (e) {
                if (response.ok) {
                    // Si la respuesta fue exitosa pero no es JSON, retornar null
                    return null as T;
                }
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error en fetchApi:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error desconocido en la petición');
        }
    }

    // Método de login
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await this.fetchApi<LoginResponse>(
                API_ENDPOINTS.login,
                {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                },
                false // No requiere autenticación
            );
            
            if (!response.access_token) {
                throw new Error('No se recibió el token de acceso');
            }

            // Guardar el token
            this.setToken(response.access_token);

            // Mapear el rol del backend al formato del frontend
            const rolMapping: { [key: string]: string } = {
                'SuperAdmin': 'superadmin',
                'Administrador': 'admin',
                'Supervisor': 'supervisor',
                'Reponedor': 'reponedor'
            };

            // Guardar información adicional del usuario
            const userRole = rolMapping[response.user_info.rol] || response.user_info.rol.toLowerCase();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userName', response.user_info.nombre);
            localStorage.setItem('userId', response.user_info.id); // ← Guardar el ID del usuario
            
            console.log('Login exitoso:', {
                token: response.access_token,
                role: userRole,
                name: response.user_info.nombre,
                id: response.user_info.id
            });
            
            return response;
        } catch (error) {
            console.error('Error en login:', error);
            this.clearToken(); // Limpiar token en caso de error
            throw error;
        }
    }

    // Método de logout
    static logout() {
        this.clearToken();
    }

    // Método para crear un usuario
    static async createUsuario(userData: CreateUsuarioData): Promise<Usuario> {
        try {
            // Si es un supervisor creando un reponedor, usar el endpoint específico
            if (localStorage.getItem('userRole') === 'supervisor' && userData.rol === 'Reponedor') {
                return await this.createReponedor({
                    nombre: userData.nombre,
                    correo: userData.correo,
                    contraseña: userData.contraseña
                });
            }

            // Para otros casos, usar el endpoint general
            const response = await this.fetchApi<{ mensaje: string; usuario: Usuario }>(
                API_ENDPOINTS.usuarios,
                {
                    method: 'POST',
                    body: JSON.stringify(userData),
                }
            );
            return response.usuario;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    // Método para obtener usuarios (modificado para supervisores)
    static async getUsuarios(): Promise<Usuario[]> {
        try {
            const userRole = localStorage.getItem('userRole');
            const endpoint = userRole === 'supervisor' 
                ? API_ENDPOINTS.supervisor_reponedores 
                : API_ENDPOINTS.usuarios;

            const response = await this.fetchApi<{ total: number; reponedores?: Usuario[]; usuarios?: Usuario[]; mensaje: string }>(
                endpoint as string
            );

            // Si es supervisor, la respuesta viene en 'reponedores'
            if (userRole === 'supervisor' && response.reponedores) {
                return response.reponedores.map(reponedor => ({
                    ...reponedor,
                    rol: 'Reponedor' // Asegurarnos de que el rol esté presente
                }));
            }
            
            // Si es admin, la respuesta viene en 'usuarios'
            return response.usuarios || [];
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    // Método específico para obtener supervisores (solo para administradores)
    static async getSupervisores(): Promise<Usuario[]> {
        try {
            const response = await this.fetchApi<{ total: number; usuarios: Usuario[]; mensaje: string }>(
                API_ENDPOINTS.supervisores
            );
            return response.usuarios || [];
        } catch (error) {
            console.error('Error al obtener supervisores:', error);
            throw error;
        }
    }

    // Ejemplo de método para obtener productos
    static async getProductos() {
        return await this.fetchApi(API_ENDPOINTS.productos);
    }

    // Ejemplo de método para crear un producto
    static async createProducto(productoData: any) {
        return await this.fetchApi(API_ENDPOINTS.productos, {
            method: 'POST',
            body: JSON.stringify(productoData),
        });
    }

    // Método para actualizar un producto
    static async updateProducto(productoId: number, productoData: any) {
        return await this.fetchApi(`${API_ENDPOINTS.productos}/${productoId}`, {
            method: 'PUT',
            body: JSON.stringify(productoData),
        });
    }

    // Método para eliminar un producto
    static async deleteProducto(productoId: number) {
        return await this.fetchApi(`${API_ENDPOINTS.productos}/${productoId}`, {
            method: 'DELETE',
        });
    }

    // Método para actualizar un usuario
    static async updateUsuario(userId: number, userData: UpdateUsuarioData): Promise<Usuario> {
        try {
            // Asegurarnos de que el rol tenga el formato correcto
            const formattedUserData = {
                ...userData,
                rol: userData.rol === 'Supervisor' ? 'Supervisor' : 'Reponedor'
            };

            const response = await this.fetchApi<{ mensaje: string; usuario: Usuario }>(
                `${API_ENDPOINTS.usuarios}/${userId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(formattedUserData),
                }
            );

            // Asegurarnos de que la respuesta incluya el rol actualizado
            return {
                ...response.usuario,
                rol: response.usuario.rol || formattedUserData.rol // Usar el rol enviado si no viene en la respuesta
            };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // Método para eliminar un usuario
    static async deleteUsuario(userId: number): Promise<void> {
        try {
            const response = await this.fetchApi<{ mensaje: string }>(
                `${API_ENDPOINTS.usuarios}/${userId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response || response.mensaje.includes('error')) {
                throw new Error(response?.mensaje || 'Error al eliminar el usuario');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw new Error(error instanceof Error ? error.message : 'Error al eliminar el usuario');
        }
    }

    // Perfil unificado para todos los roles
    static async getProfile(): Promise<Usuario> {
        const response = await this.fetchApi<Usuario>(
            API_ENDPOINTS.profile,
            {
                method: 'GET'
            }
        );
        return response;
    }

    // Método específico para que supervisores creen reponedores
    static async createReponedor(reponedorData: CreateReponedorData): Promise<Usuario> {
        try {
            const response = await this.fetchApi<{ mensaje: string; usuario: Usuario }>(
                API_ENDPOINTS.supervisor_reponedores,
                {
                    method: 'POST',
                    body: JSON.stringify(reponedorData),
                }
            );
            return response.usuario;
        } catch (error) {
            console.error('Error al crear reponedor:', error);
            throw error;
        }
    }

    // Método público para obtener el mapa de reposición
    static async getMapaReposicion(idMapa?: number): Promise<any> {
        try {
            // Usar el endpoint correcto que ya incluye los puntos de reposición
            const endpoint = idMapa ? `?id_mapa=${idMapa}` : '';
            const response = await fetch(`${API_ENDPOINTS.mapa}/reposicion${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener el mapa');
            }

            const data = await response.json();
            console.log('Respuesta del mapa (single request):', data);

            // El endpoint ya incluye los puntos de reposición, no necesitamos hacer llamadas adicionales
            return data;
        } catch (error) {
            console.error('Error en getMapaReposicion:', error);
            throw error;
        }
    }

    /**
     * @deprecated Este método ya no es necesario porque el endpoint /mapa/reposicion 
     * ya incluye los puntos de reposición directamente. Usar getMapaReposicion() en su lugar.
     */
    static async getMuebleConPuntos(idMueble: number): Promise<any> {
        const response = await fetch(`${API_ENDPOINTS.productos}/${idMueble}/puntos`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los puntos del mueble');
        }

        return response.json();
    }

    static async asignarProductoAPunto(idProducto: number, idPunto: number): Promise<any> {
        console.log('🎯 [API] asignarProductoAPunto llamado con:', {
            idProducto,
            idPunto,
            endpoint: `/puntos/${idPunto}/asignar-producto`,
            body: { id_producto: idProducto }
        });
        
        return await this.fetchApi(
            `/puntos/${idPunto}/asignar-producto`,
            {
                method: 'PUT',
                body: JSON.stringify({ id_producto: idProducto })
            }
        );
    }

    static async desasignarProductoDePunto(idPunto: number): Promise<void> {
        if (!idPunto) {
            throw new Error('Se requiere un ID de punto válido para desasignar');
        }
        console.log('Desasignando producto del punto con ID:', idPunto);
        await this.fetchApi(`/puntos/${idPunto}/desasignar-producto`, {
            method: 'DELETE',
        });
    }

    // Desasignar completamente un punto de reposición (producto y usuario)
    static async desasignarPuntoCompleto(idPunto: number): Promise<void> {
        if (!idPunto) {
            throw new Error('Se requiere un ID de punto válido para desasignar');
        }
        console.log('Desasignando completamente el punto con ID:', idPunto);
        await this.fetchApi('/puntos/desasignar', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_punto: idPunto }),
        });
    }

    // Métodos para tareas
    static async getTareasSupervisor(estado?: string): Promise<Tarea[]> {
        console.log('🔍 ApiService.getTareasSupervisor - Iniciando petición:', {
            estado,
            token: !!this.getToken(),
            API_ENDPOINTS_tareas: API_ENDPOINTS.tareas,
            API_URL: API_URL
        });
        
        const params = new URLSearchParams();
        if (estado && estado !== 'todos') {
            params.append('estado', estado);
        }
        
        const url = params.toString() 
            ? `${API_ENDPOINTS.tareas}/supervisor?${params.toString()}`
            : `${API_ENDPOINTS.tareas}/supervisor`;
            
        console.log('🔍 ApiService.getTareasSupervisor - URL construida:', {
            url,
            startsWith_http: url.startsWith('http'),
            API_ENDPOINTS_tareas: API_ENDPOINTS.tareas
        });
            
        try {
            const result = await this.fetchApi<Tarea[]>(url, { method: 'GET' });
            console.log('🎯 ApiService.getTareasSupervisor - Respuesta exitosa:', result);
            return result;
        } catch (error) {
            console.error('❌ ApiService.getTareasSupervisor - Error:', error);
            throw error;
        }
    }

    static async getTareaById(idTarea: number): Promise<Tarea> {
        return await this.fetchApi<Tarea>(`${API_ENDPOINTS.tareas}/${idTarea}`);
    }

    static async crearTarea(data: CrearTareaData): Promise<any> {
        return await this.fetchApi(`${API_ENDPOINTS.tareas}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async actualizarEstadoTarea(idTarea: number, estado: string): Promise<void> {
        return await this.fetchApi(`${API_ENDPOINTS.tareas}/${idTarea}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    }

    static async actualizarCantidadProductoTareaPorPunto(idTarea: number, idPunto: number, cantidad: number): Promise<void> {
        await this.fetchApi(`/tareas/${idTarea}/detalle/${idPunto}`, {
            method: 'PUT',
            body: JSON.stringify({ cantidad }),
        });
    }

    static async asignarReponedor(idTarea: number, idReponedor: string): Promise<void> {
        return await this.fetchApi(`${API_ENDPOINTS.tareas}/${idTarea}/asignar-reponedor`, {
            method: 'PUT',
            body: JSON.stringify({ id_reponedor: parseInt(idReponedor) })
        });
    }

    static async actualizarReponedor(idTarea: number, idReponedor: string): Promise<void> {
        return await this.fetchApi(`${API_ENDPOINTS.tareas}/${idTarea}/reponedor`, {
            method: 'PUT',
            body: JSON.stringify({ id_reponedor: idReponedor })
        });
    }

    // Asignar reponedor a una tarea
    static async asignarReponedorATarea(idTarea: number, idReponedor: number): Promise<{
        mensaje: string;
        tarea: {
            id: number;
            estado: string;
            reponedor: string;
        };
    }> {
        return await this.fetchApi<{
            mensaje: string;
            tarea: {
                id: number;
                estado: string;
                reponedor: string;
            };
        }>(`${API_ENDPOINTS.tareas}/${idTarea}/asignar-reponedor`, {
            method: 'PUT',
            body: JSON.stringify({ id_reponedor: idReponedor }),
        });
    }

    // Métodos para reponedores
    static async getReponedoresAsignados(): Promise<Reponedor[]> {
        const response = await this.fetchApi<{ total: number; reponedores: Reponedor[]; mensaje: string }>(
            `${API_ENDPOINTS.supervisor}/reponedores`
        );
        return response.reponedores;
    }

    static async getReponedoresDisponibles(): Promise<Reponedor[]> {
        const response = await this.fetchApi<{ total: number; reponedores: Reponedor[]; mensaje: string }>(
            `${API_ENDPOINTS.supervisor}/reponedores/disponibles`
        );
        return response.reponedores;
    }

    static async asignarReponedorASupervisor(reponedorId: number): Promise<any> {
        return await this.fetchApi(
            `${API_ENDPOINTS.supervisor}/reponedores/${reponedorId}/asignar`,
            { method: 'POST' }
        );
    }

    // Método para obtener las tareas asignadas al reponedor actual
    static async getTareasReponedor(): Promise<Tarea[]> {
        return await this.fetchApi<Tarea[]>(
            '/tareas/reponedor',
            { method: 'GET' }
        );
    }

    // Método para completar una tarea
    static async completarTarea(idTarea: number): Promise<{ mensaje: string; estado: string; fecha_completada: string }> {
        return await this.fetchApi<{ mensaje: string; estado: string; fecha_completada: string }>(
            `/tareas/${idTarea}/completar`,
            { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmado: true })
            }
        );
    }

    // Método para obtener el mapa del reponedor
    static async getMapaReponedorVista(idMapa?: number): Promise<any> {
        try {
            const response = await fetch(`${API_ENDPOINTS.mapa}/reponedor/vista${idMapa ? `?id_mapa=${idMapa}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener el mapa del reponedor');
            }

            const data = await response.json();
            console.log('Respuesta del mapa del reponedor:', data);

            return data;
        } catch (error) {
            console.error('Error en getMapaReponedorVista:', error);
            throw error;
        }
    }

    // Método para generar ruta optimizada (POST - NUEVO)
    static async generarRutaOptimizada(
        idTarea: number, 
        algoritmo: 'vecino_mas_cercano' | 'fuerza_bruta' | 'genetico' = 'vecino_mas_cercano'
    ): Promise<any> {
        return await this.fetchApi<any>(
            `/tareas/${idTarea}/ruta-optimizada?algoritmo=${algoritmo}`,
            { method: 'POST' }
        );
    }

    // Método para obtener ruta visual moderna (GET - RECOMENDADO)
    static async obtenerRutaVisual(idTarea: number): Promise<RutaVisualResponse> {
        return await this.fetchApi<RutaVisualResponse>(
            `/tareas/${idTarea}/ruta-visual`,
            { method: 'GET' }
        );
    }

    // Método legacy para obtener ruta optimizada (GET - COMPATIBILIDAD)
    static async obtenerRutaOptimizada(
        idTarea: number, 
        algoritmo: 'vecino_mas_cercano' | 'fuerza_bruta' | 'genetico' = 'vecino_mas_cercano'
    ): Promise<RutaOptimizadaResponse> {
        return await this.fetchApi<RutaOptimizadaResponse>(
            `/tareas/${idTarea}/ruta-optimizada-visual`,
            { method: 'GET' }
        );
    }

    // Método para iniciar una tarea (cambiar estado a en_progreso)
    static async iniciarTarea(idTarea: number): Promise<{ mensaje: string; estado: string }> {
        return await this.fetchApi<{ mensaje: string; estado: string }>(
            `/tareas/${idTarea}/iniciar`,
            { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // Método para reiniciar una tarea completada (útil para pruebas)
    static async reiniciarTarea(idTarea: number): Promise<{ mensaje: string; estado: string }> {
        return await this.fetchApi<{ mensaje: string; estado: string }>(
            `/tareas/${idTarea}/reiniciar`,
            { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // ============ MÉTODOS DE REPORTES ============
    
    // Obtener lista de todos los reponedores
    static async getReponedoresReporte(): Promise<ListaReponedoresResponse> {
        return await this.fetchApi<ListaReponedoresResponse>(
            `${API_ENDPOINTS.reportes}/reponedores`,
            { method: 'GET' }
        );
    }

    // Obtener historial de tareas de un reponedor específico
    static async getHistorialReponedor(
        idReponedor: number,
        fechaInicio?: string,
        fechaFin?: string,
        estado?: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<HistorialReponedorResponse> {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        if (estado) params.append('estado', estado);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        return await this.fetchApi<HistorialReponedorResponse>(
            `${API_ENDPOINTS.reportes}/reponedor/${idReponedor}?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // Descargar reporte de reponedor en Excel o PDF
    static async descargarReporteReponedor(
        idReponedor: number,
        formato: 'excel' | 'pdf',
        fechaInicio?: string,
        fechaFin?: string,
        estado?: string
    ): Promise<Blob> {
        const params = new URLSearchParams();
        params.append('formato', formato);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        if (estado) params.append('estado', estado);

        const response = await fetch(
            `${API_ENDPOINTS.reportes}/reponedor/${idReponedor}/descargar?${params.toString()}`,
            {
                method: 'GET',
                headers: this.getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`Error al descargar reporte: ${response.statusText}`);
        }

        return await response.blob();
    }

    // Obtener estadísticas generales del sistema
    static async getEstadisticasGenerales(
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<EstadisticasGenerales> {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);

        return await this.fetchApi<EstadisticasGenerales>(
            `${API_ENDPOINTS.reportes}/estadisticas/general?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // Obtener productos más repuestos (JSON)
    static async getProductosMasRepuestos(request: ProductosReportRequest): Promise<ProductosRepuestosResponse> {
        return await this.fetchApi<ProductosRepuestosResponse>(
            `${API_ENDPOINTS.reportes}/productos-repuestos`,
            {
                method: 'POST',
                body: JSON.stringify(request)
            }
        );
    }

    // Descargar reporte de productos más repuestos
    static async descargarReporteProductos(
        request: ProductosReportRequest,
        formato: 'excel' | 'pdf'
    ): Promise<Blob> {
        const params = new URLSearchParams();
        params.append('formato', formato);

        const response = await fetch(
            `${API_ENDPOINTS.reportes}/productos-repuestos/descargar?${params.toString()}`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {
            throw new Error(`Error al descargar reporte: ${response.statusText}`);
        }

        return await response.blob();
    }

    // Obtener preview de productos más repuestos
    static async getPreviewProductosRepuestos(
        fechaInicio: string,
        fechaFin: string,
        limite: number = 20
    ): Promise<ProductosRepuestosResponse> {
        const params = new URLSearchParams();
        params.append('fecha_inicio', fechaInicio);
        params.append('fecha_fin', fechaFin);
        params.append('limite', limite.toString());

        return await this.fetchApi<ProductosRepuestosResponse>(
            `${API_ENDPOINTS.reportes}/productos-repuestos/preview?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // ============ MÉTODOS DE DASHBOARD ============
    
    // Obtener resumen del dashboard para administrador
    static async getDashboardResumen(
        periodo: 'dia' | 'semana' | 'mes' = 'dia',
        fecha?: string
    ): Promise<DashboardResumen> {
        const params = new URLSearchParams();
        params.append('periodo', periodo);
        if (fecha) {
            params.append('fecha', fecha);
        }

        return await this.fetchApi<DashboardResumen>(
            `${API_ENDPOINTS.dashboard}/resumen?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // Obtener estadísticas generales del reponedor (resumen semanal)
    static async getResumenSemanalEstadisticas(): Promise<ResumenSemanalEstadisticas> {
        return await this.fetchApi<ResumenSemanalEstadisticas>(
            '/reponedor/resumen-semanal/estadisticas',
            { method: 'GET' }
        );
    }

    // Obtener rendimiento de reponedores (para supervisores)
    static async getRendimientoReponedores(fecha_inicio?: string, fecha_fin?: string): Promise<RendimientoReponedores> {
        const params = new URLSearchParams();
        if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
        if (fecha_fin) params.append('fecha_fin', fecha_fin);
        
        const url = `/admin/estadisticas/supervisor/reponedores-rendimiento${params.toString() ? `?${params.toString()}` : ''}`;
        return await this.fetchApi<RendimientoReponedores>(url, { method: 'GET' });
    }

    // Obtener estadísticas de productos (para supervisores)
    static async getEstadisticasProductosSupervisor(fecha_inicio?: string, fecha_fin?: string): Promise<EstadisticasProductos> {
        const params = new URLSearchParams();
        if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
        if (fecha_fin) params.append('fecha_fin', fecha_fin);
        
        const url = `/admin/estadisticas/supervisor/productos-estadisticas${params.toString() ? `?${params.toString()}` : ''}`;
        return await this.fetchApi<EstadisticasProductos>(url, { method: 'GET' });
    }

    // ============ MÉTODOS DE BACKOFFICE (SUPERADMIN) ============
    
    // 1) Obtener métricas del dashboard del sistema
    static async getBackofficeMetricas(): Promise<MetricasSistema> {
        return await this.fetchApi<MetricasSistema>(
            '/backoffice/dashboard/metricas',
            { method: 'GET' }
        );
    }

    // 2) Listar empresas con filtros y paginación
    static async getBackofficeEmpresas(
        estado?: string,
        skip: number = 0,
        limit: number = 50
    ): Promise<EmpresaBackoffice[]> {
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());

        return await this.fetchApi<EmpresaBackoffice[]>(
            `/backoffice/empresas?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // 3) Obtener resumen de una empresa específica
    static async getBackofficeResumenEmpresa(idEmpresa: number): Promise<ResumenEmpresa> {
        return await this.fetchApi<ResumenEmpresa>(
            `/backoffice/empresas/${idEmpresa}/resumen`,
            { method: 'GET' }
        );
    }

    // 4) Obtener consumo de recursos de una empresa
    static async getBackofficeConsumoEmpresa(idEmpresa: number): Promise<ConsumoRecursos> {
        return await this.fetchApi<ConsumoRecursos>(
            `/backoffice/empresas/${idEmpresa}/consumo`,
            { method: 'GET' }
        );
    }

    // 5) Obtener logs de auditoría con filtros
    static async getBackofficeAuditoriaLogs(
        usuario_id?: number,
        empresa_id?: number,
        entidad?: string,
        accion?: string,
        fecha_desde?: string,
        fecha_hasta?: string,
        skip: number = 0,
        limit: number = 50
    ): Promise<LogAuditoria[]> {
        const params = new URLSearchParams();
        if (usuario_id) params.append('usuario_id', usuario_id.toString());
        if (empresa_id) params.append('empresa_id', empresa_id.toString());
        if (entidad) params.append('entidad', entidad);
        if (accion) params.append('accion', accion);
        if (fecha_desde) params.append('fecha_desde', fecha_desde);
        if (fecha_hasta) params.append('fecha_hasta', fecha_hasta);
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());

        return await this.fetchApi<LogAuditoria[]>(
            `/backoffice/auditoria/logs?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // 6) Obtener estadísticas de auditoría
    static async getBackofficeEstadisticasAuditoria(): Promise<EstadisticasAuditoria> {
        return await this.fetchApi<EstadisticasAuditoria>(
            '/backoffice/auditoria/estadisticas',
            { method: 'GET' }
        );
    }

    // 7) Obtener historial de cambios de una entidad específica
    static async getBackofficeHistorialEntidad(
        entidad: string,
        idEntidad: number,
        limit: number = 50
    ): Promise<LogAuditoria[]> {
        return await this.fetchApi<LogAuditoria[]>(
            `/backoffice/auditoria/entidad/${entidad}/${idEntidad}?limit=${limit}`,
            { method: 'GET' }
        );
    }

    // 8) Suspender una empresa
    static async suspenderEmpresa(
        idEmpresa: number,
        motivo: string
    ): Promise<{ mensaje: string }> {
        if (!motivo || motivo.length < 10) {
            throw new Error('El motivo debe tener al menos 10 caracteres');
        }

        return await this.fetchApi<{ mensaje: string }>(
            `/backoffice/empresas/${idEmpresa}/suspender?motivo=${encodeURIComponent(motivo)}`,
            { method: 'POST' }
        );
    }

    // 9) Reactivar una empresa suspendida
    static async reactivarEmpresa(idEmpresa: number): Promise<{ mensaje: string }> {
        return await this.fetchApi<{ mensaje: string }>(
            `/backoffice/empresas/${idEmpresa}/reactivar`,
            { method: 'POST' }
        );
    }

    // ============ FIN MÉTODOS DE BACKOFFICE ============

    // ============ MÉTODOS DE COTIZACIONES ============

    // 1) Solicitar cotización (público - sin autenticación)
    static async solicitarCotizacion(data: CotizacionSolicitar): Promise<CotizacionResponse> {
        return await this.fetchApi<CotizacionResponse>(
            '/cotizaciones/solicitar',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            },
            false // No requiere autenticación
        );
    }

    // 2) Listar cotizaciones con filtros (SuperAdmin)
    static async listarCotizaciones(
        estado?: string,
        skip: number = 0,
        limit: number = 100
    ): Promise<CotizacionListItem[]> {
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());

        return await this.fetchApi<CotizacionListItem[]>(
            `/cotizaciones/?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // 3) Listar cotizaciones pendientes (SuperAdmin)
    static async listarCotizacionesPendientes(): Promise<CotizacionListItem[]> {
        return await this.fetchApi<CotizacionListItem[]>(
            '/cotizaciones/pendientes',
            { method: 'GET' }
        );
    }

    // 4) Obtener estadísticas de cotizaciones (SuperAdmin)
    static async getCotizacionesEstadisticas(): Promise<CotizacionStats> {
        return await this.fetchApi<CotizacionStats>(
            '/cotizaciones/estadisticas',
            { method: 'GET' }
        );
    }

    // 5) Obtener detalle de cotización (SuperAdmin)
    static async getCotizacion(idCotizacion: number): Promise<CotizacionResponse> {
        return await this.fetchApi<CotizacionResponse>(
            `/cotizaciones/${idCotizacion}`,
            { method: 'GET' }
        );
    }

    // 6) Actualizar cotización (SuperAdmin)
    static async actualizarCotizacion(
        idCotizacion: number,
        data: CotizacionUpdate
    ): Promise<CotizacionResponse> {
        return await this.fetchApi<CotizacionResponse>(
            `/cotizaciones/${idCotizacion}`,
            {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 7) Cambiar estado de cotización (SuperAdmin)
    static async cambiarEstadoCotizacion(
        idCotizacion: number,
        nuevoEstado: string
    ): Promise<{ mensaje: string }> {
        return await this.fetchApi<{ mensaje: string }>(
            `/cotizaciones/${idCotizacion}/cambiar-estado`,
            {
                method: 'POST',
                body: JSON.stringify({ nuevo_estado: nuevoEstado }),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 8) Convertir cotización aprobada en empresa + plan (SuperAdmin)
    static async convertirCotizacion(idCotizacion: number): Promise<CotizacionConvertidaResponse> {
        return await this.fetchApi<CotizacionConvertidaResponse>(
            `/cotizaciones/${idCotizacion}/convertir`,
            { method: 'POST' }
        );
    }

    // ============ FIN MÉTODOS DE COTIZACIONES ============

    // ============ MÉTODOS DE FACTURACIÓN ============

    // 1) Listar mis facturas (Admin de empresa)
    static async listarMisFacturas(
        skip: number = 0,
        limit: number = 100,
        estado?: string
    ): Promise<FacturaListItem[]> {
        const params = new URLSearchParams();
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());
        if (estado) params.append('estado', estado);

        return await this.fetchApi<FacturaListItem[]>(
            `/facturas/mis-facturas?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // 2) Listar todas las facturas (SuperAdmin)
    static async listarFacturas(
        skip: number = 0,
        limit: number = 100,
        estado?: string
    ): Promise<FacturaListItem[]> {
        const params = new URLSearchParams();
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());
        if (estado) params.append('estado', estado);

        return await this.fetchApi<FacturaListItem[]>(
            `/facturas/?${params.toString()}`,
            { method: 'GET' }
        );
    }

    // 3) Listar facturas pendientes (SuperAdmin)
    static async listarFacturasPendientes(): Promise<FacturaListItem[]> {
        return await this.fetchApi<FacturaListItem[]>(
            '/facturas/pendientes',
            { method: 'GET' }
        );
    }

    // 4) Listar facturas vencidas (SuperAdmin)
    static async listarFacturasVencidas(): Promise<FacturaListItem[]> {
        return await this.fetchApi<FacturaListItem[]>(
            '/facturas/vencidas',
            { method: 'GET' }
        );
    }

    // 5) Obtener estadísticas de facturación (SuperAdmin)
    static async getFacturasStats(idEmpresa?: number): Promise<FacturaStats> {
        const params = idEmpresa ? `?id_empresa=${idEmpresa}` : '';
        return await this.fetchApi<FacturaStats>(
            `/facturas/stats${params}`,
            { method: 'GET' }
        );
    }

    // 6) Obtener detalle de factura (SuperAdmin o Admin de empresa)
    static async getFactura(idFactura: number): Promise<FacturaResponse> {
        return await this.fetchApi<FacturaResponse>(
            `/facturas/${idFactura}`,
            { method: 'GET' }
        );
    }

    // 7) Generar factura automática (SuperAdmin)
    static async generarFactura(data: FacturaGenerar): Promise<FacturaResponse> {
        return await this.fetchApi<FacturaResponse>(
            '/facturas/generar',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 8) Crear factura manual (SuperAdmin)
    static async crearFactura(data: FacturaCreate): Promise<FacturaResponse> {
        return await this.fetchApi<FacturaResponse>(
            '/facturas/',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 9) Actualizar factura (SuperAdmin)
    static async actualizarFactura(
        idFactura: number,
        data: FacturaUpdate
    ): Promise<FacturaResponse> {
        return await this.fetchApi<FacturaResponse>(
            `/facturas/${idFactura}`,
            {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 10) Registrar pago de factura (SuperAdmin)
    static async registrarPagoFactura(
        idFactura: number,
        data: FacturaRegistrarPago
    ): Promise<FacturaResponse> {
        return await this.fetchApi<FacturaResponse>(
            `/facturas/${idFactura}/registrar-pago`,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // 11) Marcar factura como vencida (SuperAdmin)
    static async marcarFacturaVencida(idFactura: number): Promise<{ mensaje: string }> {
        return await this.fetchApi<{ mensaje: string }>(
            `/facturas/${idFactura}/marcar-vencida`,
            { method: 'POST' }
        );
    }

    // 12) Anular factura (SuperAdmin)
    static async anularFactura(
        idFactura: number,
        motivo: string
    ): Promise<{ mensaje: string }> {
        return await this.fetchApi<{ mensaje: string }>(
            `/facturas/${idFactura}/anular`,
            {
                method: 'POST',
                body: JSON.stringify({ motivo }),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    // ============ FIN MÉTODOS DE FACTURACIÓN ============

    // ============ MÉTODOS DE AUDITORÍA AVANZADA ============

    // 1) Obtener historial de actividad de un usuario específico
    static async getAuditoriaUsuario(
        idUsuario: number,
        dias: number = 30,
        limit: number = 50
    ): Promise<LogAuditoria[]> {
        return await this.fetchApi<LogAuditoria[]>(
            `/auditoria/usuario/${idUsuario}?dias=${dias}&limit=${limit}`,
            { method: 'GET' }
        );
    }

    // 2) Listar acciones registradas
    static async getAuditoriaAcciones(): Promise<string[]> {
        return await this.fetchApi<string[]>(
            '/auditoria/acciones',
            { method: 'GET' }
        );
    }

    // 3) Listar tipos de entidad registrados
    static async getAuditoriaEntidades(): Promise<string[]> {
        return await this.fetchApi<string[]>(
            '/auditoria/entidades',
            { method: 'GET' }
        );
    }

    // 4) Obtener actividad reciente (últimos N minutos)
    static async getAuditoriaActividadReciente(
        minutos: number = 60,
        limit: number = 20
    ): Promise<LogAuditoria[]> {
        return await this.fetchApi<LogAuditoria[]>(
            `/auditoria/actividad-reciente?minutos=${minutos}&limit=${limit}`,
            { method: 'GET' }
        );
    }

    // ============ FIN MÉTODOS DE AUDITORÍA AVANZADA ============

    // Métodos para persistir la tarea activa y ruta en localStorage
    static setTareaActiva(idTarea: number): void {
        localStorage.setItem('tarea_activa', idTarea.toString());
    }

    static getTareaActiva(): number | null {
        const idTarea = localStorage.getItem('tarea_activa');
        return idTarea ? parseInt(idTarea, 10) : null;
    }

    static clearTareaActiva(): void {
        localStorage.removeItem('tarea_activa');
        localStorage.removeItem('ruta_optimizada');
        localStorage.removeItem('detalles_completados');
    }

    static setRutaOptimizada(ruta: any): void {
        localStorage.setItem('ruta_optimizada', JSON.stringify(ruta));
    }

    static getRutaOptimizada(): any | null {
        const ruta = localStorage.getItem('ruta_optimizada');
        return ruta ? JSON.parse(ruta) : null;
    }

    static setDetallesCompletados(detalles: number[]): void {
        localStorage.setItem('detalles_completados', JSON.stringify(detalles));
    }

    static getDetallesCompletados(): number[] {
        const detalles = localStorage.getItem('detalles_completados');
        return detalles ? JSON.parse(detalles) : [];
    }

    // Consultar ruta optimizada por ID de tarea (ACTUALIZADO para usar POST)
    static async getRutaOptimizadaPorTarea(idTarea: number, algoritmo: string = 'vecino_mas_cercano'): Promise<any> {
        return await this.fetchApi<any>(
            `/tareas/${idTarea}/ruta-optimizada?algoritmo=${algoritmo}`,
            { method: 'POST' }
        );
    }

    // Obtener detalle de una tarea específica
    static async getDetalleTarea(idTarea: number): Promise<any> {
        return await this.fetchApi<any>(
            `/tareas/${idTarea}`,
            { method: 'GET' }
        );
    }

    // Obtener todas las tareas para el administrador
    static async getAllTareas(): Promise<any[]> {
        try {
            // Primero intentamos obtener todas las tareas del reponedor actual para ver la estructura
            const tareasReponedor = await this.getTareasReponedor();
            
            // Transformar los datos para que coincidan con lo que espera el frontend del admin
            const tareasTransformadas = tareasReponedor.map((tarea: any) => ({
                id: tarea.id_tarea,
                supervisor_a_cargo: 'Sin asignar', // Por ahora, esto se puede mejorar cuando tengamos endpoint específico
                producto: tarea.productos?.[0]?.nombre || 'Sin producto',
                estado: tarea.estado
            }));

            return tareasTransformadas;
        } catch (error) {
            console.error('Error al obtener tareas:', error);
            
            // Fallback: intentar obtener tareas específicas por ID
            const tareas = [];
            for (let i = 1; i <= 5; i++) {
                try {
                    const tarea = await this.getDetalleTarea(i);
                    tareas.push({
                        id: tarea.id_tarea,
                        supervisor_a_cargo: tarea.supervisor,
                        producto: tarea.productos?.[0]?.nombre || 'Sin producto',
                        estado: tarea.estado
                    });
                } catch (error) {
                    // Tarea no encontrada o sin acceso, continuar
                    continue;
                }
            }
            return tareas;
        }
    }

    // ==================== REPORTES ====================
    
    // Listar todos los reponedores
    static async getReponedores(): Promise<any[]> {
        return await this.fetchApi<any>(
            `/reportes/reponedores`,
            { method: 'GET' }
        );
    }

    // Obtener historial de un reponedor
    static async getHistorialReponedor(
        idReponedor: number,
        fechaInicio?: string,
        fechaFin?: string,
        estado?: string
    ): Promise<any> {
        let url = `/reportes/reponedor/${idReponedor}`;
        const params = new URLSearchParams();
        
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        if (estado) params.append('estado', estado);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        return await this.fetchApi<any>(url, { method: 'GET' });
    }

    // Obtener estadísticas generales
    static async getEstadisticasGenerales(
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<any> {
        let url = `/reportes/estadisticas/general`;
        const params = new URLSearchParams();
        
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        return await this.fetchApi<any>(url, { method: 'GET' });
    }

    // Descargar reporte de reponedor
    static async descargarReporteReponedor(
        idReponedor: number,
        formato: 'excel' | 'pdf' = 'excel',
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<Blob> {
        let url = `/reportes/reponedor/${idReponedor}/descargar`;
        const params = new URLSearchParams({ formato });
        
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        url += `?${params.toString()}`;
        
        const token = this.getToken();
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al descargar el reporte');
        }
        
        return await response.blob();
    }
}

// Nuevas funciones para obtener el mapa según el rol
export async function getMapaReponedor(token: string, idMapa?: number) {
  const params = idMapa ? `?id_mapa=${idMapa}` : '';
  const response = await fetch(`${API_URL}/mapa/reponedor/vista${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('No se pudo obtener el mapa del reponedor');
  return await response.json();
}
