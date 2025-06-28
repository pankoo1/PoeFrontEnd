import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ correo, contraseña });
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      
      // Obtener el rol del usuario y redirigir según corresponda
      const userRole = localStorage.getItem('userRole');
      switch(userRole) {
        case 'admin':
          navigate('/dashboard');
          break;
        case 'supervisor':
          navigate('/supervisor-dashboard');
          break;
        case 'reponedor':
          navigate('/reponedor-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-25"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema POE</h1>
          <p className="text-gray-600">Gestión de inventario y reposición</p>
        </div>

        <Card className="card-modern card-hover shadow-modern">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Bienvenido</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contraseña" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg button-modern shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
            
            {/* Credenciales de prueba */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-800 mb-3 text-center">Credenciales de prueba</p>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded-md border border-gray-100">
                  <p className="font-medium text-blue-600 mb-1">👨‍💼 Administrador</p>
                  <p className="text-gray-600">admin@admin.com</p>
                  <p className="text-gray-600">admin123</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-100">
                  <p className="font-medium text-green-600 mb-1">👷‍♂️ Supervisor</p>
                  <p className="text-gray-600">supervisor@supervisor.com</p>
                  <p className="text-gray-600">supervisor123</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-100">
                  <p className="font-medium text-orange-600 mb-1">📦 Reponedor</p>
                  <p className="text-gray-600">reponedor@reponedor.com</p>
                  <p className="text-gray-600">reponedor123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
