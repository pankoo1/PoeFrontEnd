import React, { useRef, useEffect, useState } from 'react';
import type { VistaGraficaMapa, ObjetoMapa, ObjetoNuevo, UbicacionObjeto } from '@/types/mapa.types';

interface MapCanvasProps {
  mapa: VistaGraficaMapa | null;
  ubicaciones: UbicacionObjeto[];
  onCellClick?: (x: number, y: number) => void;
  onObjectPlace?: (x: number, y: number, objeto: ObjetoMapa | ObjetoNuevo) => void;
  draggedObject: (ObjetoMapa | ObjetoNuevo) | null;
  highlightedCells?: { x: number; y: number }[];
}

const MAX_CANVAS_SIZE = 800; // Tamaño máximo del canvas en píxeles

// Calcular tamaño de celda dinámicamente
const calculateCellSize = (ancho: number, alto: number): number => {
  const maxDimension = Math.max(ancho, alto);
  
  // Si el mapa es pequeño (< 20), usar celdas grandes
  if (maxDimension <= 20) return 40;
  
  // Si es mediano (20-50), usar celdas medianas
  if (maxDimension <= 50) return 20;
  
  // Para mapas grandes, calcular para que quepa en MAX_CANVAS_SIZE
  return Math.max(4, Math.floor(MAX_CANVAS_SIZE / maxDimension));
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mapa,
  ubicaciones,
  onCellClick,
  onObjectPlace,
  draggedObject,
  highlightedCells = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [cellSize, setCellSize] = useState(40);
  const [zoom, setZoom] = useState(1);

  // Calcular tamaño de celda cuando cambia el mapa
  useEffect(() => {
    if (mapa) {
      const calculatedSize = calculateCellSize(mapa.ancho, mapa.alto);
      setCellSize(calculatedSize);
    }
  }, [mapa?.ancho, mapa?.alto]);

  // Renderizar el canvas
  useEffect(() => {
    if (!mapa || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar grilla base (todas las celdas son pasillos)
    for (let y = 0; y < mapa.alto; y++) {
      for (let x = 0; x < mapa.ancho; x++) {
        // Fondo base (pasillo)
        ctx.fillStyle = '#f8fafc'; // slate-50

        // Highlight si está en la lista
        if (highlightedCells.some(h => h.x === x && h.y === y)) {
          ctx.fillStyle = '#fef3c7'; // yellow-100
        }

        // Hover
        if (hoveredCell?.x === x && hoveredCell?.y === y) {
          ctx.fillStyle = '#e0e7ff'; // indigo-100
        }

        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Bordes de celda
        ctx.strokeStyle = '#e2e8f0'; // slate-200 más suave
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Dibujar objetos ubicados (muebles, muros, salidas)
    ubicaciones.forEach((ub: any) => {
      const ancho = ub.ancho || 1;
      const alto = ub.alto || 1;
      
      // Color según tipo
      if (ub.tipo_objeto === 'muro') {
        ctx.fillStyle = '#334155'; // slate-700
      } else if (ub.tipo_objeto === 'salida') {
        ctx.fillStyle = '#22c55e'; // green-500
      } else if (ub.tipo_objeto === 'mueble') {
        ctx.fillStyle = '#3b82f6'; // blue-500
      } else {
        ctx.fillStyle = '#94a3b8'; // slate-400 (default)
      }

      // Dibujar rectángulo del objeto
      ctx.fillRect(ub.x * cellSize, ub.y * cellSize, ancho * cellSize, alto * cellSize);

      // Borde del objeto
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 2;
      ctx.strokeRect(ub.x * cellSize, ub.y * cellSize, ancho * cellSize, alto * cellSize);

      // Nombre del objeto (solo si es grande)
      if (ub.nombre_objeto && cellSize >= 20 && ancho * cellSize >= 40) {
        ctx.fillStyle = '#ffffff'; // Texto blanco
        ctx.font = `bold ${Math.max(10, cellSize / 3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const texto = ub.nombre_objeto.substring(0, Math.max(5, Math.floor((ancho * cellSize) / 8)));
        ctx.fillText(
          texto,
          ub.x * cellSize + (ancho * cellSize) / 2,
          ub.y * cellSize + (alto * cellSize) / 2
        );
      }
    });

    // Previsualización de objeto siendo arrastrado
    if (draggedObject && hoveredCell) {
      const ancho = (draggedObject as any).ancho || 1;
      const alto = (draggedObject as any).alto || 1;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // blue-500 con transparencia
      ctx.fillRect(
        hoveredCell.x * cellSize,
        hoveredCell.y * cellSize,
        ancho * cellSize,
        alto * cellSize
      );

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        hoveredCell.x * cellSize,
        hoveredCell.y * cellSize,
        ancho * cellSize,
        alto * cellSize
      );
      ctx.setLineDash([]);
    }
  }, [mapa, ubicaciones, hoveredCell, draggedObject, highlightedCells, cellSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mapa) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < mapa.ancho && y >= 0 && y < mapa.alto) {
      setHoveredCell({ x, y });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mapa) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < mapa.ancho && y >= 0 && y < mapa.alto) {
      onCellClick?.(x, y);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current || !mapa || !hoveredCell || !draggedObject) return;

    onObjectPlace?.(hoveredCell.x, hoveredCell.y, draggedObject);
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  if (!mapa) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-slate-500">Selecciona o crea un mapa para comenzar</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white overflow-auto">
      <div className="mb-2 text-sm text-slate-600">
        Dimensiones: {mapa.ancho} × {mapa.alto} | Tamaño celda: {cellSize}px
      </div>
      <canvas
        ref={canvasRef}
        width={mapa.ancho * cellSize}
        height={mapa.alto * cellSize}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="cursor-crosshair"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-50 border border-slate-300"></div>
          <span>Suelo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700"></div>
          <span>Muro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500"></div>
          <span>Mueble</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Salida</span>
        </div>
      </div>
    </div>
  );
};
