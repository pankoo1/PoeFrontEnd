
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Route, Search, Eye, MapPin, Clock, Play, Pause, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const RutasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroReponedor, setFiltroReponedor] = useState('todos');
  
  const [rutas] = useState([
    { 
      id: 1, 
      nombre: 'Ruta Pasillo A-B', 
      reponedor: 'Carlos Martínez', 
      pasillos: ['Pasillo A - Lácteos', 'Pasillo B - Panadería'], 
      estado: 'En Ejecución',
      progreso: 66,
      horaInicio: '08:00',
      horaEstimadaFin: '10:30',
      ubicacionActual: 'Pasillo A - Lácteos'
    },
    { 
      id: 2, 
      nombre: 'Ruta Pasillo C-D', 
      reponedor: 'Ana López', 
      pasillos: ['Pasillo C - Frutas y Verduras', 'Pasillo D - Bebidas'], 
      estado: 'Pendiente',
      progreso: 0,
      horaInicio: '09:00',
      horaEstimadaFin: '11:00',
      ubicacionActual: 'Almacén'
    },
    { 
      id: 3, 
      nombre: 'Ruta Pasillo E', 
      reponedor: 'Miguel Santos', 
      pasillos: ['Pasillo E - Carnes'], 
      estado: 'Completada',
      progreso: 100,
      horaInicio: '07:00',
      horaEstimadaFin: '08:30',
      ubicacionActual: 'Completada'
    },
    { 
      id: 4, 
      nombre: 'Ruta Pasillo F-G', 
      reponedor: 'Laura García', 
      pasillos: ['Pasillo F - Limpieza', 'Pasillo G - Higiene'], 
      estado: 'En Ejecución',
      progreso: 33,
      horaInicio: '08:30',
      horaEstimadaFin: '11:00',
      ubicacionActual: 'Pasillo F - Limpieza'
    },
  ]);

  const filteredRutas = rutas.filter(ruta => {
    const matchesSearch = ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ruta.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ruta.ubicacionActual.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || ruta.estado.toLowerCase().replace(' ', '-') === filtroEstado;
    const matchesReponedor = filtroReponedor === 'todos' || ruta.reponedor === filtroReponedor;
    return matchesSearch && matchesEstado && matchesReponedor;
  });

  const reponedores = Array.from(new Set(rutas.map(ruta => ruta.reponedor)));

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completada</Badge>;
      case 'En Ejecución':
        return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"><Play className="w-3 h-3 mr-1" />En Ejecución</Badge>;
      case 'Pendiente':
        return <Badge className="bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"><Pause className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200">{estado}</Badge>;
    }
  };

  const verDetalles = (ruta: any) => {
    toast({
      title: "Ver detalles",
      description: `Mostrando detalles de la ruta: ${ruta.nombre}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Gestión de Rutas</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Filters Section */}
        <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar rutas, reponedores o ubicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en-ejecución">En Ejecución</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroReponedor} onValueChange={setFiltroReponedor}>
              <SelectTrigger className="bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200">
                <SelectValue placeholder="Filtrar por reponedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los reponedores</SelectItem>
                {reponedores.map((reponedor) => (
                  <SelectItem key={reponedor} value={reponedor}>{reponedor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Routes Table */}
        <Card className="bg-white/60 backdrop-blur-lg border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Rutas de Reposición</CardTitle>
                <p className="text-blue-100 mt-1">Supervisa el progreso de las rutas asignadas en tiempo real</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-blue-100">
                    <TableHead className="font-bold text-slate-700 py-4">Ruta</TableHead>
                    <TableHead className="font-bold text-slate-700">Reponedor</TableHead>
                    <TableHead className="font-bold text-slate-700">Pasillos</TableHead>
                    <TableHead className="font-bold text-slate-700">Estado</TableHead>
                    <TableHead className="font-bold text-slate-700">Progreso</TableHead>
                    <TableHead className="font-bold text-slate-700">Horario</TableHead>
                    <TableHead className="font-bold text-slate-700">Ubicación</TableHead>
                    <TableHead className="font-bold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRutas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Route className="w-12 h-12 text-gray-400" />
                          <p className="text-gray-500 text-lg">No se encontraron rutas</p>
                          <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRutas.map((ruta) => (
                      <TableRow key={ruta.id} className="hover:bg-blue-50/50 transition-all duration-200 border-b border-slate-100">
                        <TableCell className="font-semibold text-slate-900 py-4">{ruta.nombre}</TableCell>
                        <TableCell className="text-slate-700">{ruta.reponedor}</TableCell>
                        <TableCell className="text-slate-700">
                          <div className="text-sm max-w-48">
                            {ruta.pasillos.map((pasillo, index) => (
                              <div key={index} className="mb-1 text-xs bg-slate-100 px-2 py-1 rounded">
                                {pasillo}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(ruta.estado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  ruta.progreso === 100 ? 'bg-green-500' : 
                                  ruta.progreso > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${ruta.progreso}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{ruta.progreso}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-slate-700 mb-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {ruta.horaInicio} - {ruta.horaEstimadaFin}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-700">
                            <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                            {ruta.ubicacionActual}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => verDetalles(ruta)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RutasPage;
      ubicacionActual: 'Almacén'
    },
    { 
      id: 4, 
      nombre: 'Ruta Pasillo F-G', 
      reponedor: 'Laura Pérez', 
      pasillos: ['Pasillo F - Limpieza', 'Pasillo G - Cuidado Personal'], 
      estado: 'En Ejecución',
      progreso: 33,
      horaInicio: '08:30',
      horaEstimadaFin: '11:00',
      ubicacionActual: 'Pasillo F - Limpieza'
    },
  ]);

  const filteredRutas = rutas.filter(ruta => {
    const matchesSearch = ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ruta.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ruta.ubicacionActual.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || ruta.estado.toLowerCase().replace(' ', '-') === filtroEstado;
    const matchesReponedor = filtroReponedor === 'todos' || ruta.reponedor === filtroReponedor;
    return matchesSearch && matchesEstado && matchesReponedor;
  });

  const reponedores = Array.from(new Set(rutas.map(ruta => ruta.reponedor)));

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completada</Badge>;
      case 'En Ejecución':
        return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"><Play className="w-3 h-3 mr-1" />En Ejecución</Badge>;
      case 'Pendiente':
        return <Badge className="bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"><Pause className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200">{estado}</Badge>;
    }
  };

  const verDetalles = (ruta: any) => {
    toast({
      title: "Ver detalles",
      description: `Mostrando detalles de la ruta: ${ruta.nombre}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Gestión de Rutas</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Filters Section */}
        <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar rutas, reponedores o ubicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en-ejecución">En Ejecución</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroReponedor} onValueChange={setFiltroReponedor}>
              <SelectTrigger className="bg-white/70 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200">
                <SelectValue placeholder="Filtrar por reponedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los reponedores</SelectItem>
                {reponedores.map((reponedor) => (
                  <SelectItem key={reponedor} value={reponedor}>{reponedor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        {/* Routes Table */}
        <Card className="bg-white/60 backdrop-blur-lg border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Rutas de Reposición</CardTitle>
                <p className="text-blue-100 mt-1">Supervisa el progreso de las rutas asignadas en tiempo real</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-blue-100">
                    <TableHead className="font-bold text-slate-700 py-4">Ruta</TableHead>
                    <TableHead className="font-bold text-slate-700">Reponedor</TableHead>
                    <TableHead className="font-bold text-slate-700">Pasillos</TableHead>
                    <TableHead className="font-bold text-slate-700">Estado</TableHead>
                    <TableHead className="font-bold text-slate-700">Progreso</TableHead>
                    <TableHead className="font-bold text-slate-700">Horario</TableHead>
                    <TableHead className="font-bold text-slate-700">Ubicación</TableHead>
                    <TableHead className="font-bold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRutas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Route className="w-12 h-12 text-gray-400" />
                          <p className="text-gray-500 text-lg">No se encontraron rutas</p>
                          <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRutas.map((ruta) => (
                      <TableRow key={ruta.id} className="hover:bg-blue-50/50 transition-all duration-200 border-b border-slate-100">
                        <TableCell className="font-semibold text-slate-900 py-4">{ruta.nombre}</TableCell>
                        <TableCell className="text-slate-700">{ruta.reponedor}</TableCell>
                        <TableCell className="text-slate-700">
                          <div className="text-sm max-w-48">
                            {ruta.pasillos.map((pasillo, index) => (
                              <div key={index} className="mb-1 text-xs bg-slate-100 px-2 py-1 rounded">
                                {pasillo}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(ruta.estado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  ruta.progreso === 100 ? 'bg-green-500' : 
                                  ruta.progreso > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${ruta.progreso}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{ruta.progreso}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-slate-700 mb-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {ruta.horaInicio} - {ruta.horaEstimadaFin}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-700">
                            <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                            {ruta.ubicacionActual}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => verDetalles(ruta)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(ruta.estado)}`}>
                          {ruta.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${ruta.progreso}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">{ruta.progreso}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-500" />
                            {ruta.horaInicio} - {ruta.horaEstimadaFin}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                          {ruta.ubicacionActual}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => verDetalles(ruta)}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRutas.length === 0 && (
              <div className="text-center py-8">
                <Route className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No se encontraron rutas que coincidan con los filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RutasPage;
