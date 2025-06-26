import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Tarea } from "@/services/api";

const getEstadoBadge = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
    case 'en_progreso':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
    case 'completada':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
    case 'cancelada':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
    default:
      return <Badge variant="outline">{estado || 'Desconocido'}</Badge>;
  }
};

const ReponedorTareas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');

  // Polling para actualización automática
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchTareas = async () => {
      setLoading(true);
      setError(null);
      try {
        const tareasApi = await ApiService.getTareasReponedor();
        setTareas(tareasApi);
      } catch (err: any) {
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
    interval = setInterval(fetchTareas, 300000); // Actualiza cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Filtrado y ordenamiento
  const tareasFiltradas = tareas
    .filter(t => !filtroEstado || (t.estado && t.estado.toLowerCase() === filtroEstado))
    .sort((a, b) => {
      if (orden === 'asc') {
        return (a.fecha_creacion || '').localeCompare(b.fecha_creacion || '');
      } else {
        return (b.fecha_creacion || '').localeCompare(a.fecha_creacion || '');
      }
    });

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
        {/* Filtros y ordenamiento */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div>
            <label className="mr-2 font-medium">Filtrar por estado:</label>
            <select
              className="border rounded px-2 py-1"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium">Ordenar por fecha:</label>
            <select
              className="border rounded px-2 py-1"
              value={orden}
              onChange={e => setOrden(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="mb-8">Cargando tareas...</div>
        ) : error ? (
          <div className="mb-8 text-red-600">{error}</div>
        ) : (
          tareasFiltradas.length === 0 ? (
            <div className="text-muted-foreground">No tienes tareas asignadas.</div>
          ) : (
            <div className="grid gap-6">
              {tareasFiltradas.map((tarea) => (
                <Card key={tarea.id_tarea} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-blue-500 text-white">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {tarea.productos && tarea.productos.length > 0 ? tarea.productos[0].nombre : 'Producto'}
                          </CardTitle>
                          <CardDescription>
                            {tarea.productos && tarea.productos.length > 0 ? `Ubicación: ${tarea.productos[0].ubicacion.estanteria || ''} Nivel: ${tarea.productos[0].ubicacion.nivel || ''}` : ''}
                            {tarea.productos && tarea.productos.length > 0 ? ` • Cantidad: ${tarea.productos[0].cantidad} unidades` : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getEstadoBadge(tarea.estado)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Reponedor</p>
                        <p className="font-medium">{tarea.reponedor || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha Creación</p>
                        <p className="font-medium">{tarea.fecha_creacion ? tarea.fecha_creacion.split('T')[0] : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="font-medium">{tarea.estado}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {tarea.estado && tarea.estado.toLowerCase() === 'completada' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ✓ Completada
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default ReponedorTareas;
