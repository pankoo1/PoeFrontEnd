import React from 'react';

interface ShelfGridProps {
    filas: number;
    columnas: number;
    className?: string;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({
    filas,
    columnas,
    className = ''
}) => {
    return (
        <div className={`border rounded-lg p-4 ${className}`}>
            <div
                className="grid gap-2 bg-white"
                style={{
                    gridTemplateColumns: `repeat(${columnas}, minmax(40px, 1fr))`,
                    gridTemplateRows: `repeat(${filas}, minmax(40px, 1fr))`,
                }}
            >
                {Array.from({ length: filas }, (_, fila) =>
                    Array.from({ length: columnas }, (_, columna) => (
                        <div
                            key={`${fila}-${columna}`}
                            className="
                                relative
                                bg-gray-100
                                w-full
                                h-full
                                min-h-[40px]
                                rounded
                                transition-colors
                                hover:bg-gray-200
                                cursor-pointer
                                border
                                border-gray-300
                                flex
                                items-center
                                justify-center
                                text-xs
                                font-medium
                            "
                            title={`Posición: Fila ${fila + 1}, Columna ${columna + 1}`}
                        >
                            {`${fila + 1},${columna + 1}`}
                        </div>
                    ))
                ).flat()}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
                Dimensiones: {filas} filas × {columnas} columnas
            </div>
        </div>
    );
}; 