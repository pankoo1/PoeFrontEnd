import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TareaForm from '../components/forms/TareaForm';

const AdminTareasPage = () => {
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
              <ClipboardList className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Gestión de Tareas
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-semibold">Tareas de Reposición</CardTitle>
              </div>
              <TareaForm />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
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
                  <SelectItem value="cancelada">Cancelada</SelectItem>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tarea.prioridad === 'Alta' ? 'bg-red-100 text-red-700 border border-red-200' :
                          tarea.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {tarea.prioridad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tarea.estado === 'Completada' ? 'bg-green-100 text-green-700 border border-green-200' :
                          tarea.estado === 'En Progreso' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          tarea.estado === 'Pendiente' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {tarea.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-700">{tarea.fechaLimite}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editarTarea(tarea)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => cancelarTarea(tarea.id)}
                            className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para editar tarea */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] glass border-0 shadow-2xl">
            <DialogHeader className="border-b border-slate-200 pb-4">
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                Editar Tarea
              </DialogTitle>
            </DialogHeader>
            {editingTarea && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reponedor" className="text-right font-medium text-slate-700">Reponedor</Label>
                  <Select value={editingTarea.reponedor} onValueChange={(value) => setEditingTarea({...editingTarea, reponedor: value})}>
                    <SelectTrigger className="col-span-3 border-slate-300 focus:border-blue-500">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-producto" className="text-right font-medium text-slate-700">Producto</Label>
                  <Input
                    id="edit-producto"
                    value={editingTarea.producto}
                    onChange={(e) => setEditingTarea({...editingTarea, producto: e.target.value})}
                    className="col-span-3 border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-area" className="text-right font-medium text-slate-700">Área</Label>
                  <Select value={editingTarea.area} onValueChange={(value) => setEditingTarea({...editingTarea, area: value})}>
                    <SelectTrigger className="col-span-3 border-slate-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lácteos">Lácteos</SelectItem>
                      <SelectItem value="Frutas y Verduras">Frutas y Verduras</SelectItem>
                      <SelectItem value="Panadería">Panadería</SelectItem>
                      <SelectItem value="Carnicería">Carnicería</SelectItem>
                      <SelectItem value="Bebidas">Bebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cantidad" className="text-right font-medium text-slate-700">Cantidad</Label>
                  <Input
                    id="edit-cantidad"
                    type="number"
                    value={editingTarea.cantidad}
                    onChange={(e) => setEditingTarea({...editingTarea, cantidad: parseInt(e.target.value)})}
                    className="col-span-3 border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-prioridad" className="text-right font-medium text-slate-700">Prioridad</Label>
                  <Select value={editingTarea.prioridad} onValueChange={(value) => setEditingTarea({...editingTarea, prioridad: value})}>
                    <SelectTrigger className="col-span-3 border-slate-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-estado" className="text-right font-medium text-slate-700">Estado</Label>
                  <Select value={editingTarea.estado} onValueChange={(value) => setEditingTarea({...editingTarea, estado: value})}>
                    <SelectTrigger className="col-span-3 border-slate-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-fecha" className="text-right font-medium text-slate-700">Fecha Límite</Label>
                  <Input
                    id="edit-fecha"
                    value={editingTarea.fechaLimite}
                    onChange={(e) => setEditingTarea({...editingTarea, fechaLimite: e.target.value})}
                    className="col-span-3 border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="hover:bg-slate-50">
                    Cancelar
                  </Button>
                  <Button onClick={guardarEdicion} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
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

export default AdminTareasPage;
