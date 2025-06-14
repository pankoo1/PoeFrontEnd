import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { Producto, UpdateProductoData } from '@/types/producto';
import ProductForm from '../components/forms/ProductForm';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para almacenar los productos
  const [products, setProducts] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Cargar productos al iniciar
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getProductos() as { productos: Producto[] };
      setProducts(data.productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page]);

  const handleProductAdded = (newProduct: Producto) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const handleDeleteProduct = async (id: number, nombre: string) => {
    try {
      await ApiService.deleteProducto(id);
      // En lugar de eliminar el producto, actualizamos su estado
      setProducts(prevProducts => prevProducts.map(product => 
        product.id_producto === id 
          ? { ...product, estado: 'inactivo' } 
          : product
      ));
      toast({
        title: "Producto desactivado",
        description: `${nombre} ha sido marcado como inactivo`,
      });
    } catch (error) {
      console.error('Error al desactivar producto:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el producto",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (product: Producto) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingProduct) return;

    try {
      const updateData: UpdateProductoData = {
        nombre: editingProduct.nombre,
        categoria: editingProduct.categoria,
        codigo_unico: editingProduct.codigo_unico
      };

      const updatedProduct = await ApiService.updateProducto(editingProduct.id_producto, updateData);
      
      setProducts((prevProducts: Producto[]) => prevProducts.map((product: Producto) =>
        product.id_producto === (updatedProduct as Producto).id_producto ? (updatedProduct as Producto) : product
      ));

      toast({
        title: "Producto actualizado",
        description: `La información de ${(updatedProduct as Producto).nombre} ha sido actualizada`,
      });

      setEditDialogOpen(false);
      setEditingProduct(null);
      
      // Recargar la lista para asegurar sincronización
      await loadProducts();

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <Package className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Inventario de Supermercado</CardTitle>
              </div>
              <ProductForm onProductAdded={handleProductAdded} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo Unidad</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id_producto}>
                      <TableCell>{product.codigo_unico}</TableCell>
                      <TableCell className="font-medium">{product.nombre}</TableCell>
                      <TableCell>{product.categoria}</TableCell>
                      <TableCell>{product.unidad_tipo}</TableCell>
                      <TableCell>{product.unidad_cantidad}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.estado === 'activo' ? 'Disponible' : 'No disponible'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id_producto, product.nombre)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No se encontraron productos. Agrega uno nuevo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para editar producto */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.nombre}
                    onChange={(e) => setEditingProduct({...editingProduct, nombre: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Categoría</Label>
                  <Input
                    id="edit-category"
                    value={editingProduct.categoria}
                    onChange={(e) => setEditingProduct({...editingProduct, categoria: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-codigo" className="text-right">Código único</Label>
                  <Input
                    id="edit-codigo"
                    value={editingProduct.codigo_unico}
                    onChange={(e) => setEditingProduct({...editingProduct, codigo_unico: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Estado</Label>
                  <Select 
                    value={editingProduct.estado} 
                    onValueChange={(value) => setEditingProduct({...editingProduct, estado: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Disponible</SelectItem>
                      <SelectItem value="inactivo">No disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEditSave}>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProductsPage;
