
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { UbicacionFisica } from '@/types/mapa';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MapPage = () => {
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = useState<UbicacionFisica | null>(null);

    const handleObjectClick = (ubicacion: UbicacionFisica) => {
        setSelectedLocation(ubicacion);
    };

    return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mapa Interactivo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-200px)]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-500 text-white">
                <Map className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Visualización de Mapa</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-100px)]">
                        <MapViewer
                            onObjectClick={handleObjectClick}
                            className="w-full h-full"
                        />
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalles de la Ubicación</DialogTitle>
                        <DialogDescription>
                            {selectedLocation?.objeto && (
                                <div className="mt-4">
                                    <h3 className="font-semibold">Objeto</h3>
                                    <p>Nombre: {selectedLocation.objeto.nombre}</p>
                                    <p>Tipo: {selectedLocation.objeto.tipo}</p>
                                    <p>Caminable: {selectedLocation.objeto.caminable ? 'Sí' : 'No'}</p>
                                </div>
                            )}
                            {selectedLocation?.mueble && (
                                <div className="mt-4">
                                    <h3 className="font-semibold">Mueble</h3>
                                    <p>Estantería: {selectedLocation.mueble.estanteria}</p>
                                    <p>Nivel: {selectedLocation.mueble.nivel}</p>
                                </div>
                            )}
                            {selectedLocation?.punto?.producto && (
                                <div className="mt-4">
                                    <h3 className="font-semibold">Producto</h3>
                                    <p>Nombre: {selectedLocation.punto.producto.nombre}</p>
                                    <p>Categoría: {selectedLocation.punto.producto.categoria}</p>
                                    <p>Unidad: {selectedLocation.punto.producto.unidad_cantidad} {selectedLocation.punto.producto.unidad_tipo}</p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MapPage;
