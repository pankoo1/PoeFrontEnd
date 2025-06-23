import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Edit, UserX, Package } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ApiService, Tarea, Reponedor } from '@/services/api';
import { API_URL } from '@/config/api';

interface Ubicacion {
  id_punto: number;
  estanteria: string;
  nivel: number;
}

interface Producto {
  id_producto: number;
  nombre: string;
  cantidad: number;
  ubicacion: Ubicacion;
}

interface TareaDetalle {
  id_tarea: number;
  fecha_creacion: string;
  estado: string;
  color_estado: string;
  reponedor: string;
  productos: Producto[];
}

interface EditingProducts {
  id_tarea: number;
  productos: Producto[];
}

const TareasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingTarea, setEditingTarea] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProductsDialogOpen, setEditProductsDialogOpen] = useState(false);
  const [editingProducts, setEditingProducts] = useState<EditingProducts | null>(null);
  const [tempProductQuantities, setTempProductQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [reponedores, setReponedores] = useState<Reponedor[]>([]);
  const [loadingReponedores, setLoadingReponedores] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<TareaDetalle | null>(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  
  useEffect(() => {
    cargarTareas();
  }, [filtroEstado]);

  useEffect(() => {
    if (editDialogOpen) {
      cargarReponedores();
    }
  }, [editDialogOpen]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const tareasResponse = await ApiService.getTareasSupervisor(
        filtroEstado === 'todos' ? undefined : filtroEstado
      );
      setTareas(tareasResponse);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarReponedores = async () => {
    try {
      setLoadingReponedores(true);
      const reponedoresData = await ApiService.getReponedoresAsignados();
      setReponedores(reponedoresData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reponedores",
        variant: "destructive",
      });
    } finally {
      setLoadingReponedores(false);
    }
  };

  const cancelarTarea = async (id: number) => {
    try {
      await ApiService.actualizarEstadoTarea(id, 'cancelada');
    setTareas(tareas.map(tarea => {
      if (tarea.id_tarea === id) {
          return { ...tarea, estado: 'cancelada' };
      }
      return tarea;
    }));
    toast({
      title: "Tarea cancelada",
      description: "La tarea ha sido cancelada exitosamente",
    });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la tarea",
        variant: "destructive",
      });
    }
  };

  const editarTarea = (tarea) => {
    setEditingTarea(tarea);
    setEditDialogOpen(true);
  };

  const editarProductos = async (tarea: any) => {
    try {
      const tareaActualizada = await ApiService.getTareaById(tarea.id_tarea);
      
      setEditingProducts({
        id_tarea: tareaActualizada.id_tarea,
        productos: tareaActualizada.productos
      });

      // Inicializar las cantidades temporales con las cantidades actuales
      const initialQuantities: Record<number, number> = {};
      tareaActualizada.productos.forEach((producto: Producto) => {
        initialQuantities[producto.ubicacion.id_punto] = producto.cantidad;
      });
      setTempProductQuantities(initialQuantities);
      setEditProductsDialogOpen(true);
    } catch (error) {
      console.error('Error al cargar tarea:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la tarea",
        variant: "destructive",
      });
    }
  };

  const actualizarCantidadTemporal = (idPunto: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return; // No permitir cantidades menores a 1
    
    // Actualizar el estado temporal de cantidades
    setTempProductQuantities(prev => ({
      ...prev,
      [idPunto]: nuevaCantidad
    }));
  };

  const guardarCambiosCantidad = async () => {
    try {
      if (!editingProducts) return;

      // Crear un array de promesas para todas las actualizaciones
      const actualizaciones = editingProducts.productos.map(async (producto) => {
        const idPunto = producto.ubicacion.id_punto;
        const nuevaCantidad = tempProductQuantities[idPunto];
        
        // Solo actualizar si la cantidad ha cambiado
        if (nuevaCantidad !== undefined && nuevaCantidad !== producto.cantidad) {
          console.log('Actualizando producto:', {
            id_tarea: editingProducts.id_tarea,
            id_punto: idPunto,
            cantidad_actual: producto.cantidad,
            nueva_cantidad: nuevaCantidad
          });
          
          await ApiService.actualizarCantidadProductoTareaPorPunto(
            editingProducts.id_tarea,
            idPunto,
            nuevaCantidad
          );
        }
      });

      // Esperar a que todas las actualizaciones se completen
      await Promise.all(actualizaciones);

      setEditingProducts(null);
      setTempProductQuantities({});
      setEditProductsDialogOpen(false);
      
      toast({
        title: "Éxito",
        description: "Los cambios han sido guardados correctamente",
      });
      
      // Recargar las tareas para mostrar los cambios actualizados
      await cargarTareas();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  const guardarEdicion = async () => {
    try {
      // Si hay un reponedor seleccionado (diferente de 'sin_asignar') y la tarea no tenía reponedor
      if (editingTarea.reponedor && editingTarea.reponedor !== 'sin_asignar' && !editingTarea.reponedor_original) {
        // Usamos asignar-reponedor solo cuando la tarea no tenía reponedor previamente
        await ApiService.asignarReponedor(editingTarea.id_tarea, editingTarea.reponedor);
      }
      // Si se está cambiando el reponedor (la tarea ya tenía uno asignado)
      else if (editingTarea.reponedor && editingTarea.reponedor !== 'sin_asignar' && editingTarea.reponedor_original) {
        await ApiService.actualizarReponedor(editingTarea.id_tarea, editingTarea.reponedor);
      }

      // Actualizamos el estado local
    setTareas(tareas.map(tarea => 
        tarea.id_tarea === editingTarea.id_tarea ? {
          ...tarea,
          reponedor: editingTarea.reponedor === 'sin_asignar' ? null : editingTarea.reponedor,
          estado: editingTarea.reponedor === 'sin_asignar' ? 'sin_asignar' : 'pendiente'
        } : tarea
      ));
      
    setEditDialogOpen(false);
    setEditingTarea(null);
    toast({
      title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      let errorMessage = "No se pudo actualizar la tarea.";
      
      // Si es un error 409, probablemente el reponedor ya está asignado a otra tarea
      if (error.message?.includes('409')) {
        errorMessage = "El reponedor seleccionado no está disponible o ya está asignado a otra tarea.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTareaClick = async (tarea: any) => {
    try {
      const response = await ApiService.getTareaById(tarea.id_tarea);
      setSelectedTarea(response);
      setShowDetalleDialog(true);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la tarea",
        variant: "destructive",
      });
    }
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = 
      (tarea.reponedor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         tarea.productos[0].nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarea.estado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado.toLowerCase() === filtroEstado.toLowerCase();
    return matchesSearch && matchesEstado;
  });

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Tareas Asignadas</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Tareas de Reposición</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="sin_asignar">Sin Asignar</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p>Cargando tareas...</p>
              </div>
            ) : filteredTareas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay tareas {filtroEstado !== 'todos' && `en estado ${filtroEstado}`}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTareas.map((tarea) => (
                  <div
                    key={tarea.id_tarea}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleTareaClick(tarea)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          style={{ 
                            backgroundColor: tarea.color_estado,
                            color: 'white'
                          }}
                        >
                          {tarea.estado === 'sin_asignar' ? 'Sin Asignar' :
                           tarea.estado === 'en_progreso' ? 'En Progreso' :
                           tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatearFecha(tarea.fecha_creacion)}
                      </span>
                    </div>
                    <div className="mb-2">
                      {tarea.reponedor ? (
                        <>
                      <span className="font-medium">Reponedor: </span>
                      <span>{tarea.reponedor}</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <UserX className="w-4 h-4" />
                          <span>Sin reponedor asignado</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="font-medium">Productos: </span>
                      <div className="mt-1 space-y-1">
                        {tarea.productos.map((producto, index) => (
                          <div 
                            key={`tarea-${tarea.id_tarea}-${producto.ubicacion.id_punto ? `punto-${producto.ubicacion.id_punto}` : `producto-${producto.id_producto}-${index}`}`} 
                            className="text-sm"
                          >
                            • {producto.nombre} - {producto.cantidad} unidades
                            </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          editarTarea(tarea);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {tarea.reponedor ? 'Editar' : 'Asignar Reponedor'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          editarProductos(tarea);
                        }}
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Editar Productos
                      </Button>
                      {tarea.estado !== 'cancelada' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelarTarea(tarea.id_tarea);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTarea?.reponedor ? 'Editar Tarea' : 'Asignar Reponedor'}
              </DialogTitle>
            </DialogHeader>
            {editingTarea && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reponedor" className="text-right">Reponedor</Label>
                  <Select 
                    value={editingTarea.reponedor || 'sin_asignar'} 
                    onValueChange={(value) => setEditingTarea({
                      ...editingTarea, 
                      reponedor: value === 'sin_asignar' ? null : value,
                      reponedor_original: editingTarea.reponedor
                    })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar reponedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                      {loadingReponedores ? (
                        <SelectItem value="loading" disabled>Cargando reponedores...</SelectItem>
                      ) : (
                        reponedores.map((reponedor) => (
                          <SelectItem key={reponedor.id_usuario} value={reponedor.id_usuario.toString()}>
                            {reponedor.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarEdicion}>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editProductsDialogOpen} onOpenChange={setEditProductsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Productos de la Tarea</DialogTitle>
            </DialogHeader>
            {editingProducts && (
              <div className="space-y-4">
                {editingProducts.productos.map((producto) => {
                  const cantidadActual = tempProductQuantities[producto.ubicacion.id_punto] ?? producto.cantidad;
                  
                  return (
                    <div 
                      key={`punto-${producto.ubicacion.id_punto}`} 
                      className="grid grid-cols-6 items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="col-span-3">
                        <Label>Producto</Label>
                        <p className="text-sm font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Ubicación: Estantería {producto.ubicacion.estanteria}, Nivel {producto.ubicacion.nivel}
                        </p>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            actualizarCantidadTemporal(producto.ubicacion.id_punto, cantidadActual - 1);
                          }}
                          disabled={cantidadActual <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={cantidadActual}
                          onChange={(e) => {
                            const nuevaCantidad = parseInt(e.target.value) || 0;
                            if (nuevaCantidad >= 1) {
                              actualizarCantidadTemporal(producto.ubicacion.id_punto, nuevaCantidad);
                            }
                          }}
                          className="w-20 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            actualizarCantidadTemporal(producto.ubicacion.id_punto, cantidadActual + 1);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingProducts(null);
                  setTempProductQuantities({});
                  setEditProductsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={guardarCambiosCantidad}>
                Confirmar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Tarea</DialogTitle>
            </DialogHeader>
            {selectedTarea && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Tarea</p>
                    <p className="text-lg">{selectedTarea.id_tarea}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge 
                      style={{ backgroundColor: selectedTarea.color_estado }}
                      className="text-white"
                    >
                      {selectedTarea.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                    <p className="text-lg">{new Date(selectedTarea.fecha_creacion).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reponedor</p>
                    <p className="text-lg">{selectedTarea.reponedor || 'Sin asignar'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Productos</h3>
                  <div className="space-y-2">
                    {selectedTarea.productos.map((producto, index) => (
                      <div 
                        key={`detalle-${selectedTarea.id_tarea}-producto-${index}`}
                        className="p-3 border rounded-lg"
                      >
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {producto.cantidad} unidades
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ubicación: Estantería {producto.ubicacion.estanteria}, Nivel {producto.ubicacion.nivel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TareasPage;
