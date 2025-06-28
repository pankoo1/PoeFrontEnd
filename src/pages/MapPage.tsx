import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Search, Save } from 'lucide-react';
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
    const [asignaciones, setAsignaciones] = useState<{[key: string]: Producto}>({});
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadProductos();
    }, []);

    // Efecto para mantener actualizada la ubicación seleccionada
    useEffect(() => {
        if (selectedLocation) {
            actualizarUbicacionSeleccionada();
        }
    }, [selectedLocation?.x, selectedLocation?.y]);

    const actualizarUbicacionSeleccionada = async () => {
        if (!selectedLocation) return;
        
        try {
            const data = await ApiService.getMapaReposicion();
            const ubicacionActualizada = data.ubicaciones.find(
                (u: any) => u.x === selectedLocation.x && u.y === selectedLocation.y
            );
            
            if (ubicacionActualizada) {
                console.log('Actualizando ubicación seleccionada:', ubicacionActualizada);
                setSelectedLocation(ubicacionActualizada);
            }
        } catch (error) {
            console.error('Error al actualizar ubicación:', error);
        }
    };

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

    const handleObjectClick = async (ubicacion: UbicacionFisica) => {
        setSelectedLocation(ubicacion);
        await actualizarUbicacionSeleccionada();
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, producto: Producto) => {
        e.dataTransfer.setData('producto', JSON.stringify(producto));
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, posicion: { fila: number, columna: number }) => {
        try {
            const productoData = e.dataTransfer.getData('producto');
            if (!productoData) return;
            
            const producto = JSON.parse(productoData) as Producto;
            
            if (!selectedLocation?.mueble) {
                console.log('No hay mueble seleccionado');
                toast({
                    title: "Error",
                    description: "No hay mueble seleccionado para asignar el producto",
                    variant: "destructive",
                });
                return;
            }

            // Calcular el ID del punto basado en la posición
            const idPunto = calcularIdPunto(selectedLocation.mueble, posicion.fila, posicion.columna);
                
            if (!idPunto) {
                console.error('No se pudo determinar el punto:', {
                    mueble: selectedLocation.mueble,
                    posicion,
                    puntos_disponibles: selectedLocation.mueble.puntos_reposicion
                });
                toast({
                    title: "Error",
                    description: "No se pudo determinar el punto de reposición. Verifica que la posición sea válida.",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);
            
            try {
                // Asignar el producto al punto
                await ApiService.asignarProductoAPunto(producto.id_producto, idPunto, Number(producto.id_usuario));
                
                // Actualizar la visualización
                await actualizarUbicacionSeleccionada();

                toast({
                    title: "Éxito",
                    description: `${producto.nombre} asignado correctamente a la posición (${posicion.fila + 1}, ${posicion.columna + 1})`,
                });
            } catch (error) {
                console.error('Error al asignar producto:', error);
            toast({
                    title: "Error",
                    description: "No se pudo asignar el producto al punto",
                    variant: "destructive",
            });
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error al procesar el producto:', error);
            toast({
                title: "Error",
                description: "No se pudo procesar el producto",
                variant: "destructive",
            });
        }
    };

    const handleClearCell = async (posicion: { fila: number, columna: number }) => {
        try {
            // Convertir coordenadas a base 1 para buscar el punto
            const filaBase1 = posicion.fila + 1;
            const columnaBase1 = posicion.columna + 1;

            console.log('Buscando punto para desasignar:', {
                coordenadas: { fila: filaBase1, columna: columnaBase1 },
                puntosDisponibles: selectedLocation?.mueble?.puntos_reposicion
            });

            const punto = selectedLocation?.mueble?.puntos_reposicion?.find(
                p => p.nivel === filaBase1 && p.estanteria === columnaBase1
            );

            console.log('Punto encontrado:', punto);

            if (!punto) {
                console.log('No se encontró el punto en esta posición');
                return;
            }

            if (!punto.producto) {
                console.log('No hay producto asignado a este punto');
                return;
            }

            console.log('Intentando desasignar producto del punto:', {
                idPunto: punto.id_punto,
                nombreProducto: punto.producto.nombre
            });

            setIsLoading(true);

            // Llamar al endpoint de desasignación
            await ApiService.desasignarProductoDePunto(punto.id_punto);

            // Actualizar la visualización
            await actualizarUbicacionSeleccionada();

            toast({
                title: "Éxito",
                description: `${punto.producto.nombre} desasignado correctamente de la posición (${posicion.fila + 1}, ${posicion.columna + 1})`,
            });
        } catch (error) {
            console.error('Error al desasignar producto:', error);
            toast({
                title: "Error",
                description: "No se pudo desasignar el producto. Por favor, intente nuevamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmarAsignaciones = async () => {
        try {
            setIsLoading(true);
            
            // Procesar todas las asignaciones
            for (const key in asignaciones) {
                const producto = asignaciones[key];
                const idPunto = Number(key);
                
                await ApiService.asignarProductoAPunto(producto.id_producto, idPunto, Number(producto.id_usuario));
            }

            toast({
                title: "Éxito",
                description: "Todas las asignaciones fueron guardadas correctamente",
            });

            // Limpiar las asignaciones temporales
            setAsignaciones({});
            
            // Recargar los datos del mapa
            try {
                const data = await ApiService.getMapaReposicion();
                if (selectedLocation) {
                    // Buscar y actualizar la ubicación seleccionada con los nuevos datos
                    const ubicacionActualizada = data.ubicaciones.find(
                        (u: any) => u.x === selectedLocation.x && u.y === selectedLocation.y
                    );
                    if (ubicacionActualizada) {
                        setSelectedLocation(ubicacionActualizada);
                    }
                }
            } catch (error) {
                console.error('Error al recargar el mapa:', error);
                toast({
                    title: "Advertencia",
                    description: "Los cambios se guardaron pero no se pudo actualizar la vista. Por favor, refresque la página.",
                    variant: "default",
                });
            }
        } catch (error) {
            console.error('Error al guardar asignaciones:', error);
        toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudieron guardar las asignaciones",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const calcularIdPunto = (mueble: any, fila: number, columna: number): number | null => {
        console.log('Calculando punto para:', {
            mueble: JSON.parse(JSON.stringify(mueble)),
            fila,
            columna
        });
        
        if (!mueble) {
            console.log('Mueble no disponible');
            return null;
        }

        // Verificar la estructura del mueble
        console.log('Estructura del mueble:', {
            tieneFilas: 'filas' in mueble,
            tieneColumnas: 'columnas' in mueble,
            tienePuntos: 'puntos_reposicion' in mueble,
            filas: mueble.filas,
            columnas: mueble.columnas,
            puntos: mueble.puntos_reposicion
        });

        // Validar que la posición está dentro de los límites (usando índices base 0)
        if (fila < 0 || fila >= mueble.filas || columna < 0 || columna >= mueble.columnas) {
            console.log('Posición fuera de límites:', { fila, columna, limites: { filas: mueble.filas, columnas: mueble.columnas } });
            return null;
        }

        if (!Array.isArray(mueble.puntos_reposicion)) {
            console.log('puntos_reposicion no es un array o no existe:', mueble.puntos_reposicion);
            return null;
        }

        // Mostrar todos los puntos disponibles antes de buscar
        console.log('Puntos disponibles antes de buscar:', 
            mueble.puntos_reposicion.map((p: any) => ({
                id_punto: p.id_punto,
                fila: p.fila,
                columna: p.columna,
                nivel: p.nivel,
                estanteria: p.estanteria
            }))
        );

        // Convertir coordenadas de base 0 a base 1
        const filaBase1 = fila + 1;
        const columnaBase1 = columna + 1;

        console.log('Buscando punto con coordenadas (base 1):', {
            fila: filaBase1,
            columna: columnaBase1
        });

        // Buscar el punto usando las coordenadas en base 1
        const punto = mueble.puntos_reposicion.find((p: any) => {
            // Intentar coincidir tanto con fila/columna como con nivel/estanteria
            const coincideFila = p.fila === filaBase1 || p.nivel === filaBase1;
            const coincideColumna = p.columna === columnaBase1 || p.estanteria === columnaBase1;
            const coincide = coincideFila && coincideColumna;
            
            console.log('Comparando punto:', {
                punto: {
                    id_punto: p.id_punto,
                    fila: p.fila,
                    columna: p.columna,
                    nivel: p.nivel,
                    estanteria: p.estanteria
                },
                buscado: { 
                    fila: filaBase1, 
                    columna: columnaBase1 
                },
                coincideFila,
                coincideColumna,
                coincide
            });
            
            return coincide;
        });

        console.log('Resultado de búsqueda:', {
            puntoEncontrado: punto,
            coordenadasBuscadas: { fila: filaBase1, columna: columnaBase1 }
        });

        return punto ? punto.id_punto : null;
    };

    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
                <div className="container mx-auto px-4 py-6 flex items-center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/supervisor-dashboard')}
                        className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                            <Map className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Mapa de Supervisión
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Card className="glass border-0 shadow-2xl h-[calc(100vh-200px)]">
                    <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                                <Map className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-semibold">Mapa Interactivo</CardTitle>
                                <p className="text-blue-100 mt-1">Gestiona la asignación de productos en estanterías</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-100px)] p-6">
                        <MapViewer
                            onObjectClick={handleObjectClick}
                            className="w-full h-full"
                        />
                    </CardContent>
                </Card>
            </main>

            <Dialog open={selectedLocation !== null} onOpenChange={(open) => !open && setSelectedLocation(null)}>
                <DialogContent className="max-w-7xl min-h-[90vh] glass border-0 shadow-2xl">
                    <DialogHeader className="border-b border-slate-200 pb-4">
                        <DialogTitle className="text-3xl mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                            {selectedLocation?.mueble ? 
                                `Estantería ${selectedLocation.mueble.estanteria}` : 
                                'Detalles de la Ubicación'
                            }
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="grid grid-cols-[2fr,1fr] gap-8 h-full">
                                <div className="space-y-8">
                                    {selectedLocation?.mueble ? (
                                        <>
                                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                                                <h3 className="font-semibold text-lg text-slate-800">Información del Mueble</h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Estantería:</span>
                                                        <span className="ml-2 font-medium text-slate-800">{selectedLocation.mueble.estanteria}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Nivel:</span>
                                                        <span className="ml-2 font-medium text-slate-800">{selectedLocation.mueble.nivel}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Dimensiones:</span>
                                                    <span className="ml-2 font-medium text-slate-800">
                                                        {selectedLocation.mueble.filas || 3} filas × {selectedLocation.mueble.columnas || 4} columnas
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Ubicación:</span>
                                                    <span className="ml-2 font-medium text-slate-800">({selectedLocation.x}, {selectedLocation.y})</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-4 text-slate-800">Vista de la Estantería</h3>
                                                <ShelfGrid 
                                                    filas={selectedLocation.mueble.filas || 3} 
                                                    columnas={selectedLocation.mueble.columnas || 4}
                                                    onDrop={handleDrop}
                                                    onClearCell={handleClearCell}
                                                    puntosPreAsignados={selectedLocation.mueble.puntos_reposicion?.map(punto => ({
                                                        fila: punto.nivel - 1, // Convertir de base 1 a base 0
                                                        columna: punto.estanteria - 1, // Convertir de base 1 a base 0
                                                        producto: punto.producto ? {
                                                            id_producto: punto.producto.id_producto,
                                                            nombre: punto.producto.nombre,
                                                            categoria: punto.producto.categoria,
                                                            unidad_tipo: punto.producto.unidad_tipo,
                                                            unidad_cantidad: punto.producto.unidad_cantidad,
                                                            id_usuario: 0,
                                                            codigo_unico: '',
                                                            estado: 'activo'
                                                        } : null
                                                    })) || []}
                                                />
                                                {Object.keys(asignaciones).length > 0 && (
                                                    <div className="mt-4 flex justify-end">
                                                        <Button
                                                            onClick={handleConfirmarAsignaciones}
                                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                                    Guardando...
                                                                </>
                                                            ) : (
                                                                <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Confirmar Asignaciones
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : selectedLocation?.objeto ? (
                                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-lg text-slate-800">Objeto</h3>
                                            <div>
                                                <span className="text-slate-600">Nombre:</span>
                                                <span className="ml-2 font-medium text-slate-800">{selectedLocation.objeto.nombre}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Tipo:</span>
                                                <span className="ml-2 font-medium text-slate-800">{selectedLocation.objeto.tipo}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Caminable:</span>
                                                <span className="ml-2 font-medium text-slate-800">{selectedLocation.objeto.caminable ? 'Sí' : 'No'}</span>
                                            </div>
                                        </div>
                                    ) : selectedLocation?.punto?.producto && (
                                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-lg text-slate-800">Producto</h3>
                                            <div>
                                                <span className="text-slate-600">Nombre:</span>
                                                <span className="ml-2 font-medium text-slate-800">{selectedLocation.punto.producto.nombre}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Categoría:</span>
                                                <span className="ml-2 font-medium text-slate-800">{selectedLocation.punto.producto.categoria}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Unidad:</span>
                                                <span className="ml-2 font-medium text-slate-800">
                                                    {selectedLocation.punto.producto.unidad_cantidad} {selectedLocation.punto.producto.unidad_tipo}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Lista de Productos */}
                                <div className="border-l border-slate-200 pl-6">
                                    <h3 className="font-semibold text-2xl mb-4 text-slate-800">Productos</h3>
                                    <div className="mb-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                type="text"
                                                placeholder="Buscar productos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full text-base py-5 pl-10 border-slate-300 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-2">
                                        {filteredProductos.map((producto) => (
                                            <div
                                                key={producto.id_producto}
                                                className="p-3 bg-white border border-slate-200 rounded-lg cursor-move hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, producto)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-base truncate mr-2 text-slate-800">
                                                        {producto.nombre}
                                                    </div>
                                                    <div className="text-sm text-slate-600 whitespace-nowrap">
                                                        {producto.unidad_cantidad} {producto.unidad_tipo}
                                                    </div>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    <span className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 border border-blue-200">
                                                        {producto.categoria}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
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
