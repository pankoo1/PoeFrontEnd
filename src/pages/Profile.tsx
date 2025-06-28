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

const Profile = () => {
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
      const response = await ApiService.getProfile();
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

      await ApiService.updateProfile(updateData);
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Mi Perfil
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-semibold">Información Personal</CardTitle>
                </div>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
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
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando datos del perfil...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={isEditing ? editedData.nombre : profileData.nombre}
                      onChange={(e) => setEditedData({...editedData, nombre: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50 border-slate-200" : "border-slate-300 focus:border-blue-500"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editedData.correo : profileData.correo}
                      onChange={(e) => setEditedData({...editedData, correo: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50 border-slate-200" : "border-slate-300 focus:border-blue-500"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-700 font-medium">Rol</Label>
                    <Input
                      id="role"
                      value={profileData.rol}
                      disabled
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-700 font-medium">Estado</Label>
                    <Input
                      id="status"
                      value={profileData.estado}
                      disabled
                      className="bg-slate-50 border-slate-200"
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

export default Profile;
