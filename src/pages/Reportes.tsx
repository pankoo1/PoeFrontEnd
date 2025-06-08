
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, TrendingUp, Clock, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReportesPage = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Reportes de Rendimiento</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tareas</p>
                  <p className="text-2xl font-bold">{estadisticasGenerales.totalTareas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{estadisticasGenerales.tareasCompletadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{estadisticasGenerales.tiempoPromedioGeneral}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eficiencia General</p>
                  <p className="text-2xl font-bold">{estadisticasGenerales.eficienciaGeneral}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Reporte */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generar Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                <Select value={tipoReporte} onValueChange={setTipoReporte}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
              <Button onClick={generarReporte}>
                Generar Reporte
              </Button>
              <Button variant="outline" onClick={exportarDatos}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Datos */}
        <Card>
          <CardHeader>
            <CardTitle>
              {tipoReporte === 'rendimiento' ? 'Rendimiento por Reponedor' : 
               tipoReporte === 'rutas' ? 'Eficiencia de Rutas' : 
               'Datos Generales'}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  {datosRendimiento.map((dato, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{dato.reponedor}</TableCell>
                      <TableCell>{dato.tareasCompletadas}</TableCell>
                      <TableCell>{dato.tiempoPromedio}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          parseInt(dato.eficiencia) >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dato.eficiencia}
                        </span>
                      </TableCell>
                      <TableCell>{dato.pasillosRecorridos}</TableCell>
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
                  {datosRutas.map((dato, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{dato.ruta}</TableCell>
                      <TableCell>{dato.totalRecorridos}</TableCell>
                      <TableCell>{dato.tiempoPromedio}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          parseInt(dato.eficiencia) >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dato.eficiencia}
                        </span>
                      </TableCell>
                      <TableCell>{dato.incidencias}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportesPage;
