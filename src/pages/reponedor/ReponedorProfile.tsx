
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Info, Home, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/shared/Logo';

interface ProfileData {
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

const ReponedorProfile = () => {
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
      console.error('Error al cargar datos del perfil:', error);
      toast({
        title: "Error al cargar perfil",
        description: "No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  Información personal del reponedor
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
              <div className="p-3 bg-primary/40 rounded-xl">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Información Personal</h2>
                <p className="text-muted-foreground">Consulta y gestiona tu información de perfil</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/20">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Datos del Reponedor</CardTitle>
                    <CardDescription>
                      Tu información personal. Para modificar estos datos, contacta a tu supervisor.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6 p-4 bg-info/10 border border-info/30 rounded-lg flex items-start space-x-3">
                  <Info className="w-5 h-5 text-info mt-0.5" />
                  <div className="text-sm text-info">
                    <p className="font-medium">Información de solo lectura</p>
                    <p>Si necesitas actualizar algún dato personal, solicítalo a tu supervisor.</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos del perfil...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-sm font-medium">Nombre Completo</Label>
                        <Input
                          id="nombre"
                          value={profileData.nombre}
                          readOnly
                          className="bg-muted/50 border-2 border-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.correo}
                          readOnly
                          className="bg-muted/50 border-2 border-muted/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rol" className="text-sm font-medium">Rol</Label>
                        <Input
                          id="rol"
                          value={profileData.rol}
                          readOnly
                          className="bg-muted/50 border-2 border-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                        <Input
                          id="estado"
                          value={profileData.estado}
                          readOnly
                          className="bg-muted/50 border-2 border-muted/30"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        variant="outline" 
                        onClick={navigateToDashboard}
                        className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                      </Button>
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

export default ReponedorProfile;
