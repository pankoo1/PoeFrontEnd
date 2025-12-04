import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Search, 
  Loader2, 
  RefreshCw, 
  Save, 
  X,
  GripVertical
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { MapaService } from '@/services/mapa.service';
import { useToast } from '@/hooks/use-toast';

interface Producto {
  id_producto: number;
  nombre: string;
  categoria: string;
  unidad_tipo: string;
  unidad_cantidad: number;
  codigo_unico: string;
}

interface PuntoReposicion {
  id_punto: number;
  nivel: number;
  estanteria: number;
  producto?: {
    id_producto: number;
    nombre: string;
    categoria: string;
  } | null;
}

interface MuebleInfo {
  nombre: string;
  filas: number;
  columnas: number;
  puntos: PuntoReposicion[];
}

interface MuebleAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  mueble: MuebleInfo | null;
  onSuccess?: () => void;
}

interface PendingAssignment {
  id_punto: number;
  id_producto: number | null; // null = desasignar
  producto?: Producto;
}

export const MuebleAssignmentModal: React.FC<MuebleAssignmentModalProps> = ({
  open,
  onClose,
  mueble,
  onSuccess
}) => {
  const { toast } = useToast();
  
  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado local de puntos (incluye cambios pendientes)
  const [localPuntos, setLocalPuntos] = useState<PuntoReposicion[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingAssignment[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (open && mueble) {
      loadInitialData();
    }
  }, [open, mueble]);

  // Filtrar productos
  useEffect(() => {
    const filtered = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);
  }, [productos, searchTerm]);

  // Inicializar datos locales
  useEffect(() => {
    if (mueble) {
      setLocalPuntos(mueble.puntos);
      setPendingChanges([]);
    }
  }, [mueble]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const productosResponse = await ApiService.getProductos();
      // La respuesta viene como {productos: [...], total, page, limit}
      const productosArray = (productosResponse as any).productos || productosResponse;
      setProductos(productosArray);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!mueble) return;
    
    setRefreshing(true);
    try {
      // Recargar puntos del mueble desde el backend
      const response = await MapaService.obtenerVistaReposicion();
      const ubicacionMueble = response.ubicaciones.find((u: any) => 
        u.objeto?.nombre === mueble.nombre && u.mueble
      );
      
      if (ubicacionMueble && ubicacionMueble.mueble) {
        setLocalPuntos(ubicacionMueble.mueble.puntos_reposicion || []);
        setPendingChanges([]);
        toast({
          title: 'Actualizado',
          description: 'Los puntos de reposición se han actualizado'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductDrop = (e: React.DragEvent, punto: PuntoReposicion) => {
    e.preventDefault();
    const productoId = parseInt(e.dataTransfer.getData('producto-id'));
    const producto = productos.find(p => p.id_producto === productoId);
    
    if (!producto) return;

    // Verificar si el punto ya tiene producto
    const puntoActual = localPuntos.find(p => p.id_punto === punto.id_punto);
    if (puntoActual?.producto) {
      toast({
        title: 'Punto ocupado',
        description: 'Este punto ya tiene un producto. Haz click en él para liberarlo primero.',
        variant: 'destructive'
      });
      return;
    }

    // Actualizar estado local
    setLocalPuntos(prev => prev.map(p => 
      p.id_punto === punto.id_punto 
        ? { 
            ...p, 
            producto: { 
              id_producto: producto.id_producto,
              nombre: producto.nombre, 
              categoria: producto.categoria 
            } 
          }
        : p
    ));

    // Registrar cambio pendiente
    setPendingChanges(prev => {
      const filtered = prev.filter(c => c.id_punto !== punto.id_punto);
      return [...filtered, { 
        id_punto: punto.id_punto, 
        id_producto: producto.id_producto,
        producto 
      }];
    });

    toast({
      title: 'Producto asignado',
      description: `${producto.nombre} asignado a N${punto.nivel} E${punto.estanteria}`,
    });
  };

  const handlePuntoClick = (punto: PuntoReposicion) => {
    const puntoLocal = localPuntos.find(p => p.id_punto === punto.id_punto);
    
    if (puntoLocal?.producto) {
      // Desasignar producto
      setLocalPuntos(prev => prev.map(p => 
        p.id_punto === punto.id_punto ? { ...p, producto: null } : p
      ));

      // Registrar desasignación pendiente
      setPendingChanges(prev => {
        const filtered = prev.filter(c => c.id_punto !== punto.id_punto);
        return [...filtered, { 
          id_punto: punto.id_punto, 
          id_producto: null 
        }];
      });

      toast({
        title: 'Producto removido',
        description: `Producto removido de N${punto.nivel} E${punto.estanteria}`,
      });
    }
  };

  const handleSave = async () => {
    if (pendingChanges.length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No hay cambios pendientes para guardar',
      });
      return;
    }

    setSaving(true);
    try {
      // Procesar todos los cambios pendientes
      for (const change of pendingChanges) {
        if (change.id_producto === null) {
          // Desasignar
          await MapaService.desasignarProductoDePunto(change.id_punto);
        } else {
          // Asignar
          await MapaService.asignarProductoAPunto(change.id_punto, change.id_producto);
        }
      }

      toast({
        title: 'Cambios guardados',
        description: `${pendingChanges.length} cambios aplicados correctamente`,
      });

      setPendingChanges([]);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (pendingChanges.length > 0) {
      // Revertir cambios locales
      setLocalPuntos(mueble?.puntos || []);
      setPendingChanges([]);
      toast({
        title: 'Cambios cancelados',
        description: 'Se han revertido todos los cambios',
      });
    }
    onClose();
  };

  if (!mueble) return null;

  // Generar matriz visual de puntos
  const matrix: (PuntoReposicion | null)[][] = [];
  for (let nivel = mueble.filas; nivel >= 1; nivel--) { // De arriba hacia abajo
    const fila: (PuntoReposicion | null)[] = [];
    for (let estanteria = 1; estanteria <= mueble.columnas; estanteria++) {
      const punto = localPuntos.find(p => p.nivel === nivel && p.estanteria === estanteria);
      fila.push(punto || null);
    }
    matrix.push(fila);
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            Asignación de Productos - {mueble.nombre}
          </DialogTitle>
          <DialogDescription>
            Arrastra productos desde la lista hacia los puntos de reposición. Haz click en puntos ocupados para remover productos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Lista de Productos - Lado Izquierdo */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProductos.map((producto) => (
                    <div
                      key={producto.id_producto}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('producto-id', producto.id_producto.toString());
                      }}
                      className="p-3 border border-slate-200 rounded-lg cursor-grab hover:bg-slate-50 transition-colors active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{producto.nombre}</h4>
                          <p className="text-xs text-slate-600">{producto.categoria}</p>
                          <p className="text-xs text-slate-500">{producto.codigo_unico}</p>
                        </div>
                        <GripVertical className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Vista Gráfica - Lado Derecho */}
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Puntos de Reposición ({mueble.filas}×{mueble.columnas})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 rounded-lg">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${mueble.columnas}, 1fr)` }}>
                {matrix.map((fila, filaIndex) =>
                  fila.map((punto, colIndex) => (
                    <div
                      key={`${filaIndex}-${colIndex}`}
                      className={`
                        w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-all
                        ${punto ? (
                          punto.producto 
                            ? 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200' 
                            : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                        ) : 'bg-slate-100 border-slate-300 text-slate-500'}
                      `}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => punto && handleProductDrop(e, punto)}
                      onClick={() => punto && handlePuntoClick(punto)}
                      title={punto?.producto ? `Click para remover: ${punto.producto.nombre}` : punto ? 'Arrastra un producto aquí' : 'Sin punto'}
                    >
                      {punto ? (
                        <>
                          <div>N{punto.nivel}</div>
                          <div>E{punto.estanteria}</div>
                          {punto.producto && (
                            <div className="text-center leading-tight mt-1">
                              <div className="font-bold">{punto.producto.nombre.substring(0, 8)}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-400">—</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {pendingChanges.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pendingChanges.length} cambio{pendingChanges.length !== 1 ? 's' : ''} pendiente{pendingChanges.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || pendingChanges.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};