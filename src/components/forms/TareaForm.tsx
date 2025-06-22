import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ProductSelector from './ProductSelector';
import { Producto } from '@/types/producto';
import { ApiService } from '@/services/api'; // Asegúrate de importar tu ApiService

const TareaForm = () => {
  // Verificar rol de usuario
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'supervisor') {
    // Si no es supervisor, no mostrar el formulario
    return null;
  }

  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    reponedor: '',
    estado: '' // Solo los campos necesarios
  });
  const [selectedProducts, setSelectedProducts] = useState<Array<{producto: Producto, cantidad: number}>>([]);
  const [productoToAdd, setProductoToAdd] = useState<Producto | null>(null);
  const [cantidadToAdd, setCantidadToAdd] = useState('');

  const handleAddProduct = (producto: Producto) => {
    if (selectedProducts.some(p => p.producto.id_producto === producto.id_producto)) {
      toast({
        title: 'Este producto ya fue agregado.',
        variant: 'destructive',
      });
      return;
    }
    setProductoToAdd(producto);
  };

  const handleConfirmAdd = () => {
    if (!productoToAdd || !cantidadToAdd || isNaN(Number(cantidadToAdd)) || Number(cantidadToAdd) <= 0) {
      toast({ title: 'Cantidad inválida', variant: 'destructive' });
      return;
    }
    setSelectedProducts(prev => [...prev, { producto: productoToAdd, cantidad: Number(cantidadToAdd) }]);
    setProductoToAdd(null);
    setCantidadToAdd('');
  };

  const handleRemoveProduct = (id_producto: number) => {
    setSelectedProducts(prev => prev.filter(p => p.producto.id_producto !== id_producto));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar duplicados (fallback)
    const ids = selectedProducts.map(p => p.producto.id_producto);
    const hasDuplicates = ids.length !== new Set(ids).size;
    if (hasDuplicates) {
      toast({ title: 'No se puede guardar la tarea porque hay productos duplicados.', variant: 'destructive' });
      return;
    }
    if (selectedProducts.length === 0) {
      toast({ title: 'Debe agregar al menos un producto.', variant: 'destructive' });
      return;
    }
    // Validar cantidades de productos
    for (const { producto, cantidad } of selectedProducts) {
      const cantidadNum = Number(cantidad);
      if (
        cantidad === undefined ||
        cantidad === null ||
        isNaN(cantidadNum)
      ) {
        toast({ title: `Falta ingresar la cantidad para el producto "${producto.nombre}".`, variant: 'destructive' });
        return;
      }
      if (cantidadNum <= 0) {
        toast({ title: `La cantidad para el producto "${producto.nombre}" debe ser mayor a 0.`, variant: 'destructive' });
        return;
      }
    }
    // Construir payload según lo que espera el backend
    const payload: any = {
      productos: selectedProducts.map(({ producto, cantidad }) => ({
        id_producto: producto.id_producto,
        cantidad: Number(cantidad)
      })),
      id_reponedor: formData.reponedor ? Number(formData.reponedor) : null,
      id_supervisor: null, // El backend lo ignora si eres supervisor
      estado: formData.estado // Nuevo campo
    };
    // Aquí deberías llamar a tu ApiService para crear la tarea
    try {
      // Reemplaza 'crearTarea' por el método real de tu ApiService
      await ApiService.crearTarea(payload);
      toast({ title: 'Tarea creada exitosamente', variant: 'default' });
      setFormData({ reponedor: '', estado: '' });
      setSelectedProducts([]);
      setIsOpen(false);
    } catch (err: any) {
      toast({ title: err.message || 'Error al crear la tarea', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Asignar Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] h-[80vh] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Panel izquierdo: Datos generales de la tarea */}
          <form onSubmit={handleSubmit} className="md:w-1/2 p-6 flex flex-col gap-4 border-r order-1 md:order-none">
            <DialogHeader>
              <DialogTitle>Asignar Nueva Tarea de Reposición</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="reponedor">Reponedor Asignado</Label>
              <Select value={formData.reponedor} onValueChange={value => setFormData({ ...formData, reponedor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar reponedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carlos">Carlos Martínez</SelectItem>
                  <SelectItem value="ana">Ana López</SelectItem>
                  <SelectItem value="miguel">Miguel Santos</SelectItem>
                  <SelectItem value="laura">Laura Pérez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado de la Tarea</Label>
              <Select value={formData.estado} onValueChange={value => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="sin asignar">Sin Asignar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Asignar Tarea
              </Button>
            </div>
          </form>
          {/* Panel derecho: Selección y detalle de productos */}
          <div className="md:w-1/2 bg-muted/50 p-6 flex flex-col order-2 md:order-none">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Package className="w-5 h-5" /> Productos</h3>
            <ProductSelector
              selectedProducts={selectedProducts.map(p => p.producto)}
              onAdd={handleAddProduct}
              excludeIds={selectedProducts.map(p => p.producto.id_producto)}
            />
            {productoToAdd && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">{productoToAdd.nombre}</span>
                <Input
                  type="number"
                  min={1}
                  value={cantidadToAdd}
                  onChange={e => setCantidadToAdd(e.target.value)}
                  placeholder="Cantidad"
                  className="w-24"
                  autoFocus
                />
                <Button size="sm" type="button" onClick={handleConfirmAdd}>Agregar</Button>
                <Button size="sm" type="button" variant="outline" onClick={() => setProductoToAdd(null)}>Cancelar</Button>
              </div>
            )}
            <div className="mt-4">
              <Label>Detalle de productos seleccionados</Label>
              <div className="border rounded p-2 bg-white max-h-40 overflow-y-auto">
                {selectedProducts.length === 0 && <div className="text-muted-foreground text-sm">No hay productos agregados.</div>}
                {selectedProducts.map(({ producto, cantidad }) => (
                  <div key={producto.id_producto} className="flex items-center justify-between py-1 border-b last:border-b-0">
                    <span>{producto.nombre} <span className="text-xs text-muted-foreground">({producto.categoria})</span> x <b>{cantidad}</b></span>
                    <Button size="icon" variant="ghost" onClick={() => handleRemoveProduct(producto.id_producto)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TareaForm;
