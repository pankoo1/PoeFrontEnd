import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Mapa, UbicacionFisica } from '@/types/mapa';
import { MapaService } from '@/services/map.service';
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
    const animationFrameRef = useRef<number>();
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
            
            // PASO 2: Dibujar la ruta optimizada del endpoint con mejoras visuales
            if (rutaOptimizada) {
                // DEFINICIÓN UNIFICADA DE PALETA DE COLORES PARA RUTAS Y MUEBLES
                const paletaSegmentos = [
                    { 
                        inicio: 'hsl(158, 64%, 65%)', 
                        fin: 'hsl(158, 64%, 45%)', 
                        conexion: 'hsl(158, 64%, 52%)',
                        primary: 'hsl(158, 64%, 52%)', 
                        light: 'hsl(158, 64%, 65%)', 
                        dark: 'hsl(158, 64%, 40%)' 
                    }, // Verde corporativo
                    { 
                        inicio: 'hsl(213, 94%, 78%)', 
                        fin: 'hsl(213, 94%, 55%)', 
                        conexion: 'hsl(213, 94%, 68%)',
                        primary: 'hsl(213, 94%, 68%)', 
                        light: 'hsl(213, 94%, 78%)', 
                        dark: 'hsl(213, 94%, 50%)' 
                    }, // Azul logística
                    { 
                        inicio: 'hsl(43, 96%, 70%)', 
                        fin: 'hsl(43, 96%, 45%)', 
                        conexion: 'hsl(43, 96%, 56%)',
                        primary: 'hsl(43, 96%, 56%)', 
                        light: 'hsl(43, 96%, 70%)', 
                        dark: 'hsl(43, 96%, 45%)' 
                    }, // Naranja energético
                    { 
                        inicio: 'hsl(285, 85%, 75%)', 
                        fin: 'hsl(285, 85%, 45%)', 
                        conexion: 'hsl(285, 85%, 60%)',
                        primary: 'hsl(285, 85%, 60%)', 
                        light: 'hsl(285, 85%, 75%)', 
                        dark: 'hsl(285, 85%, 45%)' 
                    }, // Púrpura
                    { 
                        inicio: 'hsl(12, 76%, 75%)', 
                        fin: 'hsl(12, 76%, 45%)', 
                        conexion: 'hsl(12, 76%, 61%)',
                        primary: 'hsl(12, 76%, 61%)', 
                        light: 'hsl(12, 76%, 75%)', 
                        dark: 'hsl(12, 76%, 45%)' 
                    }, // Rojo coral
                    { 
                        inicio: 'hsl(195, 78%, 65%)', 
                        fin: 'hsl(195, 78%, 35%)', 
                        conexion: 'hsl(195, 78%, 49%)',
                        primary: 'hsl(195, 78%, 49%)', 
                        light: 'hsl(195, 78%, 65%)', 
                        dark: 'hsl(195, 78%, 35%)' 
                    }, // Cian
                ];
                
                // NUEVO: Manejo de la estructura de muebles_rutas del endpoint
                // MEJORA 1: Dibujar rutas segmentadas por mueble con gradientes
                if (rutaOptimizada.muebles_rutas && rutaOptimizada.muebles_rutas.length > 0) {
                    // Obtener punto de inicio desde las coordenadas globales (primer punto de la ruta)
                    const puntoInicioReal = rutaOptimizada.coordenadas_ruta_global && rutaOptimizada.coordenadas_ruta_global.length > 0
                        ? rutaOptimizada.coordenadas_ruta_global[0]
                        : { x: 0, y: 0 };
                    let posicionActual = { x: puntoInicioReal.x, y: puntoInicioReal.y }; // Punto de inicio real
                        let puntosConexion: Array<{ x: number, y: number, color: string }> = []; // Para dibujar después
                        
                        // PASO 1: Dibujar todas las líneas de ruta primero
                        rutaOptimizada.muebles_rutas.forEach((mueble: any, index: number) => {
                            if (mueble.ruta_optimizada_mueble && mueble.ruta_optimizada_mueble.length > 0) {
                                const rutaMueble = mueble.ruta_optimizada_mueble;
                                const colorInfo = paletaSegmentos[index % paletaSegmentos.length];
                                
                                // Crear gradiente para este segmento
                                const inicioX = posicionActual.x * cellW + cellW / 2;
                                const inicioY = posicionActual.y * cellH + cellH / 2;
                                const ultimoPaso = rutaMueble[rutaMueble.length - 1];
                                const finX = ultimoPaso.x * cellW + cellW / 2;
                                const finY = ultimoPaso.y * cellH + cellH / 2;
                                
                                const gradienteSegmento = ctx.createLinearGradient(inicioX, inicioY, finX, finY);
                                gradienteSegmento.addColorStop(0, colorInfo.inicio);
                                gradienteSegmento.addColorStop(1, colorInfo.fin);
                                
                                // Dibujar segmento de ruta hacia este mueble con gradiente
                                ctx.strokeStyle = gradienteSegmento;
                                ctx.lineWidth = 4;
                                ctx.lineCap = 'round';
                                ctx.lineJoin = 'round';
                                ctx.setLineDash([]);
                                
                                ctx.beginPath();
                                // Empezar desde la posición actual
                                ctx.moveTo(inicioX, inicioY);
                                
                                // Dibujar el segmento completo
                                rutaMueble.forEach((paso: any) => {
                                    ctx.lineTo(paso.x * cellW + cellW / 2, paso.y * cellH + cellH / 2);
                                });
                                ctx.stroke();
                                
                                // Guardar información del punto de conexión para dibujarlo después
                                if (rutaMueble.length > 0 && index < rutaOptimizada.muebles_rutas.length - 1) {
                                    puntosConexion.push({
                                        x: finX,
                                        y: finY,
                                        color: colorInfo.conexion
                                    });
                                }
                                
                                // Actualizar posición para el siguiente segmento
                                posicionActual = { x: ultimoPaso.x, y: ultimoPaso.y };
                            }
                        });
                        
                        // PASO 1.5: Dibujar punto de inicio (desde punto de partida real)
                        const startX = puntoInicioReal.x * cellW + cellW / 2;
                        const startY = puntoInicioReal.y * cellH + cellH / 2;
                        
                        // Círculo principal con gradiente corporativo
                        const startGradient = ctx.createRadialGradient(startX-2, startY-2, 0, startX, startY, 12);
                        startGradient.addColorStop(0, 'hsl(158, 64%, 60%)'); // Verde claro
                        startGradient.addColorStop(0.7, 'hsl(158, 64%, 52%)'); // Verde corporativo
                        startGradient.addColorStop(1, 'hsl(158, 64%, 45%)');   // Verde oscuro
                        
                        ctx.fillStyle = startGradient;
                        ctx.beginPath();
                        ctx.arc(startX, startY, 12, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Borde elegante
                        ctx.strokeStyle = 'hsl(0, 0%, 100%)'; // Blanco
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(startX, startY, 12, 0, Math.PI * 2);
                        ctx.stroke();
                        
                        // Icono de inicio
                        ctx.fillStyle = 'hsl(0, 0%, 100%)';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🏠', startX, startY);
                        
                        // Etiqueta "INICIO"
                        ctx.fillStyle = 'hsl(215, 25%, 27%)'; // Color foreground
                        ctx.font = 'bold 10px Arial';
                        ctx.fillText('INICIO', startX, startY + 25);
                        
                        // PASO 2: Dibujar puntos de conexión encima de las líneas
                        puntosConexion.forEach((punto) => {
                            // Punto de conexión con gradiente sutil
                            const conexionGradient = ctx.createRadialGradient(punto.x, punto.y, 0, punto.x, punto.y, 10);
                            conexionGradient.addColorStop(0, 'hsl(0, 84%, 70%)'); // Rojo claro
                            conexionGradient.addColorStop(0.7, 'hsl(0, 84%, 60%)'); // Rojo medio
                            conexionGradient.addColorStop(1, 'hsl(0, 84%, 50%)'); // Rojo oscuro
                            
                            ctx.fillStyle = conexionGradient;
                            ctx.beginPath();
                            ctx.arc(punto.x, punto.y, 10, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // Borde blanco elegante
                            ctx.strokeStyle = 'hsl(0, 0%, 100%)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(punto.x, punto.y, 10, 0, Math.PI * 2);
                            ctx.stroke();
                        });
                        
                        // PASO 3: Punto FINAL de la ruta completa
                        if (rutaOptimizada.muebles_rutas.length > 0) {
                            const ultimoMueble = rutaOptimizada.muebles_rutas[rutaOptimizada.muebles_rutas.length - 1];
                            if (ultimoMueble.ruta_optimizada_mueble && ultimoMueble.ruta_optimizada_mueble.length > 0) {
                                const ultimaRuta = ultimoMueble.ruta_optimizada_mueble;
                                const puntoFinal = ultimaRuta[ultimaRuta.length - 1];
                                const finalX = puntoFinal.x * cellW + cellW / 2;
                                const finalY = puntoFinal.y * cellH + cellH / 2;
                                
                                // Punto FINAL con estilo distintivo (verde éxito)
                                const finalGradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, 12);
                                finalGradient.addColorStop(0, 'hsl(120, 65%, 75%)'); // Verde éxito claro
                                finalGradient.addColorStop(0.7, 'hsl(120, 65%, 55%)'); // Verde éxito medio
                                finalGradient.addColorStop(1, 'hsl(120, 65%, 35%)'); // Verde éxito oscuro
                                
                                ctx.fillStyle = finalGradient;
                                ctx.beginPath();
                                ctx.arc(finalX, finalY, 12, 0, Math.PI * 2);
                                ctx.fill();
                                
                                // Borde blanco grueso
                                ctx.strokeStyle = 'hsl(0, 0%, 100%)';
                                ctx.lineWidth = 3;
                                ctx.beginPath();
                                ctx.arc(finalX, finalY, 12, 0, Math.PI * 2);
                                ctx.stroke();
                                
                                // Icono de finalización
                                ctx.fillStyle = 'hsl(0, 0%, 100%)';
                                ctx.font = 'bold 14px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText('✓', finalX, finalY);
                                
                                // Etiqueta "FIN"
                                ctx.fillStyle = 'hsl(215, 25%, 27%)'; // Color foreground
                                ctx.font = 'bold 10px Arial';
                                ctx.fillText('FIN', finalX, finalY + 25);
                            }
                        }
                }
                // FALLBACK: Ruta global única si no hay rutas segmentadas
                else if (rutaOptimizada.coordenadas_ruta_global && rutaOptimizada.coordenadas_ruta_global.length > 1) {
                    const coordenadas = rutaOptimizada.coordenadas_ruta_global;
                        
                        // Línea principal con gradiente corporativo simple
                        const routeGradient = ctx.createLinearGradient(
                            coordenadas[0].x * cellW, coordenadas[0].y * cellH,
                            coordenadas[coordenadas.length-1].x * cellW, coordenadas[coordenadas.length-1].y * cellH
                        );
                        
                        // Gradiente corporativo simple
                        routeGradient.addColorStop(0, 'hsl(158, 64%, 52%)');    // Verde corporativo
                        routeGradient.addColorStop(0.5, 'hsl(213, 94%, 68%)'); // Azul logística
                        routeGradient.addColorStop(1, 'hsl(43, 96%, 56%)');    // Naranja energético
                        
                        ctx.strokeStyle = routeGradient;
                        ctx.lineWidth = 4;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.setLineDash([]);
                        
                        ctx.beginPath();
                        ctx.moveTo(coordenadas[0].x * cellW + cellW / 2, coordenadas[0].y * cellH + cellH / 2);
                        coordenadas.forEach((coord: any, index: number) => {
                            if (index > 0) {
                                ctx.lineTo(coord.x * cellW + cellW / 2, coord.y * cellH + cellH / 2);
                            }
                        });
                        ctx.stroke();
                        
                        // Dibujar punto de INICIO (primer punto de la ruta)
                        const startX = coordenadas[0].x * cellW + cellW / 2;
                        const startY = coordenadas[0].y * cellH + cellH / 2;
                        
                        // Círculo principal con gradiente corporativo
                        const startGradient = ctx.createRadialGradient(startX-2, startY-2, 0, startX, startY, 12);
                        startGradient.addColorStop(0, 'hsl(158, 64%, 60%)'); // Verde claro
                        startGradient.addColorStop(0.7, 'hsl(158, 64%, 52%)'); // Verde corporativo
                        startGradient.addColorStop(1, 'hsl(158, 64%, 45%)');   // Verde oscuro
                        
                        ctx.fillStyle = startGradient;
                        ctx.beginPath();
                        ctx.arc(startX, startY, 12, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Borde elegante
                        ctx.strokeStyle = 'hsl(0, 0%, 100%)'; // Blanco
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(startX, startY, 12, 0, Math.PI * 2);
                        ctx.stroke();
                        
                        // Icono de inicio
                        ctx.fillStyle = 'hsl(0, 0%, 100%)';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🏠', startX, startY);
                        
                        // Etiqueta "INICIO"
                        ctx.fillStyle = 'hsl(215, 25%, 27%)'; // Color foreground
                        ctx.font = 'bold 10px Arial';
                        ctx.fillText('INICIO', startX, startY + 25);
                        
                        // Dibujar punto FINAL (último punto de la ruta)
                        const finalX = coordenadas[coordenadas.length - 1].x * cellW + cellW / 2;
                        const finalY = coordenadas[coordenadas.length - 1].y * cellH + cellH / 2;
                        
                        // Punto FINAL con estilo distintivo (verde éxito)
                        const finalGradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, 12);
                        finalGradient.addColorStop(0, 'hsl(120, 65%, 75%)'); // Verde éxito claro
                        finalGradient.addColorStop(0.7, 'hsl(120, 65%, 55%)'); // Verde éxito medio
                        finalGradient.addColorStop(1, 'hsl(120, 65%, 35%)'); // Verde éxito oscuro
                        
                        ctx.fillStyle = finalGradient;
                        ctx.beginPath();
                        ctx.arc(finalX, finalY, 12, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Borde blanco grueso
                        ctx.strokeStyle = 'hsl(0, 0%, 100%)';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.arc(finalX, finalY, 12, 0, Math.PI * 2);
                        ctx.stroke();
                        
                        // Icono de finalización
                        ctx.fillStyle = 'hsl(0, 0%, 100%)';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('✓', finalX, finalY);
                        
                        // Etiqueta "FIN"
                        ctx.fillStyle = 'hsl(215, 25%, 27%)'; // Color foreground
                        ctx.font = 'bold 10px Arial';
                        ctx.fillText('FIN', finalX, finalY + 25);
                    }
                    
                    // MEJORA 3: Dibujar marcadores de destino (solo si hay muebles_rutas)
                    if (rutaOptimizada.muebles_rutas && rutaOptimizada.muebles_rutas.length > 0) {
                    let numeroMueble = 1;
                    rutaOptimizada.muebles_rutas.forEach((mueble: any, index: number) => {
                        // Encontrar la ubicación del mueble en el mapa
                        const ubicacionMueble = ubicaciones.find(u => 
                            u.mueble && u.mueble.id_mueble === mueble.id_mueble
                        );
                        
                        if (ubicacionMueble) {
                            const x = ubicacionMueble.x * cellW + cellW / 2;
                            const y = ubicacionMueble.y * cellH + cellH / 2;
                            
                            // Usar la misma paleta unificada para marcadores
                            const colorMueble = paletaSegmentos[index % paletaSegmentos.length];
                            
                            // MARCADOR DE DESTINO CON COLORES SINCRONIZADOS
                            // Base del punto con gradiente del color del segmento
                            const destGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
                            destGradient.addColorStop(0, colorMueble.light);
                            destGradient.addColorStop(0.7, colorMueble.primary);
                            destGradient.addColorStop(1, colorMueble.dark);
                            
                            // Punto principal de destino
                            ctx.fillStyle = destGradient;
                            ctx.beginPath();
                            ctx.arc(x, y, 20, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // Borde blanco elegante
                            ctx.strokeStyle = 'hsl(0, 0%, 100%)';
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(x, y, 20, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            // NÚMERO DEL ORDEN más grande y visible
                            ctx.fillStyle = 'hsl(0, 0%, 100%)';
                            ctx.font = 'bold 18px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(numeroMueble.toString(), x, y);
                            
                            // BADGE DE PRODUCTOS (esquina superior derecha)
                            const numProductos = mueble.detalle_tareas?.length || 0;
                            if (numProductos > 0) {
                                const badgeX = x + 15;
                                const badgeY = y - 15;
                                
                                // Badge con color accent (naranja energético)
                                const badgeGradient = ctx.createRadialGradient(badgeX, badgeY, 0, badgeX, badgeY, 10);
                                badgeGradient.addColorStop(0, 'hsl(43, 96%, 60%)'); // Naranja claro
                                badgeGradient.addColorStop(1, 'hsl(43, 96%, 50%)'); // Naranja oscuro
                                
                                ctx.fillStyle = badgeGradient;
                                ctx.beginPath();
                                ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
                                ctx.fill();
                                
                                // Borde blanco del badge
                                ctx.strokeStyle = 'hsl(0, 0%, 100%)';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
                                ctx.stroke();
                                
                                // Número de productos
                                ctx.fillStyle = 'hsl(0, 0%, 100%)';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(numProductos.toString(), badgeX, badgeY);
                            }
                            
                            numeroMueble++;
                        }
                    });
                }
                
                // BACKWARD COMPATIBILITY: Mantener soporte para estructura antigua
                else if (rutaOptimizada.detalle_tareas) {
                    
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
                        
                        // Ruta de compatibilidad dibujada
                    }
                }
            }
            
            // Canvas dibujado
        };
        
        // Dibujar inicialmente
        redrawCanvas();
        
        // Si hay ruta optimizada, iniciar animación continua
        if (rutaOptimizada) {
            const animate = () => {
                redrawCanvas();
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        }
        
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
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
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

            // Usar BFS para agrupar TODAS las celdas contiguas del mismo mueble
            const cluster: UbicacionFisica[] = [];
            const queue: UbicacionFisica[] = [mueble];
            const visitados = new Set<string>();
            visitados.add(key);

            while (queue.length > 0) {
                const current = queue.shift()!;
                cluster.push(current);
                procesados.add(`${current.x}-${current.y}`);

                // Buscar vecinos adyacentes (arriba, abajo, izquierda, derecha)
                const vecinos = [
                    { x: current.x - 1, y: current.y }, // izquierda
                    { x: current.x + 1, y: current.y }, // derecha
                    { x: current.x, y: current.y - 1 }, // arriba
                    { x: current.x, y: current.y + 1 }, // abajo
                ];

                vecinos.forEach(({ x, y }) => {
                    const vecinoKey = `${x}-${y}`;
                    if (visitados.has(vecinoKey)) return;

                    const vecino = mueblesUbicaciones.find(u => 
                        u.x === x && 
                        u.y === y &&
                        u.objeto?.nombre === mueble.objeto?.nombre &&
                        u.objeto?.tipo === mueble.objeto?.tipo &&
                        !!u.objeto && !!mueble.objeto
                    );

                    if (vecino) {
                        visitados.add(vecinoKey);
                        queue.push(vecino);
                    }
                });
            }

            // Calcular el rectángulo que abarca todo el cluster
            const minX = Math.min(...cluster.map(u => u.x));
            const maxX = Math.max(...cluster.map(u => u.x));
            const minY = Math.min(...cluster.map(u => u.y));
            const maxY = Math.max(...cluster.map(u => u.y));

            const width = maxX - minX + 1;
            const height = maxY - minY + 1;

            // Determinar si es más horizontal o más vertical
            const esHorizontal = width > height;

            pasillos.push({
                x: minX,
                y: minY,
                width,
                height,
                ubicaciones: cluster,
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
