
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReponedorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Datos simulados de tareas
  const [tareas, setTareas] = useState([
    {
      id: 1,
      producto: 'Leche Entera 1L',
      ubicacion: 'Pasillo 2, Estante A',
      cantidad: 24,
      estado: 'pendiente',
      prioridad: 'alta',
      supervisor: 'María González',
      fechaAsignacion: '2024-06-07',
      horaEstimada: '09:30 AM'
    },
    {
      id: 2,
      producto: 'Pan Integral',
      ubicacion: 'Panadería, Estante Principal',
      cantidad: 15,
      estado: 'en_progreso',
      prioridad: 'media',
      supervisor: 'María González',
      fechaAsignacion: '2024-06-07',
      horaEstimada: '10:15 AM'
    },
    {
      id: 3,
      producto: 'Cereales Variados',
      ubicacion: 'Pasillo 3, Estante B',
      cantidad: 18,
      estado: 'completada',
      prioridad: 'baja',
      supervisor: 'María González',
      fechaAsignacion: '2024-06-07',
      horaEstimada: '08:45 AM'
    },
    {
      id: 4,
      producto: 'Frutas y Verduras',
      ubicacion: 'Sección Frutas y Verduras',
      cantidad: 30,
      estado: 'pendiente',
      prioridad: 'alta',
      supervisor: 'María González',
      fechaAsignacion: '2024-06-07',
      horaEstimada: '11:00 AM'
    }
  ]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'en_progreso':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
      case 'completada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const marcarCompletada = (tareaId: number) => {
    setTareas(prev => prev.map(tarea => 
      tarea.id === tareaId 
        ? { ...tarea, estado: 'completada' }
        : tarea
    ));
    toast({
      title: "Tarea completada",
      description: "La tarea ha sido marcada como completada exitosamente",
    });
  };

  const iniciarTarea = (tareaId: number) => {
    setTareas(prev => prev.map(tarea => 
      tarea.id === tareaId 
        ? { ...tarea, estado: 'en_progreso' }
        : tarea
    ));
    toast({
      title: "Tarea iniciada",
      description: "La tarea ha sido marcada como en progreso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mis Tareas</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Tareas Asignadas</h2>
          <p className="text-muted-foreground">
            Gestiona tus tareas de reposición y marca su progreso
          </p>
        </div>

        <div className="grid gap-6">
          {tareas.map((tarea) => (
            <Card key={tarea.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-500 text-white">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tarea.producto}</CardTitle>
                      <CardDescription>
                        {tarea.ubicacion} • Cantidad: {tarea.cantidad} unidades
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getEstadoBadge(tarea.estado)}
                    {getPrioridadBadge(tarea.prioridad)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Supervisor</p>
                    <p className="font-medium">{tarea.supervisor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Asignación</p>
                    <p className="font-medium">{tarea.fechaAsignacion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora Estimada</p>
                    <p className="font-medium">{tarea.horaEstimada}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {tarea.estado === 'pendiente' && (
                    <Button 
                      onClick={() => iniciarTarea(tarea.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Iniciar Tarea
                    </Button>
                  )}
                  
                  {(tarea.estado === 'pendiente' || tarea.estado === 'en_progreso') && (
                    <Button 
                      onClick={() => marcarCompletada(tarea.id)}
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}
                  
                  {tarea.estado === 'completada' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ Completada
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ReponedorTareas;

  // Función para mostrar el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completada':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{status}</span>;
      case 'en progreso':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{status}</span>;
      case 'cancelada':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">{status}</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Función para actualizar el estado de una tarea
  const updateTaskStatus = (tareaId: number, nuevoEstado: string) => {
    const [tareas, setTareas] = useState(prev => prev.map(tarea => {
      if (tarea.id === tareaId) {
        return { ...tarea, estado: nuevoEstado };
      }
      return tarea;
    }));

    const { toast } = useToast();
    toast({
      title: `Tarea ${nuevoEstado.toLowerCase()}`,
      description: `La tarea ha sido ${nuevoEstado.toLowerCase()} exitosamente`,
    });
  };
