import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Users, Package, MapPin, FileText, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Administrador';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar supervisores y reponedores del sistema',
      icon: Users,
      path: '/users',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Gestión de Productos',
      description: 'Controlar inventario y productos del supermercado',
      icon: Package,
      path: '/products',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Mapa Interactivo',
      description: 'Vista general del mapa del supermercado',
      icon: MapPin,
      path: '/map',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes de rendimiento y rutas',
      icon: FileText,
      path: '/reportes',
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Gestión de Tareas',
      description: 'Asignar, editar y monitorear tareas de reposición',
      icon: FileText,
      path: '/admin-tareas',
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/profile')}
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
            Bienvenido, <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{userName}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Administra todo el sistema POE desde este panel central de control
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {item.title}
                    </CardTitle>
                    <p className="mt-2 text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className={`w-full h-12 bg-gradient-to-r ${item.gradient} hover:scale-105 text-white font-medium rounded-lg button-modern shadow-lg`}
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

        {/* Admin Overview Stats */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-modern">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Resumen del Sistema</h3>
            <p className="text-gray-600">
              Vista general del estado actual de la plataforma POE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-600 font-medium">Usuarios</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">45</div>
              <div className="text-sm text-gray-500">Total activos</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-600 font-medium">Productos</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2,847</div>
              <div className="text-sm text-gray-500">En inventario</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-600 font-medium">Ubicaciones</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
              <div className="text-sm text-gray-500">Puntos de reposición</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-gray-600 font-medium">Tareas</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">89</div>
              <div className="text-sm text-gray-500">Activas hoy</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
