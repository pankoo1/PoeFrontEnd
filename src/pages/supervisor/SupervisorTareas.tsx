import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Search, Edit, CheckCircle2, Clock, AlertTriangle, ClipboardList, Target, User, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ApiService, Tarea } from '@/services/api';
import { API_ENDPOINTS, API_URL } from '@/config/api';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

const SupervisorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reponedores, setReponedores] = useState<any[]>([]);
  const [asignarDialogOpen, setAsignarDialogOpen] = useState(false);
  const [tareaAAsignar, setTareaAAsignar] = useState<Tarea | null>(null);
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState<string>('');

  // Verificar autenticación al montar
  useEffect(() => {
    const token = ApiService.getToken();
    console.log('🔐 SupervisorTareas - Verificación de autenticación:', {
      tieneToken: !!token,
      token: token ? `${token.substring(0, 20)}...` : 'No token'
    });
    
    if (!token) {
      console.warn('⚠️ SupervisorTareas - Sin token, redirigiendo a login');
      toast({
        title: "Sin autenticación",
        description: "No se encontró token de autenticación. Redirigiendo al login...",
        variant: "destructive",
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  }, [navigate, toast]);

  // Cargar tareas del supervisor
  const cargarTareas = async (estado?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 SupervisorTareas - Iniciando carga de tareas:', {
        estado,
        token: !!ApiService.getToken(),
        url: estado && estado !== 'todos' 
          ? `${API_ENDPOINTS.tareas}/supervisor?estado=${estado}`
          : `${API_ENDPOINTS.tareas}/supervisor`
      });

      // Test simple de conectividad
      console.log('🌐 Probando conectividad básica...');
      try {
        const response = await fetch(`${API_ENDPOINTS.tareas}/supervisor`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ApiService.getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🌐 Respuesta de conectividad básica:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
      } catch (connectError) {
        console.error('❌ Error de conectividad básica:', connectError);
      }
      
      const tareasData: Tarea[] = await ApiService.getTareasSupervisor(estado);
      setTareas(tareasData);
      
      console.log('🎯 SupervisorTareas - Tareas cargadas exitosamente:', {
        total: tareasData.length,
        estados: tareasData.reduce((acc: any, tarea) => {
          acc[tarea.estado] = (acc[tarea.estado] || 0) + 1;
          return acc;
        }, {}),
        datos: tareasData
      });
      
    } catch (error: any) {
      console.error('❌ SupervisorTareas - Error al cargar tareas:', {
        error,
        message: error.message,
        status: error.status,
        response: error.response
      });
      setError('No se pudieron cargar las tareas');
      
      if (error.message?.includes('403')) {
        toast({
          title: "Sin permisos",
          description: "Solo los supervisores pueden acceder a estas tareas",
          variant: "destructive",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar reponedores asignados al supervisor
  const cargarReponedores = async () => {
    try {
      const reponedoresData = await ApiService.getReponedoresAsignados();
      setReponedores(reponedoresData);
      console.log('🧑‍💼 SupervisorTareas - Reponedores cargados:', reponedoresData);
    } catch (error) {
      console.error('Error al cargar reponedores:', error);
    }
  };

  // Cargar tareas al montar el componente y cuando cambie el filtro
  useEffect(() => {
    console.log('🔄 SupervisorTareas - useEffect ejecutado:', {
      filtroEstado,
      timestamp: new Date().toISOString()
    });
    cargarTareas(filtroEstado);
    cargarReponedores();
  }, [filtroEstado]);

  const editarTarea = (tarea: Tarea) => {
    setEditingTarea(tarea);
    setEditDialogOpen(true);
  };

  const guardarEdicion = () => {
    if (!editingTarea) return;
    
    setTareas(tareas.map(tarea => 
      tarea.id_tarea === editingTarea.id_tarea ? editingTarea : tarea
    ));
    setEditDialogOpen(false);
    setEditingTarea(null);
    toast({
      title: "Tarea actualizada",
      description: `La tarea ha sido actualizada (funcionalidad de edición en desarrollo)`,
    });
  };

  // Función para abrir el diálogo de asignar reponedor
  const abrirAsignarReponedor = (tarea: Tarea) => {
    setTareaAAsignar(tarea);
    setReponedorSeleccionado('');
    setAsignarDialogOpen(true);
  };

  // Función para asignar reponedor a una tarea
  const asignarReponedor = async () => {
    if (!tareaAAsignar || !reponedorSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un reponedor",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Asignando reponedor:', {
        idTarea: tareaAAsignar.id_tarea,
        idReponedor: reponedorSeleccionado
      });

      await ApiService.asignarReponedorATarea(
        tareaAAsignar.id_tarea, 
        parseInt(reponedorSeleccionado)
      );

      // Recargar las tareas para mostrar los cambios
      await cargarTareas(filtroEstado);

      setAsignarDialogOpen(false);
      setTareaAAsignar(null);
      setReponedorSeleccionado('');

      toast({
        title: "Reponedor asignado",
        description: "El reponedor ha sido asignado correctamente a la tarea",
        variant: "default",
      });
    } catch (error) {
      console.error('Error al asignar reponedor:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el reponedor a la tarea",
        variant: "destructive",
      });
    }
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = (tarea.reponedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.productos.some(p => (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const mapearEstado = (estado: string) => {
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en progreso': 'En Progreso', 
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'sin asignar': 'Sin Asignar'
    };
    return estadosMap[estado] || estado;
  };

  const getPrioridad = (estado: string) => {
    if (estado === 'pendiente') return 'Alta';
    if (estado === 'en progreso') return 'Media';
    return 'Baja';
  };

  const getResumenProductos = (productos: Tarea['productos']) => {
    if (productos.length === 0) return 'Sin productos';
    if (productos.length === 1) return productos[0].nombre || 'Producto';
    return `${productos.length} productos`;
  };

  const getUbicacionesResumen = (productos: Tarea['productos']) => {
    const ubicacionesUnicas = productos
      .map(p => p.ubicacion)
      .filter((ub, index, arr) => 
        arr.findIndex(u => u.estanteria === ub.estanteria && u.nivel === ub.nivel) === index
      );
    
    if (ubicacionesUnicas.length === 0) return 'Sin ubicación';
    if (ubicacionesUnicas.length === 1) {
      const ub = ubicacionesUnicas[0];
      return `E${ub.estanteria}-N${ub.nivel}`;
    }
    return `${ubicacionesUnicas.length} ubicaciones`;
  };

  return (
    <SupervisorLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Tareas</h1>
          <p className="text-sm text-slate-600">Supervisa y administra las tareas de tu equipo</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => cargarTareas(filtroEstado)}
          disabled={loading}
          className="border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Banner informativo */}
        <Card className="mb-6 border-blue-100 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Panel de Supervisión de Tareas</h2>
                <p className="text-sm text-slate-600">Supervisa el progreso y gestiona las tareas asignadas a tu equipo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros y búsqueda */}
        <Card className="mb-6 border-slate-100 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Buscar por reponedor o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de tareas */}
        <Card className="border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Lista de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                <span className="text-slate-600">Cargando tareas...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-600">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <span>{error}</span>
              </div>
            ) : filteredTareas.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No hay tareas</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'No se encontraron tareas que coincidan con la búsqueda' : 'No hay tareas asignadas en este momento'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reponedor</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Ubicaciones</TableHead>
                      <TableHead>Cantidad Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTareas.map((tarea) => (
                      <TableRow key={tarea.id_tarea} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{tarea.reponedor || 'Sin asignar'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{getResumenProductos(tarea.productos)}</div>
                            {tarea.productos.length > 1 && (
                              <div className="text-xs text-muted-foreground">
                                {tarea.productos.slice(0, 2).map(p => p.nombre).join(', ')}
                                {tarea.productos.length > 2 && '...'}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getUbicacionesResumen(tarea.productos)}</div>
                        </TableCell>
                        <TableCell>
                          {tarea.productos.reduce((total, p) => total + p.cantidad, 0)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: `${tarea.color_estado}20`,
                              color: tarea.color_estado,
                              borderColor: `${tarea.color_estado}40`
                            }}
                          >
                            {mapearEstado(tarea.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(tarea.fecha_creacion).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editarTarea(tarea)}
                              className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            {(!tarea.reponedor || tarea.reponedor === 'Sin asignar') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => abrirAsignarReponedor(tarea)}
                                className="border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 text-blue-600"
                              >
                                <User className="w-3 h-3 mr-1" />
                                Asignar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para ver detalles de tarea */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Detalles de la Tarea</DialogTitle>
              </DialogHeader>
              {editingTarea && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">ID Tarea:</Label>
                    <span className="col-span-3">{editingTarea.id_tarea}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Reponedor:</Label>
                    <span className="col-span-3">{editingTarea.reponedor || 'Sin asignar'}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Estado:</Label>
                    <div className="col-span-3">
                      <Badge 
                        variant="outline"
                        style={{ 
                          backgroundColor: `${editingTarea.color_estado}20`,
                          color: editingTarea.color_estado,
                          borderColor: `${editingTarea.color_estado}40`
                        }}
                      >
                        {mapearEstado(editingTarea.estado)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Fecha Creación:</Label>
                    <span className="col-span-3">{new Date(editingTarea.fecha_creacion).toLocaleString('es-ES')}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right font-semibold">Productos:</Label>
                    <div className="col-span-3 space-y-2">
                      {editingTarea.productos.map((producto, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium">{producto.nombre || 'Producto sin nombre'}</div>
                          <div className="text-sm text-muted-foreground">
                            Cantidad: {producto.cantidad} | 
                            Ubicación: E{producto.ubicacion.estanteria}-N{producto.ubicacion.nivel} |
                            Punto: {producto.ubicacion.id_punto}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right font-semibold">Ubicaciones:</Label>
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-2">
                        {editingTarea.productos
                          .map(p => p.ubicacion)
                          .filter((ub, index, arr) => 
                            arr.findIndex(u => u.estanteria === ub.estanteria && u.nivel === ub.nivel) === index
                          )
                          .map((ubicacion, index) => (
                            <Badge key={index} variant="secondary">
                              E{ubicacion.estanteria}-N{ubicacion.nivel}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditDialogOpen(false)}
                      className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog para asignar reponedor */}
          <Dialog open={asignarDialogOpen} onOpenChange={setAsignarDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Asignar Reponedor a Tarea</DialogTitle>
              </DialogHeader>
              {tareaAAsignar && (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Tarea ID: {tareaAAsignar.id_tarea}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getResumenProductos(tareaAAsignar.productos)} en {getUbicacionesResumen(tareaAAsignar.productos)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reponedor-select">Seleccionar Reponedor</Label>
                    <Select value={reponedorSeleccionado} onValueChange={setReponedorSeleccionado}>
                      <SelectTrigger id="reponedor-select" className="w-full">
                        <SelectValue placeholder="Seleccione un reponedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {reponedores.map((reponedor) => (
                          <SelectItem key={reponedor.id_usuario} value={reponedor.id_usuario.toString()}>
                            {reponedor.nombre} ({reponedor.correo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setAsignarDialogOpen(false)}
                      className="border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={asignarReponedor}
                      disabled={!reponedorSeleccionado}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Asignar Reponedor
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SupervisorLayout>
  );
};

export default SupervisorTareas;
