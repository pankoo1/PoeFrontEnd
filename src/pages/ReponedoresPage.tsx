
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Eye, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ReponedorForm from '../components/forms/ReponedorForm';

const ReponedoresPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingReponedor, setViewingReponedor] = useState(null);
  const [editingReponedor, setEditingReponedor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [reponedores, setReponedores] = useState([
    { id: 1, name: 'Carlos Martínez', email: 'carlos@empresa.com', telefono: '+123456789', area: 'Lácteos', estado: 'Activo', tareasAsignadas: 5, supervisor: 'María González', fechaIngreso: '2023-03-15' },
    { id: 2, name: 'Ana López', email: 'ana@empresa.com', telefono: '+123456788', area: 'Frutas y Verduras', estado: 'Activo', tareasAsignadas: 3, supervisor: 'María González', fechaIngreso: '2023-05-20' },
    { id: 3, name: 'Miguel Santos', email: 'miguel@empresa.com', telefono: '+123456787', area: 'Panadería', estado: 'En Descanso', tareasAsignadas: 0, supervisor: 'María González', fechaIngreso: '2023-01-10' },
    { id: 4, name: 'Laura Pérez', email: 'laura@empresa.com', telefono: '+123456786', area: 'Carnicería', estado: 'Activo', tareasAsignadas: 2, supervisor: 'María González', fechaIngreso: '2023-07-08' },
  ]);

  const verDetalles = (reponedor) => {
    setViewingReponedor(reponedor);
    setViewDialogOpen(true);
  };

  const editarReponedor = (reponedor) => {
    setEditingReponedor(reponedor);
    setEditDialogOpen(true);
  };

  const guardarEdicion = () => {
    setReponedores(reponedores.map(reponedor => 
      reponedor.id === editingReponedor.id ? editingReponedor : reponedor
    ));
    setEditDialogOpen(false);
    setEditingReponedor(null);
    toast({
      title: "Reponedor actualizado",
      description: `La información de ${editingReponedor.name} ha sido actualizada`,
    });
  };

  const filteredReponedores = reponedores.filter(reponedor =>
    reponedor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reponedor.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold">Gestión de Reponedores</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Reponedores a Cargo</CardTitle>
              </div>
              <ReponedorForm />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar reponedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tareas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReponedores.map((reponedor) => (
                  <TableRow key={reponedor.id}>
                    <TableCell className="font-medium">{reponedor.name}</TableCell>
                    <TableCell>{reponedor.email}</TableCell>
                    <TableCell>{reponedor.telefono}</TableCell>
                    <TableCell>{reponedor.area}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reponedor.estado === 'Activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reponedor.estado}
                      </span>
                    </TableCell>
                    <TableCell>{reponedor.tareasAsignadas}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => verDetalles(reponedor)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => editarReponedor(reponedor)}
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

        {/* Dialog para ver detalles del reponedor */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Reponedor</DialogTitle>
            </DialogHeader>
            {viewingReponedor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Nombre Completo</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Teléfono</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.telefono}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Área Asignada</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.area}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Estado</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.estado}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Tareas Asignadas</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.tareasAsignadas}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Supervisor</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.supervisor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Fecha de Ingreso</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.fechaIngreso}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setViewDialogOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para editar reponedor */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Reponedor</DialogTitle>
            </DialogHeader>
            {editingReponedor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                  <Input
                    id="edit-name"
                    value={editingReponedor.name}
                    onChange={(e) => setEditingReponedor({...editingReponedor, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input
                    id="edit-email"
                    value={editingReponedor.email}
                    onChange={(e) => setEditingReponedor({...editingReponedor, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-telefono" className="text-right">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={editingReponedor.telefono}
                    onChange={(e) => setEditingReponedor({...editingReponedor, telefono: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-area" className="text-right">Área</Label>
                  <Select value={editingReponedor.area} onValueChange={(value) => setEditingReponedor({...editingReponedor, area: value})}>
                    <SelectTrigger className="col-span-3">
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
                  <Label htmlFor="edit-estado" className="text-right">Estado</Label>
                  <Select value={editingReponedor.estado} onValueChange={(value) => setEditingReponedor({...editingReponedor, estado: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="En Descanso">En Descanso</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
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

export default ReponedoresPage;
