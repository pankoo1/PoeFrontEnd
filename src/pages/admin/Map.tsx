import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  RefreshCw
} from 'lucide-react';
import { MapCanvas } from '@/components/mapa/MapCanvas';
import { ObjectPalette } from '@/components/mapa/ObjectPalette';
import { CreateFurnitureModal } from '@/components/mapa/CreateFurnitureModal';
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
      
      if (mapas.length > 0) {
        // Cargar el primer mapa disponible
        await loadMapa(mapas[0].id_mapa);
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
      draggedObject: objeto,
      selectedObjectId: objeto.id_objeto
    }));
  };

  const handleCellClick = (x: number, y: number) => {
    if (!editorState.draggedObject || !editorState.mapa) return;

    // Agregar objeto en la ubicación
    const nuevaUbicacion: UbicacionObjeto = {
      x,
      y,
      id_objeto: editorState.draggedObject.id_objeto,
      rotacion: 0
    };

    setEditorState(prev => ({
      ...prev,
      ubicaciones: [...prev.ubicaciones, nuevaUbicacion],
      hasUnsavedChanges: true
    }));
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

    // Validar que haya exactamente 1 salida
    const salidas = editorState.ubicaciones.filter(u => {
      const objeto = editorState.objetosDisponibles.find(o => o.id_objeto === u.id_objeto);
      return objeto?.tipo === 'salida';
    });

    if (salidas.length !== 1) {
      toast({
        title: 'Error de validación',
        description: 'Debe haber exactamente 1 salida en el mapa',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      await MapaService.guardarLayoutCompleto(
        editorState.mapa.id_mapa,
        editorState.ubicaciones
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
      // TODO: Implementar endpoint en el backend para crear muebles
      const nuevoObjeto: ObjetoMapa = {
        id_objeto: Date.now(), // ID temporal
        tipo: objeto.tipo,
        nombre: objeto.nombre,
        filas: objeto.filas,
        columnas: objeto.columnas,
        ancho: objeto.ancho,
        alto: objeto.alto,
        es_caminable: objeto.es_caminable
      };

      setEditorState(prev => ({
        ...prev,
        objetosDisponibles: [...prev.objetosDisponibles, nuevoObjeto]
      }));

      toast({
        title: 'Mueble creado',
        description: `El mueble "${objeto.nombre}" se ha agregado a la paleta`
      });
    } catch (err) {
      throw new Error('Error al crear el mueble');
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-blue-600" />
              Editor de Mapas
            </h1>
            <p className="text-slate-600 mt-1">
              Diseña el layout del supermercado arrastrando objetos al canvas
            </p>
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
          </div>
        </div>

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
                    {editorState.mapa ? `${editorState.mapa.filas}×${editorState.mapa.columnas}` : '—'}
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
        <div className="grid grid-cols-[1fr_350px] gap-6">
          {/* Canvas */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Canvas del Mapa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {editorState.mapa ? (
                <MapCanvas
                  mapa={editorState.mapa}
                  ubicaciones={editorState.ubicaciones || []}
                  onCellClick={handleCellClick}
                  onObjectPlace={handleObjectPlace}
                  draggedObject={editorState.draggedObject || null}
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

          {/* Paleta de Objetos */}
          <ObjectPalette
            objetos={editorState.objetosDisponibles || []}
            onObjectSelect={handleObjectSelect}
            onCreateFurniture={() => setShowCreateModal(true)}
            selectedObjectId={editorState.selectedObjectId || null}
          />
        </div>

        {/* Modal para crear mueble */}
        <CreateFurnitureModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFurniture}
        />

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
      </div>
    </AdminLayout>
  );
};

export default MapPage;
