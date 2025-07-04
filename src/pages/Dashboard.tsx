import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Users, Package, MapPin, FileText, LogOut, User, BarChart3, Settings, Truck } from 'lucide-react';
import Logo from '@/components/Logo';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

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
              <div className="metric-value text-primary">156</div>
              <div className="metric-label">Productos Activos</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-primary">+12 este mes</span>
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
              <div className="metric-value text-secondary">24</div>
              <div className="metric-label">Usuarios Registrados</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-secondary">3 supervisores</span>
              </div>
            </div>
          </div>
          
          <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-accent/25 to-accent/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-accent/40 rounded-full group-hover:bg-accent/50 transition-all duration-300">
                  <Truck className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div className="metric-value text-accent">8</div>
              <div className="metric-label">Rutas Optimizadas</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="badge-accent">Activas hoy</span>
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
              <div className="metric-value text-success">98%</div>
              <div className="metric-label">Eficiencia Global</div>
              <div className="mt-3 flex items-center justify-center">
                <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">↗ +2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos principales */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">Módulos del Sistema</h3>
          <p className="text-muted-foreground">Accede a todas las funcionalidades de administración del sistema POE</p>
        </div>
        
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
          <Card className="card-supermarket bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-primary/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span>Actividad Reciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Ruta optimizada para Pasillo A</span>
                </div>
                <span className="text-xs text-muted-foreground">Hace 5 min</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm">Nuevo usuario registrado</span>
                </div>
                <span className="text-xs text-muted-foreground">Hace 12 min</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Productos actualizados</span>
                </div>
                <span className="text-xs text-muted-foreground">Hace 1 hora</span>
              </div>
            </CardContent>
          </Card>

          {/* Métricas operacionales */}
          <Card className="card-logistics bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/30 rounded-lg">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <span>Métricas Operacionales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reponedores activos</span>
                  <span className="badge-primary">15/18 trabajando</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '83%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tareas completadas hoy</span>
                  <span className="badge-secondary">47/52 completadas</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supervisión de calidad</span>
                  <span className="badge-accent">Excelente</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{width: '96%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </>
  );
};

export default Dashboard;
