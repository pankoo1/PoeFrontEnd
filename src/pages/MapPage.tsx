import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { UbicacionFisica } from '@/types/mapa';
import { ShelfGrid } from '@/components/ui/shelf-grid';
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLocation?.mueble ? 
                                `Estantería ${selectedLocation.mueble.estanteria}` : 
                                'Detalles de la Ubicación'
                            }
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-4">
                                {selectedLocation?.mueble ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Información del Mueble</h3>
                                                <div className="space-y-1 text-sm">
                                                    <div>Estantería: {selectedLocation.mueble.estanteria}</div>
                                                    <div>Nivel: {selectedLocation.mueble.nivel}</div>
                                                    <div>Dimensiones: {selectedLocation.mueble.filas} filas × {selectedLocation.mueble.columnas} columnas</div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Ubicación en el Mapa</h3>
                                                <div className="space-y-1 text-sm">
                                                    <div>Coordenada X: {selectedLocation.x}</div>
                                                    <div>Coordenada Y: {selectedLocation.y}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-4">Vista de la Estantería</h3>
                                            <ShelfGrid 
                                                filas={selectedLocation.mueble.filas} 
                                                columnas={selectedLocation.mueble.columnas}
                                            />
                                        </div>
                                    </div>
                                ) : selectedLocation?.objeto ? (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Objeto</h3>
                                        <div>Nombre: {selectedLocation.objeto.nombre}</div>
                                        <div>Tipo: {selectedLocation.objeto.tipo}</div>
                                        <div>Caminable: {selectedLocation.objeto.caminable ? 'Sí' : 'No'}</div>
                                    </div>
                                ) : selectedLocation?.punto?.producto && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Producto</h3>
                                        <div>Nombre: {selectedLocation.punto.producto.nombre}</div>
                                        <div>Categoría: {selectedLocation.punto.producto.categoria}</div>
                                        <div>Unidad: {selectedLocation.punto.producto.unidad_cantidad} {selectedLocation.punto.producto.unidad_tipo}</div>
                                    </div>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MapPage;
