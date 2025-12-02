import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  BarChart3,
  Clock,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { ApiService, Tarea, ResumenSemanalEstadisticas } from "@/services/api";
import ReponedorLayout from '@/components/layout/ReponedorLayout';

// Componente de Métrica (EXACTO AL BACKOFFICE)
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
          <span className="text-emerald-600 font-medium">{subtext}</span>
        </p>
      )}
    </div>
  );
}

const ReponedorDashboard = () => {
  const userName = localStorage.getItem('userName') || 'Reponedor';

  // Estado para el resumen
  const [resumen, setResumen] = useState({
    tareasHoy: 0,
    completadas: 0,
    pendientes: 0,
    alertas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<ResumenSemanalEstadisticas["data"] | null>(null);

  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      setError(null);
      try {
        const tareasApi: Tarea[] = await ApiService.getTareasReponedor();
        const hoy = new Date().toISOString().slice(0, 10);
        const tareasHoy = tareasApi.filter(t => t.fecha_creacion && t.fecha_creacion.startsWith(hoy));
        const completadas = tareasApi.filter(t => t.estado && t.estado.toLowerCase() === 'completada').length;
        const pendientes = tareasApi.filter(t => t.estado && t.estado.toLowerCase() !== 'completada').length;
        
        setResumen({
          tareasHoy: tareasHoy.length,
          completadas,
          pendientes,
          alertas: 0
        });

        const estadisticasRes = await ApiService.getResumenSemanalEstadisticas();
        setEstadisticas(estadisticasRes.data);
      } catch (err: any) {
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  return (
    <ReponedorLayout>
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">
          Resumen General
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500">Reponedor</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
          
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {/* MÉTRICAS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Tareas de Hoy"
                value={resumen.tareasHoy}
                subtext={null}
                icon={Clock}
                colorClass="bg-blue-600"
              />
              <MetricCard
                title="Completadas"
                value={resumen.completadas}
                subtext={null}
                icon={CheckCircle}
                colorClass="bg-emerald-600"
              />
              <MetricCard
                title="Pendientes"
                value={resumen.pendientes}
                subtext={null}
                icon={ListChecks}
                colorClass="bg-amber-600"
              />
              <MetricCard
                title="Alertas"
                value={resumen.alertas}
                subtext={null}
                icon={AlertCircle}
                colorClass="bg-rose-600"
              />
            </div>

            {/* Estadísticas Generales */}
            {estadisticas && (
              <>
                {/* Sección de Estadísticas */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    Estadísticas de Rendimiento
                  </h3>
                  
                  {/* Métricas de Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle size={20} className="text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Total Tareas</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{estadisticas.total_tareas}</div>
                      <p className="text-xs text-slate-500 mt-1">Tareas completadas</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package size={20} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Productos</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{estadisticas.total_productos_repuestos}</div>
                      <p className="text-xs text-slate-500 mt-1">Unidades repuestas</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BarChart3 size={20} className="text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Promedio</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{estadisticas.promedio_productos_por_tarea}</div>
                      <p className="text-xs text-slate-500 mt-1">Productos/tarea</p>
                    </div>
                  </div>

                  {/* Distribución y Periodo */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Distribución por Estado */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Distribución por Estado</h4>
                      <div className="space-y-2">
                        {Object.entries(estadisticas.tareas_por_estado).map(([estado, cantidad]) => {
                          const estadoConfig: Record<string, { bg: string; text: string; label: string }> = {
                            pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pendiente' },
                            en_progreso: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En Progreso' },
                            completada: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completada' },
                            cancelada: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' }
                          };
                          const config = estadoConfig[estado] || estadoConfig.pendiente;
                          
                          return (
                            <div key={estado} className={`${config.bg} rounded-lg p-3 flex items-center justify-between`}>
                              <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
                              <span className={`text-xl font-bold ${config.text}`}>{cantidad}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Periodo de Actividad */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Periodo de Actividad</h4>
                      <div className="space-y-2">
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <div className="text-xs text-emerald-600 font-medium mb-1">Primera Tarea</div>
                          <div className="text-sm font-semibold text-emerald-800">
                            {estadisticas.periodo_actividad.fecha_primera_tarea 
                              ? new Date(estadisticas.periodo_actividad.fecha_primera_tarea).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })
                              : 'Sin datos'
                            }
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">Última Tarea</div>
                          <div className="text-sm font-semibold text-blue-800">
                            {estadisticas.periodo_actividad.fecha_ultima_tarea 
                              ? new Date(estadisticas.periodo_actividad.fecha_ultima_tarea).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })
                              : 'Sin datos'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ReponedorLayout>
  );
};

export default ReponedorDashboard;
