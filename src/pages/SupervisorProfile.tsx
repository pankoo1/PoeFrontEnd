import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Información Personal</CardTitle>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Editar Datos
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setEditedData(profileData);
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-4">
                  <p>Cargando datos del perfil...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={isEditing ? editedData.nombre : profileData.nombre}
                      onChange={(e) => setEditedData({...editedData, nombre: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editedData.correo : profileData.correo}
                      onChange={(e) => setEditedData({...editedData, correo: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      value={profileData.rol}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Input
                      id="status"
                      value={profileData.estado}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupervisorProfile;
