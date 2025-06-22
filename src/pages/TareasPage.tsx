import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Tarea } from '@/services/api';

const TareasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingTarea, setEditingTarea] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  
  useEffect(() => {
    cargarTareas();
  }, [filtroEstado]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const tareasResponse = await ApiService.getTareasSupervisor(filtroEstado);
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

  const cancelarTarea = (id: number) => {
    setTareas(tareas.map(tarea => {
      if (tarea.id_tarea === id) {
        return { ...tarea, estado: 'Cancelada' };
      }
      return tarea;
    }));
    toast({
      title: "Tarea cancelada",
      description: "La tarea ha sido cancelada exitosamente",
    });
  };

  const editarTarea = (tarea) => {
    setEditingTarea(tarea);
    setEditDialogOpen(true);
  };

  const guardarEdicion = () => {
    setTareas(tareas.map(tarea => 
      tarea.id_tarea === editingTarea.id_tarea ? editingTarea : tarea
    ));
    setEditDialogOpen(false);
    setEditingTarea(null);
    toast({
      title: "Tarea actualizada",
      description: `La tarea de ${editingTarea.productos[0].nombre} ha sido actualizada`,
    });
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = tarea.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.productos[0].nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.estado.toLowerCase().includes(filtroEstado.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado.toLowerCase() === filtroEstado;
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

      <main className="container mx-auto px-4 py-8 flex-1">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <CardTitle>Lista de Tareas</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Select
                  value={filtroEstado}
                  onValueChange={setFiltroEstado}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Cargando tareas...</p>
              </div>
            ) : tareas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay tareas {filtroEstado && `en estado ${filtroEstado}`}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tareas.map((tarea) => (
                  <div
                    key={tarea.id_tarea}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tarea.color_estado }}
                        />
                        <span className="font-medium capitalize">{tarea.estado}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatearFecha(tarea.fecha_creacion)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Reponedor: </span>
                      <span>{tarea.reponedor}</span>
                    </div>
                    <div>
                      <span className="font-medium">Productos:</span>
                      <ul className="mt-2 space-y-2">
                        {tarea.productos.map((producto, index) => (
                          <li key={index} className="flex items-center justify-between text-sm">
                            <span>{producto.nombre}</span>
                            <div className="text-right">
                              <span className="font-medium">{producto.cantidad} unidades</span>
                              <span className="text-muted-foreground block">
                                Est. {producto.ubicacion.estanteria}, Nivel {producto.ubicacion.nivel}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para editar tarea */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Tarea</DialogTitle>
            </DialogHeader>
            {editingTarea && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reponedor" className="text-right">Reponedor</Label>
                  <Select value={editingTarea.reponedor} onValueChange={(value) => setEditingTarea({...editingTarea, reponedor: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carlos Martínez">Carlos Martínez</SelectItem>
                      <SelectItem value="Ana López">Ana López</SelectItem>
                      <SelectItem value="Miguel Santos">Miguel Santos</SelectItem>
                      <SelectItem value="Laura Pérez">Laura Pérez</SelectItem>
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
      </main>
    </div>
  );
};

export default TareasPage;
