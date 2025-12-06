import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { VistaGraficaMapa, ObjetoMapa, ObjetoNuevo, UbicacionObjeto } from '@/types/mapa.types';
import { unifyContiguousFurniture } from '@/utils/mapHelpers';

interface MapCanvasProps {
  mapa: VistaGraficaMapa | null;
  ubicaciones: UbicacionObjeto[];
  onCellClick?: (x: number, y: number, event?: { ctrlKey?: boolean }) => void;
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
  const animationFrameRef = useRef<number>();
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [cellSize, setCellSize] = useState(40);
  const [zoom, setZoom] = useState(1);

  // Memoizar muebles unificados para mejor rendimiento
  const unifiedFurniture = useMemo(() => {
    return unifyContiguousFurniture(ubicaciones as any[]);
  }, [ubicaciones]);

  // Animación continua para el preview del drag
  useEffect(() => {
    if (draggedObject && hoveredCell) {
      const animate = () => {
        if (!canvasRef.current || !mapa) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Solo redibujar si hay un objeto siendo arrastrado
        if (draggedObject && hoveredCell) {
          // Trigger re-render usando el dependency del useEffect principal
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [draggedObject, hoveredCell, mapa]);

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

    const gap = 2; // Espacio entre celdas
    const radius = Math.min(6, cellSize / 4); // Radio de bordes redondeados

    // Helper para dibujar rectángulo con bordes redondeados
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Dibujar grilla base (todas las celdas son pasillos)
    for (let y = 0; y < mapa.alto; y++) {
      for (let x = 0; x < mapa.ancho; x++) {
        const px = x * cellSize + gap / 2;
        const py = y * cellSize + gap / 2;
        const size = cellSize - gap;

        // Determinar color base
        let fillColor = '#ffffff';
        
        // Highlight si está en la lista
        if (highlightedCells.some(h => h.x === x && h.y === y)) {
          fillColor = '#fef3c7'; // yellow-100
        }

        // Hover con efecto más visible
        if (hoveredCell?.x === x && hoveredCell?.y === y) {
          fillColor = '#dbeafe'; // blue-100
        }

        // Dibujar celda con bordes redondeados
        roundRect(px, py, size, size, radius);
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Borde sutil
        ctx.strokeStyle = '#e5e7eb'; // gray-200
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Sombra interior sutil para dar profundidad
        if (!highlightedCells.some(h => h.x === x && h.y === y) && hoveredCell?.x !== x && hoveredCell?.y !== y) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
          ctx.lineWidth = 1;
          roundRect(px + 1, py + 1, size - 2, size - 2, radius - 1);
          ctx.stroke();
        }
      }
    }

    // Separar muebles de otros objetos
    const muebles = ubicaciones.filter((ub: any) => ub.tipo_objeto === 'mueble');
    const otrosObjetos = ubicaciones.filter((ub: any) => ub.tipo_objeto !== 'mueble');

    // Dibujar objetos NO muebles (muros, salidas) individualmente
    otrosObjetos.forEach((ub: any) => {
      const ancho = ub.ancho || 1;
      const alto = ub.alto || 1;
      const px = ub.x * cellSize + gap / 2;
      const py = ub.y * cellSize + gap / 2;
      const width = ancho * cellSize - gap;
      const height = alto * cellSize - gap;
      const objRadius = Math.min(8, cellSize / 3);

      // Crear gradiente según tipo
      let gradient;
      if (ub.tipo_objeto === 'muro') {
        // Gradiente gris oscuro para muros
        gradient = ctx.createLinearGradient(px, py, px, py + height);
        gradient.addColorStop(0, '#475569'); // slate-600
        gradient.addColorStop(1, '#1e293b'); // slate-800
        ctx.fillStyle = gradient;
      } else if (ub.tipo_objeto === 'salida') {
        // Gradiente verde para salidas
        gradient = ctx.createLinearGradient(px, py, px, py + height);
        gradient.addColorStop(0, '#34d399'); // green-400
        gradient.addColorStop(1, '#059669'); // green-600
        ctx.fillStyle = gradient;
      } else {
        // Gradiente gris por defecto
        gradient = ctx.createLinearGradient(px, py, px, py + height);
        gradient.addColorStop(0, '#cbd5e1'); // slate-300
        gradient.addColorStop(1, '#94a3b8'); // slate-400
        ctx.fillStyle = gradient;
      }

      // Dibujar rectángulo con bordes redondeados
      roundRect(px, py, width, height, objRadius);
      ctx.fill();

      // Sombra para dar profundidad
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Borde del objeto
      if (ub.tipo_objeto === 'muro') {
        ctx.strokeStyle = '#0f172a'; // slate-900
      } else if (ub.tipo_objeto === 'salida') {
        ctx.strokeStyle = '#047857'; // green-700
      } else {
        ctx.strokeStyle = '#64748b'; // slate-500
      }
      ctx.lineWidth = 2;
      ctx.stroke();

      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Highlight interior para efecto 3D
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      roundRect(px + 2, py + 2, width - 4, height - 4, objRadius - 1);
      ctx.stroke();

      // Nombre del objeto (solo si es grande)
      if (ub.nombre_objeto && cellSize >= 20 && width >= 40) {
        ctx.fillStyle = '#ffffff'; // Texto blanco
        ctx.font = `bold ${Math.max(10, cellSize / 3)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra de texto para mejor legibilidad
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        const texto = ub.nombre_objeto.substring(0, Math.max(5, Math.floor(width / 8)));
        ctx.fillText(
          texto,
          px + width / 2,
          py + height / 2
        );

        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // Dibujar muebles unificados con el estilo del MapViewer
    unifiedFurniture.forEach((unified) => {
      const px = unified.minX * cellSize + gap / 2;
      const py = unified.minY * cellSize + gap / 2;
      const width = unified.width * cellSize - gap;
      const height = unified.height * cellSize - gap;
      const muebleRadius = Math.min(10, cellSize / 3);

      // Gradiente diagonal azul claro (mismo estilo que supervisor/reponedor)
      // 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)'
      const gradient = ctx.createLinearGradient(px, py, px + width, py + height);
      gradient.addColorStop(0, '#bfdbfe'); // blue-200
      gradient.addColorStop(1, '#93c5fd'); // blue-300

      // Dibujar rectángulo del mueble unificado con bordes redondeados
      roundRect(px, py, width, height, muebleRadius);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sombra suave para dar profundidad (estilo MapViewer)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Borde azul medio
      ctx.strokeStyle = '#60a5fa'; // blue-400
      ctx.lineWidth = 1;
      ctx.stroke();

      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Highlight interior blanco para efecto 3D (inset light)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      roundRect(px + 1, py + 1, width - 2, height - 2, muebleRadius - 1);
      ctx.stroke();

      // Nombre del mueble unificado (centrado, estilo MapViewer)
      if (unified.nombre && cellSize >= 15 && width >= 40) {
        // Texto del nombre con estilo similar al MapViewer
        ctx.fillStyle = '#1f2937'; // gray-800
        ctx.font = `600 ${Math.max(10, cellSize / 3.5)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra de texto blanca para legibilidad sobre fondo azul claro
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        const maxChars = Math.floor(width / 7);
        const texto = unified.nombre.length > maxChars 
          ? unified.nombre.substring(0, maxChars - 3) + '...'
          : unified.nombre;
        
        ctx.fillText(
          texto,
          px + width / 2,
          py + height / 2
        );

        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // Previsualización de objeto siendo arrastrado
    if (draggedObject && hoveredCell) {
      const ancho = (draggedObject as any).ancho || 1;
      const alto = (draggedObject as any).alto || 1;
      const px = hoveredCell.x * cellSize + gap / 2;
      const py = hoveredCell.y * cellSize + gap / 2;
      const width = ancho * cellSize - gap;
      const height = alto * cellSize - gap;
      const previewRadius = Math.min(10, cellSize / 3);

      // Gradiente para preview
      const previewGradient = ctx.createLinearGradient(px, py, px, py + height);
      previewGradient.addColorStop(0, 'rgba(96, 165, 250, 0.4)'); // blue-400
      previewGradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)'); // blue-500

      // Fondo del preview
      roundRect(px, py, width, height, previewRadius);
      ctx.fillStyle = previewGradient;
      ctx.fill();

      // Borde animado con efecto de pulso
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = (Date.now() / 50) % 12; // Animación
      ctx.stroke();
      ctx.setLineDash([]);

      // Sombra para el preview
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.stroke();

      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Icono "+" en el centro
      if (width >= 30 && height >= 30) {
        const centerX = px + width / 2;
        const centerY = py + height / 2;
        const iconSize = Math.min(20, cellSize / 2);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Línea horizontal del +
        ctx.beginPath();
        ctx.moveTo(centerX - iconSize / 2, centerY);
        ctx.lineTo(centerX + iconSize / 2, centerY);
        ctx.stroke();

        // Línea vertical del +
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - iconSize / 2);
        ctx.lineTo(centerX, centerY + iconSize / 2);
        ctx.stroke();
      }
    }
  }, [mapa, ubicaciones, hoveredCell, draggedObject, highlightedCells, cellSize, unifiedFurniture]);

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
      onCellClick?.(x, y, { ctrlKey: e.ctrlKey });
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
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-600 mb-1">Sin mapa seleccionado</p>
          <p className="text-sm text-slate-500">Selecciona o crea un mapa para comenzar a diseñar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 shadow-sm overflow-auto">
      {/* Header con información */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">
              {mapa.ancho} × {mapa.alto}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-slate-600">
              Celda: {cellSize}px
            </span>
          </div>
        </div>
      </div>

      {/* Canvas del mapa */}
      <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
        <canvas
          ref={canvasRef}
          width={mapa.ancho * cellSize}
          height={mapa.alto * cellSize}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-crosshair rounded-lg"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        />
      </div>

      {/* Leyenda mejorada */}
      <div className="mt-4 bg-white rounded-lg px-4 py-3 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Leyenda</span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded shadow-sm"></div>
              <span className="text-xs text-slate-700 font-medium">Pasillo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{
                background: 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
                border: '1px solid #0f172a'
              }}></div>
              <span className="text-xs text-slate-700 font-medium">Muro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{
                background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
                border: '1px solid #60a5fa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}></div>
              <span className="text-xs text-slate-700 font-medium">Mueble</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{
                background: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                border: '1px solid #047857'
              }}></div>
              <span className="text-xs text-slate-700 font-medium">Salida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
