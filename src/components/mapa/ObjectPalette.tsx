import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Square, DoorOpen, Search, Plus } from 'lucide-react';
import type { ObjetoMapa } from '@/types/mapa.types';

interface ObjectPaletteProps {
  objetos: ObjetoMapa[];
  onObjectSelect: (objeto: ObjetoMapa) => void;
  onCreateFurniture: () => void;
  selectedObjectId?: number | null;
}

export const ObjectPalette: React.FC<ObjectPaletteProps> = ({
  objetos,
  onObjectSelect,
  onCreateFurniture,
  selectedObjectId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getObjectIcon = (tipo: string) => {
    switch (tipo) {
      case 'mueble':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'muro':
        return <Square className="w-5 h-5 text-slate-600" />;
      case 'salida':
        return <DoorOpen className="w-5 h-5 text-green-600" />;
      default:
        return <Square className="w-5 h-5 text-slate-400" />;
    }
  };

  const getObjectColor = (tipo: string) => {
    switch (tipo) {
      case 'mueble':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'muro':
        return 'border-slate-300 bg-slate-50 hover:bg-slate-100';
      case 'salida':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      default:
        return 'border-slate-200 bg-slate-50 hover:bg-slate-100';
    }
  };

  const filteredObjetos = objetos.filter(obj =>
    obj.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const muebles = filteredObjetos.filter(o => o.tipo === 'mueble');
  const muros = filteredObjetos.filter(o => o.tipo === 'muro');
  const salidas = filteredObjetos.filter(o => o.tipo === 'salida');

  return (
    <Card className="border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Paleta de Objetos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-auto">
        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar objetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Botón para crear mueble */}
        <Button
          onClick={onCreateFurniture}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Mueble
        </Button>

        {/* Muebles */}
        {muebles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Muebles ({muebles.length})
            </h3>
            <div className="space-y-2">
              {muebles.map((obj) => (
                <div
                  key={obj.id_objeto}
                  draggable
                  onDragStart={() => onObjectSelect(obj)}
                  onClick={() => onObjectSelect(obj)}
                  className={`
                    p-3 rounded-lg border-2 cursor-move transition-all
                    ${getObjectColor(obj.tipo)}
                    ${selectedObjectId === obj.id_objeto ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getObjectIcon(obj.tipo)}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{obj.nombre}</p>
                        {obj.ancho && obj.alto && (
                          <p className="text-xs text-slate-600">
                            {obj.ancho}x{obj.alto} celdas
                          </p>
                        )}
                        {obj.filas && obj.columnas && (
                          <p className="text-xs text-slate-500">
                            {obj.filas}×{obj.columnas} divisiones
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${obj.es_caminable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {obj.es_caminable ? 'Caminable' : 'Bloqueado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Muros */}
        {muros.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Square className="w-4 h-4" />
              Muros ({muros.length})
            </h3>
            <div className="space-y-2">
              {muros.map((obj) => (
                <div
                  key={obj.id_objeto}
                  draggable
                  onDragStart={() => onObjectSelect(obj)}
                  onClick={() => onObjectSelect(obj)}
                  className={`
                    p-3 rounded-lg border-2 cursor-move transition-all
                    ${getObjectColor(obj.tipo)}
                    ${selectedObjectId === obj.id_objeto ? 'ring-2 ring-slate-500' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {getObjectIcon(obj.tipo)}
                    <p className="text-sm font-medium text-slate-900">{obj.nombre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salidas */}
        {salidas.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <DoorOpen className="w-4 h-4" />
              Salidas ({salidas.length})
            </h3>
            <div className="space-y-2">
              {salidas.map((obj) => (
                <div
                  key={obj.id_objeto}
                  draggable
                  onDragStart={() => onObjectSelect(obj)}
                  onClick={() => onObjectSelect(obj)}
                  className={`
                    p-3 rounded-lg border-2 cursor-move transition-all
                    ${getObjectColor(obj.tipo)}
                    ${selectedObjectId === obj.id_objeto ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {getObjectIcon(obj.tipo)}
                    <p className="text-sm font-medium text-slate-900">{obj.nombre}</p>
                  </div>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    ⚠️ Debe haber exactamente 1 salida
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredObjetos.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No se encontraron objetos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
