import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Building2,
  Activity
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type MetricasSistema } from '@/services/api';
import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { useNavigate } from 'react-router-dom';

// Componente de Sidebar Item - NO USADO, MOVIDO A LAYOUT
// Componente de Métrica
function MetricCard({ title, value, subtext, icon: Icon, colorClass }: any) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} text-white shadow-sm`}>
          <Icon size={24} />
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-500" />
          <span className="text-emerald-600 font-medium">{subtext}</span> vs mes anterior
        </p>
      )}
    </div>
  );
}

// Componente de Estado del Sistema
function SystemStatusItem({ label, status }: { label: string, status: 'operational' | 'degraded' | 'down' }) {
  const colors = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-rose-500"
  };
  const text = {
    operational: "Operacional",
    degraded: "Lento / Degradado",
    down: "Caído"
  };
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colors[status]}`}></span>
        <span className="text-slate-500 text-xs">{text[status]}</span>
      </div>
    </div>
  );
}

const BackofficeDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [metricas, setMetricas] = useState<MetricasSistema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Cargar métricas del sistema
  const cargarMetricas = async () => {
    try {
      setIsLoading(true);
      const datos = await ApiService.getBackofficeMetricas();
      setMetricas(datos);
      setLastUpdate(new Date());
      
      toast({
        title: "Métricas actualizadas",
        description: "Datos del sistema actualizados correctamente.",
      });
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas del sistema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarMetricas();
  }, []);

  // Calcular variación porcentual de ingresos
  const calcularVariacionIngresos = () => {
    if (!metricas || metricas.ingresos_mes_anterior === 0) return 0;
    return ((metricas.ingresos_mes_actual - metricas.ingresos_mes_anterior) / metricas.ingresos_mes_anterior) * 100;
  };

  const variacionIngresos = calcularVariacionIngresos();

  return (
    <BackofficeLayout>
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            Resumen General
          </h2>
          
          <div className="flex items-center gap-6">
            <button
              onClick={cargarMetricas}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">Super Admin</p>
                <p className="text-xs text-slate-500">Sistema POE</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando métricas del sistema...</p>
              </div>
            </div>
          ) : metricas ? (
            <>
              {/* Última actualización */}
              <div className="text-right text-xs text-slate-400">
                Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
              </div>

              {/* MÉTRICAS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                <MetricCard 
                  title="Empresas Activas" 
                  value={metricas.empresas_activas} 
                  subtext={`${metricas.total_empresas} total`}
                  icon={Building2} 
                  colorClass="bg-blue-500" 
                />
                <MetricCard 
                  title="Facturación Mes" 
                  value={`$${metricas.ingresos_mes_actual.toLocaleString('es-CL')}`} 
                  subtext={variacionIngresos >= 0 ? `+${variacionIngresos.toFixed(1)}%` : `${variacionIngresos.toFixed(1)}%`}
                  icon={DollarSign} 
                  colorClass="bg-emerald-500" 
                />
                <MetricCard 
                  title="Usuarios Totales" 
                  value={metricas.total_usuarios} 
                  subtext={`${metricas.usuarios_activos} activos`}
                  icon={Users} 
                  colorClass="bg-violet-500" 
                />
                <MetricCard 
                  title="Casos Soporte" 
                  value={metricas.actividades_soporte_abiertas} 
                  subtext={`${metricas.actividades_soporte_cerradas} cerrados`}
                  icon={AlertTriangle} 
                  colorClass="bg-amber-500" 
                />
              </div>

              {/* GRID INFERIOR */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* ESTADO DE EMPRESAS */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Estado de Empresas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Activas</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-3xl font-bold text-green-800">{metricas.empresas_activas}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {((metricas.empresas_activas / metricas.total_empresas) * 100).toFixed(1)}% del total
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-700">En Prueba</span>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-800">{metricas.empresas_en_prueba}</p>
                      <p className="text-xs text-yellow-600 mt-1">Período de evaluación</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">Suspendidas</span>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <p className="text-3xl font-bold text-red-800">{metricas.empresas_suspendidas}</p>
                      <p className="text-xs text-red-600 mt-1">Requieren atención</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Inactivas</span>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{metricas.empresas_inactivas}</p>
                      <p className="text-xs text-gray-600 mt-1">Sin servicio activo</p>
                    </div>
                  </div>
                </div>

                {/* ESTADO DEL SISTEMA */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Estado del Sistema</h3>
                  <div className="space-y-4">
                    <SystemStatusItem label="API Gateway" status="operational" />
                    <SystemStatusItem label="Base de Datos" status="operational" />
                    <SystemStatusItem label="Servicio de Facturación" status="operational" />
                    <SystemStatusItem label="Notificaciones" status="operational" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Todos los servicios operativos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* USUARIOS Y SUSCRIPCIONES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Usuarios por Rol */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Usuarios por Rol</h3>
                  <div className="space-y-3">
                    {Object.entries(metricas.usuarios_por_rol)
                      .filter(([rol]) => !['superadmin', 'super_admin'].includes(rol.toLowerCase()))
                      .map(([rol, cantidad]) => {
                        const rolNames: { [key: string]: string } = {
                          'admin': 'Administrador',
                          'supervisor': 'Supervisor',
                          'reponedor': 'Reponedor'
                        };
                        return (
                          <div key={rol} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users size={20} className="text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-700">{rolNames[rol.toLowerCase()] || rol}</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-800">{cantidad}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Suscripciones */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Estado de Suscripciones</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="font-medium text-green-700">Planes Activos</span>
                      <span className="text-2xl font-bold text-green-800">{metricas.planes_activos}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <span className="font-medium text-orange-700">Por Vencer (30d)</span>
                      <span className="text-2xl font-bold text-orange-800">{metricas.planes_por_vencer_30d}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="font-medium text-red-700">Planes Vencidos</span>
                      <span className="text-2xl font-bold text-red-800">{metricas.planes_vencidos}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FACTURACIÓN Y COTIZACIONES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Facturación */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Facturación</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">Mes Actual</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ${metricas.ingresos_mes_actual.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Facturas Pagadas</span>
                      <span className="font-bold text-green-600">{metricas.facturas_pagadas_mes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Facturas Pendientes</span>
                      <span className="font-bold text-amber-600">{metricas.facturas_pendientes}</span>
                    </div>
                  </div>
                </div>

                {/* Cotizaciones */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Cotizaciones</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Pendientes</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                        {metricas.cotizaciones_pendientes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Aprobadas</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        {metricas.cotizaciones_aprobadas}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Rechazadas</span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                        {metricas.cotizaciones_rechazadas}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Soporte */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Actividades Soporte</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-600 font-medium mb-1">Casos Abiertos</p>
                      <p className="text-3xl font-bold text-orange-800">{metricas.actividades_soporte_abiertas}</p>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-slate-600">Casos Cerrados</span>
                      <span className="font-bold text-green-600">{metricas.actividades_soporte_cerradas}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCIONES RÁPIDAS */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Acciones Rápidas</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/backoffice/empresas')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                  >
                    <Building2 size={16} />
                    Gestionar Empresas
                  </button>
                  <button
                    onClick={() => navigate('/backoffice/auditoria')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <Activity size={16} />
                    Ver Auditoría
                  </button>
                  <button
                    onClick={cargarMetricas}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refrescar Métricas
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
              <AlertTriangle size={48} className="mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600">Error al cargar métricas</h3>
              <p className="text-center max-w-md mt-2">No se pudieron obtener las métricas del sistema.</p>
              <button
                onClick={cargarMetricas}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
    </BackofficeLayout>
  );
};

export default BackofficeDashboard;
