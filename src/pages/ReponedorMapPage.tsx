import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, Navigation } from 'lucide-react';
import { MapaService } from '@/services/mapaService';
import { MapaResponse } from '@/types/mapa';

const ReponedorMapPage = () => {
  const navigate = useNavigate();

  // Estado para el mapa y puntos reales
  const [mapa, setMapa] = useState<MapaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapa = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Iniciando carga del mapa...');
        const data = await MapaService.getMapaReponedorVista();
        console.log('Datos del mapa recibidos:', data);
        setMapa(data);
      } catch (err: any) {
        console.error('Error al cargar el mapa:', err);
        setError(`No se pudo cargar el mapa: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMapa();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'siguiente':
        return <Badge className="bg-blue-500">Siguiente</Badge>;
      case 'pendiente':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'completada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
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
          <h1 className="text-2xl font-bold">Mapa y Rutas</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mapa real */}
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Map className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Mapa Interactivo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                {loading ? (
                  <div>Cargando mapa...</div>
                ) : error ? (
                  <div className="text-red-600">{error}</div>
                ) : mapa && mapa.mapa ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{mapa.mapa.nombre || 'Mapa'}</h3>
                    <p className="mb-2">Dimensiones: {mapa.mapa.ancho} x {mapa.mapa.alto}</p>
                    <p className="text-muted-foreground">(Visualización del mapa aquí)</p>
                  </div>
                ) : (
                  <div>No hay datos de mapa disponibles.</div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Lista de Puntos de Reposición reales */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Ruta Optimizada</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Puntos de reposición ordenados según la ruta más eficiente
                </p>
                {loading ? (
                  <div>Cargando puntos...</div>
                ) : error ? (
                  <div className="text-red-600">{error}</div>
                ) : mapa && mapa.ubicaciones && mapa.ubicaciones.length > 0 ? (
                  // Extraer puntos de reposición de todas las ubicaciones con muebles
                  mapa.ubicaciones
                    .filter(u => u.mueble && u.mueble.puntos_reposicion && u.mueble.puntos_reposicion.length > 0)
                    .flatMap(ubicacion => 
                      ubicacion.mueble!.puntos_reposicion!.map(punto => ({
                        ...punto,
                        ubicacion_x: ubicacion.x,
                        ubicacion_y: ubicacion.y,
                        objeto_nombre: ubicacion.objeto?.nombre || 'Sin objeto'
                      }))
                    )
                    .filter(punto => punto.producto) // Solo mostrar puntos con productos asignados
                    .map((punto, index) => (
                      <div key={punto.id_punto} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{punto.producto?.nombre || 'Sin producto asignado'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {punto.objeto_nombre} - Estantería: {punto.estanteria} | Nivel: {punto.nivel}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Ubicación: </span>
                            <span className="font-medium">({punto.ubicacion_x}, {punto.ubicacion_y})</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Categoría: </span>
                            <span className="font-medium">{punto.producto?.categoria || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div>No hay puntos de reposición disponibles.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReponedorMapPage;
