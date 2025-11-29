import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit, Home, CheckCircle2, Clock, AlertTriangle, ClipboardList, Target, User, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Logo from '@/components/shared/Logo';
import { ApiService, Tarea } from '@/services/api';
import { API_ENDPOINTS, API_URL } from '@/config/api';

const SupervisorTareas = () => {
  console.log('🚀 COMPONENTE SUPERVISOR TAREAS SE ESTÁ EJECUTANDO!');
  
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

  console.log('🎭 SupervisorTareas - Componente montado/renderizado:', {
    filtroEstado,
    loading,
    tareasLength: tareas.length,
    token: !!ApiService.getToken(),
    userInfo: ApiService.getToken() ? 'present' : 'missing'
  });

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

  // Función para obtener el resumen de productos de una tarea
  const getResumenProductos = (productos: Tarea['productos']) => {
    if (productos.length === 0) return 'Sin productos';
    if (productos.length === 1) return productos[0].nombre || 'Producto';
    return `${productos.length} productos`;
  };

  // Función para obtener las ubicaciones únicas
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

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = (tarea.reponedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.productos.some(p => (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Mapear estados del backend al formato del componente
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

  // Mapear prioridad basada en el estado (provisional)
  const getPrioridad = (estado: string) => {
    if (estado === 'pendiente') return 'Alta';
    if (estado === 'en progreso') return 'Media';
    return 'Baja';
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
                  Gestión de Tareas (Supervisor)
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Supervisa y administra las tareas de tu equipo de reponedores
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
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
                <ClipboardList className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Supervisión de Tareas</h2>
                <p className="text-muted-foreground">Supervisa el progreso y gestiona las tareas asignadas a tu equipo</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de tareas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <ClipboardList className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{tareas.length}</div>
                <div className="metric-label">Total Tareas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Supervisadas</span>
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
                <div className="metric-value text-success">{tareas.filter(t => t.estado === 'completada').length}</div>
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
                <div className="metric-value text-warning">{tareas.filter(t => t.estado === 'en progreso').length}</div>
                <div className="metric-label">En Progreso</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Activas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-destructive/15 to-destructive/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-destructive/30 rounded-full group-hover:bg-destructive/40 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="metric-value text-destructive">{tareas.filter(t => t.estado === 'pendiente').length}</div>
                <div className="metric-label">Pendientes</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-destructive/20 text-destructive border border-destructive/40 px-2 py-1 rounded-md text-xs font-medium">⚠ Urgente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de tareas */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-warning/30 rounded-xl">
                    <Target className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Tareas de Reposición</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona las tareas asignadas a tu equipo</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => cargarTareas(filtroEstado)}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Cargando tareas...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-destructive">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <span>{error}</span>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar tareas por reponedor o producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 border-primary/20 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger className="w-48 border-2 border-primary/20 focus:border-primary/50">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en progreso">En Progreso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredTareas.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay tareas</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No se encontraron tareas que coincidan con la búsqueda' : 'No tienes tareas asignadas en este momento'}
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
                </>
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
        </main>
      </div>
    </>
  );
};

export default SupervisorTareas;
