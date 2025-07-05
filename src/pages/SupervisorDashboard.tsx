
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Map, LogOut, Route, Shield, BarChart3 } from 'lucide-react';
import Logo from '@/components/Logo';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Supervisor';

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
