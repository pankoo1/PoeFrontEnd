import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { User, Map, Calendar, CheckCircle, AlertTriangle, LogOut, Package, BarChart3 } from 'lucide-react';
import { ApiService, Tarea } from "@/services/api";
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
        </main>
      </div>
    </>
  );
};

export default ReponedorDashboard;
