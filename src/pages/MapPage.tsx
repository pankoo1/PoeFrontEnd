import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Search, Save, Trash2, UserX } from 'lucide-react';
import { MapViewer } from '@/components/MapViewer';
import { UbicacionFisica } from '@/types/mapa';
import { Producto } from '@/types/producto';
import { ShelfGrid } from '@/components/ui/shelf-grid';
import { Input } from "@/components/ui/input";
import Logo from '@/components/Logo';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [desasignaciones, setDesasignaciones] = useState<{[key: string]: boolean}>({});
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
            console.log('Actualizando ubicación seleccionada...');
            const data = await ApiService.getMapaReposicion();
            const ubicacionActualizada = data.ubicaciones.find(
                (u: any) => u.x === selectedLocation.x && u.y === selectedLocation.y
            );
            
            if (ubicacionActualizada) {
                console.log('Ubicación actualizada:', {
                    coordenadas: `(${ubicacionActualizada.x}, ${ubicacionActualizada.y})`,
                    puntosConProductos: ubicacionActualizada.mueble?.puntos_reposicion?.filter((p: any) => p.producto).length || 0,
                    totalPuntos: ubicacionActualizada.mueble?.puntos_reposicion?.length || 0
                });
                setSelectedLocation(ubicacionActualizada);
            }
        } catch (error) {
            console.error('Error al actualizar ubicación:', error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la visualización. Intenta recargar la página.",
                variant: "destructive",
            });
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

            // **NUEVA LÓGICA: Asignación temporal en lugar de inmediata**
            console.log('Asignación temporal - Producto:', producto.nombre, 'Punto:', idPunto);
            
            // Agregar a asignaciones temporales
            setAsignaciones(prev => ({
                ...prev,
                [idPunto]: producto
            }));

            toast({
                title: "Asignación Temporal",
                description: `${producto.nombre} marcado para asignación en posición (${posicion.fila + 1}, ${posicion.columna + 1}). Confirma los cambios para guardar.`,
                variant: "default",
            });
            
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

            console.log('Marcando punto para desasignación temporal:', {
                idPunto: punto.id_punto,
                nombreProducto: punto.producto.nombre
            });

            // **NUEVA LÓGICA: Desasignación temporal en lugar de inmediata**
            // Agregar a desasignaciones temporales
            setDesasignaciones(prev => ({
                ...prev,
                [punto.id_punto]: true
            }));

            toast({
                title: "Desasignación Temporal",
                description: `${punto.producto.nombre} marcado para desasignación en posición (${posicion.fila + 1}, ${posicion.columna + 1}). Confirma los cambios para guardar.`,
                variant: "default",
            });
        } catch (error) {
            console.error('Error al marcar para desasignación:', error);
            toast({
                title: "Error",
                description: "No se pudo marcar el punto para desasignación.",
                variant: "destructive",
            });
        }
    };

    const handleConfirmarAsignaciones = async () => {
        const numAsignaciones = Object.keys(asignaciones).length;
        
        if (numAsignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay asignaciones pendientes para confirmar",
                variant: "default",
            });
            return;
        }

        try {
            setIsLoading(true);
            
            console.log(`Confirmando ${numAsignaciones} asignaciones...`);
            
            // Procesar todas las asignaciones con mejor manejo de errores
            const errores = [];
            const exitosos = [];
            
            for (const [key, producto] of Object.entries(asignaciones)) {
                const idPunto = Number(key);
                
                try {
                    await ApiService.asignarProductoAPunto(producto.id_producto, idPunto, Number(producto.id_usuario || 1));
                    exitosos.push(`${producto.nombre} → Punto ${idPunto}`);
                } catch (error) {
                    console.error(`Error al asignar ${producto.nombre} al punto ${idPunto}:`, error);
                    errores.push(`${producto.nombre} → Punto ${idPunto}`);
                }
            }

            // Mostrar resultados
            if (exitosos.length > 0) {
                toast({
                    title: "Asignaciones Completadas",
                    description: `${exitosos.length} productos asignados correctamente${errores.length > 0 ? `, ${errores.length} fallaron` : ''}`,
                });
            }

            if (errores.length > 0) {
                toast({
                    title: "Algunas Asignaciones Fallaron",
                    description: `${errores.length} asignaciones no pudieron completarse. Revisa los productos y vuelve a intentarlo.`,
                    variant: "destructive",
                });
            }

            // Limpiar las asignaciones temporales exitosas
            if (exitosos.length > 0) {
                setAsignaciones({});
                
                // Esperar un poco para que el backend procese los cambios
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Solo recargar si hubo cambios exitosos
                await actualizarUbicacionSeleccionada();
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

    // Función para cancelar todas las asignaciones temporales
    const handleCancelarAsignaciones = () => {
        const numAsignaciones = Object.keys(asignaciones).length;
        
        if (numAsignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay asignaciones pendientes para cancelar",
                variant: "default",
            });
            return;
        }

        setAsignaciones({});
        toast({
            title: "Asignaciones Canceladas",
            description: `${numAsignaciones} asignaciones temporales fueron canceladas`,
        });
    };

    // Función para confirmar desasignaciones en lote
    const handleConfirmarDesasignaciones = async () => {
        const numDesasignaciones = Object.keys(desasignaciones).length;
        
        if (numDesasignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay desasignaciones pendientes para confirmar",
                variant: "default",
            });
            return;
        }

        try {
            setIsLoading(true);
            
            console.log(`Confirmando ${numDesasignaciones} desasignaciones...`);
            
            // Procesar todas las desasignaciones con mejor manejo de errores
            const errores = [];
            const exitosos = [];
            
            for (const idPunto of Object.keys(desasignaciones)) {
                try {
                    // Usar la función de desasignación completa (producto + usuario)
                    await ApiService.desasignarPuntoCompleto(Number(idPunto));
                    exitosos.push(`Punto ${idPunto}`);
                } catch (error) {
                    console.error(`Error al desasignar punto ${idPunto}:`, error);
                    errores.push(`Punto ${idPunto}`);
                }
            }

            // Mostrar resultados
            if (exitosos.length > 0) {
                toast({
                    title: "Desasignaciones Completadas",
                    description: `${exitosos.length} puntos desasignados correctamente${errores.length > 0 ? `, ${errores.length} fallaron` : ''}`,
                });
            }

            if (errores.length > 0) {
                toast({
                    title: "Algunas Desasignaciones Fallaron",
                    description: `${errores.length} desasignaciones no pudieron completarse. Revisa y vuelve a intentarlo.`,
                    variant: "destructive",
                });
            }

            // Limpiar las desasignaciones temporales exitosas
            if (exitosos.length > 0) {
                setDesasignaciones({});
                
                // Esperar un poco para que el backend procese los cambios
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Solo recargar si hubo cambios exitosos
                await actualizarUbicacionSeleccionada();
            }
            
        } catch (error) {
            console.error('Error al procesar desasignaciones:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudieron procesar las desasignaciones",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cancelar todas las desasignaciones temporales
    const handleCancelarDesasignaciones = () => {
        const numDesasignaciones = Object.keys(desasignaciones).length;
        
        if (numDesasignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay desasignaciones pendientes para cancelar",
                variant: "default",
            });
            return;
        }

        setDesasignaciones({});
        toast({
            title: "Desasignaciones Canceladas",
            description: `${numDesasignaciones} desasignaciones temporales fueron canceladas`,
        });
    };

    // Función de debug para verificar el estado
    const logEstadoActual = () => {
        console.log('=== ESTADO ACTUAL ===');
        console.log('Ubicación seleccionada:', selectedLocation);
        console.log('Asignaciones temporales:', asignaciones);
        console.log('Desasignaciones temporales:', desasignaciones);
        console.log('Puntos con productos:', selectedLocation?.mueble?.puntos_reposicion?.filter(p => p.producto));
        console.log('====================');
    };

    // Función combinada para confirmar todas las operaciones pendientes
    const handleConfirmarTodosLosCambios = async () => {
        const numAsignaciones = Object.keys(asignaciones).length;
        const numDesasignaciones = Object.keys(desasignaciones).length;
        
        if (numAsignaciones === 0 && numDesasignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay cambios pendientes para confirmar",
                variant: "default",
            });
            return;
        }

        try {
            setIsLoading(true);
            
            // Procesar primero las desasignaciones
            if (numDesasignaciones > 0) {
                await handleConfirmarDesasignaciones();
            }
            
            // Luego procesar las asignaciones
            if (numAsignaciones > 0) {
                await handleConfirmarAsignaciones();
            }
            
        } catch (error) {
            console.error('Error al procesar todos los cambios:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cancelar todos los cambios temporales
    const handleCancelarTodosLosCambios = () => {
        const numAsignaciones = Object.keys(asignaciones).length;
        const numDesasignaciones = Object.keys(desasignaciones).length;
        
        if (numAsignaciones === 0 && numDesasignaciones === 0) {
            toast({
                title: "Información",
                description: "No hay cambios pendientes para cancelar",
                variant: "default",
            });
            return;
        }

        setAsignaciones({});
        setDesasignaciones({});
        
        toast({
            title: "Todos los Cambios Cancelados",
            description: `${numAsignaciones} asignaciones y ${numDesasignaciones} desasignaciones fueron canceladas`,
        });
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
                    <Logo size="md" className="mr-4" />
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
                <DialogContent className="max-w-7xl min-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl mb-6">
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
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">Información del Mueble</h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
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
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-lg">Vista de la Estantería</h3>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={actualizarUbicacionSeleccionada}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? "Actualizando..." : "Recargar Vista"}
                                                    </Button>
                                                </div>
                                                <ShelfGrid 
                                                    filas={selectedLocation.mueble.filas || 3} 
                                                    columnas={selectedLocation.mueble.columnas || 4}
                                                    onDrop={handleDrop}
                                                    onClearCell={handleClearCell}
                                                    puntosPreAsignados={selectedLocation.mueble.puntos_reposicion?.map(punto => ({
                                                        fila: punto.nivel - 1, // Convertir de base 1 a base 0
                                                        columna: punto.estanteria - 1, // Convertir de base 1 a base 0
                                                        producto: punto.producto ? {
                                                            id_producto: punto.producto.id_producto || 0,
                                                            nombre: punto.producto.nombre,
                                                            categoria: punto.producto.categoria,
                                                            unidad_tipo: punto.producto.unidad_tipo,
                                                            unidad_cantidad: punto.producto.unidad_cantidad,
                                                            codigo_unico: '',
                                                            estado: ''
                                                        } : null
                                                    })) || []}
                                                    asignacionesTemporales={asignaciones}
                                                    desasignacionesTemporales={desasignaciones}
                                                    muebleActual={selectedLocation.mueble}
                                                />
                                                {(Object.keys(asignaciones).length > 0 || Object.keys(desasignaciones).length > 0) && (
                                                    <div className="mt-6 border-t pt-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex flex-col space-y-1">
                                                                {Object.keys(asignaciones).length > 0 && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-3 h-3 bg-yellow-400 rounded border border-yellow-500"></div>
                                                                        <span className="text-sm text-gray-600">
                                                                            {Object.keys(asignaciones).length} asignación{Object.keys(asignaciones).length > 1 ? 'es' : ''} pendiente{Object.keys(asignaciones).length > 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {Object.keys(desasignaciones).length > 0 && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-3 h-3 bg-red-400 rounded border border-red-500"></div>
                                                                        <span className="text-sm text-gray-600">
                                                                            {Object.keys(desasignaciones).length} desasignación{Object.keys(desasignaciones).length > 1 ? 'es' : ''} pendiente{Object.keys(desasignaciones).length > 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <Button
                                                                onClick={handleCancelarTodosLosCambios}
                                                                variant="outline"
                                                                className="border-gray-300 text-gray-600 hover:bg-gray-50 flex-1"
                                                                disabled={isLoading}
                                                            >
                                                                Cancelar Todos
                                                            </Button>
                                                            <Button
                                                                onClick={handleConfirmarTodosLosCambios}
                                                                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                                        Procesando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="w-4 h-4 mr-2" />
                                                                        Confirmar ({Object.keys(asignaciones).length + Object.keys(desasignaciones).length})
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : selectedLocation?.objeto ? (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-lg">Objeto</h3>
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
                                    ) : selectedLocation?.punto?.producto && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-lg">Producto</h3>
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
                                    )}
                                </div>

                                {/* Lista de Productos */}
                                <div className="border-l pl-6">
                                    <h3 className="font-semibold text-2xl mb-4">Productos</h3>
                                    <div className="mb-4">
                                        <Input
                                            type="text"
                                            placeholder="Buscar productos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full text-base py-5"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-2">
                                        {filteredProductos.map((producto) => (
                                            <div
                                                key={producto.id_producto}
                                                className="p-3 bg-card border rounded-lg cursor-move hover:bg-accent transition-colors"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, producto)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-base truncate mr-2">
                                                        {producto.nombre}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                                                        {producto.unidad_cantidad} {producto.unidad_tipo}
                                                    </div>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    <span className="inline-block bg-secondary text-secondary-foreground rounded px-2 py-1">
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
