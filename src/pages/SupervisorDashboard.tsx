
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Map, LogOut, Route } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Supervisión</h1>
              <p className="text-sm text-muted-foreground">Bienvenido, {userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/supervisor-profile')}>
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, {userName}</h2>
          <p className="text-muted-foreground">
            Gestiona a tu equipo de reponedores y supervisa las operaciones
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${item.color} text-white`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
