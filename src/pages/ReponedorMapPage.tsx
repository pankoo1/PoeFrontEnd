import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, AlertCircle, CheckCircle, Route, Clock, BarChart3, Zap } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { MapaService } from '@/services/mapaService';
import { ApiService, Tarea, RutaOptimizadaResponse } from '@/services/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReponedorMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  // Estado para la ruta optimizada
  const [rutaOptimizada, setRutaOptimizada] = useState<RutaOptimizadaResponse | null>(null);
  const [mostrarRuta, setMostrarRuta] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<number | null>(null);
  const [generandoRuta, setGenerandoRuta] = useState(false);
  const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState<'vecino_mas_cercano' | 'fuerza_bruta' | 'genetico'>('vecino_mas_cercano');

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

  // Verificar si hay una ruta en el estado de navegación o parámetros URL
  useEffect(() => {
    const rutaDesdeEstado = location.state?.rutaOptimizada;
    const tareaId = searchParams.get('tarea');
    const mostrarRutaParam = searchParams.get('mostrar_ruta') === 'true';

    if (rutaDesdeEstado) {
      setRutaOptimizada(rutaDesdeEstado);
      setMostrarRuta(true);
      setTareaSeleccionada(rutaDesdeEstado.id_tarea);
    } else if (tareaId && mostrarRutaParam) {
      // Si no hay ruta en el estado pero se solicita mostrar una, cargarla
      cargarRutaOptimizada(parseInt(tareaId));
    }
  }, [location.state, searchParams]);

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

  // Función para cargar ruta optimizada desde el backend
  const cargarRutaOptimizada = async (idTarea: number, algoritmo: 'vecino_mas_cercano' | 'fuerza_bruta' | 'genetico' = 'vecino_mas_cercano') => {
    try {
      setGenerandoRuta(true);
      const ruta = await ApiService.obtenerRutaOptimizada(idTarea, algoritmo);
      setRutaOptimizada(ruta);
      setMostrarRuta(true);
      setTareaSeleccionada(idTarea);
      
      toast({
        title: "Ruta optimizada generada",
        description: `Algoritmo: ${ruta.algoritmo_utilizado.nombre}. Distancia: ${ruta.distancia_total} unidades.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la ruta optimizada.",
        variant: "destructive",
      });
    } finally {
      setGenerandoRuta(false);
    }
  };

  // Función para comenzar una tarea desde el mapa
  const comenzarTareaDesdeMap = async (idTarea: number) => {
    try {
      setGenerandoRuta(true);
      
      // Primero iniciar la tarea
      await ApiService.iniciarTarea(idTarea);
      
      // Luego generar la ruta optimizada
      await cargarRutaOptimizada(idTarea, algoritmoSeleccionado);
      
      // Actualizar el estado local de la tarea
      setTareas((prevTareas) =>
        prevTareas.map((t) =>
          t.id_tarea === idTarea ? { ...t, estado: 'en_progreso' } : t
        )
      );

      toast({
        title: "¡Tarea iniciada!",
        description: "Ruta optimizada generada y mostrada en el mapa.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar la tarea.",
        variant: "destructive",
      });
    } finally {
      setGenerandoRuta(false);
    }
  };

  // Función para limpiar la ruta mostrada
  const limpiarRuta = () => {
    setRutaOptimizada(null);
    setMostrarRuta(false);
    setTareaSeleccionada(null);
  };

  // Función para reiniciar una tarea completada (útil para pruebas)
  const reiniciarTarea = async (idTarea: number) => {
    try {
      // Confirmar acción con el usuario
      const confirmar = window.confirm(
        "¿Estás seguro de que deseas reiniciar esta tarea? Se cambiará el estado de vuelta a 'pendiente'."
      );
      
      if (!confirmar) return;

      await ApiService.reiniciarTarea(idTarea);
      
      // Actualizar el estado local de la tarea
      setTareas((prevTareas) =>
        prevTareas.map((t) =>
          t.id_tarea === idTarea ? { ...t, estado: 'pendiente' } : t
        )
      );

      // Limpiar ruta si está mostrando la ruta de esta tarea
      if (tareaSeleccionada === idTarea) {
        limpiarRuta();
      }

      toast({
        title: "¡Tarea reiniciada!",
        description: "La tarea ha sido reiniciada y está disponible para comenzar nuevamente.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reiniciar la tarea.",
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
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mapa y Rutas</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Mapa */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Map className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Mapa Interactivo</CardTitle>
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
                      // Pasar datos de ruta si está disponible
                      rutaOptimizada={mostrarRuta ? rutaOptimizada : null}
                      // Activar modo reponedor para desactivar hover y resaltar solo destinos
                      modoReponedor={true}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Panel lateral: tareas asignadas y control de rutas */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Tareas y Rutas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              
              {/* Información de ruta actual */}
              {mostrarRuta && rutaOptimizada && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 flex items-center">
                      <Route className="w-4 h-4 mr-2" />
                      Ruta Optimizada Activa
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiarRuta}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Algoritmo:</span>
                      <span className="font-medium">{rutaOptimizada.algoritmo_utilizado.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Distancia:</span>
                      <span className="font-medium">{rutaOptimizada.distancia_total} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tiempo estimado:</span>
                      <span className="font-medium">{rutaOptimizada.tiempo_estimado_minutos} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Puntos a visitar:</span>
                      <span className="font-medium">{rutaOptimizada.puntos_reposicion.length}</span>
                    </div>
                  </div>
                  
                  {/* Lista de puntos de la ruta */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Orden de visita:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {rutaOptimizada.puntos_reposicion.map((punto) => (
                        <div key={punto.id_punto} className="flex items-center text-xs">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-xs">
                            {punto.orden_visita}
                          </div>
                          <span className="truncate">{punto.producto.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Controles de algoritmo (solo si no hay ruta activa) */}
              {!mostrarRuta && (
                <div className="mb-4 p-4 bg-gray-50 border rounded-lg">
                  <div className="flex items-center space-x-4 mb-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-sm">Algoritmo de Optimización</span>
                  </div>
                  <Select value={algoritmoSeleccionado} onValueChange={(valor) => setAlgoritmoSeleccionado(valor as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vecino_mas_cercano">Vecino más cercano</SelectItem>
                      <SelectItem value="fuerza_bruta">Fuerza bruta</SelectItem>
                      <SelectItem value="genetico">Genético</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {algoritmoSeleccionado === 'vecino_mas_cercano' && 'Rápido y eficiente para la mayoría de casos'}
                    {algoritmoSeleccionado === 'fuerza_bruta' && 'Más preciso pero lento (máx. 8 puntos)'}
                    {algoritmoSeleccionado === 'genetico' && 'Buena precisión con muchos puntos'}
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {loadingTareas ? (
                  <div className="text-center text-muted-foreground">Cargando tareas...</div>
                ) : errorTareas ? (
                  <div className="text-center text-red-600">{errorTareas}</div>
                ) : tareas.length === 0 ? (
                  <div className="text-center text-muted-foreground">No tienes tareas asignadas.</div>
                ) : (
                  tareas.map((tarea) => (
                    <div
                      key={tarea.id_tarea}
                      className={`border rounded-lg p-4 transition-all ${
                        tareaSeleccionada === tarea.id_tarea 
                          ? 'bg-blue-50 border-blue-300 shadow-md' 
                          : 'bg-white/80 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-base text-primary">
                            {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tarea.productos && tarea.productos.length > 0 ? `Ubicación: ${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}
                          </span>
                        </div>
                        <div className="ml-2">
                          {getEstadoBadge(tarea.estado)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Fecha: {tarea.fecha_creacion ? tarea.fecha_creacion.split('T')[0] : '-'}</span>
                        {tarea.productos && tarea.productos.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5">
                            Cantidad: {tarea.productos[0].cantidad}
                          </span>
                        )}
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="space-y-2">
                        {/* Botón para comenzar tarea (solo si está pendiente) */}
                        {tarea.estado && tarea.estado.toLowerCase() === 'pendiente' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => comenzarTareaDesdeMap(tarea.id_tarea)}
                            disabled={generandoRuta}
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            {generandoRuta ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                Generando ruta...
                              </>
                            ) : (
                              <>
                                <Route className="w-4 h-4 mr-2" />
                                Comenzar Tarea
                              </>
                            )}
                          </Button>
                        )}

                        {/* Botón para regenerar ruta (si está en progreso y no se está mostrando) */}
                        {tarea.estado && tarea.estado.toLowerCase() === 'en_progreso' && (!mostrarRuta || tareaSeleccionada !== tarea.id_tarea) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cargarRutaOptimizada(tarea.id_tarea, algoritmoSeleccionado)}
                            disabled={generandoRuta}
                            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            {generandoRuta ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                                Cargando...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-2" />
                                Mostrar Ruta
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Botón para completar tarea */}
                        {tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
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
                                      // Limpiar ruta si es la tarea completada
                                      if (tareaSeleccionada === tarea.id_tarea) {
                                        limpiarRuta();
                                      }
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
                        )}

                        {/* Mostrar si está completada */}
                        {tarea.estado && tarea.estado.toLowerCase() === 'completada' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center text-green-600 text-sm py-2">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Tarea Completada
                            </div>
                            {/* Botón para reiniciar tarea completada (útil para pruebas) */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reiniciarTarea(tarea.id_tarea)}
                              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <Route className="w-4 h-4 mr-2" />
                              Reiniciar Tarea
                            </Button>
                          </div>
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
