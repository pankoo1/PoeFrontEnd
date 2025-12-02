import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Package } from 'lucide-react';
import type { ObjetoNuevo } from '@/types/mapa.types';

interface CreateFurnitureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (objeto: ObjetoNuevo) => Promise<void>;
}

export const CreateFurnitureModal: React.FC<CreateFurnitureModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    filas: '',
    columnas: '',
    ancho: '',
    alto: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.nombre.trim()) {
      return 'El nombre del mueble es obligatorio';
    }

    const filas = parseInt(formData.filas);
    const columnas = parseInt(formData.columnas);
    const ancho = parseInt(formData.ancho);
    const alto = parseInt(formData.alto);

    if (isNaN(filas) || filas < 1) {
      return 'Las filas deben ser un número mayor a 0';
    }

    if (isNaN(columnas) || columnas < 1) {
      return 'Las columnas deben ser un número mayor a 0';
    }

    if (isNaN(ancho) || ancho < 1) {
      return 'El ancho debe ser un número mayor a 0';
    }

    if (isNaN(alto) || alto < 1) {
      return 'El alto debe ser un número mayor a 0';
    }

    if (filas > 10 || columnas > 10) {
      return 'Las filas y columnas no pueden exceder 10';
    }

    if (ancho > 50 || alto > 50) {
      return 'El ancho y alto no pueden exceder 50 celdas';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nuevoObjeto: ObjetoNuevo = {
        tipo: 'mueble',
        nombre: formData.nombre.trim(),
        filas: parseInt(formData.filas),
        columnas: parseInt(formData.columnas),
        ancho: parseInt(formData.ancho),
        alto: parseInt(formData.alto),
        es_caminable: false
      };

      await onSubmit(nuevoObjeto);
      
      // Reset form
      setFormData({
        nombre: '',
        filas: '',
        columnas: '',
        ancho: '',
        alto: ''
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el mueble');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        filas: '',
        columnas: '',
        ancho: '',
        alto: ''
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Package className="w-5 h-5 text-blue-600" />
            Crear Nuevo Mueble
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Define las características del mueble que se agregará a la paleta de objetos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-700 font-medium">
                Nombre del Mueble *
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Estantería Principal"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                disabled={loading}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* Divisiones (Filas y Columnas) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filas" className="text-slate-700 font-medium">
                  Filas (divisiones) *
                </Label>
                <Input
                  id="filas"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ej: 3"
                  value={formData.filas}
                  onChange={(e) => handleChange('filas', e.target.value)}
                  disabled={loading}
                  className="border-slate-200 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Divisiones verticales (1-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="columnas" className="text-slate-700 font-medium">
                  Columnas (divisiones) *
                </Label>
                <Input
                  id="columnas"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ej: 4"
                  value={formData.columnas}
                  onChange={(e) => handleChange('columnas', e.target.value)}
                  disabled={loading}
                  className="border-slate-200 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Divisiones horizontales (1-10)
                </p>
              </div>
            </div>

            {/* Dimensiones (Ancho y Alto) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ancho" className="text-slate-700 font-medium">
                  Ancho (celdas) *
                </Label>
                <Input
                  id="ancho"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Ej: 5"
                  value={formData.ancho}
                  onChange={(e) => handleChange('ancho', e.target.value)}
                  disabled={loading}
                  className="border-slate-200 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Ancho en el mapa (1-50)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alto" className="text-slate-700 font-medium">
                  Alto (celdas) *
                </Label>
                <Input
                  id="alto"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Ej: 3"
                  value={formData.alto}
                  onChange={(e) => handleChange('alto', e.target.value)}
                  disabled={loading}
                  className="border-slate-200 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Alto en el mapa (1-50)
                </p>
              </div>
            </div>

            {/* Preview visual */}
            {formData.ancho && formData.alto && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Vista previa:
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-blue-500 rounded"
                    style={{
                      width: `${Math.min(parseInt(formData.ancho) * 8, 80)}px`,
                      height: `${Math.min(parseInt(formData.alto) * 8, 80)}px`
                    }}
                  />
                  <div className="text-xs text-slate-600">
                    <p>Tamaño: {formData.ancho}×{formData.alto} celdas</p>
                    {formData.filas && formData.columnas && (
                      <p>Divisiones: {formData.filas}×{formData.columnas}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Mueble'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
