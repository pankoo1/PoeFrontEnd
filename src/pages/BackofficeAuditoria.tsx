import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search,
  Filter,
  RefreshCw,
  FileText,
  User,
  Building2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type LogAuditoria, type EstadisticasAuditoria } from '@/services/api';
import BackofficeLayout from '@/components/BackofficeLayout';

const BackofficeAuditoria = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAuditoria | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Filtros
  const [entidadFiltro, setEntidadFiltro] = useState<string>('');
  const [accionFiltro, setAccionFiltro] = useState<string>('all');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Paginación
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);

  // Cargar logs de auditoría
  const cargarLogs = async () => {
    try {
      setIsLoadingLogs(true);
      console.log('[BackofficeAuditoria] Cargando logs...');
      const datos = await ApiService.getBackofficeAuditoriaLogs(
        undefined, // usuario_id
        undefined, // empresa_id
        entidadFiltro || undefined,
        accionFiltro === 'all' ? undefined : accionFiltro,
        fechaDesde || undefined,
        fechaHasta || undefined,
        skip,
        limit
      );
      console.log('[BackofficeAuditoria] Logs cargados:', datos.length);
      setLogs(datos);
    } catch (error) {
      console.error('[BackofficeAuditoria] Error al cargar logs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los logs de auditoría.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Cargar estadísticas de auditoría
  const cargarEstadisticas = async () => {
    try {
      setIsLoadingStats(true);
      console.log('[BackofficeAuditoria] Cargando estadísticas...');
      const datos = await ApiService.getBackofficeEstadisticasAuditoria();
      console.log('[BackofficeAuditoria] Estadísticas cargadas:', datos);
      setEstadisticas(datos);
    } catch (error) {
      console.error('[BackofficeAuditoria] Error al cargar estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de auditoría.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Cargar al montar y cuando cambien los filtros
  useEffect(() => {
    cargarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidadFiltro, accionFiltro, fechaDesde, fechaHasta, skip]);

  useEffect(() => {
    cargarEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener badge de acción
  const getAccionBadge = (accion: string) => {
    const acciones: Record<string, { className: string }> = {
      'crear': { className: 'bg-green-100 text-green-700' },
      'actualizar': { className: 'bg-blue-100 text-blue-700' },
      'eliminar': { className: 'bg-red-100 text-red-700' },
      'suspender': { className: 'bg-orange-100 text-orange-700' },
      'reactivar': { className: 'bg-green-100 text-green-700' },
    };

    const accionInfo = acciones[accion.toLowerCase()] || { className: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accionInfo.className}`}>
        {accion}
      </span>
    );
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setEntidadFiltro('');
    setAccionFiltro('all');
    setFechaDesde('');
    setFechaHasta('');
    setBusqueda('');
    setSkip(0);
  };

  return (
    <BackofficeLayout>
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-600" />
            Auditoría del Sistema
          </h1>
          <p className="text-sm text-gray-500">Registro de acciones y cambios</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={cargarLogs} disabled={isLoadingLogs}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="space-y-6">
          {/* Estadísticas */}
          {estadisticas && !isLoadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{estadisticas.total_logs}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Últimas 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{estadisticas.logs_ultimas_24h}</div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Usuarios Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">
                    {estadisticas.usuarios_mas_activos.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Acciones Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {Object.keys(estadisticas.acciones_por_tipo).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Acciones y Entidades más frecuentes */}
          {estadisticas && !isLoadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acciones más frecuentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Más Frecuentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(estadisticas.acciones_por_tipo)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([accion, cantidad]) => (
                        <div key={accion} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700 capitalize">{accion}</span>
                          <span className="text-sm font-bold text-gray-900">{cantidad}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Entidades más modificadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entidades Más Modificadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estadisticas.entidades_mas_modificadas
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.entidad} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.entidad}</span>
                          <span className="text-sm font-bold text-gray-900">{item.total_modificaciones}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Entidad</label>
                  <Input
                    placeholder="Ej: empresa, usuario..."
                    value={entidadFiltro}
                    onChange={(e) => setEntidadFiltro(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Acción</label>
                  <Select value={accionFiltro} onValueChange={setAccionFiltro}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las acciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="crear">Crear</SelectItem>
                      <SelectItem value="actualizar">Actualizar</SelectItem>
                      <SelectItem value="eliminar">Eliminar</SelectItem>
                      <SelectItem value="suspender">Suspender</SelectItem>
                      <SelectItem value="reactivar">Reactivar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Desde</label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Hasta</label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría ({logs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando logs de auditoría...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron logs con los filtros aplicados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Entidad</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>ID Entidad</TableHead>
                        <TableHead>Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id_log}>
                          <TableCell className="text-sm">
                            {formatearFecha(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div className="text-sm">
                                <div className="font-medium">{log.usuario_nombre || 'N/A'}</div>
                                {log.usuario_rol && (
                                  <div className="text-xs text-gray-500">{log.usuario_rol}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{log.empresa_nombre || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium capitalize">{log.entidad}</span>
                          </TableCell>
                          <TableCell>
                            {getAccionBadge(log.accion)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            #{log.id_entidad}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                            {log.descripcion || 'Sin descripción'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Paginación simple */}
              {!isLoadingLogs && logs.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setSkip(Math.max(0, skip - limit))}
                    disabled={skip === 0}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Mostrando {skip + 1} - {skip + logs.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setSkip(skip + limit)}
                    disabled={logs.length < limit}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </BackofficeLayout>
  );
};

export default BackofficeAuditoria;
