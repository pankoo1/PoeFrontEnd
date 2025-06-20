import React, { useEffect, useState } from 'react';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import { MapaService } from '@/services/mapaService';
import { useToast } from '@/hooks/use-toast';

interface MapViewerProps {
    idMapa?: number;
    onObjectClick?: (ubicacion: UbicacionFisica) => void;
    className?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
    idMapa,
    onObjectClick,
    className = ''
}) => {
    const [mapa, setMapa] = useState<Mapa | null>(null);
    const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const cargarMapa = async () => {
        try {
            setIsLoading(true);
            const response = await MapaService.getMapaReposicion(idMapa);
            if (response.mapa) {
                setMapa(response.mapa);
                setUbicaciones(response.ubicaciones);
                // Log para verificar muebles
                const muebles = response.ubicaciones.filter(u => u.mueble !== null);
                console.log('Ubicaciones completas:', response.ubicaciones);
                console.log('Muebles encontrados:', muebles);
                console.log('Ejemplo de ubicación con mueble:', muebles[0]);
            }
        } catch (error) {
            console.error('Error al cargar el mapa:', error);
            toast({
                title: 'Error',
                description: 'No se pudo cargar el mapa',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarMapa();
    }, [idMapa]);

    const getObjectColor = (ubicacion: UbicacionFisica) => {
        if (ubicacion.punto?.producto) {
            return 'bg-green-500'; // Punto con producto
        }
        if (ubicacion.mueble) {
            return 'bg-blue-200'; // Cambiamos a un azul más claro para los muebles
        }
        if (ubicacion.objeto?.caminable) {
            return 'bg-gray-200'; // Objeto caminable
        }
        return 'bg-red-500'; // Objeto no caminable u otro
    };

    // Función para mostrar información de depuración
    const renderDebugInfo = () => {
        const muebles = ubicaciones.filter(u => u.mueble !== null);
        const productos = ubicaciones.filter(u => u.punto?.producto !== null);
        const objetos = ubicaciones.filter(u => u.objeto !== null);
        
        return (
            <div className="absolute top-0 right-0 bg-white/80 p-2 text-xs rounded-bl-lg border border-gray-200 z-10">
                <div>Dimensiones: {mapa?.ancho}x{mapa?.alto}</div>
                <div>Muebles: {muebles.length}</div>
                <div>Productos: {productos.length}</div>
                <div>Objetos: {objetos.length}</div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!mapa) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-muted-foreground mb-2">No hay mapa disponible</p>
                {/* Mostrar mensaje de la API si existe */}
                {ubicaciones.length === 0 && (
                    <pre className="text-xs text-gray-400 bg-gray-100 p-2 rounded max-w-lg overflow-x-auto">
                        {JSON.stringify({ ubicaciones, mapa }, null, 2)}
                    </pre>
                )}
            </div>
        );
    }

    return (
        <div 
            className={`relative overflow-auto border rounded-lg ${className}`}
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px'
            }}
        >
            {renderDebugInfo()}
            <div
                className="relative grid gap-0.5 p-4 bg-white"
                style={{
                    gridTemplateColumns: `repeat(${mapa.ancho}, minmax(40px, 1fr))`,
                    gridTemplateRows: `repeat(${mapa.alto}, minmax(40px, 1fr))`,
                }}
            >
                {Array.from({ length: mapa.alto }, (_, y) =>
                    Array.from({ length: mapa.ancho }, (_, x) => {
                        const ubicacion = ubicaciones.find(u => u.x === x && u.y === y);
                        return (
                            <div
                                key={`${x}-${y}`}
                                className={`
                                    relative 
                                    ${ubicacion ? getObjectColor(ubicacion) : 'bg-white'}
                                    w-full 
                                    h-full 
                                    min-h-[40px] 
                                    rounded
                                    transition-colors
                                    hover:opacity-80
                                    cursor-pointer
                                    border
                                    border-gray-300
                                    flex
                                    items-center
                                    justify-center
                                    text-xs
                                    font-bold
                                `}
                                style={{
                                    gridColumn: x + 1,
                                    gridRow: y + 1,
                                }}
                                onClick={() => ubicacion && onObjectClick?.(ubicacion)}
                                title={ubicacion?.mueble ? 
                                    `Mueble - Estantería: ${ubicacion.mueble.estanteria}, Nivel: ${ubicacion.mueble.nivel}, Filas: ${ubicacion.mueble.filas}, Columnas: ${ubicacion.mueble.columnas}` :
                                    ubicacion?.objeto?.nombre || ''
                                }
                            >
                                {ubicacion?.mueble && (
                                    <div className="w-full h-full"></div>
                                )}
                                {ubicacion?.punto?.producto && (
                                    <div className="text-white">
                                        {ubicacion.punto.producto.nombre.substring(0, 3)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ).flat()}
            </div>
        </div>
    );
};
