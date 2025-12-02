import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Package,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiService } from '@/services/api';

const TasksPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllTareas();
      setTareas(data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        variant: 'destructive'
      });
      // Si falla, dejar array vacío - NO datos inventados
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = 
      tarea.supervisor_a_cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarea.producto?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado?.toLowerCase() === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'pendiente': <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pendiente
      </Badge>,
      'en_progreso': <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        En Progreso
      </Badge>,
      'completada': <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Completada
      </Badge>
    };
    return badges[estado.toLowerCase()] || badges['pendiente'];
  };

  const estadisticas = {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado?.toLowerCase() === 'pendiente').length,
    enProgreso: tareas.filter(t => t.estado?.toLowerCase() === 'en_progreso').length,
    completadas: tareas.filter(t => t.estado?.toLowerCase() === 'completada').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Tareas</h1>
          <p className="text-slate-600 mt-1">Administra y supervisa todas las tareas de reposición</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Tareas</p>
                  <p className="text-2xl font-bold text-slate-900">{estadisticas.total}</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">En Progreso</p>
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.enProgreso}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por supervisor o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full md:w-48 border-slate-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Tareas */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Listado de Tareas ({filteredTareas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando tareas...</p>
                </div>
              </div>
            ) : filteredTareas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <ClipboardList className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium">No se encontraron tareas</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Supervisor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Producto</TableHead>
                      <TableHead className="font-semibold text-slate-700">Cantidad</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTareas.map((tarea, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="font-medium text-slate-900">
                              {tarea.supervisor_a_cargo || 'Sin asignar'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">{tarea.producto || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-700 font-medium">{tarea.cantidad || 0}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {tarea.fecha_creacion 
                                ? new Date(tarea.fecha_creacion).toLocaleDateString('es-ES')
                                : 'Sin fecha'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(tarea.estado || 'pendiente')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TasksPage;
