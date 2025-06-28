import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, Trash2, Search, UserX } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import UserForm from '@/components/forms/UserForm';
import { ApiService, Usuario } from '@/services/api';

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

  // Filtrar reponedores
  const filteredReponedores = reponedores.filter(reponedor => {
    const matchesSearch = reponedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reponedor.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || reponedor.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor-dashboard')}
            className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Gestión de Reponedores
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
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold">Reponedores a Cargo</CardTitle>
                  <p className="text-blue-100 mt-1">Gestiona tu equipo de reponedores</p>
                </div>
              </div>
              <UserForm 
                onUserAdded={handleReponedorAdded}
                isSupervisor={true}
                buttonLabel="Nuevo Reponedor"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar reponedores..."
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
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando reponedores...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-100">
                      <TableHead className="font-semibold text-slate-700">Nombre</TableHead>
                      <TableHead className="font-semibold text-slate-700">Email</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReponedores.map((reponedor) => (
                      <TableRow key={reponedor.id_usuario} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{reponedor.nombre}</TableCell>
                        <TableCell className="text-slate-700">{reponedor.correo}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reponedor.estado === 'activo' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {reponedor.estado.charAt(0).toUpperCase() + reponedor.estado.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => verDetalles(reponedor)}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Detalles
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(reponedor)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
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

            {!isLoading && filteredReponedores.length === 0 && (
              <div className="text-center py-8">
                <UserX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No se encontraron reponedores que coincidan con los filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo para ver detalles del reponedor */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="glass border-0 shadow-2xl">
            <DialogHeader className="border-b border-slate-200 pb-4">
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                Detalles del Reponedor
              </DialogTitle>
            </DialogHeader>
            {viewingReponedor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Nombre Completo</Label>
                    <p className="text-sm text-slate-600 mt-1">{viewingReponedor.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Email</Label>
                    <p className="text-sm text-slate-600 mt-1">{viewingReponedor.correo}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Estado</Label>
                  <p className="text-sm text-slate-600 mt-1">{viewingReponedor.estado}</p>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                  <Button 
                    onClick={() => setViewDialogOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
          <DialogContent className="glass border-0 shadow-2xl">
            <DialogHeader className="border-b border-slate-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-red-600">
                Confirmar Eliminación
              </DialogTitle>
            </DialogHeader>
            {userToDelete && (
              <div className="py-4">
                <p className="text-slate-800">¿Estás seguro que deseas eliminar al reponedor <span className="font-semibold">{userToDelete.nombre}</span>?</p>
                <p className="text-sm text-slate-600 mt-2">Esta acción no se puede deshacer.</p>
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setUserToDelete(null);
                    }}
                    className="hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteUser}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
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
