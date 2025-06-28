
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Map, LogOut } from 'lucide-react';

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
      title: 'Reponedores',
      description: 'Registrar y gestionar reponedores a cargo',
      icon: Users,
      path: '/reponedores',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Tareas',
      description: 'Asignar y monitorear tareas de reposición',
      icon: Calendar,
      path: '/tareas',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Mapa Interactivo',
      description: 'Visualizar ubicaciones y rutas',
      icon: Map,
      path: '/supervisor-map',
      gradient: 'from-orange-500 to-amber-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Panel de Supervisión</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/supervisor-profile')}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Mi Perfil
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-red-500/80 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">
            Bienvenido, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{userName}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gestiona a tu equipo de reponedores y supervisa las operaciones de manera eficiente
          </p>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">12</div>
                <div className="text-sm text-gray-500">+2 esta semana</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Reponedores Activos</h3>
            <p className="text-gray-600 text-sm">Equipo trabajando hoy</p>
            <div className="mt-3 bg-green-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-4/5"></div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">24</div>
                <div className="text-sm text-gray-500">8 completadas hoy</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Tareas en Progreso</h3>
            <p className="text-gray-600 text-sm">Asignadas y activas</p>
            <div className="mt-3 bg-purple-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full w-3/4"></div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">94%</div>
                <div className="text-sm text-gray-500">Eficiencia</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Rendimiento</h3>
            <p className="text-gray-600 text-sm">Eficiencia del equipo</p>
            <div className="mt-3 bg-orange-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 rounded-full w-5/6"></div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="bg-white/60 backdrop-blur-lg border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group rounded-2xl"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${item.gradient} text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-3 text-gray-600 text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className={`w-full h-14 bg-gradient-to-r ${item.gradient} hover:scale-105 hover:shadow-xl text-white font-semibold rounded-xl transition-all duration-300 text-lg`}
                  variant="default"
                >
                  Acceder
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/30 p-8 shadow-2xl">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Métricas de Supervisión</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Tareas Completadas</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">83%</div>
                  <div className="text-sm text-green-600">+7% vs ayer</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Tiempo Promedio</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">3.8min</div>
                  <div className="text-sm text-purple-600">-0.5min vs ayer</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Reponedores Activos</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">12/15</div>
                  <div className="text-sm text-orange-600">80% del equipo</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Eficiencia General</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">94.2%</div>
                  <div className="text-sm text-blue-600">+3.1% vs ayer</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/30 p-8 shadow-2xl">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Actividad Reciente</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Tarea completada</p>
                  <p className="text-gray-500 text-sm">Reposición Pasillo A - Ana López</p>
                </div>
                <span className="text-xs text-gray-400">3min</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Reponedor conectado</p>
                  <p className="text-gray-500 text-sm">Carlos Martínez inició turno</p>
                </div>
                <span className="text-xs text-gray-400">8min</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Ubicación actualizada</p>
                  <p className="text-gray-500 text-sm">Pasillo B - Sector 2 optimizado</p>
                </div>
                <span className="text-xs text-gray-400">15min</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Nueva tarea asignada</p>
                  <p className="text-gray-500 text-sm">Pasillo C - Miguel Santos</p>
                </div>
                <span className="text-xs text-gray-400">22min</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
