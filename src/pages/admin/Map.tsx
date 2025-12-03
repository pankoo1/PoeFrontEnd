import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Save, 
  Plus, 
  Trash2, 
  Map as MapIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Grid3x3,
  RefreshCw,
  Edit3,
  Package
} from 'lucide-react';
import { MapCanvas } from '@/components/mapa/MapCanvas';
import { ObjectPalette } from '@/components/mapa/ObjectPalette';
import { CreateFurnitureModal } from '@/components/mapa/CreateFurnitureModal';
import { ShelfModal } from '@/components/mapa/ShelfModal';
import { ProductSearchModal } from '@/components/mapa/ProductSearchModal';
import { MapaService } from '@/services/mapa.service';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { 
  Mapa, 
  ObjetoMapa, 
  VistaGraficaMapa, 
  UbicacionObjeto,
  DraggedObject,
  ObjetoNuevo
} from '@/types/mapa.types';

// Estado local del editor (diferente del EditorState de types)
interface LocalEditorState {
  mapa: VistaGraficaMapa | null;
  objetosDisponibles: ObjetoMapa[];
  ubicaciones: UbicacionObjeto[];
  draggedObject: DraggedObject | null;
  selectedObjectId: number | null;
  highlightedCells: Array<{ x: number; y: number }>;
  hasUnsavedChanges: boolean;
}

interface MapaListItem {
  id_mapa: number;
  nombre: string;
  ancho: number;
  alto: number;
  activo?: boolean;
}

