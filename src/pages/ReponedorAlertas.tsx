
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReponedorAlertas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Datos simulados de alertas
  const [alertas, setAlertas] = useState([
    {
      id: 1,
      tipo: 'desvio_ruta',
      titulo: 'Desvío de Ruta Detectado',
      descripcion: 'Te has desviado de la ruta optimizada en el Pasillo 3',
      ubicacion: 'Pasillo 3, Estante B',
      tiempo: '10:45 AM',
      prioridad: 'alta',
      leida: false
    },
    {
      id: 2,
      tipo: 'tiempo_excedido',
      titulo: 'Tiempo Estimado Excedido',
      descripcion: 'La tarea de reposición de cereales ha excedido el tiempo estimado',
      ubicacion: 'Pasillo 3, Estante B',
      tiempo: '10:30 AM',
      prioridad: 'media',
      leida: false
    },
    {
      id: 3,
      tipo: 'producto_faltante',
      titulo: 'Producto No Disponible',
      descripcion: 'El producto "Leche Entera 1L" no está disponible en el almacén',
      ubicacion: 'Almacén Central',
      tiempo: '09:15 AM',
      prioridad: 'alta',
      leida: true
    },
    {
      id: 4,
      tipo: 'ruta_actualizada',
      titulo: 'Ruta Actualizada',
      descripcion: 'Se ha optimizado tu ruta debido a cambios en las prioridades',
      ubicacion: 'Sistema',
      tiempo: '08:45 AM',
      prioridad: 'baja',
      leida: true
    }
  ]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'desvio_ruta':
        return <MapPin className="w-5 h-5" />;
      case 'tiempo_excedido':
        return <Clock className="w-5 h-5" />;
      case 'producto_faltante':
      case 'ruta_actualizada':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-500';
      case 'media':
        return 'bg-yellow-500';
      case 'baja':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const marcarComoLeida = (alertaId: number) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId 
        ? { ...alerta, leida: true }
        : alerta
    ));
    toast({
      title: "Alerta marcada como leída",
      description: "La alerta ha sido marcada como leída",
    });
  };

  const alertasNoLeidas = alertas.filter(alerta => !alerta.leida).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/reponedor-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Alertas</h1>
          </div>
          {alertasNoLeidas > 0 && (
            <Badge variant="destructive">
              {alertasNoLeidas} sin leer
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Notificaciones y Alertas</h2>
          <p className="text-muted-foreground">
            Mantente informado sobre desvíos de ruta y actualizaciones importantes
          </p>
        </div>

        <div className="space-y-4">
          {alertas.map((alerta) => (
            <Card 
              key={alerta.id} 
              className={`transition-all hover:shadow-md ${!alerta.leida ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${getPrioridadColor(alerta.prioridad)} text-white`}>
                      {getTipoIcon(alerta.tipo)}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{alerta.titulo}</span>
                        {!alerta.leida && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {alerta.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getPrioridadBadge(alerta.prioridad)}
                    <span className="text-sm text-muted-foreground">{alerta.tiempo}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{alerta.ubicacion}</p>
                  </div>
                  
                  {!alerta.leida && (
                    <Button 
                      onClick={() => marcarComoLeida(alerta.id)}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como leída
                    </Button>
                  )}
                  
                  {alerta.leida && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ Leída
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alertas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No tienes alertas</h3>
              <p className="text-muted-foreground">
                Todas tus actividades están funcionando correctamente
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ReponedorAlertas;
