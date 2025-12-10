import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Package,
  Clock,
  CheckCircle2,
  FileText,
  Filter,
  Loader2
} from 'lucide-react';
import { ApiService } from '@/services/api';

const ReportsPage = () => {
  const { toast } = useToast();
  const [tipoReporte, setTipoReporte] = useState('rendimiento');
  const [periodo, setPeriodo] = useState('semana');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [reponedores, setReponedores] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => {
    // Inicializar fechas
    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(hoy.getDate() - 7);
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(haceUnaSemana.toISOString().split('T')[0]);

    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      // Cargar reponedores y estadísticas del backend
      const [reponedoresData, estadisticasData] = await Promise.all([
        ApiService.getReponedores(),
        ApiService.getEstadisticasGenerales(fechaInicio, fechaFin)
      ]);

      // Transformar datos de reponedores - SOLO mostrar si el backend devuelve los datos
      const reponedoresTransformados = Array.isArray(reponedoresData) 
        ? reponedoresData.map((rep: any) => ({
            id_usuario: rep.id_usuario,
            nombre_completo: rep.nombre
          }))
        : [];

      setReponedores(reponedoresTransformados);
      setEstadisticas(estadisticasData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de reportes',
        variant: 'destructive'
      });
      
      // Si falla, dejar arrays vacíos - NO datos inventados
      setReponedores([]);
      setEstadisticas({
        total_tareas: 0,
        tareas_completadas: 0,
        tiempo_promedio: '0',
        eficiencia_promedio: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async () => {
    if (tipoReporte === 'historial' && !reponedorSeleccionado) {
      toast({
        title: 'Error',
        description: 'Selecciona un reponedor para generar el reporte',
        variant: 'destructive'
      });
      return;
    }

    setGenerando(true);
    try {
      if (tipoReporte === 'historial' && reponedorSeleccionado) {
        // Obtener historial del reponedor
        const historial = await ApiService.getHistorialReponedor(
          parseInt(reponedorSeleccionado),
          periodo === 'personalizado' ? fechaInicio : undefined,
          periodo === 'personalizado' ? fechaFin : undefined
        );
        
        const numTareas = historial?.tareas?.length || 0;
        
        toast({
          title: 'Reporte generado',
          description: `Se encontraron ${numTareas} tareas`,
        });
      } else {
        // Para otros tipos de reporte, mostrar estadísticas generales
        const stats = await ApiService.getEstadisticasGenerales(
          periodo === 'personalizado' ? fechaInicio : undefined,
          periodo === 'personalizado' ? fechaFin : undefined
        );
        
        toast({
          title: 'Reporte generado',
          description: 'El reporte se ha generado correctamente',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        variant: 'destructive'
      });
    } finally {
      setGenerando(false);
    }
  };

  const descargarReporte = async () => {
    if (!reponedorSeleccionado) {
      toast({
        title: 'Error',
        description: 'Selecciona un reponedor para descargar el reporte',
        variant: 'destructive'
      });
      return;
    }

    try {
      const blob = await ApiService.descargarReporteReponedor(
        parseInt(reponedorSeleccionado),
        'excel',
        periodo === 'personalizado' ? fechaInicio : undefined,
        periodo === 'personalizado' ? fechaFin : undefined
      );

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_reponedor_${reponedorSeleccionado}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Descarga iniciada',
        description: 'El archivo se está descargando',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el reporte',
        variant: 'destructive'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes y Análisis</h1>
          <p className="text-slate-600 mt-1">Genera reportes y visualiza estadísticas del sistema</p>
        </div>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tareas Totales</p>
                    <p className="text-2xl font-bold text-slate-900">{estadisticas.total_tareas || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.tareas_completadas || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-blue-600">{estadisticas.tiempo_promedio || '0'}h</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reponedores Activos</p>
                    <p className="text-2xl font-bold text-purple-600">{reponedores.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generador de Reportes */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="w-5 h-5" />
              Generador de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda - Configuración */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipoReporte" className="text-slate-700 font-medium">Tipo de Reporte</Label>
                  <Select value={tipoReporte} onValueChange={setTipoReporte}>
                    <SelectTrigger id="tipoReporte" className="mt-1.5 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendimiento">Rendimiento General</SelectItem>
                      <SelectItem value="historial">Historial de Reponedor</SelectItem>
                      <SelectItem value="productos">Productos Más Repuestos</SelectItem>
                      <SelectItem value="eficiencia">Análisis de Eficiencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="periodo" className="text-slate-700 font-medium">Período</Label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger id="periodo" className="mt-1.5 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="semana">Última Semana</SelectItem>
                      <SelectItem value="mes">Último Mes</SelectItem>
                      <SelectItem value="trimestre">Último Trimestre</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodo === 'personalizado' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fechaInicio" className="text-slate-700 font-medium">Fecha Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="mt-1.5 border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaFin" className="text-slate-700 font-medium">Fecha Fin</Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="mt-1.5 border-slate-200"
                      />
                    </div>
                  </div>
                )}

                {tipoReporte === 'historial' && (
                  <div>
                    <Label htmlFor="reponedor" className="text-slate-700 font-medium">Reponedor</Label>
                    <Select value={reponedorSeleccionado} onValueChange={setReponedorSeleccionado}>
                      <SelectTrigger id="reponedor" className="mt-1.5 border-slate-200">
                        <SelectValue placeholder="Seleccionar reponedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {reponedores.map((rep: any) => (
                          <SelectItem key={rep.id_usuario} value={rep.id_usuario.toString()}>
                            {rep.nombre_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Columna Derecha - Vista Previa */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Vista Previa del Reporte</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span>Tipo:</span>
                    <span className="font-medium text-slate-900">
                      {tipoReporte === 'rendimiento' && 'Rendimiento General'}
                      {tipoReporte === 'historial' && 'Historial de Reponedor'}
                      {tipoReporte === 'productos' && 'Productos Más Repuestos'}
                      {tipoReporte === 'eficiencia' && 'Análisis de Eficiencia'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span>Período:</span>
                    <span className="font-medium text-slate-900">
                      {periodo === 'personalizado' 
                        ? `${fechaInicio} a ${fechaFin}`
                        : periodo === 'hoy' ? 'Hoy'
                        : periodo === 'semana' ? 'Última Semana'
                        : periodo === 'mes' ? 'Último Mes'
                        : 'Último Trimestre'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Formato:</span>
                    <span className="font-medium text-slate-900">PDF</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    onClick={generarReporte}
                    disabled={generando}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                  >
                    {generando ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generar Reporte
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={descargarReporte}
                    variant="outline"
                    className="w-full border-slate-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Último Reporte
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
