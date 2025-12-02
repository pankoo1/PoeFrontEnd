import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import SupervisorLayout from '@/components/layout/SupervisorLayout';
import {
  ApiService,
  PrediccionRequest,
  PrediccionResponse,
  PrediccionHistorialItem,
  EstadoPrediccion
} from '@/services/api';

const Predicciones = () => {
  const { toast } = useToast();
  const userName = localStorage.getItem('nombre') || 'Supervisor';

  // Estados para generación
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [incluirSemanas, setIncluirSemanas] = useState<boolean>(true);
  const [notas, setNotas] = useState<string>('');
  const [generando, setGenerando] = useState<boolean>(false);

  // Estados para historial
  const [historial, setHistorial] = useState<PrediccionHistorialItem[]>([]);
  const [totalHistorial, setTotalHistorial] = useState<number>(0);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);

  // Estado para predicción seleccionada
  const [prediccionSeleccionada, setPrediccionSeleccionada] = useState<PrediccionResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);

  // Cargar historial al montar
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const response = await ApiService.obtenerHistorialPredicciones(0, 10);
      setHistorial(response.predicciones);
      setTotalHistorial(response.total);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial de predicciones',
        variant: 'destructive'
      });
    } finally {
      setCargandoHistorial(false);
    }
  };

  const generarPrediccion = async () => {
    setGenerando(true);
    try {
      const request: PrediccionRequest = {
        mes,
        anio,
        incluir_semanas: incluirSemanas,
        notas: notas || undefined
      };

      const response = await ApiService.generarPrediccion(request);
      
      toast({
        title: 'Predicción generada',
        description: `Se generó predicción para ${getMesNombre(mes)} ${anio}`,
      });

      // Actualizar historial y seleccionar la nueva predicción
      await cargarHistorial();
      setPrediccionSeleccionada(response);
      
      // Limpiar formulario
      setNotas('');
    } catch (error: any) {
      console.error('Error al generar predicción:', error);
      
      let mensaje = 'No se pudo generar la predicción';
      if (error.message?.includes('503')) {
        mensaje = 'El modelo ML no está disponible. Contacte al administrador.';
      } else if (error.message?.includes('403')) {
        mensaje = 'No tiene permisos para generar predicciones';
      }
      
      toast({
        title: 'Error',
        description: mensaje,
        variant: 'destructive'
      });
    } finally {
      setGenerando(false);
    }
  };

  const verDetalle = async (idPrediccion: number) => {
    setCargandoDetalle(true);
    try {
      const response = await ApiService.obtenerPrediccion(idPrediccion);
      setPrediccionSeleccionada(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el detalle de la predicción',
        variant: 'destructive'
      });
    } finally {
      setCargandoDetalle(false);
    }
  };

  const actualizarEstado = async (estado: EstadoPrediccion, notasEstado: string = '') => {
    if (!prediccionSeleccionada) return;

    try {
      const response = await ApiService.actualizarEstadoPrediccion(
        prediccionSeleccionada.id_prediccion,
        { estado, notas: notasEstado }
      );

      setPrediccionSeleccionada(response);
      await cargarHistorial();

      toast({
        title: 'Estado actualizado',
        description: `Predicción marcada como ${estado}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive'
      });
    }
  };

  const getMesNombre = (mesNum: number): string => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mesNum - 1];
  };

  const getEstadoBadge = (estado: EstadoPrediccion) => {
    const variants = {
      [EstadoPrediccion.PENDIENTE]: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pendiente' },
      [EstadoPrediccion.APLICADO]: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Aplicado' },
      [EstadoPrediccion.RECHAZADO]: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rechazado' }
    };

    const variant = variants[estado];
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <SupervisorLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            Predicciones ML
          </h1>
          <p className="text-sm text-slate-600">Predicción inteligente de reposiciones</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de generación */}
          <div className="lg:col-span-1">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Nueva Predicción
                </CardTitle>
                <CardDescription>
                  Genera predicciones ML para un mes específico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Mes
                  </label>
                  <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <SelectItem key={m} value={m.toString()}>
                          {getMesNombre(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Año
                  </label>
                  <Select value={anio.toString()} onValueChange={(v) => setAnio(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map(a => (
                        <SelectItem key={a} value={a.toString()}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirSemanas"
                    checked={incluirSemanas}
                    onChange={(e) => setIncluirSemanas(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="incluirSemanas" className="text-sm text-slate-700">
                    Incluir desglose semanal
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Notas (opcional)
                  </label>
                  <Textarea
                    placeholder="Ej: Predicción para temporada alta..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={generarPrediccion}
                  disabled={generando}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generar Predicción
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Panel de historial */}
          <div className="lg:col-span-2">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Historial de Predicciones
                  </span>
                  <Badge variant="outline">{totalHistorial} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cargandoHistorial ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No hay predicciones generadas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historial.map((pred) => (
                      <div
                        key={pred.id_prediccion}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => verDetalle(pred.id_prediccion)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-slate-900">
                              {getMesNombre(pred.mes)} {pred.anio}
                            </span>
                            {getEstadoBadge(pred.estado)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {pred.total_unidades} unidades
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {pred.total_reposiciones} reposiciones
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panel de detalle */}
        {prediccionSeleccionada && (
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Detalle de Predicción - {getMesNombre(prediccionSeleccionada.mes)} {prediccionSeleccionada.anio}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {prediccionSeleccionada.estado === EstadoPrediccion.PENDIENTE && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarEstado(EstadoPrediccion.RECHAZADO)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => actualizarEstado(EstadoPrediccion.APLICADO)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aplicar
                      </Button>
                    </>
                  )}
                  {getEstadoBadge(prediccionSeleccionada.estado)}
                </div>
              </div>
              <CardDescription>
                Generada el {new Date(prediccionSeleccionada.fecha_generacion).toLocaleString()} • 
                Modelo v{prediccionSeleccionada.version_modelo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 mb-1">Total Reposiciones</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {prediccionSeleccionada.resumen.total_reposiciones}
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="text-sm text-emerald-600 mb-1">Total Unidades</div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {prediccionSeleccionada.resumen.total_unidades}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-sm text-purple-600 mb-1">Categorías Activas</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {prediccionSeleccionada.resumen.categorias_activas.length}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-sm text-amber-600 mb-1">Promedio Diario</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {prediccionSeleccionada.resumen.promedio_diario.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Por categoría */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Por Categoría</h3>
                <div className="space-y-2">
                  {prediccionSeleccionada.por_categoria.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{cat.categoria}</div>
                        <div className="text-sm text-slate-600">
                          Ubicación: Mueble {cat.ubicacion_mueble} • {cat.dias_predichos.length} días activos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">{cat.total_unidades}</div>
                        <div className="text-sm text-slate-600">{cat.reposiciones} repos.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por semana (si existe) */}
              {prediccionSeleccionada.por_semana && prediccionSeleccionada.por_semana.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Desglose Semanal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {prediccionSeleccionada.por_semana.map((sem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-sm font-medium text-slate-600 mb-1">
                          Semana {sem.semana}
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          {sem.fecha_inicio} - {sem.fecha_fin}
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {sem.total_unidades}
                        </div>
                        <div className="text-xs text-slate-600">unidades</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {prediccionSeleccionada.notas && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mb-1">Notas</div>
                  <div className="text-sm text-slate-600">{prediccionSeleccionada.notas}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default Predicciones;
