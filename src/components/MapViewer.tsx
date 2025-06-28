import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import { MapaService } from '@/services/mapaService';
import { useToast } from '@/hooks/use-toast';

interface MapViewerProps {
    idMapa?: number;
    onObjectClick?: (ubicacion: UbicacionFisica) => void;
    className?: string;
    ubicaciones?: UbicacionFisica[];
    mapa?: Mapa;
}

export const MapViewer: React.FC<MapViewerProps> = ({
    idMapa,
    onObjectClick,
    className = '',
    ubicaciones: ubicacionesProp,
    mapa: mapaProp
}) => {
    const [mapa, setMapa] = useState<Mapa | null>(mapaProp || null);
    const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>(ubicacionesProp || []);
    const [isLoading, setIsLoading] = useState(!ubicacionesProp);
    const [hoveredObjectName, setHoveredObjectName] = useState<string | null>(null);
    const [canvasKey, setCanvasKey] = useState(0); // Para forzar re-render de overlays
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellSize = 40;

    const cargarMapa = async () => {
        try {
            setIsLoading(true);
            const response = await MapaService.getMapaReposicion(idMapa);
            if (response.mapa) {
                setMapa(response.mapa);
                setUbicaciones(response.ubicaciones);
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
        if (!ubicacionesProp) {
            cargarMapa();
        } else {
            setIsLoading(false);
        }
    }, [idMapa, ubicacionesProp]);

    // Dibuja el fondo y celdas caminables/vacías en el canvas
    useEffect(() => {
        if (!mapa || !canvasRef.current) return;
        
        const redrawCanvas = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
            if (!canvas || !ctx) return;
            
            const parent = canvas.parentElement;
            if (parent) {
                const rect = parent.getBoundingClientRect();
                
                // Usar tamaño real sin devicePixelRatio para simplificar
                canvas.width = rect.width;
                canvas.height = rect.height;
                
                // Ajustar el estilo CSS para que coincida
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
            }
            
            const width = canvas.width;
            const height = canvas.height;
            const cellW = width / mapa.ancho;
            const cellH = height / mapa.alto;
            const gap = 4; // px, espacio entre celdas
            const radius = 10; // px, radio de borde
            
            ctx.clearRect(0, 0, width, height);
            
            for (let y = 0; y < mapa.alto; y++) {
                for (let x = 0; x < mapa.ancho; x++) {
                    const ubicacion = ubicaciones.find(u => u.x === x && u.y === y);
                    if (!ubicacion?.mueble && !ubicacion?.punto?.producto) {
                        // Colores blancos para el fondo
                        ctx.fillStyle = '#ffffff'; // blanco
                        ctx.strokeStyle = '#d1d5db'; // gray-300 para el borde
                        // Bordes redondeados y gap - usar las mismas coordenadas que los overlays
                        const cx = x * cellW + gap / 2;
                        const cy = y * cellH + gap / 2;
                        const w = cellW - gap;
                        const h = cellH - gap;
                        ctx.beginPath();
                        if ('roundRect' in ctx) {
                            (ctx as any).roundRect(cx, cy, w, h, radius);
                        } else {
                            const c = ctx as CanvasRenderingContext2D;
                            c.moveTo(cx + radius, cy);
                            c.lineTo(cx + w - radius, cy);
                            c.quadraticCurveTo(cx + w, cy, cx + w, cy + radius);
                            c.lineTo(cx + w, cy + h - radius);
                            c.quadraticCurveTo(cx + w, cy + h, cx + w - radius, cy + h);
                            c.lineTo(cx + radius, cy + h);
                            c.quadraticCurveTo(cx, cy + h, cx, cy + h - radius);
                            c.lineTo(cx, cy + radius);
                            c.quadraticCurveTo(cx, cy, cx + radius, cy);
                        }
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }
        };
        
        // Dibujar inicialmente
        redrawCanvas();
        
        // Pequeño delay para asegurar que el canvas esté listo antes de los overlays
        const timeoutId = setTimeout(() => {
            setCanvasKey(prev => prev + 1);
        }, 50);
        
        // Agregar listener para redimensionar
        const handleResize = () => {
            redrawCanvas();
            setCanvasKey(prev => prev + 1); // Forzar re-render de overlays
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup del listener al desmontar
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [mapa, ubicaciones]);

    const isHighlighted = (ubicacion: UbicacionFisica) => {
        if (!hoveredObjectName || !ubicacion.objeto) return false;
        return ubicacion.objeto.nombre === hoveredObjectName;
    };

    const handleMouseEnter = (ubicacion: UbicacionFisica) => {
        if (ubicacion.objeto?.nombre) {
            setHoveredObjectName(ubicacion.objeto.nombre);
        }
    };

    const handleMouseLeave = () => {
        setHoveredObjectName(null);
    };

    // Memoizar los overlays para mejorar rendimiento en mapas grandes
    const overlays = useMemo(() => {
        if (!mapa || !canvasRef.current) return [];
        
        return ubicaciones.filter(u => u.mueble || u.punto?.producto).map(u => {
            const isHighlightedNode = isHighlighted(u);
            const canvas = canvasRef.current;
            if (!canvas) return null;
            
            // Usar las mismas coordenadas exactas que el canvas - píxeles absolutos
            const cellW = canvas.width / mapa.ancho;
            const cellH = canvas.height / mapa.alto;
            const gap = 4; // mismo gap que el canvas
            const radius = 10; // mismo radius que el canvas
            
            // Coordenadas exactas como en el canvas - píxeles absolutos
            const left = u.x * cellW + gap / 2;
            const top = u.y * cellH + gap / 2;
            const width = cellW - gap;
            const height = cellH - gap;
            
            return (
                <div
                    key={`${u.x}-${u.y}-${canvasKey}`}
                    style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: 2,
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        transform: isHighlightedNode ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: isHighlightedNode ? '0 0 0 2px orange' : undefined,
                    }}
                    onClick={() => onObjectClick?.(u)}
                    onMouseEnter={() => handleMouseEnter(u)}
                    onMouseLeave={handleMouseLeave}
                    title={u.mueble ?
                        `Mueble - Estantería: ${u.mueble.estanteria}, Nivel: ${u.mueble.nivel}, Filas: ${u.mueble.filas}, Columnas: ${u.mueble.columnas}` :
                        u.objeto?.nombre || ''
                    }
                >
                    {u.mueble && (
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: `${radius}px`, 
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', 
                            border: '2px solid #3b82f6',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }} />
                    )}
                    {u.punto?.producto && (
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white w-5/6 h-5/6 flex items-center justify-center rounded-lg font-bold text-xs shadow-lg">
                            {u.punto.producto.nombre.substring(0, 3)}
                        </div>
                    )}
                    {isHighlightedNode && u.objeto?.nombre && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg z-30">
                            {u.objeto.nombre}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                    )}
                </div>
            );
        }).filter(Boolean);
    }, [mapa, ubicaciones, hoveredObjectName, canvasKey, onObjectClick]);
    const renderDebugInfo = () => {
        const muebles = ubicaciones.filter(u => u.mueble !== null);
        const productos = ubicaciones.filter(u => u.punto?.producto !== null);
        const objetos = ubicaciones.filter(u => u.objeto !== null);
        return (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 text-xs rounded-xl border border-gray-200 shadow-lg z-20">
                <div className="font-semibold text-gray-900 mb-2">Información del Mapa</div>
                <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between space-x-4">
                        <span>Dimensiones:</span>
                        <span className="font-medium">{mapa?.ancho}×{mapa?.alto}</span>
                    </div>
                    <div className="flex justify-between space-x-4">
                        <span>Muebles:</span>
                        <span className="font-medium text-blue-600">{muebles.length}</span>
                    </div>
                    <div className="flex justify-between space-x-4">
                        <span>Productos:</span>
                        <span className="font-medium text-green-600">{productos.length}</span>
                    </div>
                    <div className="flex justify-between space-x-4">
                        <span>Objetos:</span>
                        <span className="font-medium text-orange-600">{objetos.length}</span>
                    </div>
                </div>
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
                {ubicaciones.length === 0 && (
                    <pre className="text-xs text-gray-400 bg-gray-100 p-2 rounded max-w-lg overflow-x-auto">
                        {JSON.stringify({ ubicaciones, mapa }, null, 2)}
                    </pre>
                )}
            </div>
        );
    }

    // Usar 100% del tamaño del contenedor/card
    return (
        <div
            className={`relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-gray-200 shadow-lg ${className}`}
        >
            {/* Canvas de fondo */}
            <canvas
                ref={canvasRef}
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 1, 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '0.75rem' 
                }}
            />
            {/* Overlays React para muebles y productos */}
            {overlays}
            {renderDebugInfo()}
        </div>
    );
};
