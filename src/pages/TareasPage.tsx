import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Edit, UserX, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ApiService, Tarea, Reponedor } from '@/services/api';

const TareasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingTarea, setEditingTarea] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProductsDialogOpen, setEditProductsDialogOpen] = useState(false);
  const [editingProducts, setEditingProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [reponedores, setReponedores] = useState<Reponedor[]>([]);
  const [loadingReponedores, setLoadingReponedores] = useState(false);
  
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

  const editarProductos = async (tarea) => {
    try {
      const tareaActualizada = await ApiService.getTareaById(tarea.id_tarea);
      setEditingProducts({
        id_tarea: tareaActualizada.id_tarea,
        productos: [...tareaActualizada.productos]
      });
      setEditProductsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la tarea",
        variant: "destructive",
      });
    }
  };

  const actualizarCantidadProducto = async (idProducto: number, nuevaCantidad: number) => {
    try {
      if (nuevaCantidad < 0) {
        throw new Error('La cantidad no puede ser negativa');
      }
      
      await ApiService.actualizarCantidadProductoTarea(editingProducts.id_tarea, idProducto, nuevaCantidad);
      
      // Obtener la tarea actualizada del servidor
      const tareaActualizada = await ApiService.getTareaById(editingProducts.id_tarea);
      
      // Actualizar el estado local de editingProducts
      setEditingProducts({
        ...editingProducts,
        productos: tareaActualizada.productos
      });

      // Actualizar el estado de tareas
      setTareas(tareas.map(tarea => 
        tarea.id_tarea === editingProducts.id_tarea ? tareaActualizada : tarea
      ));

      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del producto ha sido actualizada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la cantidad del producto",
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
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
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
                            key={`tarea-${tarea.id_tarea}-producto-${producto.id_producto || index}`} 
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
                        onClick={() => editarTarea(tarea)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {tarea.reponedor ? 'Editar' : 'Asignar Reponedor'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editarProductos(tarea)}
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Editar Productos
                      </Button>
                      {tarea.estado !== 'cancelada' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelarTarea(tarea.id_tarea)}
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Productos de la Tarea</DialogTitle>
            </DialogHeader>
            {editingProducts && (
              <div className="grid gap-4 py-4" key={`edit-products-${editingProducts.id_tarea}`}>
                <div className="space-y-4">
                  {editingProducts.productos.map((producto, index) => (
                    <div 
                      key={`${editingProducts.id_tarea}-${producto.id_producto || `producto-${index}`}`} 
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
                          onClick={() => actualizarCantidadProducto(producto.id_producto, producto.cantidad - 1)}
                          disabled={producto.cantidad <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => {
                            const nuevaCantidad = parseInt(e.target.value) || 0;
                            if (nuevaCantidad >= 0) {
                              actualizarCantidadProducto(producto.id_producto, nuevaCantidad);
                            }
                          }}
                          className="w-20 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actualizarCantidadProducto(producto.id_producto, producto.cantidad + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEditProductsDialogOpen(false)}>
                    Cerrar
                  </Button>
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
