import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, AlertCircle, Trash2, MapPin, Target, RefreshCw } from 'lucide-react';
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
import SupervisorLayout from '@/components/layout/SupervisorLayout';

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
  const [productosDelMueble, setProductosDelMueble] = useState<Array<{
    puntos: any[];
    idProducto: number;
    nombreProducto: string;
    cantidadTotal: number;
  }>>([]);
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

    // Verificar si hay productos asignados al supervisor en este mueble
    const puntosConProducto = ubicacion.mueble.puntos_reposicion.filter(punto => punto.producto !== null);
    
    if (puntosConProducto.length === 0) {
      toast({
        title: "Sin productos asignados",
        description: "Este mueble no tiene productos asignados a tu supervisión",
        variant: "destructive",
      });
      return;
    }

    // Agrupar puntos por producto
    const productosAgrupados = new Map<number, {
      idProducto: number;
      nombreProducto: string;
      puntos: any[];
      cantidadTotal: number;
    }>();

    puntosConProducto.forEach(punto => {
      const idProducto = punto.producto.id_producto;
      if (!productosAgrupados.has(idProducto)) {
        productosAgrupados.set(idProducto, {
          idProducto,
          nombreProducto: punto.producto.nombre,
          puntos: [],
          cantidadTotal: 0
        });
      }
      productosAgrupados.get(idProducto)!.puntos.push(punto);
    });

    const productosInit = Array.from(productosAgrupados.values());
    setProductosDelMueble(productosInit);
    setSelectedLocation(ubicacion);
    setDialogOpen(true);
  };

  const actualizarCantidadProducto = (idProducto: number, cantidadTotal: number) => {
    setProductosDelMueble(prev => prev.map(item => 
      item.idProducto === idProducto ? { ...item, cantidadTotal: Math.max(0, cantidadTotal) } : item
    ));
  };

  const agregarProductosALaTarea = () => {
    // Filtrar solo los productos con cantidad > 0
    const productosConCantidad = productosDelMueble.filter(item => item.cantidadTotal > 0);

    if (productosConCantidad.length === 0) {
      toast({
        title: "Sin productos seleccionados",
        description: "Debes ingresar cantidad para al menos un producto",
        variant: "destructive",
      });
      return;
    }

    // Distribuir la cantidad total entre los puntos de cada producto
    const nuevosProductos: any[] = [];
    
    productosConCantidad.forEach(producto => {
      const cantidadPorPunto = Math.floor(producto.cantidadTotal / producto.puntos.length);
      const cantidadRestante = producto.cantidadTotal % producto.puntos.length;
      
      producto.puntos.forEach((punto, index) => {
        // Distribuir cantidad: reparte equitativamente y agrega 1 unidad extra a los primeros puntos si hay resto
        const cantidad = cantidadPorPunto + (index < cantidadRestante ? 1 : 0);
        
        nuevosProductos.push({
          punto: punto,
          cantidad: cantidad,
          x: selectedLocation?.x || 0,
          y: selectedLocation?.y || 0,
          mueble: selectedLocation?.mueble,
          objeto: selectedLocation?.objeto
        });
      });
    });

    setPuntosSeleccionados(prev => {
      // Evitar duplicados
      const puntosNuevos = nuevosProductos.filter(nuevo => 
        !prev.some(existente => existente.punto?.id_punto === nuevo.punto.id_punto)
      );
      return [...prev, ...puntosNuevos];
    });

    toast({
      title: "Productos agregados",
      description: `${productosConCantidad.length} producto(s) distribuido(s) entre los puntos de reposición`,
    });

    // Cerrar diálogo
    setDialogOpen(false);
    setProductosDelMueble([]);
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
    <SupervisorLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mapa de Supervisión</h1>
          <p className="text-sm text-slate-600">Visualiza y gestiona las ubicaciones del supermercado</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => recargarDatos()}
          disabled={loading}
          className="border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Mapa */}
          <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Mapa del Supermercado</CardTitle>
                    <p className="text-sm text-slate-600">Haz clic en las ubicaciones para gestionar productos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[700px] bg-slate-50 rounded-lg relative border border-slate-200">
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
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Productos Seleccionados</CardTitle>
                    <p className="text-sm text-slate-600">Revisa y crea tareas para reponedores</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {puntosSeleccionados.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Selecciona productos en el mapa para crear una tarea
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Agrupar puntos por producto
                        const productosAgrupados = new Map<number, {
                          idProducto: number;
                          nombreProducto: string;
                          puntos: typeof puntosSeleccionados;
                          cantidadTotal: number;
                        }>();

                        puntosSeleccionados.forEach(punto => {
                          if (punto.punto?.producto) {
                            const idProducto = punto.punto.producto.id_producto;
                            if (!productosAgrupados.has(idProducto)) {
                              productosAgrupados.set(idProducto, {
                                idProducto,
                                nombreProducto: punto.punto.producto.nombre,
                                puntos: [],
                                cantidadTotal: 0
                              });
                            }
                            const grupo = productosAgrupados.get(idProducto)!;
                            grupo.puntos.push(punto);
                            grupo.cantidadTotal += punto.cantidad;
                          }
                        });

                        return Array.from(productosAgrupados.values()).map((producto) => (
                          <div 
                            key={producto.idProducto} 
                            className="p-4 bg-gradient-to-r from-card to-card/80 border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-semibold text-base mb-1">
                                  {producto.nombreProducto}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {producto.puntos.length} ubicación{producto.puntos.length !== 1 ? 'es' : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">
                                  {producto.cantidadTotal}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  unidades
                                </p>
                              </div>
                            </div>
                            
                            {/* Detalles de cada punto */}
                            <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                              {producto.puntos.map((punto) => (
                                <div 
                                  key={punto.punto?.id_punto}
                                  className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded"
                                >
                                  <span className="text-xs text-muted-foreground">
                                    Nivel {punto.punto?.nivel}, Est. {punto.punto?.estanteria}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs">
                                      {punto.cantidad} uds
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => eliminarPunto(punto.punto!.id_punto)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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

          {/* Dialog para mostrar productos del mueble */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Productos en {selectedLocation?.objeto?.nombre || 'Mueble de Reposición'}
              </DialogTitle>
              <DialogDescription>
                Ingresa la cantidad total a reponer. Se distribuirá automáticamente entre todos los puntos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {productosDelMueble.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay productos asignados en este mueble
                </div>
              ) : (
                <div className="space-y-4">
                  {productosDelMueble.map((producto) => (
                    <div 
                      key={producto.idProducto}
                      className="p-5 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-all bg-gradient-to-r from-slate-50 to-white"
                    >
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-lg">
                            {producto.nombreProducto}
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {producto.puntos.length} punto{producto.puntos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Mostrar ubicaciones de los puntos */}
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          {producto.puntos.map((punto, idx) => (
                            <div key={punto.id_punto} className="ml-2">
                              • Ubicación {idx + 1}: Nivel {punto.nivel}, Estantería {punto.estanteria}
                            </div>
                          ))}
                        </div>

                        {/* Input de cantidad total */}
                        <div className="flex items-center gap-3 pt-3 border-t">
                          <Label className="text-sm font-semibold min-w-fit">Cantidad Total:</Label>
                          <Input
                            type="number"
                            value={producto.cantidadTotal}
                            onChange={(e) => actualizarCantidadProducto(producto.idProducto, parseInt(e.target.value) || 0)}
                            className="flex-1 border-2 border-primary/20 focus:border-primary/50"
                            min="0"
                            placeholder="0"
                          />
                          {producto.cantidadTotal > 0 && (
                            <span className="text-xs text-muted-foreground bg-amber-50 px-2 py-1 rounded whitespace-nowrap">
                              ÷ {producto.puntos.length} = ~{Math.floor(producto.cantidadTotal / producto.puntos.length)} c/u
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setProductosDelMueble([]);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={agregarProductosALaTarea}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={productosDelMueble.every(item => item.cantidadTotal === 0)}
                >
                  Agregar a Tarea ({productosDelMueble.filter(item => item.cantidadTotal > 0).length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorMapPage;
