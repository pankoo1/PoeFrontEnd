import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, AlertCircle, Trash2 } from 'lucide-react';
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
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState<string>('');
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
    if (!reponedorSeleccionado || puntosSeleccionados.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar un reponedor y al menos un punto de reposición",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreandoTarea(true);
      await ApiService.crearTarea({
        id_reponedor: parseInt(reponedorSeleccionado),
        estado_id: 1, // Estado inicial: pendiente
        puntos: puntosSeleccionados.map(punto => ({
          id_punto: punto.punto!.id_punto,
          cantidad: punto.cantidad
        }))
      });

      toast({
        title: "Éxito",
        description: "Tarea creada correctamente",
      });

      // Limpiar selección
      setPuntosSeleccionados([]);
      setReponedorSeleccionado('');

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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mapa de Supervisión</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 h-full">
          {/* Mapa */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Map className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Visualización de Rutas y Ubicaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-6">
              <div className="w-full h-full bg-muted rounded-lg relative">
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
                  <div className="w-full h-full">
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

          {/* Panel lateral */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Puntos Seleccionados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 mb-4">
                {puntosSeleccionados.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Selecciona puntos en el mapa para crear una tarea
                  </p>
                ) : (
                  <div className="space-y-4">
                    {puntosSeleccionados.map((punto) => (
                      <div 
                        key={punto.punto?.id_punto} 
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            Estantería {punto.punto?.estanteria}, Nivel {punto.punto?.nivel}
                          </p>
                          {punto.punto?.producto && (
                            <p className="text-sm text-muted-foreground">
                              Producto: {punto.punto.producto.nombre}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
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
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="reponedor">Asignar a Reponedor</Label>
                  <Select
                    value={reponedorSeleccionado}
                    onValueChange={setReponedorSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar reponedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {reponedores.map((reponedor) => (
                        <SelectItem key={reponedor.id_usuario} value={reponedor.id_usuario.toString()}>
                          {reponedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button 
                    className="w-full" 
                    disabled={puntosSeleccionados.length === 0 || !reponedorSeleccionado || creandoTarea}
                    onClick={crearTarea}
                  >
                    {creandoTarea ? 'Creando tarea...' : 'Crear Tarea'}
                  </Button>

                  {mostrarBotonTareas && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/tareas')}
                    >
                      Ver Tareas Asignadas
                    </Button>
                  )}
                </div>
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
                      {selectedLocation?.mueble?.puntos_reposicion?.map((punto) => (
                        <div
                          key={punto.id_punto}
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
                            ${punto.producto ? 'bg-green-50 hover:bg-green-100 cursor-pointer' : 'bg-gray-50'}
                            ${puntosSeleccionados.some(p => p.punto?.id_punto === punto.id_punto) ? 'ring-2 ring-primary' : ''}
                          `}
                          onClick={() => punto.producto && handlePuntoClick(punto)}
                        >
                          {punto.producto && (
                            <div className="p-1 text-center w-full">
                              <div className="font-medium text-sm truncate px-1">
                                {punto.producto.nombre}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {punto.producto.unidad_cantidad} {punto.producto.unidad_tipo}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Dimensiones: {selectedLocation?.mueble?.filas || 3} filas × {selectedLocation?.mueble?.columnas || 4} columnas
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
