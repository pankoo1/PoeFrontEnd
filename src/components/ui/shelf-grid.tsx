import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Producto } from '@/types/producto';

interface CeldaProducto {
    producto: Producto;
    fila: number;
    columna: number;
    temporal?: boolean;
    desasignacionTemporal?: boolean;
}

interface PuntoPreAsignado {
    fila: number;
    columna: number;
    producto: Producto | null;
    nivel?: number;      // Nivel del backend (base 1)
    estanteria?: number; // Estantería del backend (base 1)
    id_punto?: number;   // ID del punto
}

interface ShelfGridProps {
    filas: number;
    columnas: number;
    className?: string;
    onDrop?: (e: React.DragEvent<HTMLDivElement>, posicion: { fila: number, columna: number }) => void;
    onClearCell?: (posicion: { fila: number, columna: number }) => void;
    puntosPreAsignados?: PuntoPreAsignado[];
    asignacionesTemporales?: {[key: string]: Producto};
    desasignacionesTemporales?: {[key: string]: boolean};
    muebleActual?: any;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({
    filas,
    columnas,
    className = '',
    onDrop,
    onClearCell,
    puntosPreAsignados = [],
    asignacionesTemporales = {},
    desasignacionesTemporales = {},
    muebleActual
}) => {
    const [productosAsignados, setProductosAsignados] = useState<CeldaProducto[]>([]);
    const [celdaActiva, setCeldaActiva] = useState<{ fila: number, columna: number } | null>(null);

    // Efecto para cargar productos pre-asignados
    useEffect(() => {
        const productosPreAsignados = puntosPreAsignados
            .filter(punto => punto.producto !== null)
            .map(punto => {
                // Usar nivel y estanteria del backend (base 1) y convertir a base 0 para el grid
                const filaGrid = punto.nivel ? punto.nivel - 1 : punto.fila;
                const columnaGrid = punto.estanteria ? punto.estanteria - 1 : punto.columna;
                
                
                return {
                    producto: punto.producto!,
                    fila: filaGrid,
                    columna: columnaGrid
                };
            });
        setProductosAsignados(productosPreAsignados);
    }, [puntosPreAsignados]);

    // Efecto para resetear el estado interno cuando cambie el mueble actual
    useEffect(() => {
        if (muebleActual) {
            setCeldaActiva(null);
            // Los productos pre-asignados se actualizarán automáticamente por el efecto anterior
        }
    }, [muebleActual]);

    // Efecto para monitorear cambios en desasignaciones temporales
    useEffect(() => {
    }, [desasignacionesTemporales]);

    // Efecto para monitorear cambios en asignaciones temporales
    useEffect(() => {
    }, [asignacionesTemporales]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, fila: number, columna: number) => {
        e.preventDefault();
        setCeldaActiva({ fila, columna });
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setCeldaActiva(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, fila: number, columna: number) => {
        e.preventDefault();
        setCeldaActiva(null);
        
        try {
            const productoData = e.dataTransfer.getData('producto');
            if (!productoData) return;
            
            const producto = JSON.parse(productoData) as Producto;
            

            // Validar que las coordenadas están dentro de los límites
            if (fila < 0 || fila >= filas || columna < 0 || columna >= columnas) {
                return;
            }
            
            // Actualizar el estado local
            setProductosAsignados(prev => {
                const filtered = prev.filter(p => p.fila !== fila || p.columna !== columna);
                const nuevaAsignacion = { producto, fila, columna };
                return [...filtered, nuevaAsignacion];
            });
            
            // Llamar al callback del padre con las coordenadas base 0
            onDrop?.(e, { fila, columna });
        } catch (error) {
        }
    }, [onDrop]);

    const getProductoEnPosicion = useCallback((fila: number, columna: number) => {
        if (muebleActual) {
            // Convertir coordenadas del grid (base 0) a coordenadas del backend (base 1)
            const filaBackend = fila + 1;
            const columnaBackend = columna + 1;
            
            // Buscar el punto correspondiente
            const punto = muebleActual.puntos_reposicion?.find(
                (p: any) => p.nivel === filaBackend && p.estanteria === columnaBackend
            );
            
            if (punto) {
                // Verificar si está marcado para desasignación temporal
                if (desasignacionesTemporales[punto.id_punto]) {
                    return {
                        producto: punto.producto || { nombre: 'Producto', unidad_cantidad: 0, unidad_tipo: '' },
                        fila,
                        columna,
                        desasignacionTemporal: true
                    };
                }
                
                // Verificar asignaciones temporales
                if (asignacionesTemporales[punto.id_punto]) {
                    return {
                        producto: asignacionesTemporales[punto.id_punto],
                        fila,
                        columna,
                        temporal: true
                    };
                }
                
                // Si hay un producto asignado permanentemente y no está marcado para desasignación
                if (punto.producto) {
                    return {
                        producto: punto.producto,
                        fila,
                        columna
                    };
                }
            }
        }
        
        // Verificar productos pre-asignados (del estado local)
        const productoPreAsignado = productosAsignados.find(p => p.fila === fila && p.columna === columna);
        if (productoPreAsignado) return productoPreAsignado;
        
        return null;
    }, [muebleActual, desasignacionesTemporales, asignacionesTemporales, productosAsignados]);

    const getCeldaClassName = useCallback((fila: number, columna: number) => {
        const productoInfo = getProductoEnPosicion(fila, columna);
        const esActiva = celdaActiva?.fila === fila && celdaActiva?.columna === columna;
        const esTemporal = productoInfo && 'temporal' in productoInfo && productoInfo.temporal;
        const esDesasignacionTemporal = productoInfo && 'desasignacionTemporal' in productoInfo && productoInfo.desasignacionTemporal;
        
        let baseClass = `
            relative
            w-full
            h-full
            min-h-[50px]
            rounded
            transition-all
            duration-200
            border
            border-gray-300
            flex
            items-center
            justify-center
            text-xs
            font-medium
        `;
        
        if (productoInfo) {
            if (esDesasignacionTemporal) {
                baseClass += ' bg-red-50 hover:bg-red-100 border-red-300 border-2 border-dashed';
            } else if (esTemporal) {
                baseClass += ' bg-yellow-50 hover:bg-yellow-100 border-yellow-300 border-2 border-dashed';
            } else {
                baseClass += ' bg-green-50 hover:bg-green-100';
            }
        } else {
            baseClass += ' bg-gray-100 hover:bg-gray-200 cursor-pointer';
        }
        
        if (esActiva) {
            baseClass += ' ring-2 ring-primary ring-offset-1';
        }
        
        return baseClass;
    }, [getProductoEnPosicion, celdaActiva]);

    const handleCellClick = useCallback((fila: number, columna: number) => {
        const productoInfo = getProductoEnPosicion(fila, columna);
        if (productoInfo) {
            const esTemporal = 'temporal' in productoInfo && productoInfo.temporal;
            const esDesasignacionTemporal = 'desasignacionTemporal' in productoInfo && productoInfo.desasignacionTemporal;
            
            if (!esTemporal && !esDesasignacionTemporal) {
                // Si no es temporal, actualizar el estado local
                setProductosAsignados(prev => prev.filter(p => p.fila !== fila || p.columna !== columna));
            }
            // Siempre notificar al componente padre (maneja temporales y permanentes)
            onClearCell?.({ fila, columna });
        }
    }, [getProductoEnPosicion, onClearCell]);

    // Memoizar el contenido del grid para evitar re-renders innecesarios
    const gridContent = useMemo(() => {
        return Array.from({ length: filas }, (_, fila) =>
            Array.from({ length: columnas }, (_, columna) => {
                const productoInfo = getProductoEnPosicion(fila, columna);
                const esTemporal = productoInfo && 'temporal' in productoInfo && productoInfo.temporal;
                const esDesasignacionTemporal = productoInfo && 'desasignacionTemporal' in productoInfo && productoInfo.desasignacionTemporal;
                
                return (
                    <div
                        key={`${fila}-${columna}`}
                        className={getCeldaClassName(fila, columna)}
                        onDragOver={(e) => handleDragOver(e, fila, columna)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, fila, columna)}
                        onClick={() => handleCellClick(fila, columna)}
                        title={productoInfo 
                            ? `${productoInfo.producto.nombre} (${productoInfo.producto.unidad_cantidad} ${productoInfo.producto.unidad_tipo})${esTemporal ? ' - TEMPORAL' : esDesasignacionTemporal ? ' - ELIMINAR' : ''} - Click para eliminar`
                            : `Posición: Fila ${fila + 1}, Columna ${columna + 1}`
                        }
                    >
                        {productoInfo ? (
                            <div className="p-1 text-center w-full relative">
                                {esTemporal && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        T
                                    </div>
                                )}
                                {esDesasignacionTemporal && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        X
                                    </div>
                                )}
                                <div className={`font-medium text-sm truncate px-1 ${esTemporal ? 'text-yellow-700' : esDesasignacionTemporal ? 'text-red-700 line-through' : ''}`}>
                                    {productoInfo.producto.nombre}
                                </div>
                                <div className={`text-xs ${esTemporal ? 'text-yellow-600' : esDesasignacionTemporal ? 'text-red-600' : 'text-muted-foreground'}`}>
                                    {productoInfo.producto.unidad_cantidad} {productoInfo.producto.unidad_tipo}
                                </div>
                                {esTemporal && (
                                    <div className="text-xs text-yellow-600 font-semibold">
                                        PENDIENTE
                                    </div>
                                )}
                                {esDesasignacionTemporal && (
                                    <div className="text-xs text-red-600 font-semibold">
                                        ELIMINAR
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {`${fila + 1},${columna + 1}`}
                            </div>
                        )}
                    </div>
                );
            })
        ).flat();
    }, [filas, columnas, getProductoEnPosicion, getCeldaClassName, handleDragOver, handleDragLeave, handleDrop, handleCellClick]);

    return (
        <div className={`border rounded-lg p-4 ${className}`}>
            <div
                className="grid gap-2 bg-white"
                style={{
                    gridTemplateColumns: `repeat(${columnas}, minmax(80px, 1fr))`,
                    gridTemplateRows: `repeat(${filas}, minmax(80px, 1fr))`,
                }}
            >
                {gridContent}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
                Dimensiones: {filas} filas × {columnas} columnas
            </div>
        </div>
    );
};