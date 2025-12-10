import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Home, Settings, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { Badge } from "@/components/ui/badge";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/shared/Logo';

interface ProfileData {
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: '',
    correo: '',
    rol: '',
    estado: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getProfile();
      setProfileData(response);
    } catch (error) {
      toast({
        title: "Error al cargar perfil",
        description: "No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRolBadgeVariant = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'supervisor':
        return 'bg-primary/20 text-primary border-primary/40';
      case 'reponedor':
        return 'bg-secondary/20 text-secondary border-secondary/40';
      case 'administrador':
        return 'bg-destructive/20 text-destructive border-destructive/40';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/40';
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-success/20 text-success border-success/40';
      case 'inactivo':
        return 'bg-destructive/20 text-destructive border-destructive/40';
      default:
        return 'bg-warning/20 text-warning border-warning/40';
    }
  };

  return (
    <>
      {/* Background fijo que cubre toda la pantalla */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="min-h-screen relative z-10">
        {/* Header con diseño unificado */}
        <header className="border-b shadow-sm rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
                <Logo size="lg" showText={true} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Mi Perfil
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Gestiona tu información personal y configuración
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Banner informativo */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/40 rounded-xl">
                <Settings className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Información de Perfil</h2>
                <p className="text-muted-foreground">Visualiza tu información personal (solo lectura)</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/30 rounded-xl">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">Información Personal</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Información personal del usuario (solo lectura)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Solo lectura</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos del perfil...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre Completo</Label>
                        <Input
                          id="name"
                          value={profileData.nombre}
                          disabled={true}
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.correo}
                          disabled={true}
                          className="bg-muted/50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-foreground">Rol del Sistema</Label>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <Badge 
                            variant="outline"
                            className={getRolBadgeVariant(profileData.rol)}
                          >
                            {profileData.rol}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-foreground">Estado de la Cuenta</Label>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${profileData.estado.toLowerCase() === 'activo' ? 'bg-success' : 'bg-destructive'}`}></div>
                          <Badge 
                            variant="outline"
                            className={getEstadoBadgeVariant(profileData.estado)}
                          >
                            {profileData.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Información de Seguridad</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tu perfil está en modo solo lectura para mantener la integridad y seguridad del sistema.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Los datos de perfil son gestionados centralmente. Para cualquier cambio, contacta al administrador del sistema.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
