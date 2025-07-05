import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save, Home, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import Logo from '@/components/Logo';

interface ProfileData {
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

const SupervisorProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: '',
    correo: '',
    rol: '',
    estado: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData>({
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
      const response = await ApiService.getSupervisorProfile();
      setProfileData(response);
      setEditedData(response);
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

  const handleSave = async () => {
    try {
      // Solo enviamos los campos que pueden ser actualizados
      const updateData = {
        nombre: editedData.nombre,
        correo: editedData.correo
      };

      await ApiService.updateSupervisorProfile(updateData);
      
      setProfileData(editedData);
      setIsEditing(false);
      
      toast({
        title: "Perfil actualizado",
        description: "Los datos han sido actualizados exitosamente",
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: "Error al actualizar perfil",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar el perfil",
        variant: "destructive",
      });
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
                  Mi Perfil (Supervisor)
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Gestiona tu información personal y configuraciones
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor/dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor/dashboard')}
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Perfil de Supervisor</h2>
                <p className="text-muted-foreground">Administra tu información personal y ajustes de cuenta</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-primary/30 rounded-xl">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Información Personal</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Datos de tu cuenta de supervisor</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                    >
                      Editar Datos
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedData(profileData);
                        }}
                        className="border-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 transition-all duration-200"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <p className="text-muted-foreground">Cargando datos del perfil...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={isEditing ? editedData.nombre : profileData.nombre}
                        onChange={(e) => setEditedData({...editedData, nombre: e.target.value})}
                        disabled={!isEditing}
                        className={`border-2 transition-colors ${
                          !isEditing 
                            ? "bg-muted border-muted/40" 
                            : "border-primary/20 focus:border-primary/50"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editedData.correo : profileData.correo}
                        onChange={(e) => setEditedData({...editedData, correo: e.target.value})}
                        disabled={!isEditing}
                        className={`border-2 transition-colors ${
                          !isEditing 
                            ? "bg-muted border-muted/40" 
                            : "border-primary/20 focus:border-primary/50"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">Rol</Label>
                      <div className="relative">
                        <Input
                          id="role"
                          value={profileData.rol}
                          disabled
                          className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30 text-primary font-medium"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
                      <Input
                        id="status"
                        value={profileData.estado}
                        disabled
                        className="bg-gradient-to-r from-success/10 to-success/20 border-success/30 text-success font-medium"
                      />
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

export default SupervisorProfile;
