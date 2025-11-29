import React, { useEffect, useState } from 'react';
import { ApiService, FacturaListItem, FacturaResponse, FacturaStats, FacturaCreate, FacturaUpdate, FacturaRegistrarPago } from '@/services/api';
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
import { FileText, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, Calendar, Receipt, RefreshCw } from 'lucide-react';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const BackofficeFacturas: React.FC = () => {
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [stats, setStats] = useState<FacturaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  // Modal de detalle
  const [selectedFactura, setSelectedFactura] = useState<FacturaResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Modal de creación manual
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [crearData, setCrearData] = useState<FacturaCreate>({
    id_empresa: 0,
    concepto: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    items: [],
    notas: '',
  });

  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<FacturaUpdate>({});

  // Modal de registro de pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoData, setPagoData] = useState<FacturaRegistrarPago>({
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: '',
    referencia_pago: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [facturasData, statsData] = await Promise.all([
        ApiService.listarFacturas(0, 100, filtroEstado === 'todos' ? undefined : filtroEstado || undefined),
        ApiService.getFacturasStats(),
      ]);
      setFacturas(facturasData);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (idFactura: number) => {
    try {
      const detalle = await ApiService.getFactura(idFactura);
      setSelectedFactura(detalle);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const abrirEdicion = (factura: FacturaResponse) => {
    setEditData({
      concepto: factura.concepto,
      fecha_vencimiento: factura.fecha_vencimiento,
      notas: factura.notas,
    });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    if (!selectedFactura) return;
    try {
      await ApiService.actualizarFactura(selectedFactura.id_factura, editData);
      setShowEditModal(false);
      await cargarDatos();
      const actualizada = await ApiService.getFactura(selectedFactura.id_factura);
      setSelectedFactura(actualizada);
    } catch (error) {
      console.error('Error al actualizar factura:', error);
    }
  };

  const registrarPago = async () => {
    if (!selectedFactura) return;
    try {
      await ApiService.registrarPagoFactura(selectedFactura.id_factura, pagoData);
      alert('✅ Pago registrado exitosamente');
      setShowPagoModal(false);
      setPagoData({
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: '',
        referencia_pago: '',
      });
      await cargarDatos();
      const actualizada = await ApiService.getFactura(selectedFactura.id_factura);
      setSelectedFactura(actualizada);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('❌ Error al registrar pago');
    }
  };

  const marcarVencida = async (idFactura: number) => {
    if (!confirm('¿Marcar esta factura como vencida?')) return;
    try {
      await ApiService.marcarFacturaVencida(idFactura);
      alert('✅ Factura marcada como vencida');
      await cargarDatos();
      if (selectedFactura && selectedFactura.id_factura === idFactura) {
        const actualizada = await ApiService.getFactura(idFactura);
        setSelectedFactura(actualizada);
      }
    } catch (error) {
      console.error('Error al marcar como vencida:', error);
    }
  };

  const anular = async (idFactura: number) => {
    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;
    try {
      await ApiService.anularFactura(idFactura, motivo);
      alert('✅ Factura anulada exitosamente');
      setShowDetailModal(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al anular factura:', error);
    }
  };

  const crearFactura = async () => {
    try {
      if (crearData.items.length === 0) {
        alert('⚠️ Debe agregar al menos un ítem a la factura');
        return;
      }
      await ApiService.crearFactura(crearData);
      alert('✅ Factura creada exitosamente');
      setShowCrearModal(false);
      setCrearData({
        id_empresa: 0,
        concepto: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        items: [],
        notas: '',
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear factura:', error);
      alert('❌ Error al crear factura');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pendiente: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      pagada: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      vencida: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
      anulada: { variant: 'outline', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const config = variants[estado] || variants.pendiente;

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {estado.toUpperCase()}
      </Badge>
    );
  };

  const facturasFiltradas = facturas.filter((f) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      (f.nombre_empresa?.toLowerCase() || '').includes(textoBusqueda) ||
      (f.concepto?.toLowerCase() || '').includes(textoBusqueda) ||
      (f.periodo_facturado?.toLowerCase() || '').includes(textoBusqueda) ||
      f.numero_factura.toLowerCase().includes(textoBusqueda)
    );
  });

  if (loading) {
    return (
      <BackofficeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando facturas...</div>
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
            <Receipt className="h-6 w-6 text-blue-600" />
            Gestión de Facturación
          </h1>
          <p className="text-sm text-gray-500">Administración de facturación del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowCrearModal(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Crear factura manual
          </Button>
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
              <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_facturas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendientes || stats.facturas_pendientes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.monto_pendiente?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.vencidas || stats.facturas_vencidas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.monto_vencido?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos (mes)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.ingresos_mes?.toFixed(2) || '0.00'}
              </div>
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
                placeholder="Buscar por empresa, concepto o número..."
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
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas ({facturasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Número</th>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-left p-2">Concepto</th>
                  <th className="text-left p-2">Monto</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Emisión</th>
                  <th className="text-left p-2">Vencimiento</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.map((factura) => (
                  <tr key={factura.id_factura} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{factura.numero_factura}</td>
                    <td className="p-2 font-medium">{factura.nombre_empresa || 'N/A'}</td>
                    <td className="p-2">{factura.concepto || factura.periodo_facturado || 'N/A'}</td>
                    <td className="p-2 font-bold text-lg">
                      ${(factura.monto_total || factura.total)?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-2">{getEstadoBadge(factura.estado)}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(factura.fecha_emision).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(factura.fecha_vencimiento).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDetalle(factura.id_factura)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {facturasFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron facturas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factura {selectedFactura?.numero_factura}</DialogTitle>
            <DialogDescription>
              Información completa de la factura
            </DialogDescription>
          </DialogHeader>

          {selectedFactura && (
            <div className="space-y-4">
              {/* Estado y acciones principales */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Estado actual</p>
                  <div className="mt-1">{getEstadoBadge(selectedFactura.estado)}</div>
                </div>
                <div className="flex gap-2">
                  {selectedFactura.estado === 'pendiente' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPagoModal(true)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Registrar pago
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => marcarVencida(selectedFactura.id_factura)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Marcar vencida
                      </Button>
                    </>
                  )}
                  {selectedFactura.estado !== 'anulada' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => anular(selectedFactura.id_factura)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Anular
                    </Button>
                  )}
                </div>
              </div>

              {/* Información de la empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{selectedFactura.nombre_empresa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Número de factura</Label>
                  <p className="font-mono font-medium">{selectedFactura.numero_factura}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha de emisión</Label>
                  <p>{new Date(selectedFactura.fecha_emision).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de vencimiento</Label>
                  <p>{new Date(selectedFactura.fecha_vencimiento).toLocaleDateString()}</p>
                </div>
                {selectedFactura.fecha_pago && (
                  <div>
                    <Label className="text-muted-foreground">Fecha de pago</Label>
                    <p className="text-green-600 font-medium">
                      {new Date(selectedFactura.fecha_pago).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Concepto */}
              <div>
                <Label className="text-muted-foreground">Concepto</Label>
                <p className="font-medium">{selectedFactura.concepto}</p>
              </div>

              {/* Items de la factura */}
              <div>
                <Label className="text-muted-foreground">Items facturados</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Descripción</th>
                        <th className="text-right p-2">Cantidad</th>
                        <th className="text-right p-2">Precio Unit.</th>
                        <th className="text-right p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFactura.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{item.descripcion}</td>
                          <td className="text-right p-2">{item.cantidad}</td>
                          <td className="text-right p-2">${item.precio_unitario.toFixed(2)}</td>
                          <td className="text-right p-2 font-medium">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${selectedFactura.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {selectedFactura.impuestos && selectedFactura.impuestos > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impuestos:</span>
                    <span className="font-medium">${selectedFactura.impuestos.toFixed(2)}</span>
                  </div>
                )}
                {selectedFactura.descuentos && selectedFactura.descuentos > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuentos:</span>
                    <span className="font-medium">-${selectedFactura.descuentos.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedFactura.monto_total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Información de pago */}
              {selectedFactura.estado === 'pagada' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">✅ Factura pagada</p>
                  {selectedFactura.metodo_pago && (
                    <p className="text-sm mt-1">Método: {selectedFactura.metodo_pago}</p>
                  )}
                  {selectedFactura.referencia_pago && (
                    <p className="text-sm">Referencia: {selectedFactura.referencia_pago}</p>
                  )}
                </div>
              )}

              {/* Notas */}
              {selectedFactura.notas && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">
                    {selectedFactura.notas}
                  </p>
                </div>
              )}

              {/* Motivo anulación */}
              {selectedFactura.motivo_anulacion && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">❌ Factura anulada</p>
                  <p className="text-sm mt-1">{selectedFactura.motivo_anulacion}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedFactura) abrirEdicion(selectedFactura);
              }}
            >
              Editar factura
            </Button>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Factura</DialogTitle>
            <DialogDescription>
              Modifica la información de la factura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Concepto</Label>
              <Input
                value={editData.concepto || ''}
                onChange={(e) => setEditData({ ...editData, concepto: e.target.value })}
              />
            </div>
            <div>
              <Label>Fecha de vencimiento</Label>
              <Input
                type="date"
                value={editData.fecha_vencimiento || ''}
                onChange={(e) => setEditData({ ...editData, fecha_vencimiento: e.target.value })}
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={editData.notas || ''}
                onChange={(e) => setEditData({ ...editData, notas: e.target.value })}
                rows={3}
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

      {/* Modal de registro de pago */}
      <Dialog open={showPagoModal} onOpenChange={setShowPagoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              Registra el pago recibido para esta factura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fecha de pago</Label>
              <Input
                type="date"
                value={pagoData.fecha_pago}
                onChange={(e) => setPagoData({ ...pagoData, fecha_pago: e.target.value })}
              />
            </div>
            <div>
              <Label>Método de pago</Label>
              <Select
                value={pagoData.metodo_pago}
                onValueChange={(value) => setPagoData({ ...pagoData, metodo_pago: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta de crédito</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referencia de pago (opcional)</Label>
              <Input
                placeholder="Número de transacción, cheque, etc."
                value={pagoData.referencia_pago || ''}
                onChange={(e) => setPagoData({ ...pagoData, referencia_pago: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={registrarPago} disabled={!pagoData.metodo_pago}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de creación manual */}
      <Dialog open={showCrearModal} onOpenChange={setShowCrearModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Factura Manual</DialogTitle>
            <DialogDescription>
              Crea una factura personalizada para una empresa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>ID Empresa</Label>
              <Input
                type="number"
                value={crearData.id_empresa}
                onChange={(e) => setCrearData({ ...crearData, id_empresa: parseInt(e.target.value) })}
                placeholder="ID de la empresa"
              />
            </div>
            <div>
              <Label>Concepto</Label>
              <Input
                value={crearData.concepto}
                onChange={(e) => setCrearData({ ...crearData, concepto: e.target.value })}
                placeholder="Ej: Suscripción mensual"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de emisión</Label>
                <Input
                  type="date"
                  value={crearData.fecha_emision}
                  onChange={(e) => setCrearData({ ...crearData, fecha_emision: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={crearData.fecha_vencimiento}
                  onChange={(e) => setCrearData({ ...crearData, fecha_vencimiento: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={crearData.notas || ''}
                onChange={(e) => setCrearData({ ...crearData, notas: e.target.value })}
                rows={3}
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm">
                ℹ️ Después de crear la factura, deberás agregarle items desde el detalle de la factura.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCrearModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={crearFactura}
              disabled={!crearData.id_empresa || !crearData.concepto || !crearData.fecha_vencimiento}
            >
              Crear factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </BackofficeLayout>
  );
};

export default BackofficeFacturas;
