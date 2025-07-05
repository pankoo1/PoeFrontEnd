
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, MapPin, CheckCircle, Home, Bell, BellRing, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';

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
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/40">Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="bg-warning/20 text-warning border-warning/40">Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="bg-success/20 text-success border-success/40">Baja</Badge>;
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
                  Alertas y Notificaciones
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Centro de notificaciones importantes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {alertasNoLeidas > 0 && (
                <Badge variant="destructive" className="bg-destructive/90 text-destructive-foreground">
                  <BellRing className="w-3 h-3 mr-1" />
                  {alertasNoLeidas} sin leer
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/reponedor-dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/reponedor-dashboard')}
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
              <div className="p-3 bg-destructive/40 rounded-xl">
                <Bell className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Centro de Notificaciones</h2>
                <p className="text-muted-foreground">Mantente informado sobre desvíos, actualizaciones y eventos importantes</p>
              </div>
            </div>
          </div>

          {/* Resumen de alertas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-destructive/10 to-destructive/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-destructive/30 rounded-full group-hover:bg-destructive/40 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="metric-value text-destructive">{alertasNoLeidas}</div>
                <div className="metric-label">Sin Leer</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-destructive/20 text-destructive border border-destructive/40 px-2 py-1 rounded-md text-xs font-medium">⚠ Requiere atención</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-info/15 to-info/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-info/30 rounded-full group-hover:bg-info/40 transition-all duration-300">
                    <Bell className="w-8 h-8 text-info" />
                  </div>
                </div>
                <div className="metric-value text-info">{alertas.length}</div>
                <div className="metric-label">Total Alertas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-info/20 text-info border border-info/40 px-2 py-1 rounded-md text-xs font-medium">📊 Historial</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{alertas.filter(a => a.leida).length}</div>
                <div className="metric-label">Leídas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-success">✓ Procesadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de alertas */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-destructive/10 to-destructive/20">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-destructive/20 rounded-xl text-destructive border border-destructive/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Lista de Alertas</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Revisa y gestiona tus notificaciones</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${!alerta.leida ? 'border-l-4 border-l-destructive bg-destructive/5' : 'bg-white/50'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getPrioridadColor(alerta.prioridad)} text-white`}>
                          {getTipoIcon(alerta.tipo)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold flex items-center space-x-2">
                            <span>{alerta.titulo}</span>
                            {!alerta.leida && (
                              <Badge variant="destructive" className="text-xs">
                                Nueva
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alerta.descripcion}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getPrioridadBadge(alerta.prioridad)}
                        <span className="text-sm text-muted-foreground">{alerta.tiempo}</span>
                      </div>
                    </div>
                    
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
                          className="border-2 border-success/30 hover:bg-success/10 hover:border-success/50 transition-all duration-200 text-success"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como leída
                        </Button>
                      )}
                      
                      {alerta.leida && (
                        <Badge variant="outline" className="bg-success/20 text-success border-success/40">
                          ✓ Leída
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {alertas.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No tienes alertas</h3>
                    <p className="text-muted-foreground">
                      Todas tus actividades están funcionando correctamente
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ReponedorAlertas;
