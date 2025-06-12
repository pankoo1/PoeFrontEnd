
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ProductForm from '../components/forms/ProductForm';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Estado para almacenar los productos
  const [products, setProducts] = useState([]);

  // Cargar productos desde localStorage al iniciar
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Datos de ejemplo si no hay productos en localStorage
      const exampleProducts = [
        { id: 1, name: 'Leche Entera 1L', category: 'Lácteos', tipoUnidad: 'Litro', cantidadUnidad: 1, codigoProducto: 'LAC001', status: 'Disponible' },
        { id: 2, name: 'Pan Integral', category: 'Panadería', tipoUnidad: 'Gramo', cantidadUnidad: 500, codigoProducto: 'PAN002', status: 'Disponible' },
        { id: 3, name: 'Manzanas Rojas 1kg', category: 'Frutas y Verduras', tipoUnidad: 'Kilogramo', cantidadUnidad: 1, codigoProducto: 'FRU003', status: 'Agotado' },
        { id: 4, name: 'Pollo Entero', category: 'Carnes', tipoUnidad: 'Kilogramo', cantidadUnidad: 1.5, codigoProducto: 'CAR004', status: 'Disponible' },
        { id: 5, name: 'Coca Cola 2L', category: 'Bebidas', tipoUnidad: 'Litro', cantidadUnidad: 2, codigoProducto: 'BEB005', status: 'Disponible' },
      ];
      setProducts(exampleProducts);
      localStorage.setItem('products', JSON.stringify(exampleProducts));
    }
  }, []);

  const eliminarProducto = (id: number, nombre: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    toast({
      title: "Producto eliminado",
      description: `${nombre} ha sido eliminado del inventario`,
    });
  };

  const editarProducto = (product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const guardarEdicion = () => {
    const updatedProducts = products.map(product => 
      product.id === editingProduct.id ? editingProduct : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setEditDialogOpen(false);
    setEditingProduct(null);
    toast({
      title: "Producto actualizado",
      description: `La información de ${editingProduct.name} ha sido actualizada`,
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase())
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
              <ProductForm />
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
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo Unidad</TableHead>
                  <TableHead>Cantidad de unidad</TableHead>
                  <TableHead>Código de producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.tipoUnidad}</TableCell>
                      <TableCell>{product.cantidadUnidad}</TableCell>
                      <TableCell>{product.codigoProducto}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'Disponible' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editarProducto(product)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => eliminarProducto(product.id, product.name)}
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
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Categoría</Label>
                  <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lácteos">Lácteos</SelectItem>
                      <SelectItem value="Panadería">Panadería</SelectItem>
                      <SelectItem value="Frutas y Verduras">Frutas y Verduras</SelectItem>
                      <SelectItem value="Carnes">Carnes</SelectItem>
                      <SelectItem value="Bebidas">Bebidas</SelectItem>
                      <SelectItem value="Limpieza">Limpieza</SelectItem>
                      <SelectItem value="Congelados">Congelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-tipo-unidad" className="text-right">Tipo Unidad</Label>
                  <Select value={editingProduct.tipoUnidad} onValueChange={(value) => setEditingProduct({...editingProduct, tipoUnidad: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cantidad-unidad" className="text-right">Cantidad de unidad</Label>
                  <Input
                    id="edit-cantidad-unidad"
                    type="number"
                    step="0.01"
                    value={editingProduct.cantidadUnidad}
                    onChange={(e) => setEditingProduct({...editingProduct, cantidadUnidad: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-codigo-producto" className="text-right">Código de producto</Label>
                  <Input
                    id="edit-codigo-producto"
                    value={editingProduct.codigoProducto}
                    onChange={(e) => setEditingProduct({...editingProduct, codigoProducto: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Estado</Label>
                  <Select value={editingProduct.status} onValueChange={(value) => setEditingProduct({...editingProduct, status: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Agotado">Agotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarEdicion}>
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
