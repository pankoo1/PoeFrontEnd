
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, MapPin, CheckCircle, Bell, Info, AlertCircle } from 'lucide-react';
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
        return <AlertCircle className="w-5 h-5" />;
      case 'ruta_actualizada':
        return <Info className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'media':
        return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
      case 'baja':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">🔥 Alta</Badge>;
      case 'media':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm">⚠️ Media</Badge>;
      case 'baja':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">✅ Baja</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-300">Normal</Badge>;
    }
  };

  const marcarComoLeida = (alertaId: number) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId 
        ? { ...alerta, leida: true }
        : alerta
    ));
    toast({
      title: "✅ Alerta marcada como leída",
      description: "La alerta ha sido procesada correctamente",
    });
  };

  const alertasNoLeidas = alertas.filter(alerta => !alerta.leida).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
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
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Alertas
              </h1>
            </div>
          </div>
          {alertasNoLeidas > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm animate-pulse">
              🔔 {alertasNoLeidas} sin leer
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Centro de Notificaciones</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente informado sobre desvíos de ruta, actualizaciones importantes y eventos del sistema
          </p>
        </div>

        {/* Alertas count summary */}
        {alertasNoLeidas > 0 && (
          <Card className="glass-card border border-red-200 bg-red-50/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Bell className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Tienes {alertasNoLeidas} alertas sin leer</h3>
                  <p className="text-red-700 text-sm">
                    Revisa y marca como leídas las alertas importantes para mantener tu flujo de trabajo optimizado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {alertas.map((alerta) => (
            <Card 
              key={alerta.id} 
              className={`glass-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden group ${!alerta.leida ? 'ring-2 ring-red-200' : ''}`}
            >
              <CardHeader className="relative">
                <div className={`absolute inset-0 ${getPrioridadColor(alerta.prioridad)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl ${getPrioridadColor(alerta.prioridad)} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {getTipoIcon(alerta.tipo)}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center space-x-3 mb-2">
                        <span className="text-gray-900 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {alerta.titulo}
                        </span>
                        {!alerta.leida && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        {alerta.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    {getPrioridadBadge(alerta.prioridad)}
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      🕒 {alerta.tiempo}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex justify-between items-center">
                  <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      Ubicación
                    </p>
                    <p className="font-semibold text-gray-900">{alerta.ubicacion}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    {!alerta.leida && (
                      <Button 
                        onClick={() => marcarComoLeida(alerta.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como leída
                      </Button>
                    )}
                    
                    {alerta.leida && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Leída
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alertas.length === 0 && (
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Todo bajo control!</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                No tienes alertas pendientes. Todas tus actividades están funcionando correctamente.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ReponedorAlertas;
