
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Map, LogOut, Route, Shield, BarChart3, TrendingUp, Package2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { ApiService, RendimientoReponedores, EstadisticasProductos } from '@/services/api';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Supervisor';

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
        console.log('🔍 Cargando métricas del supervisor...');
        const [rendimientoRes, estadisticasRes] = await Promise.all([
          ApiService.getRendimientoReponedores(),
          ApiService.getEstadisticasProductosSupervisor()
        ]);
        
        console.log('📊 Respuesta rendimiento:', rendimientoRes);
        console.log('📈 Respuesta estadísticas:', estadisticasRes);
        
        setRendimientoReponedores(rendimientoRes.data);
        setEstadisticasProductos(estadisticasRes.data);
      } catch (err: any) {
        console.error('❌ Error cargando métricas:', err);
        setError(`Error: ${err.message || 'No se pudieron cargar las métricas'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Gestión de Reponedores',
      subtitle: 'Equipo a cargo',
      description: 'Registrar y gestionar reponedores bajo tu supervisión. Controla su rendimiento y asignaciones.',
      icon: Users,
      path: '/reponedores',
      bgClass: 'bg-primary/10',
      textClass: 'text-primary',
      hoverClass: 'bg-primary text-white'
    },
    {
      title: 'Asignación de Tareas',
      subtitle: 'Gestión de trabajos',
      description: 'Asignar y monitorear tareas de reposición. Supervisa el progreso en tiempo real.',
      icon: Calendar,
      path: '/tareas',
      bgClass: 'bg-secondary/10',
      textClass: 'text-secondary',
      hoverClass: 'bg-secondary text-white'
    },
    {
      title: 'Supervisión de Rutas',
      subtitle: 'Control de recorridos',
      description: 'Supervisar rutas de reposición en ejecución. Optimiza la eficiencia del equipo.',
      icon: Route,
      path: '/rutas',
      bgClass: 'bg-accent/10',
      textClass: 'text-accent',
      hoverClass: 'bg-accent text-white'
    },
    {
      title: 'Mapa Interactivo',
      subtitle: 'Visualización en tiempo real',
      description: 'Visualizar ubicaciones y rutas del supermercado. Monitorea la actividad del equipo.',
      icon: Map,
      path: '/supervisor-map',
      bgClass: 'bg-warning/10',
      textClass: 'text-warning',
      hoverClass: 'bg-warning text-white'
    }
  ];

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
                  Panel de Supervisión
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Bienvenido, {userName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-profile')}
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
              <div className="p-3 bg-secondary/40 rounded-xl">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">¡Bienvenido al Panel de Supervisión!</h2>
                <p className="text-muted-foreground">Gestiona a tu equipo de reponedores y supervisa las operaciones del supermercado</p>
              </div>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">8</div>
                <div className="metric-label">Reponedores Activos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Trabajando</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-secondary/15 to-secondary/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-secondary/30 rounded-full group-hover:bg-secondary/40 transition-all duration-300">
                    <Calendar className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="metric-value text-secondary">24</div>
                <div className="metric-label">Tareas Asignadas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-secondary">Hoy</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-accent/25 to-accent/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-accent/40 rounded-full group-hover:bg-accent/50 transition-all duration-300">
                    <BarChart3 className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="metric-value text-accent">92%</div>
                <div className="metric-label">Eficiencia del Equipo</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-accent">↗ +5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevas métricas de rendimiento */}
          {loading ? (
            <div className="mb-8 p-6 rounded-xl bg-white/90 backdrop-blur-md">
              <p className="text-center text-muted-foreground">Cargando métricas avanzadas...</p>
            </div>
          ) : error ? (
            <div className="mb-8 p-6 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-center text-destructive">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Card de Rendimiento de Reponedores */}
              <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Rendimiento del Equipo</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Métricas de desempeño</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rendimientoReponedores && rendimientoReponedores.reponedores && rendimientoReponedores.reponedores.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{rendimientoReponedores.reponedores.length}</div>
                          <div className="text-sm text-blue-600/70">Reponedores Activos</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {rendimientoReponedores.reponedores.length > 0 
                              ? (rendimientoReponedores.reponedores.reduce((sum, rep) => sum + rep.tasa_completacion, 0) / rendimientoReponedores.reponedores.length).toFixed(1)
                              : 0
                            }%
                          </div>
                          <div className="text-sm text-green-600/70">Eficiencia Promedio</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                          <div className="text-lg font-bold text-purple-600">
                            {rendimientoReponedores.reponedores.reduce((sum, rep) => sum + rep.tareas_totales, 0)}
                          </div>
                          <div className="text-xs text-purple-600/70">Tareas Asignadas</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                          <div className="text-lg font-bold text-orange-600">
                            {rendimientoReponedores.reponedores.reduce((sum, rep) => sum + rep.tareas_completadas, 0)}
                          </div>
                          <div className="text-xs text-orange-600/70">Tareas Completadas</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground text-center">
                          Top performer: {
                            rendimientoReponedores.reponedores.length > 0
                              ? rendimientoReponedores.reponedores
                                  .sort((a, b) => b.tasa_completacion - a.tasa_completacion)[0]?.nombre || 'Sin datos'
                              : 'Sin datos'
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No hay datos de rendimiento disponibles
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card de Estadísticas de Productos */}
              <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                      <Package2 className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Gestión de Productos</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Análisis de reposición</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {estadisticasProductos?.resumen ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                          <div className="text-2xl font-bold text-emerald-600">{estadisticasProductos.resumen.total_productos || 0}</div>
                          <div className="text-sm text-emerald-600/70">Productos Gestionados</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
                          <div className="text-2xl font-bold text-cyan-600">{estadisticasProductos.resumen.total_reposiciones || 0}</div>
                          <div className="text-sm text-cyan-600/70">Total Reposiciones</div>
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
                        <div className="text-lg font-bold text-indigo-600">{estadisticasProductos.resumen.total_cantidad || 0}</div>
                        <div className="text-xs text-indigo-600/70">Total Cantidad Repuesta</div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground text-center">
                          Top producto: {
                            estadisticasProductos.productos_mas_frecuentes && estadisticasProductos.productos_mas_frecuentes.length > 0
                              ? estadisticasProductos.productos_mas_frecuentes[0].nombre
                              : 'Sin datos'
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No hay datos de productos disponibles
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Módulos de gestión */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">Herramientas de Supervisión</h3>
            <p className="text-muted-foreground">Accede a todas las funcionalidades para gestionar tu equipo</p>
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
        </main>
      </div>
    </>
  );
};

export default SupervisorDashboard;
