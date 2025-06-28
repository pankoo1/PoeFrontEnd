
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Reportes de Rendimiento
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Tareas</p>
                  <p className="text-2xl font-bold text-slate-800">{estadisticasGenerales.totalTareas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Completadas</p>
                  <p className="text-2xl font-bold text-slate-800">{estadisticasGenerales.tareasCompletadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-slate-800">{estadisticasGenerales.tiempoPromedioGeneral}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Eficiencia General</p>
                  <p className="text-2xl font-bold text-slate-800">{estadisticasGenerales.eficienciaGeneral}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Reporte */}
        <Card className="mb-8 glass border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Generar Reporte</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-slate-700">Tipo de Reporte</label>
                <Select value={tipoReporte} onValueChange={setTipoReporte}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
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
                <label className="text-sm font-medium mb-2 block text-slate-700">Período</label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
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
              <Button 
                onClick={generarReporte}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Generar Reporte
              </Button>
              <Button 
                variant="outline" 
                onClick={exportarDatos}
                className="hover:bg-slate-50 border-slate-300 hover:border-slate-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Datos */}
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold">
              {tipoReporte === 'rendimiento' ? 'Rendimiento por Reponedor' : 
               tipoReporte === 'rutas' ? 'Eficiencia de Rutas' : 
               'Datos Generales'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {tipoReporte === 'rendimiento' ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-100">
                      <TableHead className="font-semibold text-slate-700">Reponedor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tareas Completadas</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tiempo Promedio</TableHead>
                      <TableHead className="font-semibold text-slate-700">Eficiencia</TableHead>
                      <TableHead className="font-semibold text-slate-700">Pasillos Recorridos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosRendimiento.map((dato, index) => (
                      <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{dato.reponedor}</TableCell>
                        <TableCell className="text-slate-700 font-medium">{dato.tareasCompletadas}</TableCell>
                        <TableCell className="text-slate-700">{dato.tiempoPromedio}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            parseInt(dato.eficiencia) >= 90 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {dato.eficiencia}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700">{dato.pasillosRecorridos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-100">
                      <TableHead className="font-semibold text-slate-700">Ruta</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total Recorridos</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tiempo Promedio</TableHead>
                      <TableHead className="font-semibold text-slate-700">Eficiencia</TableHead>
                      <TableHead className="font-semibold text-slate-700">Incidencias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosRutas.map((dato, index) => (
                      <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{dato.ruta}</TableCell>
                        <TableCell className="text-slate-700 font-medium">{dato.totalRecorridos}</TableCell>
                        <TableCell className="text-slate-700">{dato.tiempoPromedio}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            parseInt(dato.eficiencia) >= 90 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {dato.eficiencia}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700">{dato.incidencias}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportesPage;
