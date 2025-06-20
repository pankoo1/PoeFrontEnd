import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Search } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { UbicacionFisica } from '@/types/mapa';
import { Producto } from '@/types/producto';
import { ShelfGrid } from '@/components/ui/shelf-grid';
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ApiService } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

interface ProductosResponse {
    productos: Producto[];
    mensaje?: string;
}

const MapPage = () => {
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = useState<UbicacionFisica | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            const data = await ApiService.getProductos() as ProductosResponse;
            setProductos(data.productos || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los productos',
                variant: 'destructive',
            });
        }
    };

    const handleObjectClick = (ubicacion: UbicacionFisica) => {
        setSelectedLocation(ubicacion);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, producto: Producto) => {
        e.dataTransfer.setData('producto', JSON.stringify(producto));
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, posicion: { fila: number, columna: number }) => {
        e.preventDefault();
        const productoData = e.dataTransfer.getData('producto');
        if (!productoData || !selectedLocation?.mueble) return;

        const producto = JSON.parse(productoData) as Producto;
        
        try {
            // Aquí iría la lógica para asignar el producto a la posición específica del mueble
            // Por ahora solo mostramos un toast de éxito
            toast({
                title: 'Producto asignado',
                description: `${producto.nombre} asignado a la posición ${posicion.fila},${posicion.columna}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo asignar el producto',
                variant: 'destructive',
            });
        }
    };

    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            <Dialog open={selectedLocation !== null} onOpenChange={(open) => !open && setSelectedLocation(null)}>
                <DialogContent className="max-w-6xl min-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl mb-4">
                            {selectedLocation?.mueble ? 
                                `Estantería ${selectedLocation.mueble.estanteria}` : 
                                'Detalles de la Ubicación'
                            }
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="grid grid-cols-2 gap-8 h-full">
                                <div className="space-y-6">
                                    {selectedLocation?.mueble ? (
                                        <>
                                            <div className="bg-card p-6 rounded-lg border">
                                                <h3 className="font-semibold text-lg mb-4">Información del Mueble</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-muted-foreground">Estantería:</span>
                                                            <span className="ml-2 font-medium">{selectedLocation.mueble.estanteria}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Nivel:</span>
                                                            <span className="ml-2 font-medium">{selectedLocation.mueble.nivel}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Dimensiones:</span>
                                                        <span className="ml-2 font-medium">
                                                            {selectedLocation.mueble.filas || 3} filas × {selectedLocation.mueble.columnas || 4} columnas
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Ubicación:</span>
                                                        <span className="ml-2 font-medium">({selectedLocation.x}, {selectedLocation.y})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-card p-6 rounded-lg border">
                                                <h3 className="font-semibold text-lg mb-4">Vista de la Estantería</h3>
                                                <ShelfGrid 
                                                    filas={selectedLocation.mueble.filas || 3} 
                                                    columnas={selectedLocation.mueble.columnas || 4}
                                                    onDrop={handleDrop}
                                                />
                                            </div>
                                        </>
                                    ) : selectedLocation?.objeto ? (
                                        <div className="bg-card p-6 rounded-lg border">
                                            <h3 className="font-semibold text-lg mb-4">Objeto</h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-muted-foreground">Nombre:</span>
                                                    <span className="ml-2 font-medium">{selectedLocation.objeto.nombre}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Tipo:</span>
                                                    <span className="ml-2 font-medium">{selectedLocation.objeto.tipo}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Caminable:</span>
                                                    <span className="ml-2 font-medium">{selectedLocation.objeto.caminable ? 'Sí' : 'No'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedLocation?.punto?.producto && (
                                        <div className="bg-card p-6 rounded-lg border">
                                            <h3 className="font-semibold text-lg mb-4">Producto</h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-muted-foreground">Nombre:</span>
                                                    <span className="ml-2 font-medium">{selectedLocation.punto.producto.nombre}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Categoría:</span>
                                                    <span className="ml-2 font-medium">{selectedLocation.punto.producto.categoria}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Unidad:</span>
                                                    <span className="ml-2 font-medium">
                                                        {selectedLocation.punto.producto.unidad_cantidad} {selectedLocation.punto.producto.unidad_tipo}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Lista de Productos */}
                                <div className="border-l pl-8">
                                    <div className="bg-card p-6 rounded-lg border">
                                        <h3 className="font-semibold text-lg mb-4">Productos Disponibles</h3>
                                        <div className="mb-6">
                                            <Input
                                                type="text"
                                                placeholder="Buscar productos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-4">
                                            {filteredProductos.map((producto) => (
                                                <div
                                                    key={producto.id_producto}
                                                    className="p-4 border rounded-lg cursor-move hover:bg-accent transition-colors"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, producto)}
                                                >
                                                    <div className="font-medium text-base">{producto.nombre}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        <span className="inline-block bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs">
                                                            {producto.categoria}
                                                        </span>
                                                        <span className="ml-2">
                                                            {producto.unidad_cantidad} {producto.unidad_tipo}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MapPage;
