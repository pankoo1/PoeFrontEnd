import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, AlertCircle, Trash2, Home, MapPin, Target, RefreshCw } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { MapaService } from '@/services/map.service';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Reponedor } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShelfGrid } from '@/components/ui/shelf-grid';
import Logo from '@/components/shared/Logo';

interface PuntoSeleccionado extends UbicacionFisica {
  cantidad: number;
}

const SupervisorMapPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noPointsAssigned, setNoPointsAssigned] = useState(false);
  const [mapaData, setMapaData] = useState<Mapa | null>(null);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [puntosSeleccionados, setPuntosSeleccionados] = useState<PuntoSeleccionado[]>([]);
  const [reponedores, setReponedores] = useState<Reponedor[]>([]);
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState<string>('sin_asignar');
  const [creandoTarea, setCreandoTarea] = useState(false);
  const [mostrarBotonTareas, setMostrarBotonTareas] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UbicacionFisica | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Función para recargar datos
  const recargarDatos = async () => {
    const token = ApiService.getToken();
    if (!token) {
      toast({
        variant: "destructive",
        title: "Sin autenticación",
        description: "No se encontró token de autenticación. Redirigiendo al login...",
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Reset states
    setError(null);
    setNoPointsAssigned(false);
    
    // Llamar la función de carga
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [mapaResponse, reponedoresResponse] = await Promise.all([
          MapaService.getMapaSupervisor(), // Cambiado para usar el endpoint específico de supervisores
          ApiService.getReponedoresAsignados()
        ]);
        
        if (mapaResponse.mensaje && !mapaResponse.mapa) {
          setNoPointsAssigned(true);
          return;
        }

        // Verificar si el supervisor tiene puntos asignados en este mapa
        const tieneProductosAsignados = mapaResponse.ubicaciones.some(ubicacion => 
          ubicacion.mueble?.puntos_reposicion?.some(punto => punto.producto !== null)
        );

        if (!tieneProductosAsignados) {
          // Aún mostrar el mapa, pero indicar que no hay puntos asignados
          setNoPointsAssigned(true);
        }

        setMapaData(mapaResponse.mapa);
        setUbicaciones(mapaResponse.ubicaciones);
        setReponedores(reponedoresResponse);
        
        toast({
          title: "Datos recargados",
          description: "El mapa se ha actualizado correctamente",
        });
      } catch (err) {
        console.error('Error al cargar datos del mapa:', err);
        
        let mensaje = 'Error al cargar los datos del mapa';
        
        if (err instanceof Error) {
          if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            mensaje = 'No tienes permisos para acceder al mapa de supervisión. Verifica tu sesión.';
            toast({
              variant: "destructive",
              title: "Error de autenticación",
              description: "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.",
            });
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
            mensaje = 'No tienes permisos suficientes para acceder a esta función.';
          } else if (err.message.includes('500')) {
            mensaje = 'Error interno del servidor. Intenta de nuevo más tarde.';
          } else {
            mensaje = err.message;
          }
        }
        
        handleMapError(mensaje);
      } finally {
        setLoading(false);
      }
    };

    await cargarDatos();
  };

  useEffect(() => {
    recargarDatos();
  }, []);

  const handleObjectClick = (ubicacion: UbicacionFisica) => {
    // Si el objeto no es un mueble o no tiene puntos de reposición, ignorar
    if (!ubicacion.mueble || !ubicacion.mueble.puntos_reposicion) return;

    // DEBUG: Log para analizar la estructura de puntos
    console.log('SupervisorMapPage - Mueble seleccionado:', {
      dimensiones: `${ubicacion.mueble.filas}x${ubicacion.mueble.columnas}`,
      totalPuntos: ubicacion.mueble.puntos_reposicion.length,
      puntosConProductos: ubicacion.mueble.puntos_reposicion.filter(p => p.producto).length,
      coordenadasPuntos: ubicacion.mueble.puntos_reposicion.map(p => ({
        id: p.id_punto,
        nivel: p.nivel,
        estanteria: p.estanteria,
        tieneProducto: !!p.producto,
        nombreProducto: p.producto?.nombre || 'Sin producto'
      }))
    });

    // Verificar si hay productos asignados al supervisor en este mueble
    const tienePuntosAsignados = ubicacion.mueble.puntos_reposicion.some(punto => punto.producto !== null);
    if (!tienePuntosAsignados) {
      toast({
        title: "Sin productos asignados",
        description: "Este mueble no tiene productos asignados a tu supervisión",
        variant: "destructive",
      });
      return;
    }

    setSelectedLocation(ubicacion);
    setDialogOpen(true);
  };

  const handlePuntoClick = (punto: any) => {
    if (!punto.producto) return;

    // Verificar si el punto ya está seleccionado
    const puntoExistente = puntosSeleccionados.find(p => p.punto?.id_punto === punto.id_punto);
    
    if (puntoExistente) {
      // Si ya está seleccionado, lo removemos
      setPuntosSeleccionados(prev => prev.filter(p => p.punto?.id_punto !== punto.id_punto));
    } else {
      // Si no está seleccionado, lo agregamos con cantidad inicial 1
      setPuntosSeleccionados(prev => [...prev, { 
        punto: punto,
        cantidad: 1,
        x: selectedLocation?.x || 0,
        y: selectedLocation?.y || 0,
        mueble: selectedLocation?.mueble,
        objeto: selectedLocation?.objeto
      }]);
    }
  };

  const actualizarCantidad = (idPunto: number, cantidad: number) => {
    setPuntosSeleccionados(prev => prev.map(punto => 
      punto.punto?.id_punto === idPunto ? { ...punto, cantidad } : punto
    ));
  };

  const eliminarPunto = (idPunto: number) => {
    setPuntosSeleccionados(prev => prev.filter(punto => punto.punto?.id_punto !== idPunto));
  };

  const crearTarea = async () => {
    if (puntosSeleccionados.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un punto de reposición",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreandoTarea(true);
      await ApiService.crearTarea({
        id_reponedor: reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar" 
          ? parseInt(reponedorSeleccionado) 
          : null,
        estado_id: reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar" ? 1 : 5, // 1: pendiente, 5: sin asignar
        puntos: puntosSeleccionados.map(punto => ({
          id_punto: punto.punto!.id_punto,
          cantidad: punto.cantidad
        }))
      });

      toast({
        title: "Éxito",
        description: reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar"
          ? "Tarea creada y asignada correctamente"
          : "Tarea creada sin asignar",
      });

      // Limpiar selección
      setPuntosSeleccionados([]);
      setReponedorSeleccionado('sin_asignar');

      // Mostrar botón para ver tareas
      setMostrarBotonTareas(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive",
      });
    } finally {
      setCreandoTarea(false);
    }
  };

  const renderNoPointsMessage = () => (
    <div className="text-center p-8">
      <div className="flex justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No hay puntos de reposición asignados</h3>
      <p className="text-gray-600 mb-4">
        Actualmente no tienes puntos de reposición asignados para supervisar.
      </p>
      <div className="space-y-2">
        <Button 
          variant="outline"
          onClick={() => navigate('/supervisor-dashboard')}
          className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
        >
          Volver al Dashboard
        </Button>
        <br />
        <Button 
          variant="outline"
          onClick={() => recargarDatos()}
          className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recargar Página
        </Button>
      </div>
    </div>
  );

  const handleMapError = (mensaje: string) => {
    setError(mensaje);
    toast({
      variant: "destructive",
      title: "Error",
      description: mensaje,
    });
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
                  Mapa de Supervisión
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Visualiza y gestiona las ubicaciones del supermercado
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => recargarDatos()}
                className="border-2 border-success/30 hover:bg-success/10 hover:border-success/50 transition-all duration-200"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Recargar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 flex-1 flex flex-col">
          {/* Banner informativo */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-warning/40 rounded-xl">
                  <MapPin className="w-8 h-8 text-warning" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Vista de Supervisión</h2>
                  <p className="text-muted-foreground">Supervisa ubicaciones y crea tareas para tu equipo de reponedores</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>Estado:</span>
                  {ApiService.getToken() ? (
                    <span className="text-success">✓ Autenticado</span>
                  ) : (
                    <span className="text-destructive">✗ Sin autenticación</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 h-full">
            {/* Mapa */}
            <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md flex-1 flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-warning/30 rounded-xl">
                    <Map className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Visualización de Rutas y Ubicaciones</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Haz clic en las ubicaciones para gestionar productos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <div className="w-full h-[700px] bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl relative border-2 border-primary/20">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <span className="text-lg text-muted-foreground">Cargando mapa...</span>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6 max-w-md">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-destructive">Error al cargar el mapa</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline"
                            onClick={() => recargarDatos()}
                            className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                          </Button>
                          <br />
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/supervisor-dashboard')}
                            className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
                          >
                            Volver al Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {noPointsAssigned && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
                      <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
                        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Sin puntos asignados</h3>
                        <p className="text-yellow-700 mb-4">
                          No tienes productos asignados en este mapa. Los muebles se muestran atenuados.
                        </p>
                        <p className="text-sm text-yellow-600">
                          Los muebles resaltados pertenecen a otros supervisores.
                        </p>
                      </div>
                    </div>
                  )}
                  {!loading && !error && mapaData && (
                    <div className="w-full h-[700px]">
                      <MapViewer
                        mapa={mapaData}
                        ubicaciones={ubicaciones}
                        onObjectClick={handleObjectClick}
                        className="w-full h-full rounded-2xl"
                        modoSupervisor={true}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Panel lateral */}
            <Card className="card-logistics hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/30 rounded-xl">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Puntos Seleccionados</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Crea tareas para reponedores</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {puntosSeleccionados.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Selecciona puntos en el mapa para crear una tarea
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {puntosSeleccionados.map((punto) => (
                        <div 
                          key={punto.punto?.id_punto} 
                          className="p-4 bg-gradient-to-r from-card to-card/80 border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              Estantería {punto.punto?.estanteria}, Nivel {punto.punto?.nivel}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarPunto(punto.punto!.id_punto)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {punto.punto?.producto && (
                            <p className="text-sm text-muted-foreground mb-3">
                              Producto: {punto.punto.producto.nombre}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs">Cantidad:</Label>
                            <Input
                              type="number"
                              value={punto.cantidad}
                              onChange={(e) => actualizarCantidad(punto.punto!.id_punto, parseInt(e.target.value))}
                              className="w-20 border-2 border-primary/20 focus:border-primary/50"
                              min="1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {puntosSeleccionados.length > 0 && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Asignar a Reponedor</Label>
                      <Select value={reponedorSeleccionado} onValueChange={setReponedorSeleccionado}>
                        <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                          <SelectValue placeholder="Seleccionar reponedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                          {reponedores.map(reponedor => (
                            <SelectItem key={reponedor.id_usuario} value={reponedor.id_usuario.toString()}>
                              {reponedor.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={crearTarea} 
                      disabled={creandoTarea}
                      className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 transition-all duration-200"
                    >
                      {creandoTarea ? 'Creando...' : 'Crear Tarea'}
                    </Button>

                    {mostrarBotonTareas && (
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/supervisor/tareas')}
                        className="w-full border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                      >
                        Ver Tareas Creadas
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialog para mostrar estantería */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Estantería - {selectedLocation?.objeto?.tipo || 'Sin nombre'}
              </DialogTitle>
              <DialogDescription>
                Selecciona los puntos de reposición para crear una tarea
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
              <div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">Vista de la estantería</h3>
                    <p className="text-sm text-gray-600">
                      Los productos con fondo verde están asignados a tu supervisión. 
                      Haz clic en ellos para agregarlos a la tarea.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {Array.from({length: selectedLocation?.mueble?.filas || 3}, (_, fila) => (
                      <div key={fila} className="flex space-x-2">
                        {Array.from({length: selectedLocation?.mueble?.columnas || 4}, (_, columna) => {
                          // CORREGIDO: Buscar punto por coordenadas reales (nivel y estanteria)
                          // Convertir coordenadas del grid (base 0) a coordenadas del backend (base 1)
                          const nivel = fila + 1;
                          const estanteria = columna + 1;
                          const punto = selectedLocation?.mueble?.puntos_reposicion?.find(
                            (p: any) => p.nivel === nivel && p.estanteria === estanteria
                          );
                          
                          // DEBUG: Log para verificar el mapeo correcto (solo para primera fila)
                          if (fila === 0) {
                            console.log(`SupervisorMapPage - Grid(${fila},${columna}) -> Backend(${nivel},${estanteria}) -> Punto:`, {
                              encontrado: !!punto,
                              id_punto: punto?.id_punto,
                              tieneProducto: !!punto?.producto,
                              nombreProducto: punto?.producto?.nombre || 'Sin producto'
                            });
                          }
                          
                          const isSelected = puntosSeleccionados.some(p => p.punto?.id_punto === punto?.id_punto);
                          
                          return (
                            <div
                              key={`${fila}-${columna}`}
                              className={`
                                w-32 h-24 border-2 rounded-lg cursor-pointer transition-all text-xs relative
                                ${punto?.producto 
                                  ? isSelected 
                                    ? 'bg-blue-200 border-blue-500 shadow-lg' 
                                    : 'bg-green-100 border-green-300 hover:bg-green-200' 
                                  : 'bg-gray-100 border-gray-300'
                                }
                              `}
                              onClick={() => punto?.producto && handlePuntoClick(punto)}
                            >
                              {punto?.producto && (
                                <div className="p-1 text-center w-full">
                                  <div className="font-medium text-sm truncate px-1">
                                    {punto.producto.nombre}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {punto.producto.unidad_cantidad} {punto.producto.unidad_tipo}
                                  </div>
                                </div>
                              )}
                              {!punto?.producto && (
                                <div className="text-xs text-gray-400 text-center pt-2">
                                  {nivel},{estanteria}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Dimensiones: {selectedLocation?.mueble?.filas || 3} filas × {selectedLocation?.mueble?.columnas || 4} columnas
                    <br />
                    <span className="text-xs">Los números en las celdas vacías indican: Fila,Columna</span>
                    <br />
                    <span className="text-xs text-blue-600">
                      Total de puntos: {selectedLocation?.mueble?.puntos_reposicion?.length || 0} | 
                      Productos asignados: {selectedLocation?.mueble?.puntos_reposicion?.filter(p => p.producto).length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-l pl-6">
                <h3 className="font-semibold text-2xl mb-4">Puntos Seleccionados</h3>
                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-2">
                  {puntosSeleccionados.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Selecciona puntos de la estantería para asignar a la tarea
                    </p>
                  ) : (
                    puntosSeleccionados.map((punto) => (
                      <div 
                        key={punto.punto?.id_punto}
                        className="p-3 bg-card border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-base truncate mr-2">
                            {punto.punto?.producto?.nombre}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {punto.cantidad} {punto.punto?.producto?.unidad_tipo}
                          </div>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="inline-block bg-secondary text-secondary-foreground rounded px-2 py-1">
                            {punto.punto?.producto?.categoria}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <Input
                            type="number"
                            value={punto.cantidad}
                            onChange={(e) => actualizarCantidad(punto.punto!.id_punto, parseInt(e.target.value))}
                            className="w-20"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarPunto(punto.punto!.id_punto)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default SupervisorMapPage;
