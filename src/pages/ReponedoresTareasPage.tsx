import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, Home, CheckCircle2, Clock, AlertTriangle, ClipboardList, Target, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/Logo';

interface Tarea {
  id: number;
  producto: string;
  area: string;
  cantidad: number;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Progreso' | 'Completada';
  fechaAsignacion: string;
  fechaLimite: string;
  supervisor: string;
}

const ReponedoresTareasPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [tareas, setTareas] = useState<Tarea[]>([
    { id: 1, producto: 'Leche Entera 1L', area: 'Lácteos', cantidad: 24, prioridad: 'Alta', estado: 'Pendiente', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 14:00', supervisor: 'María García' },
    { id: 2, producto: 'Manzanas Rojas', area: 'Frutas y Verduras', cantidad: 50, prioridad: 'Media', estado: 'En Progreso', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 16:00', supervisor: 'Juan Pérez' },
    { id: 3, producto: 'Pan Integral', area: 'Panadería', cantidad: 30, prioridad: 'Baja', estado: 'Completada', fechaAsignacion: '2024-01-14', fechaLimite: '2024-01-15 10:00', supervisor: 'Ana López' },
    { id: 4, producto: 'Pollo Entero', area: 'Carnicería', cantidad: 15, prioridad: 'Alta', estado: 'En Progreso', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 12:00', supervisor: 'Carlos Ruiz' },
    { id: 5, producto: 'Yogurt Natural', area: 'Lácteos', cantidad: 40, prioridad: 'Media', estado: 'Pendiente', fechaAsignacion: '2024-01-15', fechaLimite: '2024-01-15 18:00', supervisor: 'María García' },
  ]);

  const completarTarea = (id: number) => {
    setTareas(tareas.map(tarea => {
      if (tarea.id === id) {
        return { ...tarea, estado: 'Completada' as const };
      }
      return tarea;
    }));
    toast({
      title: "Tarea completada",
      description: "La tarea ha sido marcada como completada",
    });
  };

  const iniciarTarea = (id: number) => {
    setTareas(tareas.map(tarea => {
      if (tarea.id === id) {
        return { ...tarea, estado: 'En Progreso' as const };
      }
      return tarea;
    }));
    toast({
      title: "Tarea iniciada",
      description: "La tarea ha sido marcada como en progreso",
    });
  };

  const filteredTareas = tareas.filter(tarea => {
    const matchesSearch = tarea.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarea.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || tarea.estado.toLowerCase().replace(' ', '') === filtroEstado;
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
                  Mis Tareas
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Gestiona y completa tus tareas de reposición asignadas
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
                <h2 className="text-xl font-bold text-foreground">Panel de Tareas del Reponedor</h2>
                <p className="text-muted-foreground">Administra y completa tus tareas de reposición de manera eficiente</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de tareas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <span className="badge-primary">Asignadas</span>
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
                <div className="metric-value text-success">{tareas.filter(t => t.estado === 'Completada').length}</div>
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
                <div className="metric-value text-warning">{tareas.filter(t => t.estado === 'En Progreso').length}</div>
                <div className="metric-label">En Progreso</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Activas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-destructive/15 to-destructive/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-destructive/30 rounded-full group-hover:bg-destructive/40 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="metric-value text-destructive">{tareas.filter(t => t.prioridad === 'Alta').length}</div>
                <div className="metric-label">Alta Prioridad</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-destructive/20 text-destructive border border-destructive/40 px-2 py-1 rounded-md text-xs font-medium">⚠ Urgente</span>
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
                    <Target className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Tareas de Reposición</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Completa tus tareas asignadas</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar tareas por producto, área o supervisor..."
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
                    <SelectItem value="enprogreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTareas.map((tarea) => (
                      <TableRow key={tarea.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">{tarea.producto}</TableCell>
                        <TableCell>{tarea.area}</TableCell>
                        <TableCell>{tarea.cantidad}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              tarea.prioridad === 'Alta' ? 'bg-destructive/20 text-destructive border-destructive/40' :
                              tarea.prioridad === 'Media' ? 'bg-warning/20 text-warning border-warning/40' :
                              'bg-success/20 text-success border-success/40'
                            }
                          >
                            {tarea.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              tarea.estado === 'Completada' ? 'bg-success/20 text-success border-success/40' :
                              tarea.estado === 'En Progreso' ? 'bg-warning/20 text-warning border-warning/40' :
                              'bg-muted/20 text-muted-foreground border-muted/40'
                            }
                          >
                            {tarea.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{tarea.supervisor}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tarea.fechaLimite}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {tarea.estado === 'Pendiente' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => iniciarTarea(tarea.id)}
                                className="border-2 border-warning/30 hover:bg-warning/10 hover:border-warning/50 transition-all duration-200"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            {tarea.estado === 'En Progreso' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => completarTarea(tarea.id)}
                                className="border-2 border-success/30 hover:bg-success/10 hover:border-success/50 transition-all duration-200"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completar
                              </Button>
                            )}
                            {tarea.estado === 'Completada' && (
                              <Badge variant="outline" className="bg-success/20 text-success border-success/40">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Finalizada
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default ReponedoresTareasPage;
