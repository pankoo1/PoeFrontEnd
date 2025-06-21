import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Producto } from '@/types/producto';
import { ApiService } from '@/services/api';

interface ProductSelectorProps {
  selectedProducts: Producto[];
  onAdd: (producto: Producto) => void;
  excludeIds?: number[];
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ selectedProducts, onAdd, excludeIds = [] }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Producto[]>([]);

  useEffect(() => {
    ApiService.getProductos().then((data: any) => {
      setProductos(data.productos || []);
    });
  }, []);

  useEffect(() => {
    setFiltered(
      productos.filter(
        p =>
          !excludeIds.includes(p.id_producto) &&
          (p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.categoria.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, productos, excludeIds]);

  return (
    <div>
      <Input
        placeholder="Buscar producto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-40 overflow-y-auto border rounded bg-white">
        {filtered.length === 0 && <div className="p-2 text-muted-foreground">Sin resultados</div>}
        {filtered.map(producto => (
          <div key={producto.id_producto} className="flex items-center justify-between px-2 py-1 hover:bg-gray-100">
            <span>{producto.nombre} <span className="text-xs text-muted-foreground">({producto.categoria})</span></span>
            <Button size="sm" variant="outline" onClick={() => onAdd(producto)}>
              Agregar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
