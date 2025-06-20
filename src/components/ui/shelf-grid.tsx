import React, { useState } from 'react';
import { Producto } from '@/types/producto';

interface CeldaProducto {
    producto: Producto;
    fila: number;
    columna: number;
}

interface ShelfGridProps {
    filas: number;
    columnas: number;
    className?: string;
    onDrop?: (e: React.DragEvent<HTMLDivElement>, posicion: { fila: number, columna: number }) => void;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({
    filas,
    columnas,
    className = '',
    onDrop
}) => {
    const [productosAsignados, setProductosAsignados] = useState<CeldaProducto[]>([]);
    const [celdaActiva, setCeldaActiva] = useState<{ fila: number, columna: number } | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, fila: number, columna: number) => {
        e.preventDefault();
        setCeldaActiva({ fila, columna });
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setCeldaActiva(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, fila: number, columna: number) => {
        e.preventDefault();
        setCeldaActiva(null);
        
        try {
            const productoData = e.dataTransfer.getData('producto');
            if (!productoData) return;
            
            const producto = JSON.parse(productoData) as Producto;
            
            // Actualizar el estado local
            setProductosAsignados(prev => {
                // Remover producto existente en la misma posición si existe
                const filtered = prev.filter(p => p.fila !== fila || p.columna !== columna);
                return [...filtered, { producto, fila, columna }];
            });
            
            // Llamar al callback del padre
            onDrop?.(e, { fila: fila + 1, columna: columna + 1 });
        } catch (error) {
            console.error('Error al procesar el producto:', error);
        }
    };

    const getProductoEnPosicion = (fila: number, columna: number) => {
        return productosAsignados.find(p => p.fila === fila && p.columna === columna);
    };

    const getCeldaClassName = (fila: number, columna: number) => {
        const productoAsignado = getProductoEnPosicion(fila, columna);
        const esActiva = celdaActiva?.fila === fila && celdaActiva?.columna === columna;
        
        return `
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
            ${productoAsignado ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}
            ${esActiva ? 'ring-2 ring-primary ring-offset-1' : ''}
            ${!productoAsignado ? 'cursor-pointer' : ''}
        `;
    };

    return (
        <div className={`border rounded-lg p-3 ${className}`}>
            <div
                className="grid gap-1.5 bg-white"
                style={{
                    gridTemplateColumns: `repeat(${columnas}, minmax(50px, 1fr))`,
                    gridTemplateRows: `repeat(${filas}, minmax(50px, 1fr))`,
                }}
            >
                {Array.from({ length: filas }, (_, fila) =>
                    Array.from({ length: columnas }, (_, columna) => {
                        const productoAsignado = getProductoEnPosicion(fila, columna);
                        
                        return (
                            <div
                                key={`${fila}-${columna}`}
                                className={getCeldaClassName(fila, columna)}
                                onDragOver={(e) => handleDragOver(e, fila, columna)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, fila, columna)}
                                title={productoAsignado 
                                    ? `${productoAsignado.producto.nombre} (${productoAsignado.producto.unidad_cantidad} ${productoAsignado.producto.unidad_tipo})`
                                    : `Posición: Fila ${fila + 1}, Columna ${columna + 1}`
                                }
                            >
                                {productoAsignado ? (
                                    <div className="p-0.5 text-center w-full">
                                        <div className="font-medium text-[10px] truncate px-1">
                                            {productoAsignado.producto.nombre}
                                        </div>
                                        <div className="text-[8px] text-muted-foreground">
                                            {productoAsignado.producto.unidad_cantidad} {productoAsignado.producto.unidad_tipo}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-muted-foreground">
                                        {`${fila + 1},${columna + 1}`}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ).flat()}
            </div>
            <div className="mt-3 text-xs text-gray-500 text-center">
                Dimensiones: {filas} filas × {columnas} columnas
            </div>
        </div>
    );
}; 