import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, Search, Edit, Users as UsersIcon } from 'lucide-react';
import UserForm from '@/components/forms/UserForm';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { ApiService, Usuario } from '@/services/api';

const Users = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Lista de Usuarios</CardTitle>
              </div>
              <UserForm onUserAdded={handleUserAdded} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando usuarios...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id_usuario}>
                      <TableCell className="font-medium">{user.nombre}</TableCell>
                      <TableCell>{user.correo}</TableCell>
                      <TableCell>{user.rol}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-700"
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
            )}
          </CardContent>
        </Card>

        {/* Diálogo de edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingUser?.nombre || ''}
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, nombre: e.target.value} : null)}
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
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarEdicion}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>¿Estás seguro que deseas eliminar al usuario {userToDelete?.nombre}?</p>
              <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
              >
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Users;
