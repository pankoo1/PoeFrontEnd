import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import { MapaService } from '@/services/mapaService';
import { useToast } from '@/hooks/use-toast';
import { RutaOptimizadaResponse } from '@/services/api';

interface MapViewerProps {
    idMapa?: number;
    onObjectClick?: (ubicacion: UbicacionFisica) => void;
    className?: string;
    ubicaciones?: UbicacionFisica[];
    mapa?: Mapa;
    rutaOptimizada?: RutaOptimizadaResponse | null;
    modoReponedor?: boolean; // Nuevo: modo especial para reponedores
}

export const MapViewer: React.FC<MapViewerProps> = ({
    idMapa,
    onObjectClick,
    className = '',
    ubicaciones: ubicacionesProp,
    mapa: mapaProp,
    rutaOptimizada,
    modoReponedor = false
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

    // Dibuja las rutas optimizadas en el canvas
    useEffect(() => {
        if (!mapa || !canvasRef.current || !rutaOptimizada) return;
        
        const drawRoute = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
            if (!canvas || !ctx) return;
            
            const width = canvas.width;
            const height = canvas.height;
            const cellW = width / mapa.ancho;
            const cellH = height / mapa.alto;
            
            // Dibujar la ruta optimizada
            if (rutaOptimizada.coordenadas_ruta && rutaOptimizada.coordenadas_ruta.length > 0) {
                ctx.strokeStyle = '#3b82f6'; // azul
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                // Agregar un poco de transparencia para que se vea mejor
                ctx.globalAlpha = 0.8;
                
                ctx.beginPath();
                rutaOptimizada.coordenadas_ruta.forEach((coord, index) => {
                    const x = coord.x * cellW + cellW / 2;
                    const y = coord.y * cellH + cellH / 2;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                
                // Dibujar puntos importantes: inicio y fin
                ctx.globalAlpha = 1.0;
                
                // Punto de inicio (verde)
                if (rutaOptimizada.coordenadas_ruta.length > 0) {
                    const startCoord = rutaOptimizada.coordenadas_ruta[0];
                    const startX = startCoord.x * cellW + cellW / 2;
                    const startY = startCoord.y * cellH + cellH / 2;
                    
                    ctx.fillStyle = '#22c55e'; // verde
                    ctx.beginPath();
                    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Borde blanco
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
                // Dibujar puntos de reposición con el mismo estilo de punto rojo
                rutaOptimizada.puntos_reposicion.forEach((punto, index) => {
                    const x = punto.mueble.coordenadas.x * cellW + cellW / 2;
                    const y = punto.mueble.coordenadas.y * cellH + cellH / 2;
                    
                    // Punto rojo más grande y visible para todos los destinos
                    ctx.fillStyle = '#dc2626'; // rojo más intenso
                    ctx.beginPath();
                    ctx.arc(x, y, 15, 0, Math.PI * 2); // Radio aumentado para mayor visibilidad
                    ctx.fill();
                    
                    // Borde blanco más grueso
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    
                    // Número del orden de visita con fuente más grande
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(punto.orden_visita.toString(), x, y);
                });
            }
        };
        
        // Pequeño delay para asegurar que el canvas base ya esté dibujado
        const timeoutId = setTimeout(drawRoute, 100);
        
        return () => clearTimeout(timeoutId);
    }, [mapa, rutaOptimizada]);

    const isHighlighted = (ubicacion: UbicacionFisica) => {
        if (!hoveredObjectName || !ubicacion.objeto) return false;
        return ubicacion.objeto.nombre === hoveredObjectName;
    };

    // Función para determinar si un mueble es un destino en la ruta optimizada
    const esMuebleDestino = (ubicacion: UbicacionFisica) => {
        if (!rutaOptimizada?.puntos_reposicion || !ubicacion.mueble) return false;
        
        // Verificar si las coordenadas de esta ubicación coinciden con algún punto de reposición
        return rutaOptimizada.puntos_reposicion.some(punto => {
            // Comparar coordenadas del punto de reposición con la ubicación actual
            return punto.mueble.coordenadas.x === ubicacion.x && 
                   punto.mueble.coordenadas.y === ubicacion.y;
        });
    };

    const handleMouseEnter = (ubicacion: UbicacionFisica) => {
        // Desactivar hover en modo reponedor
        if (modoReponedor) return;
        
        if (ubicacion.objeto?.nombre) {
            setHoveredObjectName(ubicacion.objeto.nombre);
        }
    };

    const handleMouseLeave = () => {
        // Desactivar hover en modo reponedor
        if (modoReponedor) return;
        
        setHoveredObjectName(null);
    };

    // Función para agrupar muebles contiguos en pasillos
    const agruparMueblesEnPasillos = useMemo(() => {
        if (!mapa || ubicaciones.length === 0) return [];

        const mueblesUbicaciones = ubicaciones.filter(u => u.mueble);
        const pasillos: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            ubicaciones: UbicacionFisica[];
            esHorizontal: boolean;
        }> = [];
        const procesados = new Set<string>();

        mueblesUbicaciones.forEach(mueble => {
            const key = `${mueble.x}-${mueble.y}`;
            if (procesados.has(key)) return;

            // Buscar muebles contiguos horizontalmente
            const pasilloHorizontal = [mueble];
            let x = mueble.x + 1;
            while (x < mapa.ancho) {
                const siguienteMueble = mueblesUbicaciones.find(u => u.x === x && u.y === mueble.y);
                if (siguienteMueble) {
                    pasilloHorizontal.push(siguienteMueble);
                    x++;
                } else {
                    break;
                }
            }

            // Buscar muebles contiguos verticalmente
            const pasilloVertical = [mueble];
            let y = mueble.y + 1;
            while (y < mapa.alto) {
                const siguienteMueble = mueblesUbicaciones.find(u => u.x === mueble.x && u.y === y);
                if (siguienteMueble) {
                    pasilloVertical.push(siguienteMueble);
                    y++;
                } else {
                    break;
                }
            }

            // Elegir el pasillo más largo (horizontal vs vertical)
            const pasilloFinal = pasilloHorizontal.length >= pasilloVertical.length 
                ? pasilloHorizontal 
                : pasilloVertical;
            const esHorizontal = pasilloFinal === pasilloHorizontal;

            // Marcar como procesados
            pasilloFinal.forEach(u => {
                procesados.add(`${u.x}-${u.y}`);
            });

            // Crear el rectángulo del pasillo
            pasillos.push({
                x: pasilloFinal[0].x,
                y: pasilloFinal[0].y,
                width: esHorizontal ? pasilloFinal.length : 1,
                height: esHorizontal ? 1 : pasilloFinal.length,
                ubicaciones: pasilloFinal,
                esHorizontal
            });
        });

        return pasillos;
    }, [mapa, ubicaciones]);

    // Memoizar los overlays para mejorar rendimiento en mapas grandes
    // Memoizar los overlays para mejorar rendimiento en mapas grandes
    const overlays = useMemo(() => {
        if (!mapa || !canvasRef.current) return [];
        
        const canvas = canvasRef.current;
        const cellW = canvas.width / mapa.ancho;
        const cellH = canvas.height / mapa.alto;
        const gap = 4; // mismo gap que el canvas
        const radius = 10; // mismo radius que el canvas
        
        const overlaysArray: JSX.Element[] = [];

        // Renderizar pasillos (muebles agrupados)
        agruparMueblesEnPasillos.forEach((pasillo, index) => {
            const isHighlightedPasillo = pasillo.ubicaciones.some(u => isHighlighted(u));
            const tieneDestino = pasillo.ubicaciones.some(u => esMuebleDestino(u));
            
            // Coordenadas del rectángulo del pasillo
            const left = pasillo.x * cellW + gap / 2;
            const top = pasillo.y * cellH + gap / 2;
            const width = pasillo.width * cellW - gap;
            const height = pasillo.height * cellH - gap;
            
            overlaysArray.push(
                <div
                    key={`pasillo-${index}-${canvasKey}`}
                    style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: 2,
                        pointerEvents: modoReponedor ? 'none' : 'auto',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        transform: isHighlightedPasillo ? 'scale(1.02)' : 'scale(1)',
                        borderRadius: `${radius}px`,
                        background: modoReponedor && tieneDestino 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' // gradiente naranja para destinos
                            : 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', // gradiente azul por defecto
                        border: modoReponedor && tieneDestino
                            ? '2px solid #d97706'
                            : '1px solid #60a5fa',
                        cursor: modoReponedor ? 'default' : 'pointer',
                        // Efecto de pasillo de supermercado
                        boxShadow: isHighlightedPasillo 
                            ? '0 0 0 3px orange, 0 4px 12px rgba(0,0,0,0.15)' 
                            : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                    onClick={() => {
                        if (!modoReponedor && onObjectClick) {
                            // Llamar onClick para la primera ubicación del pasillo
                            onObjectClick(pasillo.ubicaciones[0]);
                        }
                    }}
                    onMouseEnter={() => {
                        if (!modoReponedor && pasillo.ubicaciones[0].objeto?.nombre) {
                            setHoveredObjectName(pasillo.ubicaciones[0].objeto.nombre);
                        }
                    }}
                    onMouseLeave={() => {
                        if (!modoReponedor) {
                            setHoveredObjectName(null);
                        }
                    }}
                    title={!modoReponedor ? 
                        `Pasillo ${pasillo.ubicaciones[0].objeto?.nombre || ''} - ${pasillo.ubicaciones.length} sección(es)` 
                        : ''}
                >
                    {/* Etiqueta del pasillo */}
                    <div 
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#1f2937',
                            fontWeight: '600',
                            fontSize: '12px',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {pasillo.ubicaciones[0].objeto?.nombre || `Pasillo ${index + 1}`}
                    </div>
                    
                    {/* Indicador de productos en el pasillo */}
                    {pasillo.ubicaciones.some(u => u.punto?.producto) && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                border: '2px solid white',
                                fontSize: '8px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            {pasillo.ubicaciones.filter(u => u.punto?.producto).length}
                        </div>
                    )}
                    
                    {/* Tooltip mejorado */}
                    {isHighlightedPasillo && pasillo.ubicaciones[0].objeto?.nombre && (
                        <div 
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.9)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                marginBottom: '4px',
                                zIndex: 10,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            {pasillo.ubicaciones[0].objeto.nombre}
                            <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                {pasillo.ubicaciones.length} sección(es) - {pasillo.esHorizontal ? 'Horizontal' : 'Vertical'}
                            </div>
                        </div>
                    )}
                </div>
            );
        });

        // Renderizar productos individuales que no están en pasillos
        ubicaciones.filter(u => u.punto?.producto && !u.mueble).forEach(u => {
            const left = u.x * cellW + gap / 2;
            const top = u.y * cellH + gap / 2;
            const width = cellW - gap;
            const height = cellH - gap;
            
            overlaysArray.push(
                <div
                    key={`producto-${u.x}-${u.y}-${canvasKey}`}
                    style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: 3,
                        pointerEvents: modoReponedor ? 'none' : 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: `${radius}px`,
                    }}
                    onClick={() => !modoReponedor && onObjectClick?.(u)}
                >
                    <div 
                        style={{
                            background: '#22c55e',
                            color: 'white',
                            width: '80%',
                            height: '80%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: `${radius}px`,
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}
                    >
                        {u.punto?.producto?.nombre.substring(0, 3)}
                    </div>
                </div>
            );
        });

        return overlaysArray;
    }, [mapa, ubicaciones, hoveredObjectName, canvasKey, onObjectClick, modoReponedor, rutaOptimizada, agruparMueblesEnPasillos]);
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
            className={`relative w-full h-full min-h-[400px] overflow-auto border rounded-lg ${className}`}
        >
            {/* Canvas de fondo */}
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, width: '100%', height: '100%' }}
            />
            {/* Overlays React para muebles y productos */}
            {overlays}
            {renderDebugInfo()}
        </div>
    );
};
