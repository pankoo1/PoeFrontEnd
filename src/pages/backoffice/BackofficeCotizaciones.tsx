import React, { useEffect, useState } from 'react';
import { ApiService, CotizacionListItem, CotizacionResponse, CotizacionStats, CotizacionUpdate } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp, RefreshCw } from 'lucide-react';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const BackofficeCotizaciones: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<CotizacionListItem[]>([]);
  const [stats, setStats] = useState<CotizacionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  // Modal de detalle
  const [selectedCotizacion, setSelectedCotizacion] = useState<CotizacionResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<CotizacionUpdate>({});

  // Modal de cambio de estado
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');

  // Modal de conversión
  const [showConvertirModal, setShowConvertirModal] = useState(false);
  const [convertirData, setConvertirData] = useState({
    nombre_empresa: '',
    rut_empresa: '',
    direccion: '',
    ciudad: '',
    region: '',
    admin_nombre: '',
    admin_correo: '',
    admin_contraseña: '',
    cantidad_supervisores: 0,
    cantidad_reponedores: 0,
    precio_mensual: 0,
    features: {} as any
  });

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cotizacionesData, statsData] = await Promise.all([
        ApiService.listarCotizaciones(filtroEstado === 'todos' ? undefined : filtroEstado || undefined),
        ApiService.getCotizacionesEstadisticas(),
      ]);
      setCotizaciones(cotizacionesData);
      setStats(statsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (idCotizacion: number) => {
    try {
      const detalle = await ApiService.getCotizacion(idCotizacion);
      setSelectedCotizacion(detalle);
      setShowDetailModal(true);
    } catch (error) {
    }
  };

  const abrirEdicion = (cotizacion: CotizacionResponse) => {
    setEditData({
      nombre_contacto: cotizacion.nombre_contacto,
      email: cotizacion.email,
      telefono: cotizacion.telefono,
      empresa: cotizacion.empresa,
      cargo: cotizacion.cargo,
      cantidad_supervisores: cotizacion.cantidad_supervisores,
      cantidad_reponedores: cotizacion.cantidad_reponedores,
      cantidad_productos: cotizacion.cantidad_productos,
      integraciones_requeridas: cotizacion.integraciones_requeridas,
      comentarios: cotizacion.comentarios,
      precio_sugerido: cotizacion.precio_sugerido,
      precio_final: cotizacion.precio_final,
      notas_internas: cotizacion.notas_internas,
    });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    if (!selectedCotizacion) return;
    try {
      await ApiService.actualizarCotizacion(selectedCotizacion.id_cotizacion, editData);
      setShowEditModal(false);
      await cargarDatos();
      if (selectedCotizacion) {
        const actualizada = await ApiService.getCotizacion(selectedCotizacion.id_cotizacion);
        setSelectedCotizacion(actualizada);
      }
    } catch (error) {
    }
  };

  const cambiarEstado = async () => {
    if (!selectedCotizacion || !nuevoEstado) return;
    try {
      await ApiService.cambiarEstadoCotizacion(selectedCotizacion.id_cotizacion, nuevoEstado);
      setShowEstadoModal(false);
      setNuevoEstado('');
      await cargarDatos();
      const actualizada = await ApiService.getCotizacion(selectedCotizacion.id_cotizacion);
      setSelectedCotizacion(actualizada);
    } catch (error) {
    }
  };

  const abrirModalConvertir = () => {
    if (!selectedCotizacion) return;
    // Pre-llenar con datos de la cotización
    setConvertirData({
      nombre_empresa: selectedCotizacion.empresa || '',
      rut_empresa: '',
      direccion: '',
      ciudad: '',
      region: '',
      admin_nombre: selectedCotizacion.nombre_contacto || '',
      admin_correo: selectedCotizacion.email || '',
      admin_contraseña: '',
      cantidad_supervisores: selectedCotizacion.cantidad_supervisores || 0,
      cantidad_reponedores: selectedCotizacion.cantidad_reponedores || 0,
      precio_mensual: selectedCotizacion.precio_final || selectedCotizacion.precio_sugerido || 0,
      features: selectedCotizacion.features_sugeridos || {}
    });
    setShowConvertirModal(true);
  };

  const convertir = async () => {
    if (!selectedCotizacion) return;
    
    // Validar campos requeridos
    if (!convertirData.nombre_empresa || !convertirData.rut_empresa || !convertirData.admin_nombre || 
        !convertirData.admin_correo || !convertirData.admin_contraseña) {
      alert('❌ Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const resultado = await ApiService.convertirCotizacion(selectedCotizacion.id_cotizacion, convertirData);
      alert(`✅ Cotización convertida exitosamente:\n\nEmpresa ID: ${resultado.id_empresa}\nPlan ID: ${resultado.id_plan}\n\n${resultado.mensaje}`);
      setShowConvertirModal(false);
      setShowDetailModal(false);
      await cargarDatos();
    } catch (error) {
      alert('❌ Error al convertir cotización. Verifique los datos ingresados.');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pendiente: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      en_revision: { variant: 'outline', icon: <FileText className="h-3 w-3 mr-1" /> },
      aprobada: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rechazada: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
      convertida: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    };

    const config = variants[estado] || variants.pendiente;

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {estado.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      (c.empresa?.toLowerCase() || '').includes(textoBusqueda) ||
      c.email_contacto.toLowerCase().includes(textoBusqueda) ||
      c.nombre_contacto.toLowerCase().includes(textoBusqueda)
    );
  });

  if (loading) {
    return (
      <BackofficeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando cotizaciones...</div>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            Gestión de Cotizaciones
          </h1>
          <p className="text-sm text-gray-500">Administración de solicitudes de cotización</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_cotizaciones}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aprobadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasa_conversion.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por empresa, email o contacto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_revision">En revisión</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones ({cotizacionesFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-left p-2">Contacto</th>
                  <th className="text-left p-2">Recursos</th>
                  <th className="text-left p-2">Precio Sugerido</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map((cotizacion) => (
                  <tr key={cotizacion.id_cotizacion} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{cotizacion.id_cotizacion}</td>
                    <td className="p-2 font-medium">{cotizacion.empresa}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">{cotizacion.nombre_contacto}</div>
                        <div className="text-muted-foreground text-xs">{cotizacion.email}</div>
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{cotizacion.cantidad_supervisores} Sup.</Badge>
                        <Badge variant="secondary">{cotizacion.cantidad_reponedores} Rep.</Badge>
                      </div>
                    </td>
                    <td className="p-2 font-semibold">
                      ${cotizacion.precio_sugerido ? cotizacion.precio_sugerido.toLocaleString() : cotizacion.precio_final ? cotizacion.precio_final.toLocaleString() : '0'}
                    </td>
                    <td className="p-2">{getEstadoBadge(cotizacion.estado)}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(cotizacion.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDetalle(cotizacion.id_cotizacion)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cotizacionesFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron cotizaciones
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización #{selectedCotizacion?.id_cotizacion}</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de cotización
            </DialogDescription>
          </DialogHeader>

          {selectedCotizacion && (
            <div className="space-y-4">
              {/* Estado actual */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Estado actual</p>
                  <div className="mt-1">{getEstadoBadge(selectedCotizacion.estado)}</div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowEstadoModal(true)}
                  disabled={selectedCotizacion.estado === 'convertida'}
                >
                  Cambiar estado
                </Button>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa solicitante</Label>
                  <p className="font-medium">{selectedCotizacion.empresa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nombre de contacto</Label>
                  <p className="font-medium">{selectedCotizacion.nombre_contacto}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCotizacion.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <p className="font-medium">{selectedCotizacion.telefono || 'N/A'}</p>
                </div>
              </div>

              {/* Recursos solicitados */}
              <div>
                <Label className="text-muted-foreground">Recursos solicitados</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-3 bg-muted rounded">
                    <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Supervisores</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_supervisores}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Reponedores</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_reponedores}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <FileText className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Productos</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_productos ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Plan y precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Precio sugerido</Label>
                  <p className="font-medium">${selectedCotizacion.precio_sugerido?.toFixed(2) ?? 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Precio final</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedCotizacion.precio_final?.toFixed(2) ?? 'N/A'}
                  </p>
                </div>
              </div>

              {/* Mensaje del cliente */}
              {selectedCotizacion.mensaje && (
                <div>
                  <Label className="text-muted-foreground">Mensaje del cliente</Label>
                  <p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">
                    {selectedCotizacion.mensaje}
                  </p>
                </div>
              )}

              {/* Notas internas */}
              {selectedCotizacion.notas_internas && (
                <div>
                  <Label className="text-muted-foreground">Notas internas</Label>
                  <p className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded whitespace-pre-wrap">
                    {selectedCotizacion.notas_internas}
                  </p>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Fecha de solicitud</Label>
                  <p>{new Date(selectedCotizacion.fecha_creacion).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última actualización</Label>
                  <p>{new Date(selectedCotizacion.fecha_actualizacion).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedCotizacion) abrirEdicion(selectedCotizacion);
              }}
            >
              Editar cotización
            </Button>
            {selectedCotizacion?.estado === 'aprobada' && (
              <Button onClick={abrirModalConvertir} className="bg-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Convertir en empresa
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cotización</DialogTitle>
            <DialogDescription>
              Modifica los datos de la cotización
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información de contacto */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Información de Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Empresa solicitante</Label>
                  <Input
                    value={editData.empresa || ''}
                    onChange={(e) => setEditData({ ...editData, empresa: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nombre de contacto</Label>
                  <Input
                    value={editData.nombre_contacto || ''}
                    onChange={(e) => setEditData({ ...editData, nombre_contacto: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={editData.telefono || ''}
                    onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input
                    value={editData.cargo || ''}
                    onChange={(e) => setEditData({ ...editData, cargo: e.target.value })}
                    placeholder="Ej: Gerente de Operaciones"
                  />
                </div>
              </div>
            </div>

            {/* Recursos solicitados (influyen en el precio) */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Recursos Solicitados</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Cantidad de supervisores</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editData.cantidad_supervisores || ''}
                    onChange={(e) => setEditData({ ...editData, cantidad_supervisores: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>Cantidad de reponedores</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editData.cantidad_reponedores || ''}
                    onChange={(e) => setEditData({ ...editData, cantidad_reponedores: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>Cantidad de productos</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editData.cantidad_productos || ''}
                    onChange={(e) => setEditData({ ...editData, cantidad_productos: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Requerimientos adicionales */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Requerimientos Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <Label>Integraciones requeridas</Label>
                  <Input
                    value={editData.integraciones_requeridas || ''}
                    onChange={(e) => setEditData({ ...editData, integraciones_requeridas: e.target.value })}
                    placeholder="Ej: SAP, API personalizada, etc."
                  />
                </div>
                <div>
                  <Label>Comentarios del cliente</Label>
                  <Textarea
                    value={editData.comentarios || ''}
                    onChange={(e) => setEditData({ ...editData, comentarios: e.target.value })}
                    rows={3}
                    placeholder="Comentarios y requerimientos especiales del cliente"
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Precios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Precio sugerido ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.precio_sugerido || ''}
                    onChange={(e) => setEditData({ ...editData, precio_sugerido: parseFloat(e.target.value) || undefined })}
                    placeholder="Precio sugerido automático"
                  />
                </div>
                <div>
                  <Label>Precio final ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.precio_final || ''}
                    onChange={(e) => setEditData({ ...editData, precio_final: parseFloat(e.target.value) || undefined })}
                    placeholder="Precio final acordado"
                  />
                </div>
              </div>
            </div>

            {/* Notas internas */}
            <div>
              <Label>Notas internas (solo SuperAdmin)</Label>
              <Textarea
                value={editData.notas_internas || ''}
                onChange={(e) => setEditData({ ...editData, notas_internas: e.target.value })}
                rows={4}
                placeholder="Notas visibles solo para SuperAdmin..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de cambio de estado */}
      <Dialog open={showEstadoModal} onOpenChange={setShowEstadoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado de cotización</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para esta cotización
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_revision">En revisión</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstadoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={cambiarEstado} disabled={!nuevoEstado}>
              Cambiar estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de conversión con formulario */}
      <Dialog open={showConvertirModal} onOpenChange={setShowConvertirModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convertir cotización en empresa</DialogTitle>
            <DialogDescription>
              Complete los datos necesarios para crear la empresa y el plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Datos de la empresa */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Datos de la Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la empresa *</Label>
                  <Input
                    value={convertirData.nombre_empresa}
                    onChange={(e) => setConvertirData({ ...convertirData, nombre_empresa: e.target.value })}
                    placeholder="Ej: Empresa SpA"
                  />
                </div>
                <div>
                  <Label>RUT de la empresa *</Label>
                  <Input
                    value={convertirData.rut_empresa}
                    onChange={(e) => setConvertirData({ ...convertirData, rut_empresa: e.target.value })}
                    placeholder="Ej: 12345678-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Dirección (opcional)</Label>
                  <Input
                    value={convertirData.direccion}
                    onChange={(e) => setConvertirData({ ...convertirData, direccion: e.target.value })}
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ciudad (opcional)</Label>
                  <Input
                    value={convertirData.ciudad}
                    onChange={(e) => setConvertirData({ ...convertirData, ciudad: e.target.value })}
                    placeholder="Ej: Santiago"
                  />
                </div>
                <div>
                  <Label>Región (opcional)</Label>
                  <Input
                    value={convertirData.region}
                    onChange={(e) => setConvertirData({ ...convertirData, region: e.target.value })}
                    placeholder="Ej: Metropolitana"
                  />
                </div>
              </div>
            </div>

            {/* Datos del administrador */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Datos del Administrador</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del administrador *</Label>
                  <Input
                    value={convertirData.admin_nombre}
                    onChange={(e) => setConvertirData({ ...convertirData, admin_nombre: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label>Correo del administrador *</Label>
                  <Input
                    type="email"
                    value={convertirData.admin_correo}
                    onChange={(e) => setConvertirData({ ...convertirData, admin_correo: e.target.value })}
                    placeholder="admin@empresa.com"
                  />
                </div>
              </div>
              <div>
                <Label>Contraseña inicial *</Label>
                <Input
                  type="password"
                  value={convertirData.admin_contraseña}
                  onChange={(e) => setConvertirData({ ...convertirData, admin_contraseña: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>

            {/* Recursos del plan (solo lectura - desde cotización) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Recursos del Plan (desde cotización)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Supervisores</Label>
                  <Input
                    type="number"
                    value={convertirData.cantidad_supervisores}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label>Reponedores</Label>
                  <Input
                    type="number"
                    value={convertirData.cantidad_reponedores}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label>Precio mensual ($)</Label>
                  <Input
                    type="number"
                    value={convertirData.precio_mensual}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ℹ️ Estos valores se toman de la cotización y no pueden modificarse. Para cambiarlos, edita la cotización primero.
              </p>
            </div>

            {/* Advertencia */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium">⚠️ Esta acción creará:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Una nueva empresa con los datos ingresados</li>
                <li>Un plan activo con los recursos especificados</li>
                <li>Un usuario administrador con acceso completo</li>
                <li>La cotización se marcará como "convertida"</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertirModal(false)}>
              Cancelar
            </Button>
            <Button onClick={convertir} className="bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar y crear empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </BackofficeLayout>
  );
};

export default BackofficeCotizaciones;
