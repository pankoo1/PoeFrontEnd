import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { Producto } from '@/types/producto';
import ProductForm from '../components/forms/ProductForm';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

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

  const handleProductUpdated = (updatedProduct: Producto) => {
    setProducts(prevProducts => prevProducts.map(product =>
      product.id_producto === updatedProduct.id_producto ? updatedProduct : product
    ));
    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: number, nombre: string) => {
    try {
      await ApiService.deleteProducto(id);
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
              <ProductForm onProductAdded={handleProductAdded} mode="create" />
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

        {/* Formulario de edición */}
        <ProductForm
          mode="edit"
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editingProduct={editingProduct}
          onProductUpdated={handleProductUpdated}
        />
      </main>
    </div>
  );
};

export default ProductsPage;
