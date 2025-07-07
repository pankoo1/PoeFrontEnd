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
    modoReponedor?: boolean; // Nuevo: modo especial para reponedores
    modoSupervisor?: boolean; // Nuevo: modo especial para supervisores
    rutaOptimizada?: any; // Nueva prop para recibir datos de ruta del endpoint
}

export const MapViewer: React.FC<MapViewerProps> = ({
    idMapa,
    onObjectClick,
    className = '',
    ubicaciones: ubicacionesProp,
    mapa: mapaProp,
    modoReponedor = false,
    modoSupervisor = false,
    rutaOptimizada = null
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

    // Dibuja el fondo, celdas caminables/vacías y rutas optimizadas en el canvas
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
            
            // Limpiar canvas
            ctx.clearRect(0, 0, width, height);
            
            // PASO 1: Dibujar el fondo y celdas caminables
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
            
            // PASO 2: Dibujar la ruta optimizada del endpoint si existe
            if (rutaOptimizada) {
                console.log('[MapViewer] Dibujando ruta del endpoint:', rutaOptimizada);
                
                // NUEVO: Manejo de la estructura de muebles_rutas del endpoint
                if (rutaOptimizada.muebles_rutas && rutaOptimizada.muebles_rutas.length > 0) {
                    console.log('[MapViewer] Dibujando ruta desde muebles_rutas');
                    
                    // Primero dibujar la ruta global si existe
                    if (rutaOptimizada.coordenadas_ruta_global && rutaOptimizada.coordenadas_ruta_global.length > 1) {
                        ctx.strokeStyle = '#3b82f6'; // azul
                        ctx.lineWidth = 3;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.globalAlpha = 0.6;
                        
                        ctx.beginPath();
                        const primeraCoord = rutaOptimizada.coordenadas_ruta_global[0];
                        ctx.moveTo(primeraCoord.x * cellW + cellW / 2, primeraCoord.y * cellH + cellH / 2);
                        
                        rutaOptimizada.coordenadas_ruta_global.forEach((coord: any, index: number) => {
                            if (index > 0) {
                                ctx.lineTo(coord.x * cellW + cellW / 2, coord.y * cellH + cellH / 2);
                            }
                        });
                        
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    }
                    
                    // Dibujar punto de inicio (verde)
                    ctx.fillStyle = '#22c55e'; // verde
                    ctx.beginPath();
                    ctx.arc(0 * cellW + cellW / 2, 0 * cellH + cellH / 2, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Dibujar marcadores para cada mueble en la ruta
                    let numeroMueble = 1;
                    rutaOptimizada.muebles_rutas.forEach((mueble: any) => {
                        // Encontrar la ubicación del mueble en el mapa
                        const ubicacionMueble = ubicaciones.find(u => 
                            u.mueble && u.mueble.id_mueble === mueble.id_mueble
                        );
                        
                        if (ubicacionMueble) {
                            const x = ubicacionMueble.x * cellW + cellW / 2;
                            const y = ubicacionMueble.y * cellH + cellH / 2;
                            
                            // Marcador del mueble (círculo azul con número)
                            ctx.fillStyle = '#2563eb'; // azul más oscuro
                            ctx.beginPath();
                            ctx.arc(x, y, 12, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            
                            // Número del mueble
                            ctx.fillStyle = '#ffffff';
                            ctx.font = 'bold 10px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(numeroMueble.toString(), x, y);
                            
                            numeroMueble++;
                        }
                    });
                    
                    console.log(`[MapViewer] Dibujados ${numeroMueble - 1} muebles en la ruta`);
                } 
                // BACKWARD COMPATIBILITY: Mantener soporte para estructura antigua
                else if (rutaOptimizada.detalle_tareas) {
                    console.log('[MapViewer] Dibujando ruta desde detalle_tareas (compatibilidad)');
                    
                    const puntosReposicion = rutaOptimizada.detalle_tareas || [];
                    
                    if (puntosReposicion.length > 0) {
                        // Dibujar líneas conectando los puntos
                        ctx.strokeStyle = '#3b82f6'; // azul
                        ctx.lineWidth = 4;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.globalAlpha = 0.8;
                        
                        ctx.beginPath();
                        
                        // Punto de inicio (0,0)
                        let currentX = 0 * cellW + cellW / 2;
                        let currentY = 0 * cellH + cellH / 2;
                        ctx.moveTo(currentX, currentY);
                        
                        // Conectar con cada punto de reposición
                        puntosReposicion.forEach((detalle: any, index: number) => {
                            if (detalle.mueble && detalle.mueble.coordenadas) {
                                const x = detalle.mueble.coordenadas.x * cellW + cellW / 2;
                                const y = detalle.mueble.coordenadas.y * cellH + cellH / 2;
                                ctx.lineTo(x, y);
                                currentX = x;
                                currentY = y;
                            }
                        });
                        
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                        
                        // Dibujar punto de inicio (verde)
                        ctx.fillStyle = '#22c55e'; // verde
                        ctx.beginPath();
                        ctx.arc(0 * cellW + cellW / 2, 0 * cellH + cellH / 2, 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Dibujar puntos de reposición con números
                        puntosReposicion.forEach((detalle: any, index: number) => {
                            if (detalle.mueble && detalle.mueble.coordenadas) {
                                const x = detalle.mueble.coordenadas.x * cellW + cellW / 2;
                                const y = detalle.mueble.coordenadas.y * cellH + cellH / 2;
                                
                                // Punto rojo para destinos
                                ctx.fillStyle = '#dc2626'; // rojo
                                ctx.beginPath();
                                ctx.arc(x, y, 15, 0, Math.PI * 2);
                                ctx.fill();
                                
                                // Borde blanco
                                ctx.strokeStyle = '#ffffff';
                                ctx.lineWidth = 3;
                                ctx.stroke();
                                
                                // Número del orden de visita
                                ctx.fillStyle = '#ffffff';
                                ctx.font = 'bold 14px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText((index + 1).toString(), x, y);
                            }
                        });
                        
                        console.log('[MapViewer] Ruta del endpoint (compatibilidad) dibujada exitosamente');
                    }
                }
            } else {
                console.log('[MapViewer] No hay ruta del endpoint para dibujar');
            }
            
            console.log('[MapViewer] Canvas dibujado exitosamente');
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
    }, [mapa, ubicaciones, rutaOptimizada]); // Dependencias del efecto del canvas

    const isHighlighted = (ubicacion: UbicacionFisica) => {
        if (!hoveredObjectName || !ubicacion.objeto) return false;
        return ubicacion.objeto.nombre === hoveredObjectName;
    };

    // Función para determinar si un mueble es un destino en la ruta optimizada del endpoint
    const esMuebleDestino = (ubicacion: UbicacionFisica) => {
        if (!rutaOptimizada || !ubicacion.mueble) return false;
        
        // Nuevo: Verificar en muebles_rutas
        if (rutaOptimizada.muebles_rutas) {
            return rutaOptimizada.muebles_rutas.some((mueble: any) => 
                mueble.id_mueble === ubicacion.mueble.id_mueble
            );
        }
        
        // Backward compatibility: estructura antigua
        if (rutaOptimizada.detalle_tareas) {
            return rutaOptimizada.detalle_tareas.some((detalle: any) => {
                return detalle.mueble && 
                       detalle.mueble.coordenadas &&
                       detalle.mueble.coordenadas.x === ubicacion.x && 
                       detalle.mueble.coordenadas.y === ubicacion.y;
            });
        }
        
        return false;
    };

    // Función para determinar si un pasillo pertenece al supervisor (tiene productos asignados)
    const esPasilloDeSupervisor = (ubicaciones: UbicacionFisica[]) => {
        if (!modoSupervisor) return true; // En otros modos, todos los pasillos son "del usuario"
        
        // Un pasillo pertenece al supervisor si al menos uno de sus puntos tiene productos
        return ubicaciones.some(ubicacion => 
            ubicacion.mueble?.puntos_reposicion?.some(punto => punto.producto !== null)
        );
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
            const esPasilloDeSup = esPasilloDeSupervisor(pasillo.ubicaciones);
            
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
                            : modoSupervisor && !esPasilloDeSup
                            ? 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)' // gradiente gris para pasillos no del supervisor
                            : 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', // gradiente azul por defecto
                        border: modoReponedor && tieneDestino
                            ? '2px solid #d97706'
                            : modoSupervisor && !esPasilloDeSup
                            ? '1px solid #9ca3af' // borde gris para pasillos no del supervisor
                            : '1px solid #60a5fa',
                        cursor: modoReponedor ? 'default' : 'pointer',
                        // Efecto de pasillo de supermercado
                        boxShadow: isHighlightedPasillo 
                            ? '0 0 0 3px orange, 0 4px 12px rgba(0,0,0,0.15)' 
                            : modoSupervisor && !esPasilloDeSup
                            ? '0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)' // sombra más sutil para pasillos no del supervisor
                            : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                        opacity: modoSupervisor && !esPasilloDeSup ? 0.6 : 1, // Hacer más transparentes los pasillos no del supervisor
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
                        modoSupervisor 
                            ? `${pasillo.ubicaciones[0].objeto?.nombre || 'Pasillo'} - ${esPasilloDeSup ? 'ASIGNADO' : 'NO ASIGNADO'} (${pasillo.ubicaciones.length} sección(es))`
                            : `Pasillo ${pasillo.ubicaciones[0].objeto?.nombre || ''} - ${pasillo.ubicaciones.length} sección(es)` 
                        : ''}
                >
                    {/* Etiqueta del pasillo */}
                    <div 
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: modoSupervisor && !esPasilloDeSup ? '#6b7280' : '#1f2937', // Color más tenue para pasillos no del supervisor
                            fontWeight: modoSupervisor && !esPasilloDeSup ? '500' : '600',
                            fontSize: '12px',
                            textAlign: 'center',
                            textShadow: modoSupervisor && !esPasilloDeSup 
                                ? '0 1px 2px rgba(255,255,255,0.6)' 
                                : '0 1px 2px rgba(255,255,255,0.8)',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {pasillo.ubicaciones[0].objeto?.nombre || `Pasillo ${index + 1}`}
                        {modoSupervisor && !esPasilloDeSup && (
                            <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
                                (No asignado)
                            </div>
                        )}
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
                                {modoSupervisor && (
                                    <div style={{ color: esPasilloDeSup ? '#22c55e' : '#f59e0b' }}>
                                        {esPasilloDeSup ? '✓ Asignado a tu supervisión' : '⚠ No asignado'}
                                    </div>
                                )}
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
    }, [mapa, ubicaciones, hoveredObjectName, canvasKey, onObjectClick, modoReponedor, modoSupervisor, rutaOptimizada, agruparMueblesEnPasillos]);
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
