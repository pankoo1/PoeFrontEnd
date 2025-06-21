import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, Usuario } from '@/services/api';
import { Producto, CreateProductoData, UpdateProductoData } from '@/types/producto';

interface ProductFormProps {
  onProductAdded?: (producto: Producto) => void;
  onProductUpdated?: (producto: Producto) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingProduct?: Producto | null;
  mode?: 'create' | 'edit';
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onProductAdded, 
  onProductUpdated,
  isOpen,
  onOpenChange,
  editingProduct,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductoData>({
    nombre: '',
    categoria: '',
    unidad_tipo: '',
    unidad_cantidad: 1,
    codigo_unico: '',
    id_usuario: 0 // Valor inicial inválido, forzará selección
  });
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);

  // Actualizar el formulario cuando se recibe un producto para editar
  useEffect(() => {
    if (editingProduct && mode === 'edit') {
      setFormData({
        nombre: editingProduct.nombre,
        categoria: editingProduct.categoria,
        unidad_tipo: editingProduct.unidad_tipo,
        unidad_cantidad: editingProduct.unidad_cantidad,
        codigo_unico: editingProduct.codigo_unico,
        id_usuario: editingProduct.id_usuario || 0
      });
    }
  }, [editingProduct, mode]);

  useEffect(() => {
    // Cargar supervisores al montar el formulario
    const fetchSupervisores = async () => {
      try {
        const usuarios = await ApiService.getUsuarios();
        const supervisoresFiltrados = usuarios.filter(u => u.rol.toLowerCase() === 'supervisor');
        setSupervisores(supervisoresFiltrados);
      } catch (error) {
        console.error('Error al cargar supervisores:', error);
      }
    };
    fetchSupervisores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'create') {
        const newProduct = await ApiService.createProducto(formData) as Producto;
        onProductAdded?.(newProduct);
        toast({
          title: "Producto agregado",
          description: `${formData.nombre} ha sido registrado en el inventario`,
        });
      } else if (mode === 'edit' && editingProduct) {
        const updateData: UpdateProductoData = {
          nombre: formData.nombre,
          categoria: formData.categoria,
          codigo_unico: formData.codigo_unico
        };
        const updatedProduct = await ApiService.updateProducto(editingProduct.id_producto, updateData) as Producto;
        onProductUpdated?.(updatedProduct);
        toast({
          title: "Producto actualizado",
          description: `${formData.nombre} ha sido actualizado correctamente`,
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error al procesar producto:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (mode === 'create') {
      setFormData({
        nombre: '',
        categoria: '',
        unidad_tipo: '',
        unidad_cantidad: 1,
        codigo_unico: '',
        id_usuario: 0
      });
    }
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;

  const renderTrigger = () => {
    if (mode === 'create') {
      return (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </DialogTrigger>
      );
    }
    return null;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {renderTrigger()}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
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
                disabled={mode === 'edit'}
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
                disabled={mode === 'edit'}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigo_unico">Código de Producto {mode === 'create' ? '(opcional)' : ''}</Label>
            <Input
              id="codigo_unico"
              value={formData.codigo_unico}
              onChange={(e) => setFormData({...formData, codigo_unico: e.target.value})}
              disabled={mode === 'edit'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor asignado</Label>
            <Select
              value={formData.id_usuario ? String(formData.id_usuario) : ''}
              onValueChange={value => setFormData({ ...formData, id_usuario: Number(value) })}
              required
              disabled={mode === 'edit'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisores.map(sup => (
                  <SelectItem key={sup.id_usuario} value={String(sup.id_usuario)}>
                    {sup.nombre} ({sup.correo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (mode === 'create' ? 'Creando...' : 'Actualizando...') 
                : (mode === 'create' ? 'Agregar Producto' : 'Guardar Cambios')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
