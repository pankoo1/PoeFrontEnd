import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Producto {
  id_producto: number;
  nombre: string;
  categoria: string;
  unidad_tipo: string;
  unidad_cantidad: number;
  codigo_unico: string;
}

interface ProductSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (producto: Producto) => void;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  open,
  onClose,
  onSelectProduct,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  useEffect(() => {
    if (open) {
      loadProductos();
    }
  }, [open]);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getProductos();
      setProductos(response as Producto[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedProducto) {
      onSelectProduct(selectedProducto);
      onClose();
      setSearchTerm('');
      setSelectedProducto(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Buscar Producto
          </DialogTitle>
          <DialogDescription>
            Selecciona un producto para asignar al punto de reposición
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, categoría o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de productos */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No se encontraron productos
              </div>
            ) : (
              filteredProductos.map((producto) => (
                <div
                  key={producto.id_producto}
                  onClick={() => setSelectedProducto(producto)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedProducto?.id_producto === producto.id_producto
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{producto.nombre}</h3>
                      <p className="text-sm text-slate-600">{producto.categoria}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Código: {producto.codigo_unico}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {producto.unidad_cantidad} {producto.unidad_tipo}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedProducto}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Asignar Producto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
