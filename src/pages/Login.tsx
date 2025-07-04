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
    <>
      {/* Background fijo que cubre toda la pantalla - mismo que Dashboard */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        {/* Elementos decorativos de fondo modernos */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
            <div className="w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/20 rounded-full blur-2xl"></div>
          </div>
          <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-20 h-20 bg-gradient-to-br from-success/30 to-accent/20 rounded-full blur-xl"></div>
          </div>
        </div>

        <Card className="w-full max-w-lg card-supermarket relative z-10 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-primary/30 backdrop-blur-md bg-white/90 shadow-2xl">
          <CardHeader className="space-y-8 text-center pb-8">
            <div className="flex justify-center">
              <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/15 rounded-2xl border-2 border-primary/30 shadow-lg backdrop-blur-sm">
                <Logo size="xl" showText={true} />
              </div>
            </div>
            <div className="space-y-4">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sistema POE
              </CardTitle>
              <div className="space-y-2">
                <CardDescription className="text-lg font-medium text-foreground">
                  Optimización de Rutas para Supermercados
                </CardDescription>
                <CardDescription className="text-base text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="correo" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Correo Electrónico</span>
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  className="h-14 text-base border-2 border-border/50 bg-white/70 backdrop-blur-sm rounded-xl focus:border-primary focus:bg-white/90 transition-all duration-200 hover:bg-white/80"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="contraseña" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Contraseña</span>
                </Label>
                <Input
                  id="contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                  className="h-14 text-base border-2 border-border/50 bg-white/70 backdrop-blur-sm rounded-xl focus:border-secondary focus:bg-white/90 transition-all duration-200 hover:bg-white/80"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Iniciar Sesión</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Credenciales de prueba con diseño mejorado */}
            <div className="border-t border-border/30 pt-8">
              <div className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 rounded-xl p-6 space-y-5 backdrop-blur-sm border border-border/20">
                <div className="text-center">
                  <p className="font-semibold text-lg text-primary mb-2 flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span>Credenciales de Prueba</span>
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </p>
                  <p className="text-sm text-muted-foreground">Selecciona un rol para probar el sistema</p>
                </div>
                <div className="grid gap-4">
                  <div className="bg-gradient-to-r from-primary/15 to-primary/25 p-4 rounded-xl border border-primary/30 backdrop-blur-sm hover:from-primary/20 hover:to-primary/30 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/40 transition-all duration-200">
                        <span className="text-lg">👑</span>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Administrador</p>
                        <p className="text-sm text-muted-foreground">admin@poe.com • admin123</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-secondary/15 to-secondary/25 p-4 rounded-xl border border-secondary/30 backdrop-blur-sm hover:from-secondary/20 hover:to-secondary/30 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/30 rounded-lg group-hover:bg-secondary/40 transition-all duration-200">
                        <span className="text-lg">🏗️</span>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">Supervisor</p>
                        <p className="text-sm text-muted-foreground">supervisor@poe.com • supervisor123</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-accent/15 to-accent/25 p-4 rounded-xl border border-accent/30 backdrop-blur-sm hover:from-accent/20 hover:to-accent/30 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/30 rounded-lg group-hover:bg-accent/40 transition-all duration-200">
                        <span className="text-lg">📦</span>
                      </div>
                      <div>
                        <p className="font-semibold text-accent">Reponedor</p>
                        <p className="text-sm text-muted-foreground">reponedor@poe.com • reponedor123</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
