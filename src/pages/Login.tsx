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
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.80) 50%, rgba(255, 255, 255, 0.70) 100%), url('/POE.jpg')`,
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

        <div className="w-full max-w-7xl mx-auto flex items-center justify-center lg:justify-between relative z-10 gap-12">
          {/* Sección izquierda para el logo */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg">
            <div className="text-center space-y-6">
              {/* Aquí irá tu imagen de logo */}
              <div className="flex justify-center">
                <div className="w-72 h-72 bg-gradient-to-br from-primary/30 via-secondary/15 to-accent/20 rounded-3xl border-2 border-primary/20 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                  {/* Placeholder para tu logo - reemplaza con tu imagen */}
                  <div className="text-center space-y-3">
                    <Logo size="2xl" showText={false} />
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Sistema POE
                      </h1>
                      <p className="text-base text-muted-foreground font-medium">
                        Optimización de Rutas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        para Supermercados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Descripción adicional */}
              <div className="space-y-4 max-w-sm mx-auto">
                <h2 className="text-xl font-bold text-foreground">
                  Gestión Inteligente de Inventario
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Optimiza las rutas de reposición, mejora la eficiencia operativa y mantén tu supermercado funcionando de manera perfecta.
                </p>
                <div className="flex items-center justify-center space-x-4 pt-3">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Rutas Optimizadas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Mapeo Inteligente</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mb-2">
                      <ShoppingCart className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground">Control Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección derecha para el formulario de login */}
          <div className="w-full lg:w-auto lg:min-w-[420px] lg:max-w-md">
            <Card className="w-full card-supermarket relative z-10 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-primary/30 backdrop-blur-md bg-white/90 shadow-2xl">
              <CardHeader className="space-y-6 text-center pb-6">
                <div className="space-y-3">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Iniciar Sesión
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                    Accede a tu cuenta del sistema POE
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
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
                      className="h-12 text-base border-2 border-border/50 bg-white/70 backdrop-blur-sm rounded-xl focus:border-primary focus:bg-white/90 transition-all duration-200 hover:bg-white/80"
                    />
                  </div>
                  <div className="space-y-3">
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
                      className="h-12 text-base border-2 border-border/50 bg-white/70 backdrop-blur-sm rounded-xl focus:border-secondary focus:bg-white/90 transition-all duration-200 hover:bg-white/80"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4" />
                        <span>Iniciar Sesión</span>
                      </div>
                    )}
                  </Button>
                </form>

                {/* Credenciales de prueba compactas */}
                <div className="border-t border-border/30 pt-6">
                  <div className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 rounded-xl p-4 space-y-4 backdrop-blur-sm border border-border/20">
                    <div className="text-center">
                      <p className="font-semibold text-sm text-primary mb-2">Credenciales de Prueba</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-primary/15 to-primary/25 p-3 rounded-lg border border-primary/30 backdrop-blur-sm hover:from-primary/20 hover:to-primary/30 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">👑</span>
                            <span className="font-medium text-primary text-sm">Admin</span>
                          </div>
                          <span className="text-xs text-muted-foreground">admin@poe.com</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-secondary/15 to-secondary/25 p-3 rounded-lg border border-secondary/30 backdrop-blur-sm hover:from-secondary/20 hover:to-secondary/30 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">🏗️</span>
                            <span className="font-medium text-secondary text-sm">Supervisor</span>
                          </div>
                          <span className="text-xs text-muted-foreground">supervisor@poe.com</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-accent/15 to-accent/25 p-3 rounded-lg border border-accent/30 backdrop-blur-sm hover:from-accent/20 hover:to-accent/30 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">📦</span>
                            <span className="font-medium text-accent text-sm">Reponedor</span>
                          </div>
                          <span className="text-xs text-muted-foreground">reponedor@poe.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
