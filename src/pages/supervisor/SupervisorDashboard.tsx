
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, TrendingUp, Package2, AlertCircle } from 'lucide-react';
import { ApiService, RendimientoReponedores, EstadisticasProductos } from '@/services/api';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('nombre') || 'Supervisor';

  // Estados para las métricas
  const [rendimientoReponedores, setRendimientoReponedores] = useState<RendimientoReponedores['data'] | null>(null);
  const [estadisticasProductos, setEstadisticasProductos] = useState<EstadisticasProductos['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de métricas
  useEffect(() => {
    const fetchMetricas = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rendimientoRes, estadisticasRes] = await Promise.all([
          ApiService.getRendimientoReponedores(),
          ApiService.getEstadisticasProductosSupervisor()
        ]);
        
        setRendimientoReponedores(rendimientoRes.data);
        setEstadisticasProductos(estadisticasRes.data);
      } catch (err: any) {
        setError(`Error: ${err.message || 'No se pudieron cargar las métricas'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, []);

  // Componente MetricCard
  const MetricCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SupervisorLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-600">Bienvenido, {userName}</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Reponedores Activos"
            value={rendimientoReponedores?.reponedores?.length || 0}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <MetricCard
            title="Tareas Asignadas"
            value={rendimientoReponedores?.reponedores?.reduce((sum, rep) => sum + rep.tareas_totales, 0) || 0}
            icon={Calendar}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <MetricCard
            title="Tareas Completadas"
            value={rendimientoReponedores?.reponedores?.reduce((sum, rep) => sum + rep.tareas_completadas, 0) || 0}
            icon={BarChart3}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
        </div>

        {/* Estadísticas detalladas */}
        {loading ? (
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardContent className="py-12">
              <p className="text-center text-slate-600">Cargando estadísticas...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-100 shadow-sm bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card de Rendimiento */}
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Rendimiento del Equipo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rendimientoReponedores && rendimientoReponedores.reponedores && rendimientoReponedores.reponedores.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{rendimientoReponedores.reponedores.length}</div>
                        <div className="text-sm text-slate-600">Activos</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-600">
                          {(rendimientoReponedores.reponedores.reduce((sum, rep) => sum + rep.tasa_completacion, 0) / rendimientoReponedores.reponedores.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-600">Eficiencia</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 text-center">
                        <span className="font-medium">Top performer:</span> {
                          rendimientoReponedores.reponedores
                            .sort((a, b) => b.tasa_completacion - a.tasa_completacion)[0]?.nombre || 'N/A'
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-4 text-slate-500">Sin datos disponibles</p>
                )}
              </CardContent>
            </Card>

            {/* Card de Productos */}
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Package2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Gestión de Productos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {estadisticasProductos?.resumen ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-600">{estadisticasProductos.resumen.total_productos || 0}</div>
                        <div className="text-sm text-slate-600">Productos</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{estadisticasProductos.resumen.total_reposiciones || 0}</div>
                        <div className="text-sm text-slate-600">Reposiciones</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 text-center">
                        <span className="font-medium">Top producto:</span> {
                          estadisticasProductos.productos_mas_frecuentes?.[0]?.nombre || 'N/A'
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-4 text-slate-500">Sin datos disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorDashboard;