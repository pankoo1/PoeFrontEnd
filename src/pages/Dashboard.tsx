import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { Users, Package, MapPin, FileText, LogOut, User, BarChart3, Settings, Truck, Loader2, RefreshCw, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type DashboardResumen } from '@/services/api';
import Logo from '@/components/Logo';

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
      console.error('Error al cargar dashboard:', error);
      
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Funciones para calcular métricas basadas en datos reales
  const calcularEficiencia = (): number => {
    if (!dashboardData || dashboardData.tareas.total === 0) return 0;
    return (dashboardData.tareas.completadas / dashboardData.tareas.total) * 100;
  };

  const formatearEficiencia = (valor: number): string => {
    return `${valor.toFixed(1)}%`;
  };

  const obtenerTiempoPromedio = (): string => {
    if (!dashboardData || dashboardData.actividad_usuarios.length === 0) return 'N/A';
    
    const totalMinutos = dashboardData.actividad_usuarios.reduce(
      (sum, usuario) => sum + usuario.tiempo_total_minutos, 0
    );
    const totalTareas = dashboardData.actividad_usuarios.reduce(
      (sum, usuario) => sum + usuario.tareas_completadas, 0
    );
    
    if (totalTareas === 0) return 'N/A';
    
    const promedioMinutos = totalMinutos / totalTareas;
    const horas = Math.floor(promedioMinutos / 60);
    const minutos = Math.round(promedioMinutos % 60);
    
    return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
  };

  // Mostrar loading screen inicial si no hay datos
  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Cargando Dashboard</h2>
          <p className="text-muted-foreground">Obteniendo métricas del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background fijo que cubre toda la pantalla */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="min-h-screen relative z-10">
        <header className="header-admin border-b shadow-sm content-overlay rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
              <Logo size="lg" showText={true} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Centro de Administración
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Sistema de Optimización de Rutas POE
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Controles de filtro */}
            <div className="flex items-center space-x-2">
              <Select value={periodo} onValueChange={(value) => setPeriodo(value as 'dia' | 'semana' | 'mes')}>
                <SelectTrigger className="w-32 border-2 border-primary/20 focus:border-primary/50">
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
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
            >
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 content-overlay">
        {/* Banner de bienvenida */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/40 rounded-xl">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">¡Bienvenido al Panel de Control!</h2>
              <p className="text-muted-foreground">Gestiona eficientemente todas las operaciones de tu supermercado</p>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="metric-value text-primary">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  dashboardData?.top_productos?.length || 0
                )}
              </div>
              <div className="metric-label">Productos Repuestos</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-primary">Top productos</span>
              </div>
            </div>
          </div>
          
          <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-secondary/15 to-secondary/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-secondary/30 rounded-full group-hover:bg-secondary/40 transition-all duration-300">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <div className="metric-value text-secondary">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  dashboardData?.actividad_usuarios?.length || 0
                )}
              </div>
              <div className="metric-label">Reponedores Activos</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-secondary">En período</span>
              </div>
            </div>
          </div>
          
          <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-accent/25 to-accent/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-accent/40 rounded-full group-hover:bg-accent/50 transition-all duration-300">
                  <Clock className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div className="metric-value text-accent">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  obtenerTiempoPromedio()
                )}
              </div>
              <div className="metric-label">Tiempo Promedio</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-accent">Por tarea</span>
              </div>
            </div>
          </div>
          
          <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/25 to-success/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.3s'}}>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-success/40 rounded-full group-hover:bg-success/50 transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-success" />
                </div>
              </div>
              <div className="metric-value text-success">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  formatearEficiencia(calcularEficiencia())
                )}
              </div>
              <div className="metric-label">Eficiencia</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">
                  {dashboardData?.tareas.completadas || 0}/{dashboardData?.tareas.total || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos principales */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">Módulos del Sistema</h3>
          <p className="text-muted-foreground">Accede a todas las funcionalidades de administración del sistema POE</p>
        </div>

        {/* Estadísticas detalladas */}
        {dashboardData && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tareas por Estado */}
            <Card className="card-logistics bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <span>Estado de Tareas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tareas Completadas</span>
                    <span className="badge-success">{dashboardData.tareas.completadas}/{dashboardData.tareas.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{
                        width: `${dashboardData.tareas.total > 0 ? (dashboardData.tareas.completadas / dashboardData.tareas.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tareas en Progreso</span>
                    <span className="badge-warning">{dashboardData.tareas.en_progreso}/{dashboardData.tareas.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                      style={{
                        width: `${dashboardData.tareas.total > 0 ? (dashboardData.tareas.en_progreso / dashboardData.tareas.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tareas Pendientes</span>
                    <span className="badge-destructive">{dashboardData.tareas.pendientes}/{dashboardData.tareas.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                      style={{
                        width: `${dashboardData.tareas.total > 0 ? (dashboardData.tareas.pendientes / dashboardData.tareas.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                {dashboardData.tareas.total > 0 && (
                  <div className="pt-2 border-t border-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Eficiencia General</span>
                      <span className="text-sm font-bold text-primary">
                        {formatearEficiencia(calcularEficiencia())}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Productos */}
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/30 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <span>Productos Más Repuestos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.top_productos.length > 0 ? (
                  dashboardData.top_productos.map((producto, index) => {
                    // Asignar colores rotativos para los indicadores
                    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning'];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/60 rounded-lg backdrop-blur-sm hover:bg-muted/80 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${colorClass} rounded-full flex-shrink-0`}></div>
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-primary/10 rounded-md">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">
                              {producto.nombre}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="badge-primary">
                            {producto.cantidad_repuesta} rep.
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground">No hay datos de productos para este período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => navigate('/users')}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Administrar personal</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Administrar supervisores y reponedores del sistema. Controla permisos, roles y accesos.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                <span>Ir al módulo</span>
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-logistics hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => navigate('/products')}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">Gestión de Productos</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Inventario y catalogación</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Controlar inventario y productos del supermercado. Gestiona el catálogo completo de productos.
              </p>
              <div className="mt-4 flex items-center text-secondary text-sm font-medium">
                <span>Ir al módulo</span>
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => navigate('/map')}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">Mapa Interactivo</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Visualización de rutas</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Vista general del mapa del supermercado. Monitorea rutas y ubicaciones en tiempo real.
              </p>
              <div className="mt-4 flex items-center text-accent text-sm font-medium">
                <span>Ir al módulo</span>
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-logistics hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => navigate('/reportes')}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white transition-all duration-300">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">Reportes y Análisis</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Métricas de rendimiento</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Generar reportes de rendimiento y rutas de reposición. Análisis completo de eficiencia.
              </p>
              <div className="mt-4 flex items-center text-warning text-sm font-medium">
                <span>Ir al módulo</span>
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => navigate('/admin-tareas')}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Settings className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">Gestión de Tareas</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Administración de trabajos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Asignar, editar y monitorear tareas de reposición. Control completo del flujo de trabajo.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                <span>Ir al módulo</span>
                <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actividad reciente y estadísticas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad reciente */}
         

          {/* Métricas operacionales */}

        </div>
      </main>
      </div>
    </>
  );
};

export default Dashboard;
