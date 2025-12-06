import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Edit, Users as UsersIcon, UserPlus, Trash2 } from 'lucide-react';
import UserForm from '@/components/forms/UserForm';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Usuario } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';

const Users = () => {
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
      const currentUserId = ApiService.getCurrentUserId();
      // No mostrar al usuario de la sesión en la tabla
      const filtered = currentUserId
        ? loadedUsers.filter(user => user.id_usuario !== currentUserId)
        : loadedUsers;
      setUsers(filtered);
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
    
    setUsers(prevUsers => {
      const currentUserId = ApiService.getCurrentUserId();
      const next = [...prevUsers, userWithRole];
      return currentUserId ? next.filter(u => u.id_usuario !== currentUserId) : next;
    });
    
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
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-600 mt-1">Administra el personal del supermercado</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Usuarios Activos</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">
                    {users.filter(u => u.estado === 'activo').length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Supervisores</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">
                    {users.filter(u => u.rol === 'Supervisor').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de usuarios */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">Lista de Usuarios</CardTitle>
              <UserForm onUserAdded={handleUserAdded} />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Barra de búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios por nombre, email o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Nombre</TableHead>
                      <TableHead className="font-semibold text-slate-700">Email</TableHead>
                      <TableHead className="font-semibold text-slate-700">Rol</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id_usuario} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">{user.nombre}</TableCell>
                        <TableCell className="text-slate-600">{user.correo}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.rol === 'Supervisor' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.rol}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.estado === 'activo' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
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
                              className="border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              className="border-slate-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
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

        {/* Diálogos de edición y eliminación */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingUser?.nombre || ''}
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, nombre: e.target.value} : null)}
                  className="border-slate-200 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser?.correo || ''}
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, correo: e.target.value} : null)}
                  className="border-slate-200 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-medium text-slate-700">Rol</Label>
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
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Reponedor">Reponedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium text-slate-700">Estado</Label>
                <Select 
                  value={editingUser?.estado || ''} 
                  onValueChange={(value) => setEditingUser(prev => prev ? {...prev, estado: value} : null)}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
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
                  className="border-slate-200 hover:bg-slate-50"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={guardarEdicion}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-600">Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-900 font-medium">¿Estás seguro que deseas eliminar al usuario <span className="font-bold">{userToDelete?.nombre}</span>?</p>
              <p className="text-sm text-slate-600 mt-2">Esta acción no se puede deshacer y eliminará permanentemente todos los datos del usuario.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Users;
