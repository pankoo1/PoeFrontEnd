import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, AlertCircle, Trash2, Home, MapPin, Target } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { MapaService } from '@/services/mapaService';
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
import Logo from '@/components/Logo';

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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [mapaResponse, reponedoresResponse] = await Promise.all([
          MapaService.getMapaSupervisorVista(),
          ApiService.getReponedoresAsignados()
        ]);
        
        if (mapaResponse.mensaje && !mapaResponse.mapa) {
          setNoPointsAssigned(true);
          return;
        }

        setMapaData(mapaResponse.mapa);
        setUbicaciones(mapaResponse.ubicaciones);
        setReponedores(reponedoresResponse);
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al cargar los datos';
        handleMapError(mensaje);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleObjectClick = (ubicacion: UbicacionFisica) => {
    // Si el objeto no es un mueble o no tiene puntos de reposición, ignorar
    if (!ubicacion.mueble || !ubicacion.mueble.puntos_reposicion) return;

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
      <Button 
        variant="outline"
        onClick={() => navigate('/supervisor-dashboard')}
      >
        Volver al Dashboard
      </Button>
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
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/40 rounded-xl">
                <MapPin className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Vista de Supervisión</h2>
                <p className="text-muted-foreground">Supervisa ubicaciones y crea tareas para tu equipo de reponedores</p>
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
                      <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <span className="text-destructive text-lg">{error}</span>
                      </div>
                    </div>
                  )}
                  {noPointsAssigned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {renderNoPointsMessage()}
                    </div>
                  )}
                  {!loading && !error && !noPointsAssigned && mapaData && (
                    <div className="w-full h-[700px]">
                      <MapViewer
                        mapa={mapaData}
                        ubicaciones={ubicaciones}
                        onObjectClick={handleObjectClick}
                        className="w-full h-full rounded-2xl"
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
                            onClick={() => eliminarPunto(punto.punto!.id_punto)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="reponedor">Asignar a Reponedor (Opcional)</Label>
                  <Select
                    value={reponedorSeleccionado}
                    onValueChange={setReponedorSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar reponedor (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                      {reponedores && reponedores.map((reponedor) => (
                        <SelectItem 
                          key={reponedor.id_usuario} 
                          value={reponedor.id_usuario.toString()}
                        >
                          {reponedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!reponedorSeleccionado || reponedorSeleccionado === "sin_asignar") && puntosSeleccionados.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>La tarea se creará sin reponedor asignado</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={crearTarea} 
                  disabled={puntosSeleccionados.length === 0 || creandoTarea}
                  className="w-full"
                >
                  {creandoTarea ? (
                    "Creando tarea..."
                  ) : (
                    reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar" 
                      ? "Crear y Asignar Tarea" 
                      : "Crear Tarea Sin Asignar"
                  )}
                </Button>

                {mostrarBotonTareas && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/tareas')}
                  >
                    Ver Tareas Creadas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Diálogo de selección de puntos */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-7xl min-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl mb-6">
              {selectedLocation?.mueble ? 
                `Estantería ${selectedLocation.mueble.estanteria}` : 
                'Detalles de la Ubicación'
              }
            </DialogTitle>
            <div className="grid grid-cols-[2fr,1fr] gap-8 h-full">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Información del Mueble</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estantería:</span>
                      <span className="ml-2 font-medium">{selectedLocation?.mueble?.estanteria}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nivel:</span>
                      <span className="ml-2 font-medium">{selectedLocation?.mueble?.nivel}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensiones:</span>
                    <span className="ml-2 font-medium">
                      {selectedLocation?.mueble?.filas || 3} filas × {selectedLocation?.mueble?.columnas || 4} columnas
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span className="ml-2 font-medium">({selectedLocation?.x}, {selectedLocation?.y})</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Vista de la Estantería</h3>
                  <div className="border rounded-lg p-4">
                    <div 
                      className="grid gap-2 bg-white"
                      style={{
                        gridTemplateColumns: `repeat(${selectedLocation?.mueble?.columnas || 4}, minmax(80px, 1fr))`,
                        gridTemplateRows: `repeat(${selectedLocation?.mueble?.filas || 3}, minmax(80px, 1fr))`
                      }}
                    >
                      {/* Crear una matriz de celdas basada en filas y columnas */}
                      {Array.from({ length: (selectedLocation?.mueble?.filas || 3) * (selectedLocation?.mueble?.columnas || 4) }, (_, index) => {
                        const fila = Math.floor(index / (selectedLocation?.mueble?.columnas || 4)) + 1; // base 1
                        const columna = (index % (selectedLocation?.mueble?.columnas || 4)) + 1; // base 1
                        
                        // Buscar el punto que corresponde a esta posición específica
                        const punto = selectedLocation?.mueble?.puntos_reposicion?.find(
                          p => p.nivel === fila && p.estanteria === columna
                        );
                        
                        return (
                          <div
                            key={`${fila}-${columna}`}
                            className={`
                              relative
                              w-full
                              h-full
                              min-h-[50px]
                              rounded
                              transition-all
                              duration-200
                              border
                              border-gray-300
                              flex
                              items-center
                              justify-center
                              text-xs
                              font-medium
                              ${punto?.producto ? 'bg-green-50 hover:bg-green-100 cursor-pointer' : 'bg-gray-50'}
                              ${punto && puntosSeleccionados.some(p => p.punto?.id_punto === punto.id_punto) ? 'ring-2 ring-primary' : ''}
                            `}
                            onClick={() => punto?.producto && handlePuntoClick(punto)}
                            title={`Posición: Fila ${fila}, Columna ${columna}${punto?.producto ? ` - ${punto.producto.nombre}` : ' - Vacío'}`}
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
                              <div className="text-xs text-gray-400">
                                {fila},{columna}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorMapPage;
