import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, MapPin, Play, Home, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Tarea } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from '@/components/Logo';
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

const getEstadoBadge = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return <Badge variant="outline" className="bg-warning/20 text-warning border-warning/40">Pendiente</Badge>;
    case 'en_progreso':
      return <Badge variant="outline" className="bg-info/20 text-info border-info/40">En Progreso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="bg-success/20 text-success border-success/40">Completada</Badge>;
    case 'cancelada':
      return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/40">Cancelada</Badge>;
    default:
      return <Badge variant="outline">{estado || 'Desconocido'}</Badge>;
  }
};

const ReponedorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [generandoRuta, setGenerandoRuta] = useState<number | null>(null);

  // Función para cargar tareas
  const cargarTareas = async () => {
    setLoading(true);
    setError(null);
    try {
      const tareasApi = await ApiService.getTareasReponedor();
      setTareas(tareasApi);
    } catch (err: any) {
      setError('No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // Función para comenzar una tarea
  const comenzarTarea = async (idTarea: number) => {
    try {
      setGenerandoRuta(idTarea);
      
      // Primero iniciar la tarea (cambiar estado a en_progreso)
      await ApiService.iniciarTarea(idTarea);
      
      // Luego generar la ruta optimizada
      const rutaOptimizada = await ApiService.obtenerRutaOptimizada(idTarea, 'vecino_mas_cercano');
      
      toast({
        title: "¡Tarea iniciada!",
        description: "Ruta optimizada generada. Te llevaremos al mapa interactivo.",
      });

      // Actualizar el estado local de la tarea
      setTareas((prevTareas) =>
        prevTareas.map((t) =>
          t.id_tarea === idTarea ? { ...t, estado: 'en_progreso' } : t
        )
      );

      // Navegar al mapa con la ruta optimizada
      navigate(`/reponedor-mapa?tarea=${idTarea}&mostrar_ruta=true`, {
        state: { rutaOptimizada }
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la ruta optimizada.",
        variant: "destructive",
      });
    } finally {
      setGenerandoRuta(null);
    }
  };

  // Función para reiniciar una tarea completada
  const reiniciarTarea = async (idTarea: number) => {
    try {
      // Confirmar acción con el usuario
      const confirmar = window.confirm(
        "¿Estás seguro de que deseas reiniciar esta tarea? Se cambiará el estado de vuelta a 'pendiente'."
      );
      
      if (!confirmar) return;

      await ApiService.reiniciarTarea(idTarea);
      
      // Actualizar la lista de tareas
      cargarTareas();

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

  // Polling para actualización automática
  useEffect(() => {
    let interval: NodeJS.Timeout;
    cargarTareas();
    interval = setInterval(cargarTareas, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  // Filtrado y ordenamiento
  const tareasFiltradas = tareas
    .filter(t => filtroEstado === 'todos' || (t.estado && t.estado.toLowerCase() === filtroEstado))
    .sort((a, b) => {
      if (orden === 'asc') {
        return (a.fecha_creacion || '').localeCompare(b.fecha_creacion || '');
      } else {
        return (b.fecha_creacion || '').localeCompare(a.fecha_creacion || '');
      }
    });

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
                  Mis Tareas
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Gestiona tus tareas de reposición diarias
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
              <div className="p-3 bg-success/40 rounded-xl">
                <Package className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Tareas</h2>
                <p className="text-muted-foreground">Administra tu trabajo diario y marca el progreso de tus tareas</p>
              </div>
            </div>
          </div>

          {/* Métricas de tareas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{tareas.length}</div>
                <div className="metric-label">Total Tareas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Asignadas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{tareas.filter(t => t.estado?.toLowerCase() === 'completada').length}</div>
                <div className="metric-label">Completadas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Finalizadas</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-info/15 to-info/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-info/30 rounded-full group-hover:bg-info/40 transition-all duration-300">
                    <Clock className="w-8 h-8 text-info" />
                  </div>
                </div>
                <div className="metric-value text-info">{tareas.filter(t => t.estado?.toLowerCase() === 'en_progreso').length}</div>
                <div className="metric-label">En Progreso</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-info/20 text-info border border-info/40 px-2 py-1 rounded-md text-xs font-medium">⏳ Activas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-warning/25 to-warning/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-warning/40 rounded-full group-hover:bg-warning/50 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <div className="metric-value text-warning">{tareas.filter(t => t.estado?.toLowerCase() === 'pendiente').length}</div>
                <div className="metric-label">Pendientes</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Por iniciar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de tareas */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-success/30 rounded-xl">
                    <Package className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Tareas Asignadas</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona tu trabajo diario</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={cargarTareas}
                  className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros y ordenamiento */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Filtrar por estado:</label>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Ordenar por fecha:</label>
                  <Select value={orden} onValueChange={(value: 'asc' | 'desc') => setOrden(value)}>
                    <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascendente</SelectItem>
                      <SelectItem value="desc">Descendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-muted-foreground">Cargando tareas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 p-6 bg-destructive/10 rounded-lg border border-destructive/30">
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive font-medium">{error}</p>
                </div>
              ) : (
                tareasFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No tienes tareas asignadas que coincidan con los filtros.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {tareasFiltradas.map((tarea) => (
                      <Card key={tarea.id_tarea} className="card-supermarket hover:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 text-primary border border-primary/20">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                                </CardTitle>
                                <CardDescription>
                                  {tarea.productos && tarea.productos.length > 0 ? `Ubicación: ${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}
                                  {tarea.productos && tarea.productos.length > 0 ? ` • Cantidad: ${tarea.productos[0].cantidad} unidades` : ''}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {getEstadoBadge(tarea.estado)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Reponedor</p>
                              <p className="font-medium">{tarea.reponedor || '-'}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Fecha Creación</p>
                              <p className="font-medium">{tarea.fecha_creacion ? tarea.fecha_creacion.split('T')[0] : '-'}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Estado</p>
                              <p className="font-medium">{tarea.estado}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tarea.estado && tarea.estado.toLowerCase() === 'completada' && (
                              <>
                                <Badge variant="outline" className="bg-success/20 text-success border-success/40">
                                  ✓ Completada
                                </Badge>
                                {/* Botón para reiniciar tarea completada */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reiniciarTarea(tarea.id_tarea)}
                                  className="border-2 border-warning/30 hover:bg-warning/10 hover:border-warning/50 transition-all duration-200 text-warning"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Reiniciar
                                </Button>
                              </>
                            )}
                            
                            {/* Botón para comenzar tarea (solo si está pendiente) */}
                            {tarea.estado && tarea.estado.toLowerCase() === 'pendiente' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => comenzarTarea(tarea.id_tarea)}
                                disabled={generandoRuta === tarea.id_tarea}
                                className="border-2 border-info/30 hover:bg-info/10 hover:border-info/50 transition-all duration-200 text-info"
                              >
                                {generandoRuta === tarea.id_tarea ? (
                                  <>
                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-info border-t-transparent"></div>
                                    Generando ruta...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Comenzar Tarea
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Botón para ver ruta (si está en progreso) */}
                            {tarea.estado && tarea.estado.toLowerCase() === 'en_progreso' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/reponedor-mapa?tarea=${tarea.id_tarea}&mostrar_ruta=true`)}
                                className="border-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 text-accent"
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Ver Ruta en Mapa
                              </Button>
                            )}
                            
                            {tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-success/30 hover:bg-success/10 hover:border-success/50 transition-all duration-200 text-success"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar como Completada
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
                                      className="bg-success hover:bg-success/90"
                                    >
                                      Sí, completar tarea
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ReponedorTareas;
