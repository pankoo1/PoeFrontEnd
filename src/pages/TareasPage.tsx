import React, { useState } from 'react';
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

const TareasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingTarea, setEditingTarea] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [tareas, setTareas] = useState([
    { id: 1, reponedor: 'Carlos Martínez', producto: 'Leche Entera 1L', area: 'Lácteos', cantidad: 24, prioridad: 'Alta', estado: 'Pendiente', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 14:00' },
    { id: 2, reponedor: 'Ana López', producto: 'Manzanas Rojas', area: 'Frutas y Verduras', cantidad: 50, prioridad: 'Media', estado: 'En Progreso', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 16:00' },
    { id: 3, reponedor: 'Miguel Santos', producto: 'Pan Integral', area: 'Panadería', cantidad: 30, prioridad: 'Baja', estado: 'Completada', fechaAsignacion: '2024-01-14', fechaLimite: '2024-01-15 10:00' },
    { id: 4, reponedor: 'Laura Pérez', producto: 'Pollo Entero', area: 'Carnicería', cantidad: 15, prioridad: 'Alta', estado: 'En Progreso', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 12:00' },
  ]);

  const cancelarTarea = (id: number) => {
    setTareas(tareas.map(tarea => {
      if (tarea.id === id) {
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
      tarea.id === editingTarea.id ? editingTarea : tarea
    ));
    setEditDialogOpen(false);
    setEditingTarea(null);
    toast({
      title: "Tarea actualizada",
      description: `La tarea de ${editingTarea.producto} ha sido actualizada`,
    });
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = tarea.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado.toLowerCase() === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reponedor</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTareas.map((tarea) => (
                  <TableRow key={tarea.id}>
                    <TableCell className="font-medium">{tarea.reponedor}</TableCell>
                    <TableCell>{tarea.producto}</TableCell>
                    <TableCell>{tarea.area}</TableCell>
                    <TableCell>{tarea.cantidad}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tarea.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                        tarea.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tarea.prioridad}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tarea.estado === 'Completada' ? 'bg-green-100 text-green-800' :
                        tarea.estado === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tarea.estado}
                      </span>
                    </TableCell>
                    <TableCell>{tarea.fechaLimite}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => editarTarea(tarea)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
