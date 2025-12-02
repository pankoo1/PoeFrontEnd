import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Trash2, UserPlus, Search, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import UserForm from '@/components/forms/UserForm';
import { ApiService, Usuario } from '@/services/api';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

const ReponedoresPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reponedores, setReponedores] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReponedor, setViewingReponedor] = useState<Usuario | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    loadReponedores();
  }, []);

  const loadReponedores = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getUsuarios();
      setReponedores(response);
    } catch (error) {
      console.error('Error al cargar reponedores:', error);
      toast({
        title: "Error al cargar reponedores",
        description: "No se pudieron cargar los reponedores. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReponedorAdded = async (newUser: Usuario) => {
    // Actualizar la lista inmediatamente con el nuevo reponedor
    setReponedores(prevReponedores => [...prevReponedores, newUser]);
    // Recargar la lista completa para asegurar sincronización
    await loadReponedores();
  };

  const verDetalles = (reponedor: Usuario) => {
    setViewingReponedor(reponedor);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (user: Usuario) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await ApiService.deleteUsuario(userToDelete.id_usuario);
      
      // Actualizar el estado local
      setReponedores(prevUsers => prevUsers.filter(user => user.id_usuario !== userToDelete.id_usuario));
      
      toast({
        title: "Reponedor eliminado",
        description: "El reponedor ha sido eliminado exitosamente",
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error al eliminar reponedor:', error);
      toast({
        title: "Error al eliminar reponedor",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al eliminar el reponedor",
        variant: "destructive",
      });
    }
  };

  // Función para filtrar reponedores
  const filteredReponedores = reponedores.filter(reponedor => {
    const matchesSearch = reponedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reponedor.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || reponedor.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <SupervisorLayout>
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Reponedores</h1>
          <p className="text-sm text-slate-600">Administra tu equipo de reponedores</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Reponedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Reponedor</DialogTitle>
            </DialogHeader>
            <UserForm onUserAdded={handleReponedorAdded} />
          </DialogContent>
        </Dialog>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Filtros */}
        <Card className="mb-6 border-slate-100 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar reponedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de reponedores */}
        <Card className="border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Lista de Reponedores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-slate-600">Cargando reponedores...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReponedores.map((reponedor) => (
                        <TableRow key={reponedor.id_usuario} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4 text-muted-foreground" />
                              <span>{reponedor.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{reponedor.correo}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                reponedor.estado === 'activo' 
                                  ? 'bg-success/20 text-success border-success/40' 
                                  : 'bg-destructive/20 text-destructive border-destructive/40'
                              }
                            >
                              {reponedor.estado.charAt(0).toUpperCase() + reponedor.estado.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verDetalles(reponedor)}
                                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Detalles
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteClick(reponedor)}
                                className="border-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200 text-destructive"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </Button>
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

          {/* Diálogo para ver detalles del reponedor */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Detalles del Reponedor</DialogTitle>
              </DialogHeader>
              {viewingReponedor && (
                <div className="grid gap-6 py-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{viewingReponedor.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{viewingReponedor.correo}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-card to-card/80 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">ID Usuario</Label>
                      <p className="text-lg font-medium">{viewingReponedor.id_usuario}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-card to-card/80 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">Estado</Label>
                      <div className="mt-2">
                        <Badge 
                          variant="outline"
                          className={
                            viewingReponedor.estado === 'activo' 
                              ? 'bg-success/20 text-success border-success/40' 
                              : 'bg-destructive/20 text-destructive border-destructive/40'
                          }
                        >
                          {viewingReponedor.estado.charAt(0).toUpperCase() + viewingReponedor.estado.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setViewDialogOpen(false)}
                      className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Diálogo de confirmación de eliminación */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
              </DialogHeader>
              {userToDelete && (
                <div className="py-4">
                  <div className="flex items-center space-x-4 p-4 bg-destructive/5 rounded-lg mb-4">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <div>
                      <p className="font-medium">¿Estás seguro que deseas eliminar al reponedor <strong>{userToDelete.nombre}</strong>?</p>
                      <p className="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteDialogOpen(false);
                        setUserToDelete(null);
                      }}
                      className="border-2 border-muted/30 hover:bg-muted/10 hover:border-muted/50 transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteUser}
                      className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
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

export default ReponedoresPage;
