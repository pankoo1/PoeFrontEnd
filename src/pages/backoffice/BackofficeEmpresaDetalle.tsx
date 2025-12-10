import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, 
  Users,
  CreditCard,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type ResumenEmpresa, type ConsumoRecursos, type LogAuditoria } from '@/services/api';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const BackofficeEmpresaDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resumen, setResumen] = useState<ResumenEmpresa | null>(null);
  const [consumo, setConsumo] = useState<ConsumoRecursos | null>(null);
  const [historial, setHistorial] = useState<LogAuditoria[]>([]);
  const [isLoadingResumen, setIsLoadingResumen] = useState(true);
  const [isLoadingConsumo, setIsLoadingConsumo] = useState(true);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(true);

  // Cargar resumen de la empresa
  const cargarResumen = async () => {
    if (!id) return;
    
    try {
      setIsLoadingResumen(true);
      const datos = await ApiService.getBackofficeResumenEmpresa(parseInt(id));
      setResumen(datos);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el resumen de la empresa.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResumen(false);
    }
  };

  // Cargar consumo de recursos
  const cargarConsumo = async () => {
    if (!id) return;
    
    try {
      setIsLoadingConsumo(true);
      const datos = await ApiService.getBackofficeConsumoEmpresa(parseInt(id));
      setConsumo(datos);
    } catch (error) {
      // No mostrar error si no tiene plan activo
      setConsumo(null);
    } finally {
      setIsLoadingConsumo(false);
    }
  };

  // Cargar historial de auditoría
  const cargarHistorial = async () => {
    if (!id) return;
    
    try {
      setIsLoadingHistorial(true);
      const datos = await ApiService.getBackofficeHistorialEntidad('empresa', parseInt(id), 20);
      setHistorial(datos);
    } catch (error) {
      setHistorial([]);
    } finally {
      setIsLoadingHistorial(false);
    }
  };

  useEffect(() => {
    cargarResumen();
    cargarConsumo();
    cargarHistorial();
  }, [id]);

  // Obtener color del porcentaje de uso
  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-red-600';
    if (porcentaje >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; className: string }> = {
      activo: { label: 'Activo', className: 'bg-green-100 text-green-700' },
      inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' },
      suspendido: { label: 'Suspendido', className: 'bg-red-100 text-red-700' },
      prueba: { label: 'Prueba', className: 'bg-yellow-100 text-yellow-700' },
    };

    const estadoInfo = estados[estado] || estados.inactivo;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.className}`}>
        {estadoInfo.label}
      </span>
    );
  };

  // Formatear fecha para historial
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
      'crear_empresa': { className: 'bg-green-100 text-green-700' },
      'actualizar': { className: 'bg-blue-100 text-blue-700' },
      'actualizar_empresa': { className: 'bg-blue-100 text-blue-700' },
      'eliminar': { className: 'bg-red-100 text-red-700' },
      'suspender': { className: 'bg-orange-100 text-orange-700' },
      'suspender_empresa': { className: 'bg-orange-100 text-orange-700' },
      'reactivar': { className: 'bg-green-100 text-green-700' },
      'reactivar_empresa': { className: 'bg-green-100 text-green-700' },
    };

    const accionInfo = acciones[accion.toLowerCase()] || { className: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${accionInfo.className}`}>
        {accion.replace('_', ' ')}
      </span>
    );
  };

  const isLoading = isLoadingResumen;

  return (
    <BackofficeLayout>
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            Detalle de Empresa
          </h1>
          {resumen && (
            <p className="text-sm text-gray-500">{resumen.nombre_empresa}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate('/backoffice/empresas')}>
          Volver a Empresas
        </Button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando información de la empresa...</p>
            </div>
          </div>
        ) : resumen ? (
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Información General</span>
                  {getEstadoBadge(resumen.estado)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre Empresa</label>
                      <p className="text-lg font-semibold text-gray-900">{resumen.nombre_empresa}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">RUT</label>
                      <p className="text-lg text-gray-900">{resumen.rut_empresa}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estado</label>
                      <p className="text-lg text-gray-900 capitalize">{resumen.estado}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan Activo</label>
                      <p className="text-lg text-gray-900">{resumen.plan_activo ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Actual */}
            {resumen.plan_activo && resumen.precio_mensual && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Plan Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Precio Mensual</label>
                      <p className="text-xl font-bold text-blue-900">
                        ${resumen.precio_mensual.toLocaleString('es-CL')}
                      </p>
                    </div>
                    {resumen.fecha_vencimiento && (
                      <div>
                        <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fecha Vencimiento
                        </label>
                        <p className="text-lg text-blue-900">
                          {new Date(resumen.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consumo de Recursos */}
            {consumo && (
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Consumo de Recursos vs Límites del Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supervisores */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Supervisores</span>
                        <span className={`text-sm font-bold ${getColorPorcentaje((consumo.supervisores_uso / consumo.supervisores_limite) * 100)}`}>
                          {((consumo.supervisores_uso / consumo.supervisores_limite) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (consumo.supervisores_uso / consumo.supervisores_limite) * 100 >= 90 ? 'bg-red-600' :
                            (consumo.supervisores_uso / consumo.supervisores_limite) * 100 >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((consumo.supervisores_uso / consumo.supervisores_limite) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {consumo.supervisores_uso} de {consumo.supervisores_limite} 
                        <span className="text-xs"> ({consumo.supervisores_disponibles} disponibles)</span>
                      </div>
                    </div>

                    {/* Reponedores */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Reponedores</span>
                        <span className={`text-sm font-bold ${getColorPorcentaje((consumo.reponedores_uso / consumo.reponedores_limite) * 100)}`}>
                          {((consumo.reponedores_uso / consumo.reponedores_limite) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (consumo.reponedores_uso / consumo.reponedores_limite) * 100 >= 90 ? 'bg-red-600' :
                            (consumo.reponedores_uso / consumo.reponedores_limite) * 100 >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((consumo.reponedores_uso / consumo.reponedores_limite) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {consumo.reponedores_uso} de {consumo.reponedores_limite}
                        <span className="text-xs"> ({consumo.reponedores_disponibles} disponibles)</span>
                      </div>
                    </div>

                    {/* Total Usuarios */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Usuarios</span>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-900">{consumo.total_usuarios}</p>
                        <p className="text-xs text-blue-600 mt-1">Supervisores + Reponedores</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usuarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Total Usuarios</label>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{resumen.total_usuarios}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-green-700">Usuarios Activos</label>
                    <p className="text-3xl font-bold text-green-700 mt-2">{resumen.usuarios_activos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facturación y Actividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Facturación y Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-yellow-700">Facturas Pendientes</label>
                      <p className="text-2xl font-bold text-yellow-900">{resumen.facturas_pendientes}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Actividades Pendientes</label>
                      <p className="text-2xl font-bold text-blue-900">{resumen.actividades_pendientes}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  {resumen.ultima_factura_pagada && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <label className="text-sm font-medium text-green-700">Última Factura Pagada</label>
                      <p className="text-lg font-semibold text-green-900 mt-1">
                        {new Date(resumen.ultima_factura_pagada).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  )}
                  {resumen.ultima_actividad && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <label className="text-sm font-medium text-purple-700">Última Actividad</label>
                      <p className="text-lg font-semibold text-purple-900 mt-1">
                        {new Date(resumen.ultima_actividad).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historial de Auditoría */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistorial ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : historial.length > 0 ? (
                  <div className="space-y-3">
                    {historial.map((log) => (
                      <div key={log.id_log} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getAccionBadge(log.accion)}
                            <span className="text-xs text-gray-500">{formatearFecha(log.timestamp)}</span>
                          </div>
                          {log.usuario_nombre && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{log.usuario_nombre}</span>
                              {log.usuario_rol && <span className="text-gray-500"> ({log.usuario_rol})</span>}
                            </p>
                          )}
                          {log.descripcion && (
                            <p className="text-xs text-gray-600 mt-1">{log.descripcion}</p>
                          )}
                          {log.valores_anteriores && log.valores_nuevos && (
                            <div className="mt-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-red-50 p-2 rounded">
                                  <p className="font-medium text-red-700 mb-1">Antes:</p>
                                  <pre className="text-red-600 text-xs overflow-x-auto">{JSON.stringify(log.valores_anteriores, null, 2)}</pre>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="font-medium text-green-700 mb-1">Después:</p>
                                  <pre className="text-green-600 text-xs overflow-x-auto">{JSON.stringify(log.valores_nuevos, null, 2)}</pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay historial de cambios registrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se pudo cargar la información de la empresa.</p>
            <Button onClick={cargarResumen} className="mt-4">
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
};

export default BackofficeEmpresaDetalle;
