
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Info, Mail, Building, Shield, IdCard, Star, MapPin } from 'lucide-react';

const ReponedorProfile = () => {
  const navigate = useNavigate();
  
  // Datos del perfil en modo solo lectura
  const [profileData] = useState({
    nombre: 'Juan Pérez',
    email: 'reponedor@reponedor.com',
    supervisor: 'María González',
    sucursal: 'Supermercado Central',
    empleadoId: 'EMP-2023-0045',
    telefono: '+56 9 8765 4321',
    fechaIngreso: '2023-03-15',
    turno: 'Mañana (06:00 - 14:00)'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4 glass-card hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mi Perfil
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Información Personal</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Consulta y revisa tu información personal y laboral
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header Card */}
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden">
            <CardHeader className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-5"></div>
              <div className="flex items-center space-x-6 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{profileData.nombre}</CardTitle>
                  <CardDescription className="text-lg text-gray-600 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-orange-500" />
                    Reponedor - {profileData.sucursal}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Information Notice */}
          <Card className="glass-card border border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Información de solo lectura</h3>
                  <p className="text-blue-700 text-sm">
                    Si necesitas actualizar algún dato personal o laboral, solicítalo a tu supervisor a través de los canales oficiales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombre"
                    value={profileData.nombre}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center text-sm font-medium text-gray-700">
                    <span className="w-4 h-4 mr-2 text-gray-500">📱</span>
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={profileData.telefono}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empleadoId" className="flex items-center text-sm font-medium text-gray-700">
                    <IdCard className="w-4 h-4 mr-2 text-gray-500" />
                    ID Empleado
                  </Label>
                  <Input
                    id="empleadoId"
                    value={profileData.empleadoId}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-green-500" />
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sucursal" className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    Sucursal
                  </Label>
                  <Input
                    id="sucursal"
                    value={profileData.sucursal}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor" className="flex items-center text-sm font-medium text-gray-700">
                    <Shield className="w-4 h-4 mr-2 text-gray-500" />
                    Supervisor Asignado
                  </Label>
                  <Input
                    id="supervisor"
                    value={profileData.supervisor}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso" className="flex items-center text-sm font-medium text-gray-700">
                    <span className="w-4 h-4 mr-2 text-gray-500">📅</span>
                    Fecha de Ingreso
                  </Label>
                  <Input
                    id="fechaIngreso"
                    value={new Date(profileData.fechaIngreso).toLocaleDateString('es-ES')}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turno" className="flex items-center text-sm font-medium text-gray-700">
                    <span className="w-4 h-4 mr-2 text-gray-500">🕒</span>
                    Turno de Trabajo
                  </Label>
                  <Input
                    id="turno"
                    value={profileData.turno}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate('/reponedor-dashboard')}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg px-8 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReponedorProfile;
