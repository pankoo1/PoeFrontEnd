import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';
import Logo from '@/components/Logo';
import { ShoppingCart, Truck, MapPin } from 'lucide-react';

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
    <div className="min-h-screen gradient-supermarket flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <ShoppingCart className="w-32 h-32 text-white/20" />
        </div>
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <Truck className="w-24 h-24 text-white/15" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2">
          <MapPin className="w-20 h-20 text-white/10" />
        </div>
      </div>

      <Card className="w-full max-w-md card-supermarket relative z-10 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl border-2 border-primary/20">
              <Logo size="xl" showText={true} />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sistema POE
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Optimización de Rutas para Supermercados
              <br />
              <span className="text-sm">Ingresa tus credenciales para continuar</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="correo" className="text-sm font-semibold text-foreground">
                Correo Electrónico
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="h-12 border-2 border-border focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="contraseña" className="text-sm font-semibold text-foreground">
                Contraseña
              </Label>
              <Input
                id="contraseña"
                type="password"
                placeholder="••••••••"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                className="h-12 border-2 border-border focus:border-primary transition-colors"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 btn-supermarket text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Credenciales de prueba con diseño mejorado */}
          <div className="border-t border-border pt-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <p className="font-semibold text-center text-primary mb-3">Credenciales de Prueba</p>
              <div className="grid gap-3">
                <div className="bg-card p-3 rounded-md border border-primary/20">
                  <p className="font-medium text-primary mb-1">👑 Administrador</p>
                  <p className="text-xs text-muted-foreground">admin@poe.com • admin123</p>
                </div>
                <div className="bg-card p-3 rounded-md border border-secondary/20">
                  <p className="font-medium text-secondary mb-1">🏗️ Supervisor</p>
                  <p className="text-xs text-muted-foreground">supervisor@poe.com • supervisor123</p>
                </div>
                <div className="bg-card p-3 rounded-md border border-accent/20">
                  <p className="font-medium text-accent mb-1">📦 Reponedor</p>
                  <p className="text-xs text-muted-foreground">reponedor@poe.com • reponedor123</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
