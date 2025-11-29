import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, TrendingUp, Clock, Users, Home, FileText, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import { ApiService, type ReponedorReporte, type HistorialReponedorResponse, type EstadisticasGenerales, type ProductosRepuestosResponse } from '@/services/api';
import Logo from '@/components/shared/Logo';

const ReportesPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  
  // Estados para formularios
  const [tipoReporte, setTipoReporte] = useState('rendimiento');
  const [periodo, setPeriodo] = useState('semana');
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Estados para datos
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reponedores, setReponedores] = useState<ReponedorReporte[]>([]);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [historialReponedor, setHistorialReponedor] = useState<HistorialReponedorResponse | null>(null);
  const [productosRepuestos, setProductosRepuestos] = useState<ProductosRepuestosResponse | null>(null);

  // Inicializar fechas por defecto
  useEffect(() => {
    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(hoy.getDate() - 7);
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(haceUnaSemana.toISOString().split('T')[0]);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarReponedores();
    cargarEstadisticasGenerales();
  }, []);

  // Actualizar fechas cuando cambia el período
  useEffect(() => {
    const hoy = new Date();
    let fechaInicioNueva: Date;
    
    switch (periodo) {
      case 'dia':
        fechaInicioNueva = new Date(hoy);
        break;
      case 'semana':
        fechaInicioNueva = new Date();
        fechaInicioNueva.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicioNueva = new Date();
        fechaInicioNueva.setMonth(hoy.getMonth() - 1);
        break;
      case 'trimestre':
        fechaInicioNueva = new Date();
        fechaInicioNueva.setMonth(hoy.getMonth() - 3);
        break;
      default:
        fechaInicioNueva = new Date();
        fechaInicioNueva.setDate(hoy.getDate() - 7);
    }
    
    setFechaInicio(fechaInicioNueva.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  }, [periodo]);

  const cargarReponedores = async () => {
    try {
      const response = await ApiService.getReponedoresReporte();
      setReponedores(response.reponedores);
      if (response.reponedores.length > 0 && !reponedorSeleccionado) {
        setReponedorSeleccionado(response.reponedores[0].id_usuario.toString());
      }
    } catch (error) {
      console.error('Error al cargar reponedores:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reponedores",
        variant: "destructive",
      });
    }
  };

  const cargarEstadisticasGenerales = async () => {
    try {
      setIsLoading(true);
      const stats = await ApiService.getEstadisticasGenerales();
      setEstadisticasGenerales(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas generales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de inicio y fin",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingReport(true);

      if (tipoReporte === 'rendimiento' && reponedorSeleccionado) {
        // Cargar historial del reponedor
        const historial = await ApiService.getHistorialReponedor(
          parseInt(reponedorSeleccionado),
          fechaInicio,
          fechaFin
        );
        setHistorialReponedor(historial);
        
      } else if (tipoReporte === 'productos') {
        // Cargar productos más repuestos
        const productos = await ApiService.getProductosMasRepuestos({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          limit: 50
        });
        setProductosRepuestos(productos);
        
      } else if (tipoReporte === 'general') {
        // Cargar estadísticas generales con fechas
        const stats = await ApiService.getEstadisticasGenerales(fechaInicio, fechaFin);
        setEstadisticasGenerales(stats);
      }

      toast({
        title: "Reporte generado",
        description: `Reporte de ${tipoReporte} generado exitosamente`,
      });
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportarDatos = async () => {
    try {
      setIsLoading(true);
      let blob: Blob;

      if (tipoReporte === 'rendimiento' && reponedorSeleccionado) {
        blob = await ApiService.descargarReporteReponedor(
          parseInt(reponedorSeleccionado),
          'excel',
          fechaInicio,
          fechaFin
        );
        descargarArchivo(blob, `reporte_reponedor_${reponedorSeleccionado}.xlsx`);
        
      } else if (tipoReporte === 'productos') {
        blob = await ApiService.descargarReporteProductos(
          {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            limit: 100
          },
          'excel'
        );
        descargarArchivo(blob, `productos_mas_repuestos.xlsx`);
      }

      toast({
        title: "Exportando datos",
        description: "Los datos se están descargando en formato Excel",
      });
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const descargarArchivo = (blob: Blob, nombreArchivo: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatearEficiencia = (tareas_completadas: number, total_tareas: number): string => {
    if (total_tareas === 0) return '0%';
    return `${Math.round((tareas_completadas / total_tareas) * 100)}%`;
  };

  const obtenerEstadisticasCalculadas = () => {
    if (!estadisticasGenerales) {
      return {
        totalTareas: 0,
        tareasCompletadas: 0,
        tiempoPromedioGeneral: 'N/A',
        eficienciaGeneral: '0%'
      };
    }
    
    const tareas_completadas = estadisticasGenerales.estadisticas_por_estado['completada'] || 0;
    const eficiencia = formatearEficiencia(tareas_completadas, estadisticasGenerales.total_tareas);
    
    return {
      totalTareas: estadisticasGenerales.total_tareas,
      tareasCompletadas: tareas_completadas,
      tiempoPromedioGeneral: 'N/A', // El backend no provee tiempo promedio general
      eficienciaGeneral: eficiencia
    };
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
                  Reportes de Rendimiento
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Analiza el desempeño y métricas del equipo de reposición
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
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
              <div className="p-3 bg-warning/40 rounded-xl">
                <BarChart3 className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Analíticas</h2>
                <p className="text-muted-foreground">Supervisa las métricas de rendimiento y genera reportes detallados</p>
              </div>
            </div>
          </div>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{obtenerEstadisticasCalculadas().totalTareas}</div>
                <div className="metric-label">Total Tareas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Registradas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{obtenerEstadisticasCalculadas().tareasCompletadas}</div>
                <div className="metric-label">Completadas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Finalizadas</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-warning/25 to-warning/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-warning/40 rounded-full group-hover:bg-warning/50 transition-all duration-300">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <div className="metric-value text-warning">{obtenerEstadisticasCalculadas().tiempoPromedioGeneral}</div>
                <div className="metric-label">Tiempo Promedio</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Por tarea</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-secondary/15 to-secondary/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-secondary/30 rounded-full group-hover:bg-secondary/40 transition-all duration-300">
                    <TrendingUp className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="metric-value text-secondary">{obtenerEstadisticasCalculadas().eficienciaGeneral}</div>
                <div className="metric-label">Eficiencia General</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-secondary/20 text-secondary border border-secondary/40 px-2 py-1 rounded-md text-xs font-medium">📊 Promedio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Reporte */}
          <Card className="mb-8 card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-warning/30 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Generar Reporte</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Configura y genera reportes personalizados</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                  <Select value={tipoReporte} onValueChange={setTipoReporte}>
                    <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendimiento">Rendimiento por Reponedor</SelectItem>
                      <SelectItem value="productos">Productos Más Repuestos</SelectItem>
                      <SelectItem value="general">Reporte General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {tipoReporte === 'rendimiento' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reponedor</label>
                    <Select value={reponedorSeleccionado} onValueChange={setReponedorSeleccionado}>
                      <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
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
                )}
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Hoy</SelectItem>
                      <SelectItem value="semana">Esta Semana</SelectItem>
                      <SelectItem value="mes">Este Mes</SelectItem>
                      <SelectItem value="trimestre">Trimestre</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {periodo === 'personalizado' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="fechaInicio" className="text-sm font-medium">Fecha Inicio</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="border-2 border-primary/20 focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaFin" className="text-sm font-medium">Fecha Fin</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="border-2 border-primary/20 focus:border-primary/50"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={exportarDatos}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Datos */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {tipoReporte === 'rendimiento' ? 'Rendimiento por Reponedor' : 
                     tipoReporte === 'productos' ? 'Productos Más Repuestos' : 'Estadísticas Generales'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tipoReporte === 'rendimiento' ? 'Análisis detallado del desempeño individual' : 
                     tipoReporte === 'productos' ? 'Productos con mayor frecuencia de reposición' : 
                     'Métricas generales del sistema'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isGeneratingReport ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Generando reporte...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {tipoReporte === 'rendimiento' && historialReponedor ? (
                    <>
                      {/* Información del reponedor */}
                      <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">
                          Reponedor: {historialReponedor.reponedor.nombre}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Tareas:</span>
                            <div className="font-medium">{historialReponedor.estadisticas.total_tareas}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completadas:</span>
                            <div className="font-medium text-success">{historialReponedor.estadisticas.tareas_completadas}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pendientes:</span>
                            <div className="font-medium text-warning">{historialReponedor.estadisticas.tareas_pendientes}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Eficiencia:</span>
                            <div className="font-medium text-secondary">{historialReponedor.estadisticas.eficiencia}%</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tabla de tareas */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID Tarea</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            <TableHead>Fecha Completado</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead>Puntos Visitados</TableHead>
                            <TableHead>Tiempo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historialReponedor.tareas.map((tarea, index) => (
                            <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                              <TableCell className="font-medium">{tarea.id_tarea}</TableCell>
                              <TableCell>{new Date(tarea.fecha_creacion).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {tarea.fecha_completado ? 
                                  new Date(tarea.fecha_completado).toLocaleDateString() : 
                                  '-'
                                }
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    tarea.estado === 'completada' ? 'bg-success/20 text-success border-success/40' :
                                    tarea.estado === 'en_progreso' ? 'bg-warning/20 text-warning border-warning/40' :
                                    'bg-destructive/20 text-destructive border-destructive/40'
                                  }
                                >
                                  {tarea.estado.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{tarea.total_productos}</TableCell>
                              <TableCell>{tarea.puntos_visitados}</TableCell>
                              <TableCell>{tarea.tiempo_completado || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : tipoReporte === 'productos' && productosRepuestos ? (
                    <>
                      {/* Estadísticas de productos */}
                      <div className="mb-6 p-4 bg-warning/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Estadísticas del Período</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Productos Diferentes:</span>
                            <div className="font-medium">{productosRepuestos.estadisticas.total_productos_diferentes}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cantidad Total:</span>
                            <div className="font-medium">{productosRepuestos.estadisticas.cantidad_total_repuesta}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Promedio por Producto:</span>
                            <div className="font-medium">{productosRepuestos.estadisticas.promedio_por_producto.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tabla de productos */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Cantidad Total</TableHead>
                            <TableHead>Nº Tareas</TableHead>
                            <TableHead>Promedio/Tarea</TableHead>
                            <TableHead>% del Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productosRepuestos.productos.map((producto, index) => (
                            <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                              <TableCell className="font-medium">{producto.producto.nombre}</TableCell>
                              <TableCell>{producto.producto.categoria}</TableCell>
                              <TableCell>{producto.cantidad_total}</TableCell>
                              <TableCell>{producto.numero_tareas}</TableCell>
                              <TableCell>{producto.promedio_por_tarea.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    producto.porcentaje_total >= 10 ? 'bg-destructive/20 text-destructive border-destructive/40' :
                                    producto.porcentaje_total >= 5 ? 'bg-warning/20 text-warning border-warning/40' :
                                    'bg-success/20 text-success border-success/40'
                                  }
                                >
                                  {producto.porcentaje_total.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : tipoReporte === 'general' && estadisticasGenerales ? (
                    <>
                      {/* Estadísticas por estado */}
                      <div className="mb-6 p-4 bg-secondary/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Estadísticas por Estado</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(estadisticasGenerales.estadisticas_por_estado).map(([estado, cantidad]) => (
                            <div key={estado}>
                              <span className="text-muted-foreground">{estado.replace('_', ' ')}:</span>
                              <div className="font-medium">{cantidad}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Estadísticas por reponedor */}
                      <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Estadísticas por Reponedor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {Object.entries(estadisticasGenerales.estadisticas_por_reponedor).map(([reponedor, cantidad]) => (
                            <div key={reponedor}>
                              <span className="text-muted-foreground">{reponedor}:</span>
                              <div className="font-medium">{cantidad} tareas</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecciona un tipo de reporte y haz clic en "Exportar" para descargar los datos</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ReportesPage;
