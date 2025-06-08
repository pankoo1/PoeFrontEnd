
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, MapPin, Navigation } from 'lucide-react';

const ReponedorMapPage = () => {
  const navigate = useNavigate();

  // Datos simulados de puntos de reposición ordenados por ruta óptima
  const puntosRuta = [
    {
      id: 1,
      producto: 'Frutas y Verduras',
      ubicacion: 'Sección Frutas y Verduras',
      orden: 1,
      distancia: '0m',
      tiempo: '15 min',
      estado: 'siguiente'
    },
    {
      id: 2,
      producto: 'Leche Entera 1L',
      ubicacion: 'Pasillo 2, Estante A',
      orden: 2,
      distancia: '25m',
      tiempo: '12 min',
      estado: 'pendiente'
    },
    {
      id: 3,
      producto: 'Pan Integral',
      ubicacion: 'Panadería, Estante Principal',
      orden: 3,
      distancia: '45m',
      tiempo: '10 min',
      estado: 'pendiente'
    },
    {
      id: 4,
      producto: 'Cereales Variados',
      ubicacion: 'Pasillo 3, Estante B',
      orden: 4,
      distancia: '60m',
      tiempo: '8 min',
      estado: 'completada'
    }
  ];

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
          {/* Mapa Placeholder */}
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
                <div className="text-center">
                  <Navigation className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Mapa de Rutas</h3>
                  <p className="text-muted-foreground mb-4">
                    El mapa interactivo con rutas optimizadas será integrado manualmente aquí
                  </p>
                  <Button variant="outline">
                    Inicializar Navegación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Puntos de Reposición */}
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
                
                {puntosRuta.map((punto, index) => (
                  <div key={punto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {punto.orden}
                        </div>
                        <div>
                          <h4 className="font-semibold">{punto.producto}</h4>
                          <p className="text-sm text-muted-foreground">{punto.ubicacion}</p>
                        </div>
                      </div>
                      {getEstadoBadge(punto.estado)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Distancia: </span>
                        <span className="font-medium">{punto.distancia}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tiempo est.: </span>
                        <span className="font-medium">{punto.tiempo}</span>
                      </div>
                    </div>
                    
                    {punto.estado === 'siguiente' && (
                      <Button className="w-full mt-3" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Ir a este punto
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReponedorMapPage;
