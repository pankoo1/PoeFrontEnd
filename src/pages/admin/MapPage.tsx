import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Plus, 
  Trash2, 
  Map as MapIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Grid3x3
} from 'lucide-react';
import { MapCanvas } from '@/components/mapa/MapCanvas';
import { ObjectPalette } from '@/components/mapa/ObjectPalette';
import { CreateFurnitureModal } from '@/components/mapa/CreateFurnitureModal';
import { MapaService } from '@/services/mapa.service';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { 
  Mapa, 
  ObjetoMapa, 
  VistaGraficaMapa, 
  UbicacionObjeto,
  EditorState,
  DraggedObject,
  ObjetoNuevo
} from '@/types/mapa.types';

const MapPage = () => {
  const { toast } = useToast();
  
  // Estados principales
  const [editorState, setEditorState] = useState<EditorState>({
    mapa: null,
    objetosDisponibles: [],
    ubicaciones: [],
    draggedObject: null,
    selectedObjectId: null,
    highlightedCells: [],
    hasUnsavedChanges: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  
  // Form para crear nuevo mapa
  const [newMapForm, setNewMapForm] = useState({
    nombre: '',
    filas: '',
    columnas: ''
  });
    // Clave para forzar re-render del ShelfGrid cuando sea necesario
    const [shelfGridKey, setShelfGridKey] = useState(0);

    useEffect(() => {
        loadProductos();
        loadMapaCompleto(); // Cargar el mapa una sola vez al inicio
    }, []);

    // Función para cargar el mapa completo una sola vez
    const loadMapaCompleto = async () => {
        try {
            const data = await ApiService.getMapaReposicion();
            setMapaCompleto(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar el mapa. Intenta recargar la página.",
                variant: "destructive",
            });
        }
    };

    // Función optimizada que usa datos cacheados
    const actualizarUbicacionSeleccionada = async () => {
        if (!selectedLocation || !mapaCompleto) return;
        
        try {
            const ubicacionActualizada = mapaCompleto.ubicaciones.find(
                (u: any) => u.x === selectedLocation.x && u.y === selectedLocation.y
            );
            
            if (ubicacionActualizada) {
                setSelectedLocation(ubicacionActualizada);
                // Forzar re-render del ShelfGrid
                setShelfGridKey(prev => prev + 1);
            }
        } catch (error) {
            // En caso de error, intentar recargar desde servidor
            try {
                const data = await ApiService.getMapaReposicion();
                setMapaCompleto(data);
                const ubicacionActualizada = data.ubicaciones.find(
                    (u: any) => u.x === selectedLocation.x && u.y === selectedLocation.y
                );
                if (ubicacionActualizada) {
                    setSelectedLocation(ubicacionActualizada);
                    // Forzar re-render del ShelfGrid
                    setShelfGridKey(prev => prev + 1);
                }
            } catch (reloadError) {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar la visualización. Intenta recargar la página.",
                    variant: "destructive",
                });
            }
        }
    };

    const loadProductos = async () => {
        try {
            const data = await ApiService.getProductos() as ProductosResponse;
            setProductos(data.productos || []);
        } catch (error) {
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
                toast({
                    title: "Error",
                    description: "No se pudo determinar el punto de reposición. Verifica que la posición sea válida.",
                    variant: "destructive",
                });
                return;
            }

            // **NUEVA LÓGICA: Asignación temporal en lugar de inmediata**
            
            // Agregar a asignaciones temporales
            setAsignaciones(prev => ({
                ...prev,
                [idPunto]: producto
            }));

            // Remover de desasignaciones si estaba allí
            setDesasignaciones(prev => {
                const newState = { ...prev };
                delete newState[idPunto];
                return newState;
            });

            toast({
                title: "Asignación pendiente",
                description: `${producto.nombre} será asignado al confirmar los cambios`,
            });

        } catch (error) {
            toast({
                title: "Error",
                description: "Error al asignar el producto",
                variant: "destructive",
            });
        }
    };

    const calcularIdPunto = (mueble: any, fila: number, columna: number): string | null => {
        if (!mueble?.puntos_reposicion) {
            return null;
        }

        // Buscar el punto que corresponde a la posición (fila, columna)
        // Las filas y columnas en la UI son base 0, en la BD son base 1
        const nivel = fila + 1;
        const estanteria = columna + 1;
        
        const punto = mueble.puntos_reposicion.find((p: any) => 
            p.nivel === nivel && p.estanteria === estanteria
        );
        
        if (punto) {
            return punto.id_punto.toString();
        }
        
        return null;
    };

    const handleClearCell = async (posicion: { fila: number, columna: number }) => {
        if (!selectedLocation?.mueble) return;

        const idPunto = calcularIdPunto(selectedLocation.mueble, posicion.fila, posicion.columna);
        if (!idPunto) return;

        // Verificar si hay un producto asignado temporalmente
        if (asignaciones[idPunto]) {
            // Solo remover de asignaciones temporales
            setAsignaciones(prev => {
                const newState = { ...prev };
                delete newState[idPunto];
                return newState;
            });

            toast({
                title: "Asignación cancelada",
                description: "La asignación temporal ha sido removida",
            });
            return;
        }

        // Verificar si hay un producto ya asignado en la base de datos
        const punto = selectedLocation.mueble.puntos_reposicion?.find((p: any) => 
            p.id_punto.toString() === idPunto
        );

        if (punto?.producto) {
            // Marcar para desasignación
            setDesasignaciones(prev => ({
                ...prev,
                [idPunto]: true
            }));

            toast({
                title: "Desasignación pendiente",
                description: `${punto.producto.nombre} será removido al confirmar los cambios`,
            });
        }
    };

    const handleConfirmarTodosLosCambios = async () => {
        
        setIsLoading(true);
        let errores = 0;
        let exitos = 0;

        try {
            // Procesar asignaciones
            for (const [idPunto, producto] of Object.entries(asignaciones)) {
                try {
                    
                    await ApiService.asignarProductoAPunto(producto.id_producto, parseInt(idPunto));
                    exitos++;
                } catch (error) {
                    errores++;
                }
            }

            // Procesar desasignaciones
            for (const idPunto of Object.keys(desasignaciones)) {
                try {
                    await ApiService.desasignarProductoDePunto(parseInt(idPunto));
                    exitos++;
                } catch (error) {
                    errores++;
                }
            }

            // Limpiar estados temporales
            setAsignaciones({});
            setDesasignaciones({});

            // Mostrar resultado
            if (errores === 0) {
                toast({
                    title: "¡Éxito!",
                    description: `Se procesaron correctamente ${exitos} cambio${exitos !== 1 ? 's' : ''}`,
                });
            } else {
                toast({
                    title: "Procesamiento completado con errores",
                    description: `${exitos} éxito${exitos !== 1 ? 's' : ''}, ${errores} error${errores !== 1 ? 'es' : ''}`,
                    variant: "destructive",
                });
            }

            // Recargar el mapa completo desde el servidor para reflejar los cambios
            // Pequeño delay para asegurar que el servidor haya procesado todos los cambios
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadMapaCompleto();
            // Actualizar la ubicación seleccionada con los nuevos datos
            await actualizarUbicacionSeleccionada();

        } catch (error) {
            toast({
                title: "Error",
                description: "Error inesperado al procesar los cambios",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar el botón "Recargar Vista"
    const handleRecargarVista = async () => {
        setIsLoading(true);
        try {
            await loadMapaCompleto();
            await actualizarUbicacionSeleccionada();
            // Incrementar la clave para forzar re-render
            setShelfGridKey(prev => prev + 1);
            toast({
                title: "Vista actualizada",
                description: "Los datos se han recargado desde el servidor",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo recargar la vista",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelarTodosLosCambios = () => {
        setAsignaciones({});
        setDesasignaciones({});
        toast({
            title: "Cambios cancelados",
            description: "Todas las asignaciones pendientes han sido canceladas",
        });
    };

    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Background fijo que cubre toda la pantalla */}
            <div 
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            <div className="min-h-screen relative z-10">
                {/* Header con diseño unificado */}
                <header className="border-b shadow-sm rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
                    <div className="container mx-auto px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
                                <Logo size="lg" showText={true} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Mapa Interactivo
                                </h1>
                                <p className="text-base text-muted-foreground mt-1">
                                    Gestión visual del layout del supermercado
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={navigateToDashboard}
                                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Volver al Dashboard
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/')}
                                className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-8">
                    {/* Banner informativo */}
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-accent/40 rounded-xl">
                                <Map className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Visualización del Mapa del Supermercado</h2>
                                <p className="text-muted-foreground">Haz clic en cualquier estantería para gestionar productos y asignaciones</p>
                            </div>
                        </div>
                    </div>

                    {/* Card principal del mapa */}
                    <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-2">
                                <div className="p-2 bg-primary/30 rounded-lg">
                                    <Map className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-2xl">Layout del Supermercado</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[72vh] rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                                <MapViewer
                                    onObjectClick={handleObjectClick}
                                    className="w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </main>

                {/* Dialog para gestión de productos */}
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
                                                            onClick={handleRecargarVista}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? "Actualizando..." : "Recargar Vista"}
                                                        </Button>
                                                    </div>
                                                    <ShelfGrid 
                                                        key={`shelf-grid-${shelfGridKey}`}
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
        </>
    );
};

export default MapPage;
