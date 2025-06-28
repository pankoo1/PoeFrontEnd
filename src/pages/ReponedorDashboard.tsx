import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { User, Map, Calendar, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { ApiService, Tarea } from "@/services/api";

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
      title: 'Mis Tareas',
      description: 'Ver tareas asignadas y marcar como completadas',
      icon: CheckCircle,
      path: '/reponedor-tareas',
      color: 'bg-green-500'
    },
    {
      title: 'Mapa y Rutas',
      description: 'Ver rutas optimizadas y puntos de reposición',
      icon: Map,
      path: '/reponedor-map',
      color: 'bg-orange-500'
    },
    {
      title: 'Vista Semanal',
      description: 'Resumen de tareas por semana',
      icon: Calendar,
      path: '/reponedor-semanal',
      color: 'bg-purple-500'
    },
    {
      title: 'Alertas',
      description: 'Notificaciones y desvíos de ruta',
      icon: AlertTriangle,
      path: '/reponedor-alertas',
      color: 'bg-red-500'
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Reponedor</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/reponedor-profile')}
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
            Hola, <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">{userName}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gestiona tus tareas y rutas de reposición de manera eficiente
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="mb-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando resumen...</p>
          </div>
        ) : error ? (
          <div className="mb-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="card-modern card-hover shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tareas Hoy</p>
                    <p className="text-3xl font-bold text-gray-900">{resumen.tareasHoy}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-modern card-hover shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completadas</p>
                    <p className="text-3xl font-bold text-green-600">{resumen.completadas}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-modern card-hover shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{resumen.pendientes}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-2xl">
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-modern card-hover shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Alertas</p>
                    <p className="text-3xl font-bold text-red-600">{resumen.alertas}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
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
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium rounded-lg button-modern shadow-lg" 
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
      </main>
    </div>
  );
};

export default ReponedorDashboard;
