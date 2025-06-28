import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Clock, Filter, SortAsc, SortDesc, Target, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Tarea } from "@/services/api";
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
      return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm">Pendiente</Badge>;
    case 'en_progreso':
      return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">En Progreso</Badge>;
    case 'completada':
      return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">Completada</Badge>;
    case 'cancelada':
      return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">Cancelada</Badge>;
    default:
      return <Badge variant="outline" className="border-gray-300">{estado || 'Desconocido'}</Badge>;
  }
};

const ReponedorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');

  // Polling para actualización automática
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchTareas = async () => {
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
    fetchTareas();
    interval = setInterval(fetchTareas, 300000); // Actualiza cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Filtrado y ordenamiento
  const tareasFiltradas = tareas
    .filter(t => !filtroEstado || (t.estado && t.estado.toLowerCase() === filtroEstado))
    .sort((a, b) => {
      if (orden === 'asc') {
        return (a.fecha_creacion || '').localeCompare(b.fecha_creacion || '');
      } else {
        return (b.fecha_creacion || '').localeCompare(a.fecha_creacion || '');
      }
    });

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
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Mis Tareas
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Tareas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Administra tus tareas de reposición y marca su progreso en tiempo real
          </p>
        </div>

        {/* Filters and Stats */}
        <div className="mb-8">
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-900">
                <Filter className="w-5 h-5 mr-2 text-orange-500" />
                Filtros y Controles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-orange-500" />
                    Filtrar por estado
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    {orden === 'asc' ? <SortAsc className="w-4 h-4 mr-2 text-orange-500" /> : <SortDesc className="w-4 h-4 mr-2 text-orange-500" />}
                    Ordenar por fecha
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    value={orden}
                    onChange={e => setOrden(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">Más antiguas primero</option>
                    <option value="desc">Más recientes primero</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Resumen</label>
                  <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                    <p className="text-sm text-orange-700 font-medium">
                      Total: {tareasFiltradas.length} tareas
                    </p>
                    <p className="text-xs text-orange-600">
                      {tareasFiltradas.filter(t => t.estado?.toLowerCase() === 'completada').length} completadas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-gray-600 font-medium">Cargando tareas...</span>
            </div>
          </div>
        ) : error ? (
          <Card className="glass-card border border-red-200 bg-red-50/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar tareas</h3>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : tareasFiltradas.length === 0 ? (
          <Card className="glass-card border-0 bg-gradient-to-br from-white/90 to-white/70">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay tareas disponibles</h3>
              <p className="text-gray-600">
                {filtroEstado ? 'No hay tareas con el estado seleccionado.' : 'No tienes tareas asignadas en este momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tareasFiltradas.map((tarea) => (
              <Card key={tarea.id_tarea} className="glass-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden group">
                <CardHeader className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          {tarea.productos && tarea.productos.length > 0 && (
                            <>
                              <span className="inline-flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                Ubicación: {tarea.productos[0].ubicacion.estanteria || ''} Nivel: {tarea.productos[0].ubicacion.nivel || ''}
                              </span>
                              <span className="ml-4 inline-flex items-center">
                                <Package className="w-4 h-4 mr-1" />
                                Cantidad: {tarea.productos[0].cantidad} unidades
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getEstadoBadge(tarea.estado)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Reponedor
                      </p>
                      <p className="font-semibold text-gray-900">{tarea.reponedor || 'No asignado'}</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Fecha Creación
                      </p>
                      <p className="font-semibold text-gray-900">
                        {tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString('es-ES') : 'Sin fecha'}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Estado Actual
                      </p>
                      <p className="font-semibold text-gray-900 capitalize">{tarea.estado?.replace('_', ' ') || 'Indefinido'}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {tarea.estado && tarea.estado.toLowerCase() === 'completada' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tarea Completada
                      </Badge>
                    )}
                    {tarea.estado && ['pendiente', 'en_progreso'].includes(tarea.estado.toLowerCase()) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Completada
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
                                <p className="font-semibold text-orange-800">Detalles de la tarea:</p>
                                <p><span className="font-medium">Producto:</span> {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}</p>
                                <p><span className="font-medium">Ubicación:</span> {tarea.productos && tarea.productos.length > 0 ? `${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}</p>
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
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReponedorTareas;
