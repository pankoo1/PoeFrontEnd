import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { Producto, CreateProductoData } from '@/types/producto';

interface ProductFormProps {
  onProductAdded: (producto: Producto) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductoData>({
    nombre: '',
    categoria: '',
    unidad_tipo: '',
    unidad_cantidad: 1,
    codigo_unico: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newProduct = await ApiService.createProducto(formData) as Producto;
      onProductAdded(newProduct);

      toast({
        title: "Producto agregado",
        description: `${formData.nombre} ha sido registrado en el inventario`,
      });

      setFormData({
        nombre: '',
        categoria: '',
        unidad_tipo: '',
        unidad_cantidad: 1,
        codigo_unico: ''
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ingrese el nombre del producto"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              placeholder="Ej: Lácteos, Frutas, etc."
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidad_tipo">Tipo Unidad</Label>
              <Select 
                value={formData.unidad_tipo} 
                onValueChange={(value) => setFormData({...formData, unidad_tipo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">Unidad</SelectItem>
                  <SelectItem value="kg">Kilogramo</SelectItem>
                  <SelectItem value="g">Gramo</SelectItem>
                  <SelectItem value="l">Litro</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                  <SelectItem value="paquete">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad_cantidad">Cantidad por Unidad</Label>
              <Input
                id="unidad_cantidad"
                type="number"
                step="1"
                min="1"
                value={formData.unidad_cantidad}
                onChange={(e) => setFormData({...formData, unidad_cantidad: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigo_unico">Código de Producto (opcional)</Label>
            <Input
              id="codigo_unico"
              value={formData.codigo_unico}
              onChange={(e) => setFormData({...formData, codigo_unico: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
