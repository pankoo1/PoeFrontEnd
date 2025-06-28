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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4 button-modern hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="card-modern shadow-modern">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <UsersIcon className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Lista de Usuarios</CardTitle>
                  <p className="text-gray-600 mt-1">{filteredUsers.length} usuarios registrados</p>
                </div>
              </div>
              <UserForm onUserAdded={handleUserAdded} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Nombre</TableHead>
                      <TableHead className="font-semibold text-gray-900">Email</TableHead>
                      <TableHead className="font-semibold text-gray-900">Rol</TableHead>
                      <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id_usuario} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{user.nombre}</TableCell>
                        <TableCell className="text-gray-600">{user.correo}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.rol === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="button-modern border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              className="button-modern border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
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
