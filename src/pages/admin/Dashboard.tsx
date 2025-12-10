import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { Users, Package, FileText, Loader2, RefreshCw, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type DashboardResumen } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados para el dashboard
  const [dashboardData, setDashboardData] = useState<DashboardResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  // Inicializar fecha actual
  useEffect(() => {
    const hoy = new Date();
    setFechaSeleccionada(hoy.toISOString().split('T')[0]);
    
    // Establecer datos por defecto iniciales
    setDashboardData({
      tareas: {
        total: 0,
        pendientes: 0,
        en_progreso: 0,
        completadas: 0
      },
      top_productos: [],
      actividad_usuarios: [],
      periodo: 'dia',
      fecha_inicio: hoy.toISOString().split('T')[0],
      fecha_fin: hoy.toISOString().split('T')[0]
    });
  }, []);

  // Cargar datos del dashboard
  const cargarDashboard = async () => {
    try {
      setIsLoading(true);
      const datos = await ApiService.getDashboardResumen(periodo, fechaSeleccionada || undefined);
      setDashboardData(datos);
    } catch (error) {
      
      // Establecer datos por defecto en caso de error
      setDashboardData({
        tareas: {
          total: 0,
          pendientes: 0,
          en_progreso: 0,
          completadas: 0
        },
        top_productos: [],
        actividad_usuarios: [],
        periodo: periodo,
        fecha_inicio: fechaSeleccionada || new Date().toISOString().split('T')[0],
        fecha_fin: fechaSeleccionada || new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas del dashboard. Mostrando datos por defecto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarDashboard();
    }
  }, [periodo, fechaSeleccionada]);

  const MetricCard = ({ title, value, icon, color, isLoading }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    isLoading: boolean;
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-emerald-600 bg-emerald-50',
      amber: 'text-amber-600 bg-amber-50',
      red: 'text-rose-600 bg-rose-50',
    }[color];

    return (
      <Card className="border-slate-100 shadow-sm bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Cargando Dashboard</h2>
            <p className="text-slate-600">Obteniendo métricas del sistema...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Administrativo</h1>
          <p className="text-sm text-slate-600">Resumen y métricas del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={(value) => setPeriodo(value as 'dia' | 'semana' | 'mes')}>
            <SelectTrigger className="w-32 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoy</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mes</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={cargarDashboard}
            disabled={isLoading}
            className="border-slate-200 hover:bg-slate-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Tareas"
            value={dashboardData?.tareas?.total || 0}
            icon={<FileText className="w-5 h-5" />}
            color="blue"
            isLoading={isLoading}
          />
          <MetricCard
            title="Completadas"
            value={dashboardData?.tareas?.completadas || 0}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
            isLoading={isLoading}
          />
          <MetricCard
            title="En Progreso"
            value={dashboardData?.tareas?.en_progreso || 0}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
            isLoading={isLoading}
          />
          <MetricCard
            title="Pendientes"
            value={dashboardData?.tareas?.pendientes || 0}
            icon={<AlertCircle className="w-5 h-5" />}
            color="red"
            isLoading={isLoading}
          />
        </div>

        {/* Tablas de datos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Productos */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Productos Más Repuestos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.top_productos && dashboardData.top_productos.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.top_productos.slice(0, 5).map((producto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                        <span className="text-sm font-medium text-slate-900">{producto.nombre}</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{producto.cantidad_repuesta}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>

          {/* Actividad Usuarios */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Actividad de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.actividad_usuarios && dashboardData.actividad_usuarios.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.actividad_usuarios.slice(0, 5).map((usuario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{usuario.nombre_usuario}</p>
                        <p className="text-xs text-slate-500">{usuario.tareas_completadas} tareas</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-600">{usuario.tiempo_total_minutos}min</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enlaces rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/users')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Usuarios</h3>
                  <p className="text-sm text-slate-600">Gestionar personal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/products')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Productos</h3>
                  <p className="text-sm text-slate-600">Gestionar inventario</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/reportes')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Reportes</h3>
                  <p className="text-sm text-slate-600">Ver análisis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

