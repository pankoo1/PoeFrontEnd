import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ReponedorLayout from '@/components/layout/ReponedorLayout';
import { ApiService, ResumenSemanalData, SemanaDisponible } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ReponedorSemanal = () => {
  const userName = localStorage.getItem('userName') || 'Reponedor';
  const { toast } = useToast();

  // Estados
  const [resumenSemanal, setResumenSemanal] = useState<ResumenSemanalData | null>(null);
  const [semanasDisponibles, setSemanasDisponibles] = useState<SemanaDisponible[]>([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarResumenSemanaActual();
    cargarSemanasDisponibles();
  }, []);

  const cargarResumenSemanaActual = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.obtenerResumenSemanal();
      setResumenSemanal(response.data);
      setSemanaSeleccionada(response.data.periodo.fecha_inicio);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el resumen semanal');
      toast({
        title: "Error",
        description: "No se pudo cargar el resumen semanal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cargarSemanasDisponibles = async () => {
    try {
      const response = await ApiService.obtenerSemanasDisponibles(12);
      setSemanasDisponibles(response.data.semanas);
    } catch (err: any) {
    }
  };

  const cambiarSemana = async (fechaInicio: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.obtenerResumenSemanal(fechaInicio);
      setResumenSemanal(response.data);
      setSemanaSeleccionada(fechaInicio);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar la semana seleccionada",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navegarSemana = (direccion: 'anterior' | 'siguiente') => {
    if (!semanaSeleccionada || semanasDisponibles.length === 0) return;

    const indiceActual = semanasDisponibles.findIndex(s => s.fecha_inicio === semanaSeleccionada);
    if (indiceActual === -1) return;

    const nuevoIndice = direccion === 'anterior' ? indiceActual + 1 : indiceActual - 1;
    
    if (nuevoIndice >= 0 && nuevoIndice < semanasDisponibles.length) {
      cambiarSemana(semanasDisponibles[nuevoIndice].fecha_inicio);
    }
  };

  const getEstadoColor = (estadoId: number) => {
    switch (estadoId) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      case 4: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estadoId: number) => {
    switch (estadoId) {
      case 1: return 'Pendiente';
      case 2: return 'En Progreso';
      case 3: return 'Completada';
      case 4: return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const getEstadoIcono = (estadoId: number) => {
    switch (estadoId) {
      case 1: return <Clock className="w-4 h-4" />;
      case 2: return <TrendingUp className="w-4 h-4" />;
      case 3: return <CheckCircle2 className="w-4 h-4" />;
      case 4: return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  if (isLoading && !resumenSemanal) {
    return (
      <ReponedorLayout>
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
          <h2 className="text-2xl font-bold text-slate-800">Vista Semanal</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-500">Reponedor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Cargando resumen semanal...</p>
          </div>
        </div>
      </ReponedorLayout>
    );
  }

  if (error || !resumenSemanal) {
    return (
      <ReponedorLayout>
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
          <h2 className="text-2xl font-bold text-slate-800">Vista Semanal</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-500">Reponedor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 rounded-full bg-red-100">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Error al Cargar Datos</h3>
                  <p className="text-slate-600 max-w-md mb-4">{error || 'Ocurrió un error inesperado'}</p>
                  <Button onClick={cargarResumenSemanaActual}>Reintentar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ReponedorLayout>
    );
  }

  return (
    <ReponedorLayout>
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">Vista Semanal</h2>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500">Reponedor</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {/* Banner informativo con estadísticas */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/40 rounded-xl">
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{resumenSemanal.periodo.semana}</h2>
                <p className="text-muted-foreground">Análisis de tu semana laboral</p>
              </div>
            </div>
            
            {/* Navegación de semanas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarSemana('anterior')}
                disabled={isLoading || !semanasDisponibles.length}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarSemana('siguiente')}
                disabled={isLoading || !semanasDisponibles.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-slate-600 font-medium">Total Tareas</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{resumenSemanal.estadisticas.total_tareas}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600 font-medium">Productos</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{resumenSemanal.estadisticas.total_productos}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-slate-600 font-medium">Completadas</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {resumenSemanal.estadisticas.tareas_por_estado.completada || 0}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-slate-600 font-medium">Días Activos</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{resumenSemanal.estadisticas.dias_con_tareas}</p>
            </div>
          </div>
        </div>

        {/* Calendario Semanal */}
        <div className="space-y-3">
          {diasOrdenados.map((dia) => {
            const diaData = resumenSemanal.calendario[dia as keyof typeof resumenSemanal.calendario];
            const tieneTareas = diaData.total_tareas > 0;

            return (
              <Card key={dia} className={`border-slate-200 ${tieneTareas ? 'bg-white' : 'bg-slate-50/50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tieneTareas ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{diaData.dia_nombre}</CardTitle>
                        <p className="text-sm text-slate-500">
                          {new Date(diaData.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {diaData.total_tareas} {diaData.total_tareas === 1 ? 'tarea' : 'tareas'}
                    </Badge>
                  </div>
                </CardHeader>

                {tieneTareas && (
                  <CardContent className="space-y-3">
                    {diaData.tareas.map((tarea, index) => (
                      <div 
                        key={tarea.id_tarea}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getEstadoColor(tarea.estado_id)} flex items-center gap-1`}>
                              {getEstadoIcono(tarea.estado_id)}
                              {getEstadoTexto(tarea.estado_id)}
                            </Badge>
                            <span className="text-xs text-slate-500">Tarea #{tarea.id_tarea}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">
                              {tarea.total_productos} productos
                            </p>
                            {tarea.fecha_hora_completada && (
                              <p className="text-xs text-slate-500">
                                Completada: {new Date(tarea.fecha_hora_completada).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Lista de productos agrupados */}
                        <div className="space-y-2">
                          {(() => {
                            // Agrupar productos por nombre y sumar cantidades
                            const productosAgrupados = tarea.productos.reduce((acc, producto) => {
                              const key = producto.nombre;
                              if (!acc[key]) {
                                acc[key] = {
                                  nombre: producto.nombre,
                                  categoria: producto.categoria,
                                  cantidad_total: 0
                                };
                              }
                              acc[key].cantidad_total += producto.cantidad;
                              return acc;
                            }, {} as Record<string, { nombre: string; categoria: string; cantidad_total: number }>);

                            return Object.values(productosAgrupados).map((producto) => (
                              <div 
                                key={producto.nombre}
                                className="flex items-center justify-between p-2 rounded bg-white border border-slate-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-slate-400" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-700">{producto.nombre}</p>
                                    <p className="text-xs text-slate-500">{producto.categoria}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {producto.cantidad_total} unidades
                                </Badge>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}

                {!tieneTareas && (
                  <CardContent className="py-8">
                    <p className="text-center text-sm text-slate-400">Sin tareas asignadas</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Resumen de estados */}
        {resumenSemanal.estadisticas.total_tareas > 0 && (
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Resumen de Estados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(resumenSemanal.estadisticas.tareas_por_estado).map(([estado, cantidad]) => (
                  <div key={estado} className="text-center p-4 rounded-lg bg-white border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1 capitalize">{estado.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold text-slate-800">{cantidad}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ReponedorLayout>
  );
};

export default ReponedorSemanal;
