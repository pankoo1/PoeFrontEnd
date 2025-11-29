import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, Search, Edit, Users as UsersIcon, UserPlus, Home } from 'lucide-react';
import UserForm from '@/components/forms/UserForm';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { ApiService, Usuario } from '@/services/api';
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/shared/Logo';

const Users = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const loadedUsers = await ApiService.getUsuarios();
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los usuarios. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAdded = async (newUser: Usuario) => {
    // Asegurarnos de que el nuevo usuario tenga todos los campos necesarios
    const userWithRole = {
      ...newUser,
      rol: newUser.rol || 'Reponedor' // Valor por defecto en caso de que no venga
    };
    
    setUsers(prevUsers => [...prevUsers, userWithRole]);
    
    // Forzar una actualización de la tabla
    await loadUsers();
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
      setUsers(prevUsers => prevUsers.filter(user => user.id_usuario !== userToDelete.id_usuario));
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });

      // Cerrar el diálogo y limpiar el usuario seleccionado
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);

      // Recargar la lista de usuarios
      await loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast({
        title: "Error al eliminar usuario",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const guardarEdicion = async () => {
    if (!editingUser) return;

    try {
      const userData = {
        nombre: editingUser.nombre,
        correo: editingUser.correo,
        rol: editingUser.rol,
        estado: editingUser.estado
      };

      const usuarioActualizado = await ApiService.updateUsuario(editingUser.id_usuario, userData);
      
      // Actualizar el estado local inmediatamente
      setUsers(prevUsers => prevUsers.map(user => 
        user.id_usuario === editingUser.id_usuario 
          ? { ...usuarioActualizado, rol: usuarioActualizado.rol } 
          : user
      ));
      
      // Forzar una recarga de los datos
      await loadUsers();
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente",
      });
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast({
        title: "Error al actualizar usuario",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar el usuario",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Gestión de Usuarios
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Administra el personal del supermercado
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
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
              <div className="p-3 bg-secondary/40 rounded-xl">
                <UsersIcon className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Gestión de Usuarios</h2>
                <p className="text-muted-foreground">Registra, edita y administra supervisores y reponedores del sistema</p>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <UsersIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{users.length}</div>
                <div className="metric-label">Total Usuarios</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Registrados</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-secondary/15 to-secondary/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-secondary/30 rounded-full group-hover:bg-secondary/40 transition-all duration-300">
                    <UserPlus className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="metric-value text-secondary">{users.filter(u => u.estado === 'activo').length}</div>
                <div className="metric-label">Usuarios Activos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-secondary">En servicio</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-accent/25 to-accent/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-accent/40 rounded-full group-hover:bg-accent/50 transition-all duration-300">
                    <UsersIcon className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="metric-value text-accent">{users.filter(u => u.rol === 'Supervisor').length}</div>
                <div className="metric-label">Supervisores</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-accent">Líderes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de usuarios */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/30 rounded-xl">
                    <UsersIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Lista de Usuarios</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona el personal del supermercado</p>
                  </div>
                </div>
                <UserForm onUserAdded={handleUserAdded} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar usuarios por nombre, email o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-primary/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5">
                        <TableHead className="font-semibold">Nombre</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Rol</TableHead>
                        <TableHead className="font-semibold">Estado</TableHead>
                        <TableHead className="font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id_usuario} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">{user.nombre}</TableCell>
                          <TableCell>{user.correo}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.rol === 'Supervisor' 
                                ? 'bg-accent/20 text-accent border border-accent/40' 
                                : 'bg-secondary/20 text-secondary border border-secondary/40'
                            }`}>
                              {user.rol}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.estado === 'activo' 
                                ? 'bg-success/20 text-success border border-success/40' 
                                : 'bg-destructive/20 text-destructive border border-destructive/40'
                            }`}>
                              {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                                className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 text-destructive transition-all duration-200"
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

        {/* Diálogo de edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingUser?.nombre || ''}
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, nombre: e.target.value} : null)}
                  className="border-2 border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser?.correo || ''}
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, correo: e.target.value} : null)}
                  className="border-2 border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select 
                  value={editingUser?.rol || ''} 
                  onValueChange={(value) => {
                    setEditingUser(prev => prev ? {
                      ...prev,
                      rol: value === 'Supervisor' ? 'Supervisor' : 'Reponedor'
                    } : null)
                  }}
                  required
                >
                  <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Reponedor">Reponedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select 
                  value={editingUser?.estado || ''} 
                  onValueChange={(value) => setEditingUser(prev => prev ? {...prev, estado: value} : null)}
                  required
                >
                  <SelectTrigger className="border-2 border-primary/20 focus:border-primary/50">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-2 border-primary/30 hover:bg-primary/10"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={guardarEdicion}
                  className="bg-primary hover:bg-primary/90"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-destructive">Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-foreground font-medium">¿Estás seguro que deseas eliminar al usuario <span className="font-bold">{userToDelete?.nombre}</span>?</p>
              <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer y eliminará permanentemente todos los datos del usuario.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                className="border-2 border-primary/30 hover:bg-primary/10"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </>
  );
};

export default Users;
