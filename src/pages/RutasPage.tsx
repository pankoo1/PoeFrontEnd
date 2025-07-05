import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Route, Search, Eye, Home, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import Logo from '@/components/Logo';

const RutasPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [rutas] = useState([
    { 
      id: 1, 
      nombre: 'Ruta Pasillo A-B', 
      reponedor: 'Carlos Martínez', 
      pasillos: ['Pasillo A - Lácteos', 'Pasillo B - Panadería'], 
      estado: 'En Ejecución',
      progreso: 66,
      horaInicio: '08:00',
      horaEstimadaFin: '10:30',
      ubicacionActual: 'Pasillo A - Lácteos'
    },
    { 
      id: 2, 
      nombre: 'Ruta Pasillo C-D', 
      reponedor: 'Ana López', 
      pasillos: ['Pasillo C - Frutas y Verduras', 'Pasillo D - Bebidas'], 
      estado: 'Pendiente',
      progreso: 0,
      horaInicio: '09:00',
      horaEstimadaFin: '11:00',
      ubicacionActual: 'Almacén'
    },
    { 
      id: 3, 
      nombre: 'Ruta Pasillo E', 
      reponedor: 'Miguel Santos', 
      pasillos: ['Pasillo E - Carnes'], 
      estado: 'Completada',
      progreso: 100,
      horaInicio: '07:00',
      horaEstimadaFin: '08:30',
      ubicacionActual: 'Almacén'
    },
    { 
      id: 4, 
      nombre: 'Ruta Pasillo F-G', 
      reponedor: 'Laura Pérez', 
      pasillos: ['Pasillo F - Limpieza', 'Pasillo G - Cuidado Personal'], 
      estado: 'En Ejecución',
      progreso: 33,
      horaInicio: '08:30',
      horaEstimadaFin: '11:00',
      ubicacionActual: 'Pasillo F - Limpieza'
    },
  ]);

  const filteredRutas = rutas.filter(ruta =>
    ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ruta.reponedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ruta.ubicacionActual.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verDetalles = (id: number, nombre: string) => {
    console.log('Ver detalles de la ruta:', id);
  };

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
                  Supervisión de Rutas
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Monitorea el progreso de las rutas de reposición en pasillos
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
              <div className="p-3 bg-warning/40 rounded-xl">
                <Route className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Panel de Control de Rutas</h2>
                <p className="text-muted-foreground">Supervisa el progreso y estado de todas las rutas de reposición activas</p>
              </div>
            </div>
          </div>

          {/* Métricas de rutas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <Route className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{rutas.length}</div>
                <div className="metric-label">Total Rutas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Planificadas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-warning/25 to-warning/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-warning/40 rounded-full group-hover:bg-warning/50 transition-all duration-300">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <div className="metric-value text-warning">{rutas.filter(r => r.estado === 'En Ejecución').length}</div>
                <div className="metric-label">En Ejecución</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-warning">Activas</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{rutas.filter(r => r.estado === 'Completada').length}</div>
                <div className="metric-label">Completadas</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">✓ Finalizadas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-destructive/15 to-destructive/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-destructive/30 rounded-full group-hover:bg-destructive/40 transition-all duration-300">
                    <MapPin className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="metric-value text-destructive">{rutas.filter(r => r.estado === 'Pendiente').length}</div>
                <div className="metric-label">Pendientes</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-destructive/20 text-destructive border border-destructive/40 px-2 py-1 rounded-md text-xs font-medium">⏳ En espera</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de rutas */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-warning/30 rounded-xl">
                    <Route className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Rutas de Reposición en Pasillos</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Supervisa el progreso de cada ruta asignada</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar rutas por nombre o reponedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Reponedor</TableHead>
                      <TableHead>Pasillos Asignados</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Ubicación Actual</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRutas.map((ruta) => (
                      <TableRow key={ruta.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-medium">{ruta.nombre}</TableCell>
                        <TableCell>{ruta.reponedor}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {ruta.pasillos.join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={ruta.estado === 'Completada' ? 'default' : 
                                   ruta.estado === 'En Ejecución' ? 'secondary' : 'outline'}
                            className={
                              ruta.estado === 'Completada' ? 'bg-success/20 text-success border-success/40' :
                              ruta.estado === 'En Ejecución' ? 'bg-warning/20 text-warning border-warning/40' :
                              'bg-destructive/20 text-destructive border-destructive/40'
                            }
                          >
                            {ruta.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${ruta.progreso}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{ruta.progreso}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{ruta.horaInicio} - {ruta.horaEstimadaFin}</div>
                          </div>
                        </TableCell>
                        <TableCell>{ruta.ubicacionActual}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => verDetalles(ruta.id, ruta.nombre)}
                            className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalles
                          </Button>
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

export default RutasPage;
