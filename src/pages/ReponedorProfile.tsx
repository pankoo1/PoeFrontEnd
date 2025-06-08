
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Info } from 'lucide-react';

const ReponedorProfile = () => {
  const navigate = useNavigate();
  
  // Datos del perfil en modo solo lectura
  const [profileData] = useState({
    nombre: 'Juan Pérez',
    email: 'reponedor@reponedor.com',
    telefono: '+57 300 123 4567',
    supervisor: 'María González',
    sucursal: 'Supermercado Central',
    turno: 'Mañana (6:00 AM - 2:00 PM)',
    fechaIngreso: '2023-01-15',
    area: 'Lácteos',
    empleadoId: 'EMP-2023-0045'
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
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
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Información Personal</CardTitle>
                  <CardDescription>
                    Tu información personal. Para modificar estos datos, contacta a tu supervisor.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Información de solo lectura</p>
                  <p>Si necesitas actualizar algún dato personal, solicítalo a tu supervisor.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={profileData.nombre}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={profileData.telefono}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empleadoId">ID Empleado</Label>
                    <Input
                      id="empleadoId"
                      value={profileData.empleadoId}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor Asignado</Label>
                    <Input
                      id="supervisor"
                      value={profileData.supervisor}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área de Trabajo</Label>
                    <Input
                      id="area"
                      value={profileData.area}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sucursal">Sucursal</Label>
                    <Input
                      id="sucursal"
                      value={profileData.sucursal}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turno">Turno de Trabajo</Label>
                    <Input
                      id="turno"
                      value={profileData.turno}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <Input
                    id="fechaIngreso"
                    value={profileData.fechaIngreso}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate('/reponedor-dashboard')}>
                    Volver al Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReponedorProfile;
