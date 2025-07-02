import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  MapPin, 
  FileText, 
  LogOut, 
  User,
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Settings,
  Bell,
  Search,
  Calendar,
  Clock,
  Target,
  Zap,
  Award,
  Globe,
  Database
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Administrador';
  
  // Referencias para las animaciones
  const headerRef = useRef<HTMLElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función helper para crear animaciones con Web Animations API
    const animateElement = (element: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      if (element) {
        element.animate(keyframes, options);
      }
    };

    // Función helper para animar múltiples elementos con delay escalonado
    const animateStagger = (elements: HTMLCollection | NodeListOf<Element> | Element[], keyframes: Keyframe[], baseOptions: KeyframeAnimationOptions, staggerDelay: number = 100) => {
      Array.from(elements).forEach((element, index) => {
        const options = {
          ...baseOptions,
          delay: (baseOptions.delay || 0) + (index * staggerDelay)
        };
        element.animate(keyframes, options);
      });
    };

    // Animación de entrada del header
    animateElement(headerRef.current, [
      { transform: 'translateY(-50px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards'
    });

    // Animación de entrada del texto de bienvenida
    if (welcomeRef.current) {
      animateStagger(
        welcomeRef.current.children,
        [
          { transform: 'translateY(30px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        {
          duration: 1000,
          delay: 300,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards'
        },
        200
      );
    }

    // Animación escalonada de las estadísticas
    if (statsRef.current) {
      animateStagger(
        statsRef.current.children,
        [
          { transform: 'scale(0.8) translateY(40px)', opacity: 0 },
          { transform: 'scale(1) translateY(0)', opacity: 1 }
        ],
        {
          duration: 800,
          delay: 600,
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          fill: 'forwards'
        },
        150
      );
    }

    // Animación de las tarjetas del menú
    if (menuRef.current) {
      animateStagger(
        menuRef.current.children,
        [
          { transform: 'scale(0.9) translateY(50px)', opacity: 0 },
          { transform: 'scale(1) translateY(0)', opacity: 1 }
        ],
        {
          duration: 800,
          delay: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards'
        },
        100
      );
    }

    // Animación del feed de actividad
    if (activityRef.current) {
      animateStagger(
        activityRef.current.children,
        [
          { transform: 'translateX(100px)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ],
        {
          duration: 1000,
          delay: 1200,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards'
        },
        200
      );
    }

    // Animación de números que cuentan hacia arriba
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((element, index) => {
      const targetValue = parseInt(element.getAttribute('data-value') || '0');
      let currentValue = 0;
      const increment = targetValue / 60; // 60 frames para la animación
      
      setTimeout(() => {
        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(counter);
          }
          element.textContent = Math.round(currentValue).toString();
        }, 16); // ~60fps
      }, 1000 + (index * 100));
    });

    // Animación de pulso continua para elementos interactivos
    const menuIcons = document.querySelectorAll('.menu-icon');
    menuIcons.forEach((icon, index) => {
      setTimeout(() => {
        const pulseAnimation = icon.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.05)' },
          { transform: 'scale(1)' }
        ], {
          duration: 3000,
          iterations: Infinity,
          easing: 'ease-in-out'
        });
      }, 2000 + (index * 300));
    });

  }, []);

  // Función para animaciones hover en las tarjetas del menú
  const handleCardHover = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.menu-icon');
    const button = card.querySelector('button');
    
    if (icon) {
      icon.animate([
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.2) rotate(5deg)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
    }

    if (button) {
      button.animate([
        { transform: 'scale(1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
        { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
    }
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.menu-icon');
    const button = card.querySelector('button');
    
    if (icon) {
      icon.animate([
        { transform: 'scale(1.2) rotate(5deg)' },
        { transform: 'scale(1) rotate(0deg)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
    }

    if (button) {
      button.animate([
        { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
        { transform: 'scale(1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
    }
  };

  // Función para animar clic en tarjetas del menú
  const handleCardClick = (path: string, e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    
    card.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.98)' },
      { transform: 'scale(1.02)' }
    ], {
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).finished.then(() => {
      // Pequeña pausa antes de navegar para que se vea la animación
      setTimeout(() => navigate(path), 100);
    });
  };

  const handleLogout = () => {
    // Animación de salida antes del logout
    const elements = [headerRef.current, welcomeRef.current, statsRef.current, menuRef.current, activityRef.current].filter(Boolean);
    
    Promise.all(elements.map(element => 
      element?.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-50px)' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'
      }).finished
    )).then(() => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      navigate('/login');
    });
  };

  const menuItems = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar supervisores y reponedores del sistema',
      icon: Users,
      path: '/users',
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      stats: '45 usuarios activos',
      trend: '+5% este mes'
    },
    {
      title: 'Gestión de Productos',
      description: 'Controlar inventario y productos del supermercado',
      icon: Package,
      path: '/products',
      color: 'bg-violet-500',
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      stats: '2,847 productos',
      trend: '+12 nuevos hoy'
    },
    {
      title: 'Mapa Interactivo',
      description: 'Vista general del mapa del supermercado',
      icon: MapPin,
      path: '/map',
      color: 'bg-cyan-500',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      stats: '15 zonas activas',
      trend: '97% cobertura'
    },
    {
      title: 'Reportes Avanzados',
      description: 'Analytics y reportes de rendimiento del sistema',
      icon: BarChart3,
      path: '/reportes',
      color: 'bg-amber-500',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      stats: '89% eficiencia',
      trend: '+2.5% vs ayer'
    },
    {
      title: 'Gestión de Tareas',
      description: 'Asignar, editar y monitorear tareas de reposición',
      icon: Target,
      path: '/admin-tareas',
      color: 'bg-rose-500',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
      stats: '234 tareas activas',
      trend: '87% completadas'
    },
    {
      title: 'Sistema & Configuración',
      description: 'Configuraciones del sistema y mantenimiento',
      icon: Settings,
      path: '/admin-config',
      color: 'bg-slate-500',
      gradient: 'from-slate-500 via-gray-600 to-zinc-700',
      stats: 'Sistema estable',
      trend: '99.9% uptime'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header ref={headerRef} className="relative z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl border-b border-white/10 opacity-0">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Centro de Control Administrativo
                </h1>
                <p className="text-blue-200/80 text-sm font-medium">Sistema POE - Panel Principal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 mr-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">97%</div>
                  <div className="text-xs text-blue-200">Eficiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">45</div>
                  <div className="text-xs text-blue-200">Usuarios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">234</div>
                  <div className="text-xs text-blue-200">Tareas</div>
                </div>
              </div>

              {/* Action Buttons */}
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notificaciones</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Mi Perfil</span>
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="bg-red-500/20 backdrop-blur-sm border-red-400/30 text-red-100 hover:bg-red-500/30 transition-all duration-300 shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div ref={welcomeRef} className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/20 backdrop-blur-sm mb-6 opacity-0">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <h2 className="text-6xl font-bold mb-6 opacity-0">
            Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">{userName}</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed opacity-0">
            Controla y gestiona todo el ecosistema POE desde este centro de comando unificado. 
            Mantén el control total de usuarios, productos, tareas y análisis en tiempo real.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 opacity-0">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Search className="w-4 h-4 mr-2" />
              Búsqueda Rápida
            </Button>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50 transition-all duration-300">
              <Activity className="w-4 h-4 mr-2" />
              Monitor en Vivo
            </Button>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50 transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Grid */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-xl border-emerald-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 opacity-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent stat-number" data-value="45">0</div>
                  <div className="text-sm text-emerald-600 font-medium">+3 esta semana</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Usuarios Activos</h3>
              <p className="text-slate-600 text-sm mb-4">Personal del sistema conectado</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-emerald-100 rounded-full h-2 mr-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full w-4/5 group-hover:w-5/6 transition-all duration-1000"></div>
                </div>
                <span className="text-xs font-semibold text-emerald-600">80%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-xl border-blue-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 opacity-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent stat-number" data-value="234">0</div>
                  <div className="text-sm text-blue-600 font-medium">87% completadas</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tareas Activas</h3>
              <p className="text-slate-600 text-sm mb-4">Operaciones en progreso</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-blue-100 rounded-full h-2 mr-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full w-5/6 group-hover:w-full transition-all duration-1000"></div>
                </div>
                <span className="text-xs font-semibold text-blue-600">87%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-xl border-purple-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 opacity-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent stat-number" data-value="2847">0</div>
                  <div className="text-sm text-purple-600 font-medium">98% disponible</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Productos</h3>
              <p className="text-slate-600 text-sm mb-4">Inventario total del sistema</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-purple-100 rounded-full h-2 mr-3">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full w-full transition-all duration-1000"></div>
                </div>
                <span className="text-xs font-semibold text-purple-600">98%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-orange-50/50 backdrop-blur-xl border-orange-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 opacity-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent stat-number" data-value="97">0</div>
                  <div className="text-sm text-orange-600 font-medium">+2.1% vs ayer</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Eficiencia</h3>
              <p className="text-slate-600 text-sm mb-4">Rendimiento general</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-orange-100 rounded-full h-2 mr-3">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 rounded-full w-11/12 group-hover:w-full transition-all duration-1000"></div>
                </div>
                <span className="text-xs font-semibold text-orange-600">97%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Menu Grid */}
        <div ref={menuRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-8xl mx-auto mb-16">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer rounded-3xl opacity-0 hover:scale-105"
              onClick={(e) => handleCardClick(item.path, e)}
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`menu-icon p-4 rounded-3xl bg-gradient-to-br ${item.gradient} text-white shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-600 mb-1">{item.stats}</div>
                    <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {item.trend}
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {item.title}
                </CardTitle>
                
                <p className="text-slate-600 text-base leading-relaxed">
                  {item.description}
                </p>
              </CardHeader>
              
              <CardContent className="relative pt-0 pb-6">
                {/* Progress indicators */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Estado del módulo</span>
                    <span>Activo</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${item.gradient} h-2 rounded-full transition-all duration-1000 group-hover:w-full`} 
                         style={{width: index % 2 === 0 ? '85%' : '92%'}}></div>
                  </div>
                </div>
                
                <Button 
                  className={`w-full h-14 bg-gradient-to-r ${item.gradient} hover:scale-105 hover:shadow-2xl text-white font-semibold rounded-2xl transition-all duration-500 text-lg group-hover:from-slate-800 group-hover:to-slate-700 border-0`}
                  variant="default"
                >
                  <span className="mr-3">Acceder al Módulo</span>
                  <Zap className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </CardContent>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </Card>
          ))}
        </div>


        {/* Advanced Analytics & Activity Feed */}
        <div ref={activityRef} className="grid grid-cols-1 xl:grid-cols-3 gap-8 opacity-0">
          {/* Real-time Analytics */}
          <div className="xl:col-span-2">
            <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-white/20 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Analytics en Tiempo Real
                      </CardTitle>
                      <p className="text-slate-600 text-sm">Métricas de rendimiento actualizadas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-600">EN VIVO</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-700 font-semibold">Tareas Completadas</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">87%</div>
                        <div className="text-sm text-emerald-600 font-medium">+5% vs ayer</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700 font-semibold">Tiempo Promedio</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">4.2min</div>
                        <div className="text-sm text-blue-600 font-medium">-0.3min vs ayer</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-slate-700 font-semibold">Productos Reabastecidos</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">234</div>
                        <div className="text-sm text-purple-600 font-medium">+12 vs ayer</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-slate-700 font-semibold">Eficiencia General</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">94.5%</div>
                        <div className="text-sm text-orange-600 font-medium">+2.1% vs ayer</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Chart Placeholder */}
                <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-center h-32 text-slate-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Gráfico de rendimiento interactivo</p>
                      <p className="text-xs text-slate-400">Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="xl:col-span-1">
            <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b border-white/20 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Actividad Reciente
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Últimas actualizaciones del sistema</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">Nuevo usuario registrado</p>
                      <p className="text-slate-600 text-xs mt-1">Juan Pérez - Reponedor</p>
                      <p className="text-emerald-600 text-xs font-medium mt-2">hace 2 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">Tarea completada</p>
                      <p className="text-slate-600 text-xs mt-1">Reposición Pasillo A - Sector 3</p>
                      <p className="text-blue-600 text-xs font-medium mt-2">hace 5 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">Producto agregado</p>
                      <p className="text-slate-600 text-xs mt-1">Leche Entera 1L - Código: LC001</p>
                      <p className="text-purple-600 text-xs font-medium mt-2">hace 12 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">Objetivo alcanzado</p>
                      <p className="text-slate-600 text-xs mt-1">Meta diaria de eficiencia superada</p>
                      <p className="text-orange-600 text-xs font-medium mt-2">hace 18 minutos</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-6 border-slate-200 hover:bg-slate-50 transition-colors duration-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Ver historial completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;