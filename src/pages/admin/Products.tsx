import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Edit, Trash2, Home, ShoppingCart, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';
import { Producto } from '@/types/producto';
import { useNavigateToDashboard } from '@/hooks/useNavigateToDashboard';
import ProductForm from '@/components/forms/ProductForm';
import Logo from '@/components/shared/Logo';

const ProductsPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = useNavigateToDashboard();
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
    } catch (error: any) {
      console.error('Error al desactivar producto:', error);
      
      // Manejo específico del error 409 (producto vinculado a tareas activas)
      if (error.message?.includes('409')) {
        toast({
          title: "No se puede eliminar el producto",
          description: `${nombre} está vinculado a tareas activas de reposición. Complete o cancele las tareas primero.`,
          variant: "destructive",
        });
      } else if (error.message?.includes('403')) {
        toast({
          title: "Sin permisos",
          description: "Solo los administradores pueden eliminar productos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo desactivar el producto",
          variant: "destructive",
        });
      }
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
    <>
      {/* Background fijo que cubre toda la pantalla */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="min-h-screen relative z-10">
        {/* Header con diseño unificado */}
        <header className="border-b shadow-sm rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
                <Logo size="lg" showText={true} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Gestión de Productos
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Administra el inventario del supermercado
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={navigateToDashboard}
                className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Banner informativo */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/40 rounded-xl">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Inventario de Productos del Supermercado</h2>
                <p className="text-muted-foreground">Gestiona el catálogo completo de productos disponibles para la venta</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de productos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-primary/10 to-primary/25 backdrop-blur-sm bg-white/75 group">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-300">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="metric-value text-primary">{products.length}</div>
                <div className="metric-label">Total Productos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-primary">Registrados</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-success/15 to-success/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.1s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-success/30 rounded-full group-hover:bg-success/40 transition-all duration-300">
                    <ShoppingCart className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="metric-value text-success">{products.filter(p => p.estado === 'activo').length}</div>
                <div className="metric-label">Productos Activos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-success/20 text-success border border-success/40 px-2 py-1 rounded-md text-xs font-medium">Disponibles</span>
                </div>
              </div>
            </div>
            
            <div className="card-supermarket fade-in hover-lift bg-gradient-to-br from-secondary/25 to-secondary/35 backdrop-blur-sm bg-white/85 group" style={{animationDelay: '0.2s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-secondary/40 rounded-full group-hover:bg-secondary/50 transition-all duration-300">
                    <BarChart3 className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="metric-value text-secondary">{new Set(products.map(p => p.categoria)).size}</div>
                <div className="metric-label">Categorías</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="badge-secondary">Únicas</span>
                </div>
              </div>
            </div>
            
            <div className="card-logistics fade-in hover-lift bg-gradient-to-br from-warning/15 to-warning/25 backdrop-blur-sm bg-white/75 group" style={{animationDelay: '0.3s'}}>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-warning/30 rounded-full group-hover:bg-warning/40 transition-all duration-300">
                    <Package className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <div className="metric-value text-warning">{products.filter(p => p.estado !== 'activo').length}</div>
                <div className="metric-label">Inactivos</div>
                <div className="mt-3 flex items-center justify-center">
                  <span className="bg-warning/20 text-warning border border-warning/40 px-2 py-1 rounded-md text-xs font-medium">⚠ Revisión</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de productos */}
          <Card className="card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-accent/30 rounded-xl">
                    <Package className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Inventario de Supermercado</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona el catálogo completo de productos</p>
                  </div>
                </div>
                <ProductForm onProductAdded={handleProductAdded} mode="create" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar productos por nombre, categoría o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-primary/20">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="font-semibold">Código</TableHead>
                      <TableHead className="font-semibold">Producto</TableHead>
                      <TableHead className="font-semibold">Categoría</TableHead>
                      <TableHead className="font-semibold">Tipo Unidad</TableHead>
                      <TableHead className="font-semibold">Cantidad</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Cargando productos...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id_producto} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-mono text-sm">{product.codigo_unico}</TableCell>
                          <TableCell className="font-medium">{product.nombre}</TableCell>
                          <TableCell>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/40">
                              {product.categoria}
                            </span>
                          </TableCell>
                          <TableCell>{product.unidad_tipo}</TableCell>
                          <TableCell className="font-medium">{product.unidad_cantidad}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.estado === 'activo' 
                                ? 'bg-success/20 text-success border border-success/40' 
                                : 'bg-destructive/20 text-destructive border border-destructive/40'
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
                                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id_producto, product.nombre)}
                                className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 text-destructive transition-all duration-200"
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
                        <TableCell colSpan={7} className="text-center py-12">
                          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">No se encontraron productos</p>
                          <p className="text-sm text-muted-foreground">Agrega uno nuevo para comenzar</p>
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
    </>
  );
};

export default ProductsPage;
