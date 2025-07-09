import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, AlertCircle, CheckCircle, Home, Route, Navigation } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { MapaService } from '@/services/mapaService';
import { ApiService, Tarea } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import Logo from '@/components/Logo';
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

  // Algoritmos válidos para optimización de rutas
  const ALGORITMOS_VALIDOS = ['vecino_mas_cercano', 'fuerza_bruta', 'genetico'];

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

  // Estado para la ruta optimizada - integración con endpoint del backend
  const [rutaOptimizada, setRutaOptimizada] = useState<any>(null);
  const [mostrandoRuta, setMostrandoRuta] = useState(false);
  const [generandoRuta, setGenerandoRuta] = useState(false);

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

  // Función para generar ruta optimizada usando el endpoint del backend
  const generarRutaOptimizada = async (idTarea: number, algoritmo: string = 'vecino_mas_cercano') => {
    try {
      setGenerandoRuta(true);
      console.log(`[Frontend] Generando ruta para tarea ${idTarea} con algoritmo ${algoritmo}`);
      
      // Verificar que el usuario esté autenticado
      const token = ApiService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }
      
      // Hacer llamada al endpoint del backend
      const response = await fetch(`http://localhost:8000/tareas/${idTarea}/ruta-optimizada?algoritmo=${algoritmo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${errorText}`;
        
        // Manejo específico para errores de algoritmo
        if (errorText.includes('no válido') || errorText.includes('Algoritmos disponibles')) {
          errorMessage = `Algoritmo no válido. Algoritmos disponibles: ${ALGORITMOS_VALIDOS.join(', ')}`;
        }
        
        throw new Error(errorMessage);
      }

      const rutaData = await response.json();
      console.log('[Frontend] Ruta recibida del backend:', rutaData);

      // Validar la estructura de la respuesta
      if (rutaData.error) {
        throw new Error(rutaData.error);
      }

      if (rutaData.warning) {
        toast({
          title: "⚠️ Advertencia",
          description: rutaData.warning,
          variant: "destructive",
        });
      }

      // Guardar la ruta en el estado
      setRutaOptimizada(rutaData);
      setMostrandoRuta(true);

      // Mensaje de éxito más detallado
      const muebles = rutaData.muebles_rutas?.length || 0;
      const productos = rutaData.muebles_rutas?.reduce((total: number, mueble: any) => 
        total + (mueble.detalle_tareas?.length || 0), 0) || 0;

      toast({
        title: "✅ Ruta optimizada generada",
        description: `Ruta para ${muebles} muebles y ${productos} productos`,
      });

    } catch (error: any) {
      console.error('[Frontend] Error al generar ruta:', error);
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo generar la ruta optimizada",
        variant: "destructive",
      });
    } finally {
      setGenerandoRuta(false);
    }
  };

  // Función para limpiar la ruta actual
  const limpiarRuta = () => {
    setRutaOptimizada(null);
    setMostrandoRuta(false);
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
                  Mapa y Rutas
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Navegación optimizada para tus tareas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              <div className="p-3 bg-accent/40 rounded-xl">
                <Map className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Sistema de Navegación</h2>
                <p className="text-muted-foreground">Encuentra el camino más eficiente hacia tus puntos de reposición</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            {/* Mapa */}
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md overflow-hidden">
              <CardHeader className="flex-shrink-0 bg-gradient-to-r from-accent/10 to-accent/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-accent/20 text-accent border border-accent/20">
                    <Map className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Mapa Interactivo</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Visualiza tu ruta de trabajo</p>
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
                      modoReponedor={true}
                      rutaOptimizada={mostrandoRuta ? rutaOptimizada : null}
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
              
              {/* Panel de información de ruta optimizada */}
              {mostrandoRuta && rutaOptimizada && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 flex items-center">
                      <Route className="w-4 h-4 mr-2" />
                      Ruta Optimizada Activa
                    </h3>
                    <button
                      onClick={limpiarRuta}
                      className="text-blue-700 hover:text-blue-900 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tarea ID:</span>
                      <span className="font-medium">{rutaOptimizada.id_tarea || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Reponedor:</span>
                      <span className="font-medium">{rutaOptimizada.reponedor || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Muebles:</span>
                      <span className="font-medium">{rutaOptimizada.muebles_rutas?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Productos:</span>
                      <span className="font-medium">
                        {rutaOptimizada.muebles_rutas?.reduce((total: number, mueble: any) => 
                          total + (mueble.detalle_tareas?.length || 0), 0) || 0}
                      </span>
                    </div>
                    {rutaOptimizada.tiempo_estimado_total && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tiempo estimado:</span>
                        <span className="font-medium">{rutaOptimizada.tiempo_estimado_total} min</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pasos totales:</span>
                      <span className="font-medium">{rutaOptimizada.coordenadas_ruta_global?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Mostrar advertencias si existen */}
                  {rutaOptimizada.warning && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      ⚠️ {rutaOptimizada.warning}
                    </div>
                  )}
                  
                  {/* Mostrar detalles de muebles si existen */}
                  {rutaOptimizada.muebles_rutas && rutaOptimizada.muebles_rutas.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Ruta por muebles:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {rutaOptimizada.muebles_rutas.map((mueble: any, muebleIndex: number) => (
                          <div key={muebleIndex} className="bg-white rounded p-3 border border-blue-100">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-xs">
                                {muebleIndex + 1}
                              </div>
                              <div className="font-medium text-blue-900">{mueble.nombre_mueble}</div>
                              <span className="ml-auto text-xs text-gray-500">
                                {mueble.detalle_tareas?.length || 0} productos
                              </span>
                            </div>
                            <div className="space-y-1 ml-8">
                              {mueble.detalle_tareas?.map((detalle: any, detalleIndex: number) => (
                                <div key={detalleIndex} className="text-xs text-gray-600">
                                  • {detalle.producto || 'Producto'} ({detalle.cantidad || 0} unidades)
                                </div>
                              ))}
                              {mueble.distancia_total_mueble > 0 && (
                                <div className="text-xs text-green-600 mt-1">
                                  🗺️ {mueble.distancia_total_mueble} pasos
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      className="border rounded-lg p-4 transition-all bg-white/80 hover:shadow-lg"
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
                        
                        {/* Botón para generar ruta optimizada */}
                        {tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generarRutaOptimizada(tarea.id_tarea)}
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
                                <Navigation className="w-4 h-4 mr-2" />
                                Generar Ruta Optimizada
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
                              <MapPin className="w-4 h-4 mr-2" />
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
      </main>
      </div>
    </>
  );
};

export default ReponedorMapPage;
