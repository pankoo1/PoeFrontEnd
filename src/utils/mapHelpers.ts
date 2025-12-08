/**
 * Utilidades para renderizado de mapas
 */

export interface UnifiedFurniture {
  nombre: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  cells: Array<{ x: number; y: number }>;
}

/**
 * Agrupa muebles contiguos con el mismo nombre en rectángulos unificados
 * Solo afecta la visualización, las coordenadas originales se mantienen en cells
 */
export function unifyContiguousFurniture(
  ubicaciones: Array<{ x: number; y: number; nombre_objeto?: string; tipo_objeto?: string; ancho?: number; alto?: number }>
): UnifiedFurniture[] {
  // Filtrar solo muebles
  const muebles = ubicaciones.filter(ub => ub.tipo_objeto === 'mueble' && ub.nombre_objeto);
  
  if (muebles.length === 0) return [];

  // Agrupar muebles por nombre
  const furnitureGroups = new Map<string, typeof muebles>();
  
  muebles.forEach(mueble => {
    const key = mueble.nombre_objeto!;
    if (!furnitureGroups.has(key)) {
      furnitureGroups.set(key, []);
    }
    furnitureGroups.get(key)!.push(mueble);
  });

  const unified: UnifiedFurniture[] = [];

  // Para cada grupo de muebles con el mismo nombre
  furnitureGroups.forEach((mueblesGrupo, nombre) => {
    // Crear clusters de muebles contiguos usando BFS
    const visited = new Set<number>();
    
    mueblesGrupo.forEach((mueble, index) => {
      if (visited.has(index)) return;
      
      // BFS para encontrar todos los muebles conectados
      const cluster: typeof muebles = [];
      const queue = [index];
      visited.add(index);
      
      while (queue.length > 0) {
        const currentIndex = queue.shift()!;
        const current = mueblesGrupo[currentIndex];
        cluster.push(current);
        
        // Buscar muebles adyacentes (comparten un borde)
        mueblesGrupo.forEach((other, otherIndex) => {
          if (visited.has(otherIndex)) return;
          
          const currentAncho = current.ancho || 1;
          const currentAlto = current.alto || 1;
          const otherAncho = other.ancho || 1;
          const otherAlto = other.alto || 1;
          
          // Verificar si son adyacentes horizontalmente
          const horizontallyAdjacent = 
            (other.x === current.x + currentAncho && 
             other.y < current.y + currentAlto && 
             other.y + otherAlto > current.y) ||
            (other.x + otherAncho === current.x && 
             other.y < current.y + currentAlto && 
             other.y + otherAlto > current.y);
          
          // Verificar si son adyacentes verticalmente
          const verticallyAdjacent = 
            (other.y === current.y + currentAlto && 
             other.x < current.x + currentAncho && 
             other.x + otherAncho > current.x) ||
            (other.y + otherAlto === current.y && 
             other.x < current.x + currentAncho && 
             other.x + otherAncho > current.x);
          
          if (horizontallyAdjacent || verticallyAdjacent) {
            visited.add(otherIndex);
            queue.push(otherIndex);
          }
        });
      }
      
      // Calcular todas las celdas que ocupa el cluster
      const allCells: Array<{ x: number; y: number }> = [];
      cluster.forEach(m => {
        const ancho = m.ancho || 1;
        const alto = m.alto || 1;
        for (let dy = 0; dy < alto; dy++) {
          for (let dx = 0; dx < ancho; dx++) {
            allCells.push({ x: m.x + dx, y: m.y + dy });
          }
        }
      });
      
      // Calcular el rectángulo mínimo que abarca todo el cluster
      const minX = Math.min(...allCells.map(c => c.x));
      const minY = Math.min(...allCells.map(c => c.y));
      const maxX = Math.max(...allCells.map(c => c.x));
      const maxY = Math.max(...allCells.map(c => c.y));
      
      unified.push({
        nombre,
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        cells: allCells
      });
    });
  });

  return unified;
}

/**
 * Verifica si una celda pertenece a un mueble unificado
 */
export function getCellFurniture(
  x: number, 
  y: number, 
  unifiedFurniture: UnifiedFurniture[]
): UnifiedFurniture | null {
  return unifiedFurniture.find(furniture => 
    furniture.cells.some(cell => cell.x === x && cell.y === y)
  ) || null;
}
