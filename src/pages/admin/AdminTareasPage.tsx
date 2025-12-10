import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Search, Home, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/shared/Logo';
import { ApiService } from '@/services/api';

const AdminTareasPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [tareas, setTareas] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [errorTareas, setErrorTareas] = useState<string | null>(null);

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = tarea.supervisor_a_cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.producto?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado?.toLowerCase() === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  // Cargar tareas del backend al montar el componente
  useEffect(() => {
    const cargarTareas = async () => {
      setLoadingTareas(true);
      setErrorTareas(null);
      try {
        const tareasData = await ApiService.getAllTareas();
        setTareas(tareasData);
      } catch (error: any) {
        setErrorTareas('No se pudieron cargar las tareas');
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas del sistema",
          variant: "destructive",
        });
      } finally {
        setLoadingTareas(false);
      }
    };

    cargarTareas();
  }, []);

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
                  Gestión de Tareas (Admin)
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Panel administrativo para gestionar todas las tareas del sistema
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
              <div className="p-3 bg-warning/40 rounded-xl">
                <ClipboardList className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Control Administrativo</h2>
                <p className="text-muted-foreground">Administra, crea y supervisa todas las tareas de reposición del supermercado</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de tareas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <ClipboardList className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{tareas.length}</div>
                <div className="metric-label">Total Tareas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Sistema</span>
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
                <div className="metric-value text-success">{tareas.filter(t => t.estado?.toLowerCase() === 'completada').length}</div>
                <div className="metric-label">Completadas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Finalizadas</span>
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
                <div className="metric-value text-warning">{tareas.filter(t => t.estado?.toLowerCase() === 'en progreso' || t.estado?.toLowerCase() === 'enprogreso').length}</div>
                <div className="metric-label">En Progreso</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Activas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de tareas */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-warning/30 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Tareas de Reposición</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Administra todas las tareas del sistema</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar tareas por supervisor a cargo o producto..."
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
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supervisor a Cargo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTareas ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span>Cargando tareas...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : errorTareas ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-destructive">
                          {errorTareas}
                        </TableCell>
                      </TableRow>
                    ) : filteredTareas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No se encontraron tareas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTareas.map((tarea) => (
                        <TableRow key={tarea.id} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">{tarea.supervisor_a_cargo || 'Sin asignar'}</TableCell>
                          <TableCell>{tarea.producto || 'Sin producto'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                tarea.estado?.toLowerCase() === 'completada' ? 'bg-success/20 text-success border-success/40' :
                                tarea.estado?.toLowerCase() === 'en progreso' || tarea.estado?.toLowerCase() === 'enprogreso' ? 'bg-warning/20 text-warning border-warning/40' :
                                tarea.estado?.toLowerCase() === 'cancelada' ? 'bg-destructive/20 text-destructive border-destructive/40' :
                                'bg-muted/20 text-muted-foreground border-muted/40'
                              }
                            >
                              {tarea.estado || 'Sin estado'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </>
  );
};

export default AdminTareasPage;
