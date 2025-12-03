import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Grid3x3, X, Plus } from 'lucide-react';

interface PuntoReposicion {
  id_punto: number;
  nivel: number;
  estanteria: number;
  producto?: {
    nombre: string;
    categoria: string;
  } | null;
}

interface ShelfModalProps {
  open: boolean;
  onClose: () => void;
  muebleNombre: string;
  filas: number;
  columnas: number;
  puntos: PuntoReposicion[];
  onSelectPunto: (punto: PuntoReposicion) => void;
}

export const ShelfModal: React.FC<ShelfModalProps> = ({
  open,
  onClose,
  muebleNombre,
  filas,
  columnas,
  puntos,
  onSelectPunto,
}) => {
  const [selectedPunto, setSelectedPunto] = useState<PuntoReposicion | null>(null);

  // Organizar puntos en matriz [nivel][estanteria]
  const puntosMatrix: (PuntoReposicion | null)[][] = Array(filas)
    .fill(null)
    .map(() => Array(columnas).fill(null));

  puntos.forEach(punto => {
    if (punto.nivel >= 0 && punto.nivel < filas && 
        punto.estanteria >= 0 && punto.estanteria < columnas) {
      puntosMatrix[punto.nivel][punto.estanteria] = punto;
    }
  });

  const handleSelectPunto = (punto: PuntoReposicion | null) => {
    if (punto) {
      setSelectedPunto(punto);
      onSelectPunto(punto);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            {muebleNombre}
          </DialogTitle>
          <DialogDescription>
            Selecciona un punto de reposición. Verde = Vacío, Azul = Ocupado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Grid de puntos */}
          <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex flex-col-reverse gap-1">
              {puntosMatrix.map((fila, nivelIdx) => (
                <div key={nivelIdx} className="flex gap-1">
                  <div className="w-12 flex items-center justify-center text-xs font-medium text-slate-600">
                    N{nivelIdx}
                  </div>
                  {fila.map((punto, estanteriaIdx) => (
                    <div
                      key={`${nivelIdx}-${estanteriaIdx}`}
                      onClick={() => handleSelectPunto(punto)}
                      className={`
                        flex-1 h-20 rounded-lg border-2 cursor-pointer transition-all
                        flex flex-col items-center justify-center p-2
                        ${!punto
                          ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                          : punto.producto
                            ? 'border-blue-400 bg-blue-100 hover:bg-blue-200'
                            : 'border-green-400 bg-green-100 hover:bg-green-200'
                        }
                        ${selectedPunto?.id_punto === punto?.id_punto
                          ? 'ring-2 ring-blue-600'
                          : ''
                        }
                      `}
                    >
                      {punto ? (
                        <>
                          <div className="text-xs font-medium text-slate-700">
                            E{estanteriaIdx}
                          </div>
                          {punto.producto ? (
                            <div className="text-center mt-1">
                              <Package className="w-4 h-4 mx-auto text-blue-600" />
                              <p className="text-xs font-medium text-slate-900 truncate max-w-full">
                                {punto.producto.nombre}
                              </p>
                            </div>
                          ) : (
                            <Plus className="w-5 h-5 text-green-600 mt-1" />
                          )}
                        </>
                      ) : (
                        <X className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {/* Etiquetas de estanterías */}
              <div className="flex gap-1 mt-2">
                <div className="w-12"></div>
                {Array(columnas).fill(null).map((_, idx) => (
                  <div key={idx} className="flex-1 text-center text-xs font-medium text-slate-600">
                    E{idx}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información del punto seleccionado */}
          {selectedPunto && (
            <div className="bg-slate-100 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Punto Seleccionado</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">Nivel:</span>{' '}
                  <span className="font-medium">{selectedPunto.nivel}</span>
                </div>
                <div>
                  <span className="text-slate-600">Estantería:</span>{' '}
                  <span className="font-medium">{selectedPunto.estanteria}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Estado:</span>{' '}
                  <Badge variant={selectedPunto.producto ? 'default' : 'secondary'}>
                    {selectedPunto.producto ? 'Ocupado' : 'Vacío'}
                  </Badge>
                </div>
                {selectedPunto.producto && (
                  <div className="col-span-2">
                    <span className="text-slate-600">Producto:</span>{' '}
                    <span className="font-medium">{selectedPunto.producto.nombre}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
