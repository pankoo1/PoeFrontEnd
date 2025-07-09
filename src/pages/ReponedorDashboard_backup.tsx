import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { User, Map, Calendar, CheckCircle, AlertTriangle, LogOut, Package, BarChart3 } from 'lucide-react';
import { ApiService, Tarea, ResumenSemanalEstadisticas } from "@/services/api";
import Logo from '@/components/Logo';

const ReponedorDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Reponedor';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Mis Tareas Diarias',
      subtitle: 'Lista de trabajo',
      description: 'Ver tareas asignadas y marcar como completadas. Organiza tu jornada de trabajo.',
      icon: CheckCircle,
      path: '/reponedor-tareas',
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      hoverClass: 'bg-success text-white'
    },
    {
      title: 'Mapa y Rutas',
      subtitle: 'Navegación optimizada',
      description: 'Ver rutas optimizadas y puntos de reposición. Encuentra el camino más eficiente.',
      icon: Map,
      path: '/reponedor-map',
      bgClass: 'bg-accent/10',
      textClass: 'text-accent',
      hoverClass: 'bg-accent text-white'
    },
    {
      title: 'Vista Semanal',
      subtitle: 'Planificación temporal',
      description: 'Resumen de tareas por semana. Revisa tu progreso y planifica tu trabajo.',
      icon: Calendar,
      path: '/reponedor-semanal',
      bgClass: 'bg-secondary/10',
      textClass: 'text-secondary',
      hoverClass: 'bg-secondary text-white'
    },
    {
      title: 'Alertas y Notificaciones',
      subtitle: 'Información importante',
      description: 'Notificaciones importantes y desvíos de ruta. Mantente informado en tiempo real.',
      icon: AlertTriangle,
      path: '/reponedor-alertas',
      bgClass: 'bg-destructive/10',
      textClass: 'text-destructive',
      hoverClass: 'bg-destructive text-white'
    }
  ];

  // Estado para el resumen
  const [resumen, setResumen] = useState({
    tareasHoy: 0,
    completadas: 0,
    pendientes: 0,
    alertas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para el resumen semanal de estadísticas
  const [estadisticas, setEstadisticas] = useState<ResumenSemanalEstadisticas["data"] | null>(null);

  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      setError(null);
      try {
        const tareasApi: Tarea[] = await ApiService.getTareasReponedor();
        // Resumen
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
        // Obtener estadísticas generales del reponedor
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
        {/* Header con diseño unificado */}
        <header className="border-b shadow-sm rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
                <Logo size="lg" showText={true} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Panel de Reponedor
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Hola, {userName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reponedor-profile')}
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

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Banner de bienvenida */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/40 rounded-xl">
                <Package className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">¡Listo para trabajar, {userName}!</h2>
                <p className="text-muted-foreground">Gestiona tus tareas y rutas de reposición de manera eficiente</p>
              </div>
            </div>
          </div>

          {/* Métricas de rendimiento */}
          {loading ? (
            <div className="mb-8 p-6 rounded-xl bg-white/90 backdrop-blur-md">
              <p className="text-center text-muted-foreground">Cargando resumen...</p>
            </div>
          ) : error ? (
            <div className="mb-8 p-6 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-center text-destructive">{error}</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="metric-value text-primary">{resumen.tareasHoy}</div>
                  <div className="metric-label">Tareas Hoy</div>
                  <div className="mt-3 flex items-center justify-center">
                    <span className="badge-primary">Programadas</span>
                  </div>
                </div>
              </div>
              
              <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  <div className="metric-value text-success">{resumen.completadas}</div>
                  <div className="metric-label">Completadas</div>
                  <div className="mt-3 flex items-center justify-center">
                    <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Finalizadas</span>
                  </div>
                </div>
              </div>
              
              <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-warning/25 to-warning/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-warning/40 rounded-full group-hover:bg-warning/50 transition-all duration-300">
                      <BarChart3 className="w-8 h-8 text-warning" />
                    </div>
                  </div>
                  <div className="metric-value text-warning">{resumen.pendientes}</div>
                  <div className="metric-label">Pendientes</div>
                  <div className="mt-3 flex items-center justify-center">
                    <span className="badge-warning">En progreso</span>
                  </div>
                </div>
              </div>
              
              <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-destructive/15 to-destructive/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-destructive/30 rounded-full group-hover:bg-destructive/40 transition-all duration-300">
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                  </div>
                  <div className="metric-value text-destructive">{resumen.alertas}</div>
                  <div className="metric-label">Alertas</div>
                  <div className="mt-3 flex items-center justify-center">
                    <span className="bg-destructive/20 text-destructive border border-destructive/40 px-2 py-1 rounded-md text-xs font-medium">⚠ Urgente</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Sección de Estadísticas Generales - Diseño Premium */}
            {estadisticas && (
              <div className="mt-12 mb-8">
                {/* Header de estadísticas con efecto glassmorphism */}
                <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/50 backdrop-blur-xl shadow-premium glass-effect">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-3">
                        Estadísticas de Rendimiento
                      </h3>
                      <p className="text-slate-600 text-lg">Análisis completo de tu actividad y productividad</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-2">
                      <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl border border-primary/20 shadow-lg">
                        <BarChart3 className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Grid de métricas principales con diseño moderno */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {/* Tarjeta Total de Tareas */}
                  <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl border border-emerald-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div className="text-emerald-500 text-sm font-semibold tracking-wide uppercase">Total</div>
                      </div>
                      <div className="text-4xl font-black text-emerald-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                        {estadisticas.total_tareas}
                      </div>
                      <div className="text-slate-600 font-medium mb-4">Tareas Realizadas</div>
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300/50 rounded-full text-sm font-semibold shadow-sm">
                          📊 Historial Completo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Productos Repuestos */}
                  <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer" style={{animationDelay: '0.1s'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border border-blue-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                          <Package className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-blue-500 text-sm font-semibold tracking-wide uppercase">Productos</div>
                      </div>
                      <div className="text-4xl font-black text-blue-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                        {estadisticas.total_productos_repuestos}
                      </div>
                      <div className="text-slate-600 font-medium mb-4">Productos Repuestos</div>
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300/50 rounded-full text-sm font-semibold shadow-sm">
                          ✅ Completados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Promedio por Tarea */}
                  <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50 border border-purple-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer" style={{animationDelay: '0.2s'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl border border-purple-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                          <BarChart3 className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-purple-500 text-sm font-semibold tracking-wide uppercase">Promedio</div>
                      </div>
                      <div className="text-4xl font-black text-purple-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                        {estadisticas.promedio_productos_por_tarea}
                      </div>
                      <div className="text-slate-600 font-medium mb-4">Productos por Tarea</div>
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300/50 rounded-full text-sm font-semibold shadow-sm">
                          ⚡ Eficiencia
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de análisis detallado */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                  {/* Panel de Distribución por Estado - Rediseñado */}
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/50 backdrop-blur-xl shadow-premium glass-effect">
                    <div className="flex items-center mb-8">
                      <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300/30 shadow-lg mr-4">
                        <BarChart3 className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Distribución por Estado</h4>
                        <p className="text-slate-600 text-sm">Análisis de progreso</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(estadisticas.tareas_por_estado).map(([estado, cantidad], index) => {
                        const estadoConfig = {
                          pendiente: { 
                            bg: 'from-amber-50 to-amber-100', 
                            border: 'border-amber-200', 
                            text: 'text-amber-700',
                            icon: '⏳',
                            shadow: 'shadow-amber-100'
                          },
                          en_progreso: { 
                            bg: 'from-blue-50 to-blue-100', 
                            border: 'border-blue-200', 
                            text: 'text-blue-700',
                            icon: '🚀',
                            shadow: 'shadow-blue-100'
                          }, 
                          completada: { 
                            bg: 'from-emerald-50 to-emerald-100', 
                            border: 'border-emerald-200', 
                            text: 'text-emerald-700',
                            icon: '✅',
                            shadow: 'shadow-emerald-100'
                          },
                          cancelada: { 
                            bg: 'from-red-50 to-red-100', 
                            border: 'border-red-200', 
                            text: 'text-red-700',
                            icon: '❌',
                            shadow: 'shadow-red-100'
                          }
                        };
                        const config = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.pendiente;
                        
                        return (
                          <div 
                            key={estado} 
                            className={`p-6 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} ${config.shadow} shadow-lg hover:scale-105 hover-premium transition-all duration-300 cursor-default shimmer`}
                            style={{animationDelay: `${index * 0.1}s`}}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{config.icon}</div>
                              <div className={`text-sm font-medium ${config.text} opacity-80 mb-2`}>
                                {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                              </div>
                              <div className={`text-3xl font-black ${config.text} metric-number`}>{cantidad}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Panel de Periodo de Actividad - Rediseñado */}
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border border-indigo-200/50 backdrop-blur-xl shadow-premium glass-effect">
                    <div className="flex items-center mb-8">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl border border-indigo-300/30 shadow-lg mr-4">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-indigo-800">Periodo de Actividad</h4>
                        <p className="text-indigo-600 text-sm">Rango temporal</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/50 shadow-lg hover:shadow-xl hover-premium transition-all duration-300 shimmer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-emerald-600 font-semibold mb-2 flex items-center">
                              <span className="mr-2">🎯</span>
                              Primera Tarea
                            </div>
                            <div className="text-2xl font-bold text-emerald-800 metric-number">
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
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 shadow-lg hover:shadow-xl hover-premium transition-all duration-300 shimmer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-blue-600 font-semibold mb-2 flex items-center">
                              <span className="mr-2">🏁</span>
                              Última Tarea
                            </div>
                            <div className="text-2xl font-bold text-blue-800 metric-number">
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
                </div>
              </div>
            )}
            </>
          )}

          {/* Herramientas de trabajo */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">Herramientas de Trabajo</h3>
            <p className="text-muted-foreground">Accede a todas las funcionalidades para gestionar tu trabajo diario</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <Card 
                key={index} 
                className="card-supermarket hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white/90 backdrop-blur-md"
                onClick={() => navigate(item.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-xl ${item.bgClass} ${item.textClass} group-hover:${item.hoverClass} transition-all duration-300`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <span>Acceder al módulo</span>
                    <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sección de Estadísticas Generales - Diseño Premium */}
          {estadisticas && (
            <div className="mt-12 mb-8">
              {/* Header de estadísticas con efecto glassmorphism */}
              <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/50 backdrop-blur-xl shadow-premium glass-effect">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-3">
                      Estadísticas de Rendimiento
                    </h3>
                    <p className="text-slate-600 text-lg">Análisis completo de tu actividad y productividad</p>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl border border-primary/20 shadow-lg">
                      <BarChart3 className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Grid de métricas principales con diseño moderno */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Tarjeta Total de Tareas */}
                <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl border border-emerald-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="text-emerald-500 text-sm font-semibold tracking-wide uppercase">Total</div>
                    </div>
                    <div className="text-4xl font-black text-emerald-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                      {estadisticas.total_tareas}
                    </div>
                    <div className="text-slate-600 font-medium mb-4">Tareas Realizadas</div>
                    <div className="flex items-center justify-center">
                      <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300/50 rounded-full text-sm font-semibold shadow-sm">
                        📊 Historial Completo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Productos Repuestos */}
                <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer" style={{animationDelay: '0.1s'}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border border-blue-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-blue-500 text-sm font-semibold tracking-wide uppercase">Productos</div>
                    </div>
                    <div className="text-4xl font-black text-blue-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                      {estadisticas.total_productos_repuestos}
                    </div>
                    <div className="text-slate-600 font-medium mb-4">Productos Repuestos</div>
                    <div className="flex items-center justify-center">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300/50 rounded-full text-sm font-semibold shadow-sm">
                        ✅ Completados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Promedio por Tarea */}
                <div className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50 border border-purple-200/50 shadow-premium hover:shadow-3xl hover-premium transition-all duration-500 stagger-animation shimmer" style={{animationDelay: '0.2s'}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl border border-purple-300/30 shadow-lg group-hover:scale-110 transition-transform duration-300 icon-breathe">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-purple-500 text-sm font-semibold tracking-wide uppercase">Promedio</div>
                    </div>
                    <div className="text-4xl font-black text-purple-800 mb-3 group-hover:scale-105 transition-transform duration-300 metric-number">
                      {estadisticas.promedio_productos_por_tarea}
                    </div>
                    <div className="text-slate-600 font-medium mb-4">Productos por Tarea</div>
                    <div className="flex items-center justify-center">
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300/50 rounded-full text-sm font-semibold shadow-sm">
                        ⚡ Eficiencia
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de análisis detallado */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Panel de Distribución por Estado - Rediseñado */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/50 backdrop-blur-xl shadow-premium glass-effect">
                  <div className="flex items-center mb-8">
                    <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300/30 shadow-lg mr-4">
                      <BarChart3 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">Distribución por Estado</h4>
                      <p className="text-slate-600 text-sm">Análisis de progreso</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(estadisticas.tareas_por_estado).map(([estado, cantidad], index) => {
                      const estadoConfig = {
                        pendiente: { 
                          bg: 'from-amber-50 to-amber-100', 
                          border: 'border-amber-200', 
                          text: 'text-amber-700',
                          icon: '⏳',
                          shadow: 'shadow-amber-100'
                        },
                        en_progreso: { 
                          bg: 'from-blue-50 to-blue-100', 
                          border: 'border-blue-200', 
                          text: 'text-blue-700',
                          icon: '🚀',
                          shadow: 'shadow-blue-100'
                        }, 
                        completada: { 
                          bg: 'from-emerald-50 to-emerald-100', 
                          border: 'border-emerald-200', 
                          text: 'text-emerald-700',
                          icon: '✅',
                          shadow: 'shadow-emerald-100'
                        },
                        cancelada: { 
                          bg: 'from-red-50 to-red-100', 
                          border: 'border-red-200', 
                          text: 'text-red-700',
                          icon: '❌',
                          shadow: 'shadow-red-100'
                        }
                      };
                      const config = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.pendiente;
                      
                      return (
                        <div 
                          key={estado} 
                          className={`p-6 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} ${config.shadow} shadow-lg hover:scale-105 hover-premium transition-all duration-300 cursor-default shimmer`}
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{config.icon}</div>
                            <div className={`text-sm font-medium ${config.text} opacity-80 mb-2`}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                            </div>
                            <div className={`text-3xl font-black ${config.text} metric-number`}>{cantidad}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Panel de Periodo de Actividad - Rediseñado */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border border-indigo-200/50 backdrop-blur-xl shadow-premium glass-effect">
                  <div className="flex items-center mb-8">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl border border-indigo-300/30 shadow-lg mr-4">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-indigo-800">Periodo de Actividad</h4>
                      <p className="text-indigo-600 text-sm">Rango temporal</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/50 shadow-lg hover:shadow-xl hover-premium transition-all duration-300 shimmer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-emerald-600 font-semibold mb-2 flex items-center">
                            <span className="mr-2">🎯</span>
                            Primera Tarea
                          </div>
                          <div className="text-2xl font-bold text-emerald-800 metric-number">
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
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 shadow-lg hover:shadow-xl hover-premium transition-all duration-300 shimmer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-blue-600 font-semibold mb-2 flex items-center">
                            <span className="mr-2">🏁</span>
                            Última Tarea
                          </div>
                          <div className="text-2xl font-bold text-blue-800 metric-number">
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
              </div>
            )}
        </main>
      </div>
    </>
  );
};

export default ReponedorDashboard;
