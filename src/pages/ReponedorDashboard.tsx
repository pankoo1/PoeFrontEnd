import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { User, Map, Calendar, CheckCircle, AlertTriangle, LogOut, Clock, Target, TrendingUp, Package } from 'lucide-react';
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
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Mapa y Rutas',
      description: 'Ver rutas optimizadas y puntos de reposición',
      icon: Map,
      path: '/reponedor-map',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Vista Semanal',
      description: 'Resumen de tareas por semana',
      icon: Calendar,
      path: '/reponedor-semanal',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Alertas',
      description: 'Notificaciones y desvíos de ruta',
      icon: AlertTriangle,
      path: '/reponedor-alertas',
      gradient: 'from-red-500 to-rose-600'
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
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Panel de Reponedor
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/reponedor-profile')}
              className="glass-card border-gray-200 hover:border-orange-300 hover:bg-orange-50"
            >
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="glass-card border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
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
          <div className="mb-12 glass-card border border-red-200 rounded-xl p-6 text-center bg-red-50/50">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="glass-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tareas Hoy</p>
                    <p className="text-3xl font-bold text-gray-900">{resumen.tareasHoy}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Activo</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completadas</p>
                    <p className="text-3xl font-bold text-green-600">{resumen.completadas}</p>
                    <div className="flex items-center mt-2">
                      <Target className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Meta: 100%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{resumen.pendientes}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-600 font-medium">En progreso</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Alertas</p>
                    <p className="text-3xl font-bold text-red-600">{resumen.alertas}</p>
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600 font-medium">Revisar</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                    <AlertTriangle className="w-8 h-8 text-white" />
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
              className="glass-card hover:shadow-xl cursor-pointer group transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-amber-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600 text-base">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <Button 
                  className={`w-full h-12 bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white font-medium rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300`}
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

        {/* Activity Feed */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Tarea completada</p>
                    <p className="text-sm text-gray-600">Reposición en Sector A - hace 2 horas</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Completada</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Map className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nueva ruta asignada</p>
                    <p className="text-sm text-gray-600">Optimización de recorrido - hace 4 horas</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Asignada</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Punto de atención</p>
                    <p className="text-sm text-gray-600">Stock bajo en Sector C - hace 6 horas</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendiente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReponedorDashboard;
