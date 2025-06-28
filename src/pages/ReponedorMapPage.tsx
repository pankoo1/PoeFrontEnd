import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, AlertCircle, CheckCircle, AlertTriangle, Route, Navigation, Target } from 'lucide-react';
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
    <div className="text-center p-12">
      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <AlertCircle className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay puntos asignados</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Actualmente no tienes puntos de reposición asignados. Contacta con tu supervisor para obtener más información.
      </p>
      <Button 
        onClick={() => navigate('/reponedor-dashboard')}
        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Button>
    </div>
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'siguiente':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">Siguiente</Badge>;
      case 'pendiente':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm">Pendiente</Badge>;
      case 'completada':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">Completada</Badge>;
      case 'en_progreso':
        return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm">En Progreso</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-300">Desconocido</Badge>;
    }
  };

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
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <Map className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Mapa y Rutas
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Navegación Inteligente</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualiza tus rutas optimizadas y gestiona tus puntos de reposición de manera eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Mapa */}
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden">
            <CardHeader className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 opacity-5"></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
                  <Navigation className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Mapa Interactivo</CardTitle>
                  <p className="text-gray-600 mt-1">Haz clic en los puntos para ver detalles de reposición</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="w-full h-[700px] bg-gray-50/50 rounded-xl relative overflow-hidden border border-gray-200">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <span className="text-lg font-medium text-gray-700">Cargando mapa...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 backdrop-blur-sm z-20">
                    <div className="text-center p-6">
                      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <span className="text-red-600 text-lg font-medium">{error}</span>
                    </div>
                  </div>
                )}
                {noPointsAssigned && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    {renderNoPointsMessage()}
                  </div>
                )}
                {!loading && !error && !noPointsAssigned && mapaData && (
                  <div className="w-full h-full">
                    <MapViewer
                      mapa={mapaData}
                      ubicaciones={ubicaciones}
                      onObjectClick={handleObjectClick}
                      className="w-full h-full rounded-xl"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Panel lateral: tareas asignadas */}
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardHeader className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-5"></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Route className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Tareas Asignadas</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {tareas.length} {tareas.length === 1 ? 'tarea' : 'tareas'} {tareas.filter(t => t.estado?.toLowerCase() !== 'completada').length > 0 ? 'pendientes' : 'completadas'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin">
                {loadingTareas ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando tareas...</p>
                  </div>
                ) : errorTareas ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
                    <p className="text-red-600">{errorTareas}</p>
                  </div>
                ) : tareas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin tareas asignadas</h3>
                    <p className="text-gray-500 text-sm">No tienes tareas pendientes por el momento</p>
                  </div>
                ) : (
                  tareas.map((tarea) => (
                    <div
                      key={tarea.id_tarea}
                      className="glass-card bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-sm"></div>
                            <span className="font-semibold text-gray-900 text-sm truncate group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-amber-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-600">
                              {tarea.productos && tarea.productos.length > 0 ? 
                                `Estantería ${tarea.productos[0].ubicacion.estanteria || ''} - Nivel ${tarea.productos[0].ubicacion.nivel || ''}` : 
                                'Sin ubicación'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getEstadoBadge(tarea.estado)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span className="flex items-center">
                          📅 {tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </span>
                        {tarea.productos && tarea.productos.length > 0 && (
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                            {tarea.productos[0].cantidad} unidades
                          </span>
                        )}
                      </div>
                      
                      {/* Sección de acciones para completar tarea */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {tarea.estado && tarea.estado.toLowerCase() === 'completada' ? (
                          <div className="flex items-center justify-center text-green-600 text-sm font-medium bg-green-50 rounded-lg py-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tarea Completada
                          </div>
                        ) : (
                          tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Completar Tarea
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-card border-0">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                    Confirmar finalización de tarea
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600 space-y-3">
                                    <p>
                                      ¿Estás seguro de que deseas marcar esta tarea como completada? 
                                      Una vez marcada como completada, no podrás cambiar el estado sin intervención del supervisor.
                                    </p>
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                      <p className="font-semibold text-orange-800 mb-2">Detalles de la tarea:</p>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Producto:</span> {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}</p>
                                        <p><span className="font-medium">Ubicación:</span> {tarea.productos && tarea.productos.length > 0 ? `${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}</p>
                                        <p><span className="font-medium">Cantidad:</span> {tarea.productos && tarea.productos.length > 0 ? `${tarea.productos[0].cantidad} unidades` : ''}</p>
                                      </div>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        const response = await ApiService.completarTarea(tarea.id_tarea);
                                        toast({
                                          title: "✅ Tarea completada exitosamente",
                                          description: `${response.mensaje} Completada el: ${new Date(response.fecha_completada).toLocaleString('es-ES')}`,
                                        });
                                        // Actualizar el estado local
                                        setTareas((prevTareas) =>
                                          prevTareas.map((t) =>
                                            t.id_tarea === tarea.id_tarea ? { ...t, estado: 'completada' } : t
                                          )
                                        );
                                      } catch (error: any) {
                                        toast({
                                          title: "❌ Error al completar tarea",
                                          description: error.message || "No se pudo completar la tarea.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
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
        <DialogContent className="glass-card border-0 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-500" />
              Detalles del Punto de Reposición
            </DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-6">
              <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  {selectedLocation.objeto?.nombre || 'Objeto sin nombre'}
                </h4>
                <p className="text-sm text-gray-600">
                  Coordenadas: ({selectedLocation.x}, {selectedLocation.y})
                </p>
              </div>
              
              {selectedLocation.mueble && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Route className="w-4 h-4 mr-2 text-blue-500" />
                    Puntos de Reposición Asignados
                  </h5>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedLocation.mueble.puntos_reposicion
                      ?.filter(punto => punto.producto)
                      .map((punto, index) => (
                        <div key={punto.id_punto} className="glass-card border border-gray-200 rounded-lg p-4 bg-white/70">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="font-semibold text-gray-900">{punto.producto?.nombre}</p>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center">
                                  <Target className="w-3 h-3 mr-1" />
                                  Estantería: {punto.estanteria} | Nivel: {punto.nivel}
                                </p>
                                <p>
                                  Categoría: {punto.producto?.categoria || 'Sin categoría'}
                                </p>
                              </div>
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
