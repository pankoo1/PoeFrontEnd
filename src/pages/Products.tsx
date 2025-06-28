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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold">Inventario de Supermercado</CardTitle>
                  <p className="text-blue-100 mt-1">{filteredProducts.length} productos registrados</p>
                </div>
              </div>
              <ProductForm onProductAdded={handleProductAdded} mode="create" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar productos por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100">
                    <TableHead className="font-semibold text-slate-700">Código</TableHead>
                    <TableHead className="font-semibold text-slate-700">Producto</TableHead>
                    <TableHead className="font-semibold text-slate-700">Categoría</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tipo Unidad</TableHead>
                    <TableHead className="font-semibold text-slate-700">Cantidad</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="font-semibold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <span className="text-slate-600">Cargando productos...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id_producto} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-slate-700 font-mono text-sm">{product.codigo_unico}</TableCell>
                        <TableCell className="font-medium text-slate-900">{product.nombre}</TableCell>
                        <TableCell className="text-slate-700">{product.categoria}</TableCell>
                        <TableCell className="text-slate-700">{product.unidad_tipo}</TableCell>
                        <TableCell className="text-slate-700 font-medium">{product.unidad_cantidad}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.estado === 'activo' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
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
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id_producto, product.nombre)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
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
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No se encontraron productos. Agrega uno nuevo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
