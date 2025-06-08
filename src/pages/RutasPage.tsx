
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Route, Search, Eye } from 'lucide-react';

const RutasPage = () => {
  const navigate = useNavigate();
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Ejecución':
        return 'bg-blue-100 text-blue-800';
      case 'Completada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const verDetalles = (id: number, nombre: string) => {
    console.log('Ver detalles de la ruta:', id);
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
          <h1 className="text-2xl font-bold">Supervisión de Rutas de Pasillos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-500 text-white">
                <Route className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Rutas de Reposición en Pasillos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar rutas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                  <TableRow key={ruta.id}>
                    <TableCell className="font-medium">{ruta.nombre}</TableCell>
                    <TableCell>{ruta.reponedor}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {ruta.pasillos.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(ruta.estado)}`}>
                        {ruta.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${ruta.progreso}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{ruta.progreso}%</span>
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
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RutasPage;
