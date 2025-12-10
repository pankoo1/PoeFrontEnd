import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, AlertCircle, Trash2, MapPin, Target, RefreshCw, Grid3x3, CheckCircle2 } from 'lucide-react';
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
        } catch (err) {        let mensaje = 'Error al cargar los datos del mapa';
        
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

    // Agrupar puntos por producto (usando nombre como clave única)
    const productosAgrupados = new Map<string, {
      idProducto: string;
      nombreProducto: string;
      puntos: any[];
      cantidadTotal: number;
    }>();

    puntosConProducto.forEach(punto => {
      // El backend no envía ID del producto, usamos el nombre como clave única
      const nombreProducto = punto.producto.nombre;
      
      if (!productosAgrupados.has(nombreProducto)) {
        productosAgrupados.set(nombreProducto, {
          idProducto: nombreProducto, // Usamos el nombre como ID único
          nombreProducto,
          puntos: [],
          cantidadTotal: 0
        });
      }
      productosAgrupados.get(nombreProducto)!.puntos.push(punto);
    });
    
    const productosInit = Array.from(productosAgrupados.values());
    
    setProductosDelMueble(productosInit);
    setSelectedLocation(ubicacion);
    setDialogOpen(true);
  };

  const actualizarCantidadProducto = (idProducto: string, cantidadTotal: number) => {
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
      
      const dataToSend = {
        id_reponedor: reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar" 
          ? parseInt(reponedorSeleccionado) 
          : null,
        estado_id: reponedorSeleccionado && reponedorSeleccionado !== "sin_asignar" ? 1 : 5, // 1: pendiente, 5: sin asignar
        puntos: puntosSeleccionados.map(punto => ({
          id_punto: punto.punto!.id_punto,
          cantidad: punto.cantidad
        }))
      };
      
      console.log('Datos a enviar al backend:', dataToSend);
      console.log('Puntos seleccionados completos:', puntosSeleccionados);
      
      await ApiService.crearTarea(dataToSend);

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
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* HEADER MEJORADO */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <MapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Mapa de Supervisión</h1>
                <p className="text-sm text-slate-600 mt-1">Gestiona tareas seleccionando productos en el mapa interactivo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={recargarDatos}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                onClick={() => navigate('/supervisor-dashboard')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm"
              >
                Volver
              </Button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Mapa Activo</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {mapaData?.nombre || 'Sin mapa'}
                    </p>
                  </div>
                  <MapIcon className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Dimensiones</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {mapaData ? `${mapaData.alto}×${mapaData.ancho}` : '—'}
                    </p>
                  </div>
                  <Grid3x3 className="w-8 h-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Productos Seleccionados</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {puntosSeleccionados.length}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reponedores</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {reponedores.length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Editor Layout */}
          <div className="grid grid-cols-[1fr_350px] gap-6 min-h-[600px]">
            {/* Canvas del Mapa */}
            <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
              <CardHeader className="border-b border-slate-100 flex-shrink-0 bg-white">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-600" />
                  Mapa del Supermercado
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Haz clic en los muebles para gestionar productos</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-auto bg-white">
                <div className="w-full h-[700px] bg-slate-50 rounded-lg relative border border-slate-200 shadow-inner">
                {loadingMapa && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <span className="text-lg">Cargando mapa...</span>
                  </div>
                )}
                {errorMapa && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-lg">{errorMapa}</span>
                  </div>
                )}
                {!loadingMapa && !errorMapa && mapa && (
                  <div className="w-full h-full min-h-[350px]">
                    <MapViewer
                      mapa={mapa}
                      ubicaciones={ubicaciones}
                      puntosSeleccionados={puntosSeleccionados}
                      onObjectClick={handleObjectClick}
                      modoSupervisor={true}
                      className="w-full h-full min-h-[350px]"
                    />
                  </div>
                )}
                </div>
              </CardContent>
            </Card>

            {/* Panel Lateral - Productos Seleccionados */}
            <Card className="border-slate-200 shadow-sm bg-white flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Productos Seleccionados</CardTitle>
                    <p className="text-sm text-slate-600">Revisa y crea tareas</p>
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
                        // Agrupar puntos por producto usando el nombre como clave única
                        const productosAgrupados = new Map<string, {
                          idProducto: string;
                          nombreProducto: string;
                          puntos: typeof puntosSeleccionados;
                          cantidadTotal: number;
                        }>();

                        puntosSeleccionados.forEach(punto => {
                          if (punto.punto?.producto) {
                            // Usamos el nombre como ID único ya que el backend no envía id_producto
                            const nombreProducto = punto.punto.producto.nombre;
                            if (!productosAgrupados.has(nombreProducto)) {
                              productosAgrupados.set(nombreProducto, {
                                idProducto: nombreProducto,
                                nombreProducto,
                                puntos: [],
                                cantidadTotal: 0
                              });
                            }
                            const grupo = productosAgrupados.get(nombreProducto)!;
                            grupo.puntos.push(punto);
                            // Sumar solo la cantidad de este punto específico
                            grupo.cantidadTotal += (punto.cantidad || 0);
                          }
                        });

                        return Array.from(productosAgrupados.values()).map((producto) => (
                          <div 
                            key={producto.idProducto} 
                            className="p-4 bg-gradient-to-r from-card to-card/80 border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-base mb-1">
                                  {producto.nombreProducto}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {producto.puntos.length} ubicación{producto.puntos.length !== 1 ? 'es' : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">
                                    {producto.cantidadTotal}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    unidades totales
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => {
                                    // Eliminar todos los puntos de este producto
                                    producto.puntos.forEach(punto => {
                                      eliminarPunto(punto.punto!.id_punto);
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                Ingresa la cantidad a reponer para cada producto
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
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-semibold text-lg">
                            {producto.nombreProducto}
                          </div>
                        </div>

                        {/* Input de cantidad total */}
                        <div className="flex items-center gap-3">
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
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorMapPage;
