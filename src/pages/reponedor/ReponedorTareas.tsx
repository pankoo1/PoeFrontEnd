import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, MapPin, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Tarea } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReponedorLayout from '@/components/layout/ReponedorLayout';
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

  const userName = localStorage.getItem('userName') || 'Reponedor';

  return (
    <ReponedorLayout>
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">
          Mis Tareas
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={cargarTareas}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-500">Reponedor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">

          {/* Card principal de tareas */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800">Tareas Asignadas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros y ordenamiento */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-slate-700">Filtrar por estado:</label>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="border-slate-200">
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
                  <label className="block text-sm font-medium mb-2 text-slate-700">Ordenar por fecha:</label>
                  <Select value={orden} onValueChange={(value: 'asc' | 'desc') => setOrden(value)}>
                    <SelectTrigger className="border-slate-200">
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
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reiniciar
                                </Button>
                              </>
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
      </div>
    </ReponedorLayout>
  );
};

export default ReponedorTareas;
