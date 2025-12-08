/**
 * Tipos para el sistema de límites de suscripción/planes
 */

export interface PlanEmpresa {
  id_plan: number;
  id_empresa: number;
  cantidad_supervisores: number | null;
  cantidad_reponedores: number | null;
  cantidad_productos: number | null;
  cantidad_puntos: number | null;
  precio_mensual?: number;
  activo: boolean;
  features?: {
    dashboard?: boolean;
    optimizacion_rutas?: boolean;
    reportes_pdf?: boolean;
    [key: string]: any;
  };
}

export interface ValidacionRecurso {
  valido: boolean;
  limite_plan: number | null;
  cantidad_actual: number;
  disponible: number;
  porcentaje_uso: number;
  excedido?: boolean;
}

export interface PlanConUso extends PlanEmpresa {
  uso_supervisores?: number;
  uso_reponedores?: number;
  uso_productos?: number;
  uso_puntos?: number;
  validaciones?: {
    supervisores?: ValidacionRecurso;
    reponedores?: ValidacionRecurso;
    productos?: ValidacionRecurso;
    puntos?: ValidacionRecurso;
  };
}

export interface ErrorLimitePlan {
  error: 'plan_limit_exceeded';
  mensaje: string;
  recurso: 'supervisores' | 'reponedores' | 'productos' | 'puntos';
  limite_plan: number;
  uso_actual: number;
  accion_requerida: 'upgrade_plan';
  sugerencia: string;
}

export interface CreatePlanData {
  id_empresa: number;
  cantidad_supervisores: number;
  cantidad_reponedores: number;
  cantidad_productos?: number | null;
  cantidad_puntos?: number | null;
  precio_mensual?: number;
  features?: Record<string, any>;
}

export interface UpdatePlanData {
  cantidad_supervisores?: number | null;
  cantidad_reponedores?: number | null;
  cantidad_productos?: number | null;
  cantidad_puntos?: number | null;
  precio_mensual?: number;
  features?: Record<string, any>;
}

export type RecursoLimitado = 'supervisores' | 'reponedores' | 'productos' | 'puntos';
