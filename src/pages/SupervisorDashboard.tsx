
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Map, LogOut, Route } from 'lucide-react';

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
      color: 'bg-green-500'
    },
    {
      title: 'Tareas',
      description: 'Asignar y monitorear tareas de reposición',
      icon: Calendar,
      path: '/tareas',
      color: 'bg-purple-500'
    },
    {
      title: 'Rutas',
      description: 'Supervisar rutas en ejecución',
      icon: Route,
      path: '/rutas',
      color: 'bg-yellow-500'
    },
    {
      title: 'Mapa Interactivo',
      description: 'Visualizar ubicaciones y rutas',
      icon: Map,
      path: '/supervisor-map',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Supervisión</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/supervisor-profile')}
              className="button-modern border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="button-modern border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido, <span className="text-gradient">{userName}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gestiona a tu equipo de reponedores y supervisa las operaciones de manera eficiente
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="card-modern card-hover cursor-pointer group shadow-modern"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600 text-base">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg button-modern shadow-lg" 
                  variant="default"
                >
                  Acceder
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats or Additional Content */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-modern">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Panel de Control</h3>
            <p className="text-gray-600 mb-6">
              Supervisa el rendimiento de tu equipo y las operaciones en tiempo real
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <div className="text-gray-600">Tareas Activas</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <div className="text-gray-600">Reponedores</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
                <div className="text-gray-600">Rutas Activas</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
