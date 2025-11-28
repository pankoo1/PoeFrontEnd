import React, { useEffect, useState } from 'react';
import { ApiService, CotizacionListItem, CotizacionResponse, CotizacionStats, CotizacionUpdate } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp, RefreshCw } from 'lucide-react';
import BackofficeLayout from '../components/BackofficeLayout';

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
      console.error('Error al cargar cotizaciones:', error);
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
      console.error('Error al cargar detalle:', error);
    }
  };

  const abrirEdicion = (cotizacion: CotizacionResponse) => {
    setEditData({
      nombre_contacto: cotizacion.nombre_contacto,
      email_contacto: cotizacion.email_contacto,
      telefono_contacto: cotizacion.telefono_contacto,
      empresa_solicitante: cotizacion.empresa_solicitante,
      plan_id: cotizacion.plan_id,
      cantidad_usuarios: cotizacion.cantidad_usuarios,
      cantidad_tareas: cotizacion.cantidad_tareas,
      cantidad_proyectos: cotizacion.cantidad_proyectos,
      precio_mensual: cotizacion.precio_mensual,
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
      console.error('Error al actualizar cotización:', error);
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
      console.error('Error al cambiar estado:', error);
    }
  };

  const convertir = async () => {
    if (!selectedCotizacion) return;
    try {
      const resultado = await ApiService.convertirCotizacion(selectedCotizacion.id_cotizacion);
      alert(`✅ Cotización convertida exitosamente:\n\nEmpresa ID: ${resultado.id_empresa}\nPlan ID: ${resultado.id_plan}\n\n${resultado.mensaje}`);
      setShowConvertirModal(false);
      setShowDetailModal(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al convertir cotización:', error);
      alert('❌ Error al convertir cotización. Verifique que tenga estado "aprobada"');
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
      (c.empresa_solicitante?.toLowerCase() || '').includes(textoBusqueda) ||
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
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Precio</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map((cotizacion) => (
                  <tr key={cotizacion.id_cotizacion} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{cotizacion.id_cotizacion}</td>
                    <td className="p-2 font-medium">{cotizacion.empresa_solicitante}</td>
                    <td className="p-2">{cotizacion.nombre_contacto}</td>
                    <td className="p-2 text-sm text-muted-foreground">{cotizacion.email_contacto}</td>
                    <td className="p-2">
                      <Badge variant="outline">{cotizacion.plan_nombre}</Badge>
                    </td>
                    <td className="p-2 font-semibold">
                      ${cotizacion.precio_mensual ? cotizacion.precio_mensual.toFixed(2) : '0.00'}
                    </td>
                    <td className="p-2">{getEstadoBadge(cotizacion.estado)}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(cotizacion.fecha_solicitud).toLocaleDateString()}
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
                  <p className="font-medium">{selectedCotizacion.empresa_solicitante}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nombre de contacto</Label>
                  <p className="font-medium">{selectedCotizacion.nombre_contacto}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCotizacion.email_contacto}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <p className="font-medium">{selectedCotizacion.telefono_contacto || 'N/A'}</p>
                </div>
              </div>

              {/* Recursos solicitados */}
              <div>
                <Label className="text-muted-foreground">Recursos solicitados</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-3 bg-muted rounded">
                    <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Usuarios</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_usuarios}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <FileText className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Tareas</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_tareas}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <FileText className="h-4 w-4 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Proyectos</p>
                    <p className="text-lg font-bold">{selectedCotizacion.cantidad_proyectos}</p>
                  </div>
                </div>
              </div>

              {/* Plan y precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Plan seleccionado</Label>
                  <p className="font-medium">{selectedCotizacion.plan_nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Precio mensual</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedCotizacion.precio_mensual?.toFixed(2) || '0.00'}
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
                  <p>{new Date(selectedCotizacion.fecha_solicitud).toLocaleString()}</p>
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
              <Button onClick={() => setShowConvertirModal(true)} className="bg-green-600">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Empresa solicitante</Label>
                <Input
                  value={editData.empresa_solicitante || ''}
                  onChange={(e) => setEditData({ ...editData, empresa_solicitante: e.target.value })}
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
                  value={editData.email_contacto || ''}
                  onChange={(e) => setEditData({ ...editData, email_contacto: e.target.value })}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={editData.telefono_contacto || ''}
                  onChange={(e) => setEditData({ ...editData, telefono_contacto: e.target.value })}
                />
              </div>
              <div>
                <Label>Cantidad de usuarios</Label>
                <Input
                  type="number"
                  value={editData.cantidad_usuarios || ''}
                  onChange={(e) => setEditData({ ...editData, cantidad_usuarios: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Precio mensual</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.precio_mensual || ''}
                  onChange={(e) => setEditData({ ...editData, precio_mensual: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Notas internas</Label>
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

      {/* Modal de confirmación de conversión */}
      <Dialog open={showConvertirModal} onOpenChange={setShowConvertirModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convertir cotización en empresa</DialogTitle>
            <DialogDescription>
              Esta acción creará una nueva empresa con el plan seleccionado y marcará la cotización como convertida.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm">
              ⚠️ Esta acción no se puede deshacer. Se creará:
            </p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Una nueva empresa con los datos de la cotización</li>
              <li>Un plan activo con los recursos especificados</li>
              <li>La cotización se marcará como "convertida"</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertirModal(false)}>
              Cancelar
            </Button>
            <Button onClick={convertir} className="bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar conversión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </BackofficeLayout>
  );
};

export default BackofficeCotizaciones;
