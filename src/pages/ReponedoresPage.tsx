import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import UserForm from '@/components/forms/UserForm';
import { ApiService, Usuario } from '@/services/api';

const ReponedoresPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reponedores, setReponedores] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
              <UserForm 
                onUserAdded={handleReponedorAdded}
                isSupervisor={true}
                buttonLabel="Nuevo Reponedor"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando reponedores...</p>
              </div>
            ) : (
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
                  {reponedores.map((reponedor) => (
                    <TableRow key={reponedor.id_usuario}>
                      <TableCell className="font-medium">{reponedor.nombre}</TableCell>
                      <TableCell>{reponedor.correo}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reponedor.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
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
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalles
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(reponedor)}
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

        {/* Diálogo para ver detalles del reponedor */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Reponedor</DialogTitle>
            </DialogHeader>
            {viewingReponedor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Nombre Completo</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email</Label>
                    <p className="text-sm text-muted-foreground">{viewingReponedor.correo}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Estado</Label>
                  <p className="text-sm text-muted-foreground">{viewingReponedor.estado}</p>
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

        {/* Diálogo de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            {userToDelete && (
              <div className="py-4">
                <p>¿Estás seguro que deseas eliminar al reponedor {userToDelete.nombre}?</p>
                <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
                <div className="flex justify-end space-x-2 mt-4">
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ReponedoresPage;
