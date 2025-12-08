import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { User, Home, Shield, Mail, UserCircle2, Briefcase, CheckCircle, Clock, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

interface ProfileData {
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

const SupervisorProfile = () => {
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

  const getEstadoColor = (estado: string) => {
    return estado.toLowerCase() === 'activo'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const userName = profileData.nombre || 'Supervisor';

  return (
    <SupervisorLayout>
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">Mi Perfil</h2>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500">Supervisor</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando datos del perfil...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card con Avatar */}
            <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {profileData.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">{profileData.nombre}</h1>
                    <p className="text-slate-600 flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4" />
                      {profileData.correo}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {profileData.rol}
                      </Badge>
                      <Badge className={getEstadoColor(profileData.estado)}>
                        {profileData.estado.toLowerCase() === 'activo' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {profileData.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Personal */}
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-primary" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre Completo
                    </Label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-slate-800 font-medium">{profileData.nombre}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo Electrónico
                    </Label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-slate-800 font-medium">{profileData.correo}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Cuenta */}
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Información de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Rol en el Sistema
                    </Label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {profileData.rol}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Estado de Cuenta
                    </Label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <Badge className={getEstadoColor(profileData.estado)}>
                        {profileData.estado.toLowerCase() === 'activo' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {profileData.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nota Informativa */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-1">Información de Seguridad</h3>
                    <p className="text-sm text-purple-700 mb-2">
                      Tu perfil está en modo solo lectura para mantener la integridad y seguridad del sistema.
                    </p>
                    <p className="text-xs text-purple-600">
                      Los datos de perfil son gestionados centralmente. Para cualquier cambio, contacta al administrador del sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de Volver */}
            <div className="flex justify-end">
              <Button 
                onClick={navigateToDashboard}
                className="bg-primary hover:bg-primary/90"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorProfile;
