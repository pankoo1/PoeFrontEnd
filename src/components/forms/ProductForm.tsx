
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ProductForm = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    tipoUnidad: '',
    cantidadUnidad: '',
    codigoProducto: ''
  });

  // Obtener la lista de productos actual del localStorage o inicializar como array vacío
  const getProductsFromStorage = () => {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear nuevo producto con ID único y estado por defecto
    const newProduct = {
      id: Date.now(), // Usar timestamp como ID único
      name: formData.nombre,
      category: formData.categoria,
      tipoUnidad: formData.tipoUnidad,
      cantidadUnidad: parseFloat(formData.cantidadUnidad) || 0,
      codigoProducto: formData.codigoProducto,
      status: 'Disponible' // Estado por defecto
    };
    
    // Obtener productos actuales y agregar el nuevo
    const currentProducts = getProductsFromStorage();
    const updatedProducts = [...currentProducts, newProduct];
    
    // Guardar en localStorage
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Mostrar notificación
    toast({
      title: "Producto agregado",
      description: `${formData.nombre} ha sido registrado en el inventario`,
    });
    
    // Limpiar formulario
    setFormData({
      nombre: '',
      categoria: '',
      tipoUnidad: '',
      cantidadUnidad: '',
      codigoProducto: ''
    });
    
    setIsOpen(false);
    
    // Recargar la página para mostrar el nuevo producto
    window.location.reload();
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
                <SelectItem value="Frutas y Verduras">Frutas y Verduras</SelectItem>
                <SelectItem value="Carnes">Carnes y Embutidos</SelectItem>
                <SelectItem value="Panadería">Panadería</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Enlatados">Enlatados y Conservas</SelectItem>
                <SelectItem value="Limpieza">Productos de Limpieza</SelectItem>
                <SelectItem value="Higiene">Higiene Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoUnidad">Tipo Unidad</Label>
              <Select value={formData.tipoUnidad} onValueChange={(value) => setFormData({...formData, tipoUnidad: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kilogramo">Kilogramo</SelectItem>
                  <SelectItem value="Gramo">Gramo</SelectItem>
                  <SelectItem value="Litro">Litro</SelectItem>
                  <SelectItem value="Mililitro">Mililitro</SelectItem>
                  <SelectItem value="Unidad">Unidad</SelectItem>
                  <SelectItem value="Paquete">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidadUnidad">Cantidad de unidad</Label>
              <Input
                id="cantidadUnidad"
                type="number"
                step="0.01"
                value={formData.cantidadUnidad}
                onChange={(e) => setFormData({...formData, cantidadUnidad: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoProducto">Código de Producto</Label>
            <Input
              id="codigoProducto"
              value={formData.codigoProducto}
              onChange={(e) => setFormData({...formData, codigoProducto: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
