import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, Trash2, Home, UserPlus, Search, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Logo from '@/components/shared/Logo';
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

  // Función para filtrar reponedores
  const filteredReponedores = reponedores.filter(reponedor => {
    const matchesSearch = reponedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reponedor.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || reponedor.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

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
                  Gestión de Reponedores
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Administra tu equipo de reponedores asignados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/supervisor-dashboard')}
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
              <div className="p-3 bg-success/40 rounded-xl">
                <Users className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Equipo de Reponedores</h2>
                <p className="text-muted-foreground">Gestiona y supervisa a los reponedores bajo tu responsabilidad</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de reponedores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{reponedores.length}</div>
                <div className="metric-label">Total Reponedores</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Asignados</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{reponedores.filter(r => r.estado === 'activo').length}</div>
                <div className="metric-label">Activos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Disponibles</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-warning/25 to-warning/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-warning/40 rounded-full group-hover:bg-warning/50 transition-all duration-300">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <div className="metric-value text-warning">{reponedores.filter(r => r.estado === 'inactivo').length}</div>
                <div className="metric-label">Inactivos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Pausados</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-info/15 to-info/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-info/30 rounded-full group-hover:bg-info/40 transition-all duration-300">
                    <UserCheck className="w-8 h-8 text-info" />
                  </div>
                </div>
                <div className="metric-value text-info">{Math.round((reponedores.filter(r => r.estado === 'activo').length / reponedores.length) * 100) || 0}%</div>
                <div className="metric-label">Tasa de Actividad</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-info/20 text-info border border-info/40 px-2 py-1 rounded-md text-xs font-medium">📊 Rendimiento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de reponedores */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-success/30 rounded-xl">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Reponedores a Cargo</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona tu equipo de trabajo</p>
                  </div>
                </div>
                <UserForm 
                  onUserAdded={handleReponedorAdded}
                  isSupervisor={true}
                  buttonLabel="Nuevo Reponedor"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar reponedores por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48 border-2 border-primary/20 focus:border-primary/50">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <p className="text-muted-foreground">Cargando reponedores...</p>
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
                )}
              </div>
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
        </main>
      </div>
    </>
  );
};

export default ReponedoresPage;
