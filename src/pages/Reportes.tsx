import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, TrendingUp, Clock, Users, Home, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/Logo';

const ReportesPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  const [tipoReporte, setTipoReporte] = useState('rendimiento');
  const [periodo, setPeriodo] = useState('semana');

  const datosRendimiento = [
    { reponedor: 'Carlos Martínez', tareasCompletadas: 45, tiempoPromedio: '2.3h', eficiencia: '94%', pasillosRecorridos: 12 },
    { reponedor: 'Ana López', tareasCompletadas: 38, tiempoPromedio: '2.1h', eficiencia: '96%', pasillosRecorridos: 10 },
    { reponedor: 'Miguel Santos', tareasCompletadas: 42, tiempoPromedio: '2.5h', eficiencia: '89%', pasillosRecorridos: 11 },
    { reponedor: 'Laura Pérez', tareasCompletadas: 40, tiempoPromedio: '2.2h', eficiencia: '92%', pasillosRecorridos: 9 },
  ];

  const datosRutas = [
    { ruta: 'Ruta Pasillo A-B', totalRecorridos: 28, tiempoPromedio: '1.5h', eficiencia: '95%', incidencias: 2 },
    { ruta: 'Ruta Pasillo C-D', totalRecorridos: 25, tiempoPromedio: '1.8h', eficiencia: '88%', incidencias: 4 },
    { ruta: 'Ruta Pasillo E', totalRecorridos: 30, tiempoPromedio: '1.2h', eficiencia: '97%', incidencias: 1 },
    { ruta: 'Ruta Pasillo F-G', totalRecorridos: 22, tiempoPromedio: '2.0h', eficiencia: '85%', incidencias: 5 },
  ];

  const estadisticasGenerales = {
    totalTareas: 165,
    tareasCompletadas: 152,
    tiempoPromedioGeneral: '2.2h',
    eficienciaGeneral: '92%'
  };

  const generarReporte = () => {
    toast({
      title: "Reporte generado",
      description: `Reporte de ${tipoReporte} para ${periodo} generado exitosamente`,
    });
    console.log('Generando reporte:', tipoReporte, periodo);
  };

  const exportarDatos = () => {
    toast({
      title: "Exportando datos",
      description: "Los datos se están descargando en formato Excel",
    });
    console.log('Exportando datos del reporte');
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
                <div className="metric-value text-primary">{estadisticasGenerales.totalTareas}</div>
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
                <div className="metric-value text-success">{estadisticasGenerales.tareasCompletadas}</div>
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
                <div className="metric-value text-warning">{estadisticasGenerales.tiempoPromedioGeneral}</div>
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
                <div className="metric-value text-secondary">{estadisticasGenerales.eficienciaGeneral}</div>
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
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                  <Select value={tipoReporte} onValueChange={setTipoReporte}>
                    <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendimiento">Rendimiento por Reponedor</SelectItem>
                      <SelectItem value="rutas">Eficiencia de Rutas</SelectItem>
                      <SelectItem value="general">Reporte General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={generarReporte}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportarDatos}
                    className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
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
                    {tipoReporte === 'rendimiento' ? 'Rendimiento por Reponedor' : 'Eficiencia de Rutas'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tipoReporte === 'rendimiento' ? 'Análisis detallado del desempeño individual' : 'Métricas de eficiencia por ruta'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {tipoReporte === 'rendimiento' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reponedor</TableHead>
                        <TableHead>Tareas Completadas</TableHead>
                        <TableHead>Tiempo Promedio</TableHead>
                        <TableHead>Eficiencia</TableHead>
                        <TableHead>Pasillos Recorridos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datosRendimiento.map((reponedor, index) => (
                        <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">{reponedor.reponedor}</TableCell>
                          <TableCell>{reponedor.tareasCompletadas}</TableCell>
                          <TableCell>{reponedor.tiempoPromedio}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                parseInt(reponedor.eficiencia) >= 95 ? 'bg-success/20 text-success border-success/40' :
                                parseInt(reponedor.eficiencia) >= 90 ? 'bg-warning/20 text-warning border-warning/40' :
                                'bg-destructive/20 text-destructive border-destructive/40'
                              }
                            >
                              {reponedor.eficiencia}
                            </Badge>
                          </TableCell>
                          <TableCell>{reponedor.pasillosRecorridos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Total Recorridos</TableHead>
                        <TableHead>Tiempo Promedio</TableHead>
                        <TableHead>Eficiencia</TableHead>
                        <TableHead>Incidencias</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datosRutas.map((ruta, index) => (
                        <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">{ruta.ruta}</TableCell>
                          <TableCell>{ruta.totalRecorridos}</TableCell>
                          <TableCell>{ruta.tiempoPromedio}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                parseInt(ruta.eficiencia) >= 95 ? 'bg-success/20 text-success border-success/40' :
                                parseInt(ruta.eficiencia) >= 90 ? 'bg-warning/20 text-warning border-warning/40' :
                                'bg-destructive/20 text-destructive border-destructive/40'
                              }
                            >
                              {ruta.eficiencia}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                ruta.incidencias <= 2 ? 'bg-success/20 text-success border-success/40' :
                                ruta.incidencias <= 4 ? 'bg-warning/20 text-warning border-warning/40' :
                                'bg-destructive/20 text-destructive border-destructive/40'
                              }
                            >
                              {ruta.incidencias}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ReportesPage;