const MapPage = () => {
  const { toast } = useToast();
  
  // Estados principales
  const [editorState, setEditorState] = useState<LocalEditorState>({
    mapa: null,
    objetosDisponibles: [],
    ubicaciones: [],
    draggedObject: null,
    selectedObjectId: null,
    highlightedCells: [],
    hasUnsavedChanges: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  const [mapasDisponibles, setMapasDisponibles] = useState<Mapa[]>([]);
  const [mapaSeleccionadoId, setMapaSeleccionadoId] = useState<number | null>(null);
  
  // Estado de modo del editor
  const [editorMode, setEditorMode] = useState<'edit' | 'assign'>('edit');
  
  // Estados para asignación de productos
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedMueble, setSelectedMueble] = useState<any>(null);
  const [selectedPunto, setSelectedPunto] = useState<any>(null);
  
  // Form para crear nuevo mapa
  const [newMapForm, setNewMapForm] = useState({
    nombre: '',
    filas: '',
    columnas: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar mapas existentes
      const mapas = await MapaService.listarMapas();
      setMapasDisponibles(mapas); // ✅ Guardar mapas en estado
      
      if (mapas.length > 0) {
        // Buscar mapa activo o usar el primero
        const mapaActivo = mapas.find(m => m.activo) || mapas[0];
        setMapaSeleccionadoId(mapaActivo.id_mapa); // ✅ Establecer mapa seleccionado
        await loadMapa(mapaActivo.id_mapa);
      } else {
        // Si no hay mapas, mostrar diálogo para crear uno nuevo
        setShowNewMapDialog(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('Error al cargar los datos del mapa. Verifica que el backend esté corriendo.');
      setShowNewMapDialog(true);
      setLoading(false);
    }
  };

  const loadMapa = async (idMapa: number) => {
    try {
      // Cargar vista gráfica del mapa (incluye celdas y ubicaciones)
      const { vistaGrafica, ubicaciones } = await MapaService.obtenerVistaGrafica(idMapa);
      
      // Cargar paleta de objetos
      const paleta = await MapaService.obtenerPaleta();

      setEditorState(prev => ({
        ...prev,
        mapa: vistaGrafica,
        objetosDisponibles: paleta,
        ubicaciones: ubicaciones,
        hasUnsavedChanges: false
      }));

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar mapa:', err);
      setError('Error al cargar el mapa');
      setLoading(false);
    }
  };

  const handleCreateNewMap = async () => {
    const filas = parseInt(newMapForm.filas);
    const columnas = parseInt(newMapForm.columnas);

    if (!newMapForm.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del mapa es obligatorio',
        variant: 'destructive'
      });
      return;
    }

    if (isNaN(filas) || filas < 5 || filas > 100) {
      toast({
        title: 'Error',
        description: 'Las filas deben estar entre 5 y 100',
        variant: 'destructive'
      });
      return;
    }

    if (isNaN(columnas) || columnas < 5 || columnas > 100) {
      toast({
        title: 'Error',
        description: 'Las columnas deben estar entre 5 y 100',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const nuevoMapa = await MapaService.crearMapa({
        nombre: newMapForm.nombre.trim(),
        ancho: columnas,
        alto: filas
      });

      toast({
        title: 'Mapa creado',
        description: `El mapa "${nuevoMapa.nombre}" se ha creado exitosamente`
      });

      setShowNewMapDialog(false);
      setNewMapForm({ nombre: '', filas: '', columnas: '' });
      
      // Recargar lista de mapas
      const mapasActualizados = await MapaService.listarMapas();
      setMapasDisponibles(mapasActualizados);
      setMapaSeleccionadoId(nuevoMapa.id_mapa);
      
      // Cargar el nuevo mapa
      await loadMapa(nuevoMapa.id_mapa);
    } catch (err) {
      console.error('Error al crear mapa:', err);
      toast({
        title: 'Error',
        description: 'No se pudo crear el mapa',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleObjectSelect = (objeto: ObjetoMapa) => {
    setEditorState(prev => ({
      ...prev,
      draggedObject: {
        objeto,
        offsetX: 0,
        offsetY: 0,
        isNew: false
      },
      selectedObjectId: objeto.id_objeto
    }));
  };

  const handleCellClick = (x: number, y: number) => {
    if (!editorState.mapa) return;

    // MODO EDICIÓN: Colocar objetos
    if (editorMode === 'edit' && editorState.draggedObject) {
      const objeto = editorState.draggedObject.objeto;
      
      // Verificar si es ObjetoMapa o ObjetoNuevo
      const id_objeto = 'id_objeto' in objeto ? objeto.id_objeto : Date.now();
      
      const nuevaUbicacion: UbicacionObjeto = {
        x,
        y,
        id_objeto,
        rotacion: 0
      };

      setEditorState(prev => ({
        ...prev,
        ubicaciones: [...prev.ubicaciones, nuevaUbicacion],
        hasUnsavedChanges: true
      }));
      return;
    }

    // MODO ASIGNACIÓN: Click en mueble para asignar productos
    if (editorMode === 'assign') {
      const ubicacionClickeada = editorState.ubicaciones.find(u => u.x === x && u.y === y);
      
      console.log('🔍 Click en modo asignación:', { 
        x, 
        y, 
        ubicacionClickeada,
        todasUbicaciones: editorState.ubicaciones,
        objetosDisponibles: editorState.objetosDisponibles
      });
      
      if (ubicacionClickeada) {
        // Buscar el objeto por id_objeto o por nombre si no coincide
        let objetoEnCelda = editorState.objetosDisponibles.find(
          obj => obj.id_objeto === ubicacionClickeada.id_objeto
        );
        
        // Si no se encuentra por id_objeto, buscar por nombre (fallback)
        if (!objetoEnCelda && ubicacionClickeada.nombre_objeto) {
          objetoEnCelda = editorState.objetosDisponibles.find(
            obj => obj.nombre === ubicacionClickeada.nombre_objeto
          );
        }
        
        console.log('✅ Objeto encontrado:', objetoEnCelda);
        
        // Si es un mueble, abrir modal de puntos (comparación case-insensitive)
        const tipoObjeto = objetoEnCelda?.tipo?.toLowerCase();
        if (objetoEnCelda && tipoObjeto === 'mueble') {
          console.log('🪑 Es un mueble, abriendo modal...');
          handleMuebleClick(objetoEnCelda);
        } else if (objetoEnCelda) {
          console.log('❌ No es un mueble, tipo:', tipoObjeto);
          toast({
            title: 'Objeto no válido',
            description: 'Solo puedes asignar productos a muebles',
            variant: 'destructive'
          });
        } else {
          console.warn('⚠️ No se encontró objeto en la ubicación clickeada');
        }
      } else {
        console.log('ℹ️ No hay objeto en esta celda');
      }
    }
  };

  const handleMuebleClick = async (mueble: ObjetoMapa) => {
    try {
      // Obtener los puntos del mueble desde el backend
      const response = await MapaService.obtenerVistaReposicion(editorState.mapa!.id_mapa);
      
      // Buscar el mueble en la respuesta por nombre
      const ubicacionMueble = response.ubicaciones.find((u: any) => 
        u.objeto?.nombre === mueble.nombre && u.mueble
      );

      if (ubicacionMueble && ubicacionMueble.mueble) {
        setSelectedMueble({
          nombre: mueble.nombre,
          filas: ubicacionMueble.mueble.filas,
          columnas: ubicacionMueble.mueble.columnas,
          puntos: ubicacionMueble.mueble.puntos_reposicion || []
        });
        setShowShelfModal(true);
      } else {
        toast({
          title: 'Mueble sin puntos',
          description: 'Este mueble no tiene puntos de reposición configurados',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error al cargar mueble:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el mueble',
        variant: 'destructive'
      });
    }
  };

  const handleSelectPunto = (punto: any) => {
    setSelectedPunto(punto);
    setShowShelfModal(false);
    
    // Si el punto ya tiene producto, mostrar opción de desasignar
    if (punto.producto) {
      // Por ahora solo permitir asignar a puntos vacíos
      toast({
        title: 'Punto ocupado',
        description: 'Este punto ya tiene un producto asignado',
        variant: 'destructive'
      });
      return;
    }
    
    // Abrir modal de búsqueda de productos
    setShowProductModal(true);
  };

  const handleSelectProduct = async (producto: any) => {
    if (!selectedPunto) return;

    try {
      await MapaService.asignarProductoAPunto(selectedPunto.id_punto, producto.id_producto);
      
      toast({
        title: 'Producto asignado',
        description: `${producto.nombre} se ha asignado correctamente al punto N${selectedPunto.nivel} E${selectedPunto.estanteria}`
      });

      // Recargar el mapa para reflejar los cambios
      if (editorState.mapa) {
        await loadMapa(editorState.mapa.id_mapa);
      }

      setSelectedPunto(null);
      setShowProductModal(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo asignar el producto',
        variant: 'destructive'
      });
    }
  };

  const handleObjectPlace = (x: number, y: number) => {
    handleCellClick(x, y);
  };

  const handleSaveLayout = async () => {
    if (!editorState.mapa) {
      toast({
        title: 'Error',
        description: 'No hay mapa cargado',
        variant: 'destructive'
      });
      return;
    }

    // Obtener el id_tipo de "salida" desde los objetos disponibles
    const objetoTipoSalida = editorState.objetosDisponibles.find(o => o.tipo === 'salida');
    if (!objetoTipoSalida) {
      toast({
        title: 'Error de configuración',
        description: 'No se encontró el tipo de objeto "salida" en el sistema',
        variant: 'destructive'
      });
      return;
    }

    // Contar cuántas salidas hay en el mapa
    const cantidadSalidas = editorState.ubicaciones.filter(u => {
      const objeto = editorState.objetosDisponibles.find(o => o.id_objeto === u.id_objeto);
      return objeto?.tipo === 'salida';
    }).length;

    if (cantidadSalidas === 0) {
      toast({
        title: 'Error de validación',
        description: 'El mapa debe tener obligatoriamente una Salida',
        variant: 'destructive'
      });
      return;
    }

    if (cantidadSalidas > 1) {
      toast({
        title: 'Error de validación',
        description: 'El mapa solo puede tener una única Salida. Has colocado más de una distinta.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      // Separar objetos existentes (ID pequeño) de nuevos (ID timestamp)
      const MAX_INT = 2147483647;
      const objetosNuevos = editorState.objetosDisponibles.filter(obj => obj.id_objeto > MAX_INT);
      
      // Construir el payload en el formato esperado por el backend
      const payload = {
        objetos_nuevos: objetosNuevos.map(obj => ({
          temp_id: String(obj.id_objeto), // Convertir a string
          nombre: obj.nombre,
          id_tipo: obj.id_tipo || 2, // 2 = mueble por defecto
          filas: obj.filas || 3,
          columnas: obj.columnas || 3,
          direccion: 'T'
        })),
        ubicaciones: editorState.ubicaciones.map(u => {
          const esObjetoNuevo = u.id_objeto > MAX_INT;
          return {
            x: u.x,
            y: u.y,
            id_objeto_real: esObjetoNuevo ? null : u.id_objeto,
            ref_objeto_temp_id: esObjetoNuevo ? String(u.id_objeto) : null // Convertir a string
          };
        })
      };

      await MapaService.guardarLayoutCompleto(
        editorState.mapa.id_mapa,
        payload
      );

      toast({
        title: 'Guardado exitoso',
        description: 'El layout del mapa se ha guardado correctamente'
      });

      setEditorState(prev => ({
        ...prev,
        hasUnsavedChanges: false
      }));
    } catch (err) {
      console.error('Error al guardar layout:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al guardar el layout',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFurniture = async (objeto: ObjetoNuevo) => {
    try {
      // Crear mueble temporal en el frontend con timestamp como ID
      const nuevoObjeto: ObjetoMapa = {
        id_objeto: Date.now(), // ID temporal (timestamp)
        tipo: objeto.tipo,
        nombre: objeto.nombre,
        filas: objeto.filas,
        columnas: objeto.columnas,
        ancho: objeto.ancho,
        alto: objeto.alto,
        es_caminable: false, // Los muebles no son caminables por defecto
        id_tipo: 2, // Tipo mueble
        id_empresa: 0 // Temporal - se asigna correctamente en backend
      };

      setEditorState(prev => ({
        ...prev,
        objetosDisponibles: [...prev.objetosDisponibles, nuevoObjeto]
      }));

      toast({
        title: 'Mueble creado',
        description: `El mueble "${objeto.nombre}" se agregará a la paleta. Recuerda guardar el mapa para persistirlo.`
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al crear el mueble',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleRefresh = async () => {
    if (editorState.mapa) {
      await loadMapa(editorState.mapa.id_mapa);
      toast({
        title: 'Actualizado',
        description: 'Los datos se han recargado desde el servidor'
      });
    }
  };

  const handleMapaChange = async (idMapa: number) => {
    if (editorState.hasUnsavedChanges) {
      const confirmar = window.confirm('Tienes cambios sin guardar. ¿Deseas continuar sin guardar?');
      if (!confirmar) return;
    }

    try {
      setLoading(true);
      setMapaSeleccionadoId(idMapa);
      await loadMapa(idMapa);
      
      toast({
        title: 'Mapa cargado',
        description: 'El mapa se ha cargado correctamente',
      });
    } catch (err) {
      console.error('Error al cambiar mapa:', err);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el mapa seleccionado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivarMapa = async () => {
    if (!mapaSeleccionadoId) return;

    try {
      await MapaService.activarMapa(mapaSeleccionadoId);
      
      // Actualizar estado local
      setMapasDisponibles(prev => 
        prev.map(m => ({
          ...m,
          activo: m.id_mapa === mapaSeleccionadoId
        }))
      );

      toast({
        title: 'Mapa activado',
        description: 'El mapa se ha activado correctamente. Este será el mapa usado para las operaciones.',
      });
    } catch (err) {
      console.error('Error al activar mapa:', err);
      toast({
        title: 'Error',
        description: 'No se pudo activar el mapa',
        variant: 'destructive',
      });
    }
  };

  const handleClearMap = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todo el mapa?')) {
      setEditorState(prev => ({
        ...prev,
        ubicaciones: [],
        hasUnsavedChanges: true
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Cargando editor de mapas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-blue-600" />
              Editor de Mapas
            </h1>
            <p className="text-slate-600 mt-1">
              Diseña el layout del supermercado arrastrando objetos al canvas
            </p>
            
            {/* Selector de Mapas */}
            {mapasDisponibles.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Mapa actual:
                </label>
                <Select
                  value={mapaSeleccionadoId?.toString() || ''}
                  onValueChange={(value) => handleMapaChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[300px] bg-white">
                    <SelectValue placeholder="Selecciona un mapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mapasDisponibles.map((mapa) => (
                      <SelectItem key={mapa.id_mapa} value={mapa.id_mapa.toString()}>
                        {mapa.nombre} ({mapa.ancho}×{mapa.alto})
                        {mapa.activo && ' ✓'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleActivarMapa}
                  disabled={!mapaSeleccionadoId || mapasDisponibles.find(m => m.id_mapa === mapaSeleccionadoId)?.activo}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {mapasDisponibles.find(m => m.id_mapa === mapaSeleccionadoId)?.activo 
                    ? 'Mapa activo' 
                    : 'Activar mapa'}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {editorState.hasUnsavedChanges && (
              <Alert className="border-amber-200 bg-amber-50 py-2 px-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  Hay cambios sin guardar
                </AlertDescription>
              </Alert>
            )}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-slate-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            {editorMode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClearMap}
                  disabled={!editorState.mapa}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Mapa
                </Button>
                <Button
                  onClick={handleSaveLayout}
                  disabled={!editorState.hasUnsavedChanges || saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Layout
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowNewMapDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Mapa
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Toggle de Modo Editor */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 shadow-sm">
          <span className="text-sm font-semibold text-slate-700">Modo de Trabajo:</span>
          <div className="flex gap-2">
            <Button
              onClick={() => setEditorMode('edit')}
              disabled={!editorState.mapa}
              variant={editorMode === 'edit' ? 'default' : 'outline'}
              className={editorMode === 'edit' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edición de Mapa
            </Button>
            <Button
              onClick={() => setEditorMode('assign')}
              disabled={!editorState.mapa}
              variant={editorMode === 'assign' ? 'default' : 'outline'}
              className={editorMode === 'assign' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}
            >
              <Package className="w-4 h-4 mr-2" />
              Asignación de Productos
            </Button>
          </div>
        </div>

        {/* Mensaje informativo - Modo Asignación */}
        {editorMode === 'assign' && (
          <Alert className="bg-purple-50 border-purple-200">
            <Package className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900">
              Haz click en cualquier mueble del mapa para asignar productos a sus puntos de reposición
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Mapa Activo</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {editorState.mapa?.nombre || 'Sin mapa'}
                  </p>
                </div>
                <MapIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Dimensiones</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {editorState.mapa ? `${editorState.mapa.alto}×${editorState.mapa.ancho}` : '—'}
                  </p>
                </div>
                <Grid3x3 className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Objetos Colocados</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {editorState.ubicaciones?.length || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Objetos Disponibles</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {editorState.objetosDisponibles?.length || 0}
                  </p>
                </div>
                <Plus className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Layout */}
        <div className="grid grid-cols-[1fr_350px] gap-6 min-h-[600px] pb-8">
          {/* Canvas */}
          <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
            <CardHeader className="border-b border-slate-100 flex-shrink-0 bg-white">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Canvas del Mapa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-auto bg-white">
              {editorState.mapa ? (
                <MapCanvas
                  mapa={editorState.mapa}
                  ubicaciones={editorState.ubicaciones || []}
                  onCellClick={handleCellClick}
                  onObjectPlace={handleObjectPlace}
                  draggedObject={editorState.draggedObject?.objeto || null}
                  highlightedCells={editorState.highlightedCells || []}
                />
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <MapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No hay mapa cargado</p>
                    <Button
                      onClick={() => setShowNewMapDialog(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Crear Nuevo Mapa
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paleta de Objetos - Solo en modo edición */}
          {editorMode === 'edit' && (
            <ObjectPalette
              objetos={editorState.objetosDisponibles || []}
              onObjectSelect={handleObjectSelect}
              onCreateFurniture={() => setShowCreateModal(true)}
              selectedObjectId={editorState.selectedObjectId || null}
            />
          )}
        </div>

        {/* Modal para crear mueble - Solo en modo edición */}
        {editorMode === 'edit' && (
          <CreateFurnitureModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateFurniture}
          />
        )}

        {/* Dialog para crear nuevo mapa */}
        <Dialog open={showNewMapDialog} onOpenChange={setShowNewMapDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-blue-600" />
                Crear Nuevo Mapa
              </DialogTitle>
              <DialogDescription>
                Define las dimensiones del canvas para el nuevo mapa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Mapa *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Planta Principal"
                  value={newMapForm.nombre}
                  onChange={(e) => setNewMapForm(prev => ({ ...prev, nombre: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filas">Filas (5-100) *</Label>
                  <Input
                    id="filas"
                    type="number"
                    min="5"
                    max="100"
                    placeholder="Ej: 20"
                    value={newMapForm.filas}
                    onChange={(e) => setNewMapForm(prev => ({ ...prev, filas: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="columnas">Columnas (5-100) *</Label>
                  <Input
                    id="columnas"
                    type="number"
                    min="5"
                    max="100"
                    placeholder="Ej: 30"
                    value={newMapForm.columnas}
                    onChange={(e) => setNewMapForm(prev => ({ ...prev, columnas: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewMapDialog(false)}
                className="border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewMap}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Mapa'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de puntos de reposición */}
        {showShelfModal && selectedMueble && (
          <ShelfModal
            open={showShelfModal}
            onClose={() => setShowShelfModal(false)}
            muebleNombre={selectedMueble.nombre}
            filas={selectedMueble.filas}
            columnas={selectedMueble.columnas}
            puntos={selectedMueble.puntos}
            onSelectPunto={handleSelectPunto}
          />
        )}

        {/* Modal de búsqueda de productos */}
        {showProductModal && (
          <ProductSearchModal
            open={showProductModal}
            onClose={() => {
              setShowProductModal(false);
              setSelectedPunto(null);
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default MapPage;
