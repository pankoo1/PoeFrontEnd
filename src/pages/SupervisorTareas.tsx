import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Eye, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Tarea {
  id: number;
  reponedor: string;
  producto: string;
  area: string;
  cantidad: number;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Progreso' | 'Completada';
  fechaAsignacion: string;
  fechaLimite: string;
  progreso?: number;
}

const SupervisorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroReponedor, setFiltroReponedor] = useState('todos');
  const [tareas, setTareas] = useState<Tarea[]>([
    { 
      id: 1, 
      reponedor: 'Carlos Martínez', 
      producto: 'Leche Entera 1L', 
      area: 'Lácteos', 
      cantidad: 24, 
      prioridad: 'Alta', 
      estado: 'En Progreso', 
      fechaAsignacion: '2024-01-15', 
      fechaLimite: '2024-01-15 14:00',
      progreso: 75
    },
    { 
      id: 2, 
      reponedor: 'Ana López', 
      producto: 'Manzanas Rojas', 
      area: 'Frutas y Verduras', 
      cantidad: 50, 
      prioridad: 'Media', 
      estado: 'Pendiente', 
      fechaAsignacion: '2024-01-15', 
      fechaLimite: '2024-01-15 16:00' 
    },
    { 
      id: 3, 
      reponedor: 'Miguel Santos', 
      producto: 'Pan Integral', 
      area: 'Panadería', 
      cantidad: 30, 
      prioridad: 'Baja', 
      estado: 'Completada', 
      fechaAsignacion: '2024-01-14', 
      fechaLimite: '2024-01-15 10:00',
      progreso: 100
    },
    { 
      id: 4, 
      reponedor: 'Laura Pérez', 
      producto: 'Pollo Entero', 
      area: 'Carnicería', 
      cantidad: 15, 
      prioridad: 'Alta', 
      estado: 'En Progreso', 
      fechaAsignacion: '2024-01-15', 
      fechaLimite: '2024-01-15 12:00',
      progreso: 40
    },
  ]);

  const marcarComoCompletada = (id: number) => {
    setTareas(tareas.map(tarea => {
      if (tarea.id === id) {
        return { ...tarea, estado: 'Completada' as const, progreso: 100 };
      }
      return tarea;
    }));
    
    const tarea = tareas.find(t => t.id === id);
    toast({
      title: "Tarea completada",
      description: `La tarea de ${tarea?.producto} ha sido marcada como completada`,
    });
  };

  const verDetalles = (tarea: Tarea) => {
    toast({
      title: "Ver detalles",
      description: `Mostrando detalles de la tarea: ${tarea.producto}`,
    });
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = tarea.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado.toLowerCase() === filtroEstado;
    const matchesReponedor = filtroReponedor === 'todos' || tarea.reponedor === filtroReponedor;
    return matchesSearch && matchesEstado && matchesReponedor;
  });

  const reponedores = Array.from(new Set(tareas.map(tarea => tarea.reponedor)));

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Pendiente':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Media':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Baja':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor-dashboard')}
            className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Supervisión de Tareas
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold">Tareas de Reposición</CardTitle>
                <p className="text-blue-100 mt-1">Supervisa el progreso de las tareas asignadas</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 transition-colors"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-48 border-slate-300 focus:border-blue-500">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroReponedor} onValueChange={setFiltroReponedor}>
                <SelectTrigger className="w-48 border-slate-300 focus:border-blue-500">
                  <SelectValue placeholder="Filtrar por reponedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los reponedores</SelectItem>
                  {reponedores.map(reponedor => (
                    <SelectItem key={reponedor} value={reponedor}>{reponedor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100">
                    <TableHead className="font-semibold text-slate-700">Reponedor</TableHead>
                    <TableHead className="font-semibold text-slate-700">Producto</TableHead>
                    <TableHead className="font-semibold text-slate-700">Área</TableHead>
                    <TableHead className="font-semibold text-slate-700">Cantidad</TableHead>
                    <TableHead className="font-semibold text-slate-700">Prioridad</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="font-semibold text-slate-700">Progreso</TableHead>
                    <TableHead className="font-semibold text-slate-700">Fecha Límite</TableHead>
                    <TableHead className="font-semibold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTareas.map((tarea) => (
                    <TableRow key={tarea.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{tarea.reponedor}</TableCell>
                      <TableCell className="text-slate-700">{tarea.producto}</TableCell>
                      <TableCell className="text-slate-700">{tarea.area}</TableCell>
                      <TableCell className="text-slate-700 font-medium">{tarea.cantidad}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadBadge(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        {tarea.progreso !== undefined ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${tarea.progreso}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-600">{tarea.progreso}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700">{tarea.fechaLimite}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => verDetalles(tarea)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          {tarea.estado !== 'Completada' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => marcarComoCompletada(tarea.id)}
                              className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTareas.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No se encontraron tareas que coincidan con los filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorTareas;
