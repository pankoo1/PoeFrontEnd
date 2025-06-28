import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { MapaService } from '@/services/mapaService';
import { ApiService, Tarea } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ReponedorMapPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado para el mapa y puntos reales
  const [mapaData, setMapaData] = useState<Mapa | null>(null);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noPointsAssigned, setNoPointsAssigned] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UbicacionFisica | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Estado para las tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [errorTareas, setErrorTareas] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapa = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Iniciando carga del mapa...');
        const data = await MapaService.getMapaReponedorVista();
        console.log('Datos del mapa recibidos:', data);
        
        if (data.mensaje && !data.mapa) {
          setNoPointsAssigned(true);
          return;
        }

        setMapaData(data.mapa);
        setUbicaciones(data.ubicaciones);
      } catch (err: any) {
        console.error('Error al cargar el mapa:', err);
        setError(`No se pudo cargar el mapa: ${err.message}`);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMapa();
  }, []);

  useEffect(() => {
    // Cargar tareas del reponedor
    const fetchTareas = async () => {
      setLoadingTareas(true);
      setErrorTareas(null);
      try {
        const tareasApi = await ApiService.getTareasReponedor();
        setTareas(tareasApi);
      } catch (err: any) {
        setErrorTareas('No se pudieron cargar las tareas');
      } finally {
        setLoadingTareas(false);
      }
    };
    fetchTareas();
  }, []);

  const handleObjectClick = (ubicacion: UbicacionFisica) => {
    // Si el objeto no es un mueble o no tiene puntos de reposición, ignorar
    if (!ubicacion.mueble || !ubicacion.mueble.puntos_reposicion) return;

    // Verificar si hay productos asignados al reponedor en este mueble
    const tienePuntosAsignados = ubicacion.mueble.puntos_reposicion.some(punto => punto.producto !== null);
    if (!tienePuntosAsignados) {
      toast({
        title: "Sin productos asignados",
        description: "Este mueble no tiene productos asignados a ti",
        variant: "destructive",
      });
      return;
    }

    setSelectedLocation(ubicacion);
    setDialogOpen(true);
  };

  const renderNoPointsMessage = () => (
    <div className="text-center p-8">
      <div className="flex justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No hay puntos de reposición asignados</h3>
      <p className="text-gray-600 mb-4">
        Actualmente no tienes puntos de reposición asignados.
      </p>
      <Button 
        variant="outline"
        onClick={() => navigate('/reponedor-dashboard')}
      >
        Volver al Dashboard
      </Button>
    </div>
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'siguiente':
        return <Badge className="bg-blue-500">Siguiente</Badge>;
      case 'pendiente':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'completada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4 button-modern hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Mapa y Rutas</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Mapa */}
          <Card className="card-modern shadow-modern">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
                  <Map className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Mapa Interactivo</CardTitle>
                  <p className="text-gray-600 mt-1">Visualiza tus rutas y puntos de reposición</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-[750px] bg-muted rounded-lg relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <span className="text-lg">Cargando mapa...</span>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-lg">{error}</span>
                  </div>
                )}
                {noPointsAssigned && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {renderNoPointsMessage()}
                  </div>
                )}
                {!loading && !error && !noPointsAssigned && mapaData && (
                  <div className="w-full h-[750px]">
                    <MapViewer
                      mapa={mapaData}
                      ubicaciones={ubicaciones}
                      onObjectClick={handleObjectClick}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Panel lateral: tareas asignadas */}
          <Card className="card-modern shadow-modern">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Tareas Asignadas</CardTitle>
                  <p className="text-gray-600 mt-1">{tareas.length} tareas pendientes</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {loadingTareas ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tareas...</p>
                  </div>
                ) : errorTareas ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-medium">{errorTareas}</p>
                  </div>
                ) : tareas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-2">Sin tareas asignadas</p>
                    <p className="text-gray-400 text-sm">No tienes tareas pendientes por el momento</p>
                  </div>
                ) : (
                  tareas.map((tarea) => (
                    <div
                      key={tarea.id_tarea}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="font-semibold text-gray-900 text-sm truncate">
                              {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {tarea.productos && tarea.productos.length > 0 ? 
                              `Estantería ${tarea.productos[0].ubicacion.estanteria || ''} - Nivel ${tarea.productos[0].ubicacion.nivel || ''}` : 
                              'Sin ubicación'
                            }
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getEstadoBadge(tarea.estado)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>📅 {tarea.fecha_creacion ? tarea.fecha_creacion.split('T')[0] : '-'}</span>
                        {tarea.productos && tarea.productos.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 ml-2">
                            Cantidad: {tarea.productos[0].cantidad}
                          </span>
                        )}
                      </div>
                      
                      {/* Sección de acciones para completar tarea */}
                      <div className="mt-2 pt-2 border-t">
                        {tarea.estado && tarea.estado.toLowerCase() === 'completada' ? (
                          <div className="flex items-center justify-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Tarea Completada
                          </div>
                        ) : (
                          tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Completar Tarea
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar finalización de tarea</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas marcar esta tarea como completada? 
                                    Una vez marcada como completada, no podrás cambiar el estado sin intervención del supervisor.
                                    <br /><br />
                                    <strong>Tarea:</strong> {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                                    <br />
                                    <strong>Ubicación:</strong> {tarea.productos && tarea.productos.length > 0 ? `${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}
                                    <br />
                                    <strong>Cantidad:</strong> {tarea.productos && tarea.productos.length > 0 ? `${tarea.productos[0].cantidad} unidades` : ''}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        const response = await ApiService.completarTarea(tarea.id_tarea);
                                        toast({
                                          title: "Tarea completada",
                                          description: `${response.mensaje} Completada el: ${new Date(response.fecha_completada).toLocaleString()}`,
                                        });
                                        // Actualizar el estado local
                                        setTareas((prevTareas) =>
                                          prevTareas.map((t) =>
                                            t.id_tarea === tarea.id_tarea ? { ...t, estado: 'completada' } : t
                                          )
                                        );
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: error.message || "No se pudo completar la tarea.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Sí, completar tarea
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Diálogo para mostrar detalles de la ubicación */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Punto de Reposición</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedLocation.objeto?.nombre || 'Objeto sin nombre'}</h4>
                <p className="text-sm text-muted-foreground">
                  Posición: ({selectedLocation.x}, {selectedLocation.y})
                </p>
              </div>
              
              {selectedLocation.mueble && (
                <div>
                  <h5 className="font-medium mb-2">Puntos de Reposición Asignados:</h5>
                  <div className="space-y-2">
                    {selectedLocation.mueble.puntos_reposicion
                      ?.filter(punto => punto.producto)
                      .map((punto, index) => (
                        <div key={punto.id_punto} className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{punto.producto?.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                Estantería: {punto.estanteria} | Nivel: {punto.nivel}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Categoría: {punto.producto?.categoria || 'Sin categoría'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReponedorMapPage;
