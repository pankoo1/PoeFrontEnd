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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Eye, 
  Ban, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, type EmpresaBackoffice } from '@/services/api';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const BackofficeEmpresas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [empresas, setEmpresas] = useState<EmpresaBackoffice[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<EmpresaBackoffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Paginación
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);
  
  // Modal de suspender
  const [showSuspenderModal, setShowSuspenderModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaBackoffice | null>(null);
  const [motivoSuspension, setMotivoSuspension] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  // Cargar empresas
  const cargarEmpresas = async () => {
    try {
      setIsLoading(true);
      const estado = estadoFiltro === 'todos' ? undefined : estadoFiltro;
      const datos = await ApiService.getBackofficeEmpresas(estado, skip, limit);
      setEmpresas(datos);
      setFilteredEmpresas(datos);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al montar y cuando cambien los filtros
  useEffect(() => {
    cargarEmpresas();
  }, [estadoFiltro, skip]);

  // Filtrar por búsqueda local
  useEffect(() => {
    if (!busqueda.trim()) {
      setFilteredEmpresas(empresas);
      return;
    }

    const searchLower = busqueda.toLowerCase();
    const filtered = empresas.filter(empresa => 
      empresa.nombre_empresa.toLowerCase().includes(searchLower) ||
      empresa.rut_empresa.toLowerCase().includes(searchLower) ||
      empresa.email?.toLowerCase().includes(searchLower)
    );
    setFilteredEmpresas(filtered);
  }, [busqueda, empresas]);

  // Suspender empresa
  const handleSuspender = async () => {
    if (!empresaSeleccionada || !motivoSuspension.trim()) {
      toast({
        title: "Error",
        description: "Debe proporcionar un motivo de al menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (motivoSuspension.trim().length < 10) {
      toast({
        title: "Motivo insuficiente",
        description: "El motivo debe tener al menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSuspending(true);
      await ApiService.suspenderEmpresa(empresaSeleccionada.id_empresa, motivoSuspension);
      
      toast({
        title: "Empresa suspendida",
        description: `${empresaSeleccionada.nombre_empresa} ha sido suspendida correctamente.`,
      });
      
      setShowSuspenderModal(false);
      setMotivoSuspension('');
      setEmpresaSeleccionada(null);
      cargarEmpresas();
    } catch (error) {
      console.error('Error al suspender empresa:', error);
      toast({
        title: "Error",
        description: "No se pudo suspender la empresa.",
        variant: "destructive",
      });
    } finally {
      setIsSuspending(false);
    }
  };

  // Reactivar empresa
  const handleReactivar = async (empresa: EmpresaBackoffice) => {
    try {
      await ApiService.reactivarEmpresa(empresa.id_empresa);
      
      toast({
        title: "Empresa reactivada",
        description: `${empresa.nombre_empresa} ha sido reactivada correctamente.`,
      });
      
      cargarEmpresas();
    } catch (error) {
      console.error('Error al reactivar empresa:', error);
      toast({
        title: "Error",
        description: "No se pudo reactivar la empresa.",
        variant: "destructive",
      });
    }
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      activo: { 
        label: 'Activo', 
        className: 'bg-green-100 text-green-700 border-green-300',
        icon: <CheckCircle className="h-3 w-3" />
      },
      inactivo: { 
        label: 'Inactivo', 
        className: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: <AlertCircle className="h-3 w-3" />
      },
      suspendido: { 
        label: 'Suspendido', 
        className: 'bg-red-100 text-red-700 border-red-300',
        icon: <Ban className="h-3 w-3" />
      },
      prueba: { 
        label: 'Prueba', 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: <AlertCircle className="h-3 w-3" />
      },
    };

    const estadoInfo = estados[estado] || estados.inactivo;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoInfo.className}`}>
        {estadoInfo.icon}
        {estadoInfo.label}
      </span>
    );
  };

  return (
    <BackofficeLayout>
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            Gestión de Empresas
          </h1>
          <p className="text-sm text-gray-500">Administración de clientes del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={cargarEmpresas} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por nombre, RUT o email
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar empresa..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filtrar por estado
                </label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activas</SelectItem>
                    <SelectItem value="prueba">En Prueba</SelectItem>
                    <SelectItem value="suspendido">Suspendidas</SelectItem>
                    <SelectItem value="inactivo">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Empresas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Empresas ({filteredEmpresas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando empresas...</p>
                </div>
              </div>
            ) : filteredEmpresas.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron empresas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmpresas.map((empresa) => (
                      <TableRow key={empresa.id_empresa}>
                        <TableCell className="font-medium">
                          {empresa.nombre_empresa}
                        </TableCell>
                        <TableCell>{empresa.rut_empresa}</TableCell>
                        <TableCell>
                          {empresa.ciudad && empresa.region ? (
                            <div className="text-sm">
                              <div>{empresa.ciudad}</div>
                              <div className="text-gray-500">{empresa.region}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {empresa.email ? (
                            <div className="text-sm">
                              <div>{empresa.email}</div>
                              {empresa.telefono && (
                                <div className="text-gray-500">{empresa.telefono}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {empresa.tiene_plan_activo ? (
                            <div className="text-sm">
                              <div className="font-medium">{empresa.nombre_plan}</div>
                              {empresa.estado_plan && (
                                <span className={`text-xs ${
                                  empresa.estado_plan === 'activo' ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {empresa.estado_plan}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin plan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(empresa.estado)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/backoffice/empresas/${empresa.id_empresa}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {empresa.estado === 'suspendido' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReactivar(empresa)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : empresa.estado === 'activo' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEmpresaSeleccionada(empresa);
                                  setShowSuspenderModal(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Suspender Empresa */}
      <Dialog open={showSuspenderModal} onOpenChange={setShowSuspenderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Empresa</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea suspender la empresa "{empresaSeleccionada?.nombre_empresa}"?
              Esta acción bloqueará el acceso de todos los usuarios de la empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Motivo de la suspensión (mínimo 10 caracteres)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              value={motivoSuspension}
              onChange={(e) => setMotivoSuspension(e.target.value)}
              placeholder="Ejemplo: Incumplimiento de condiciones contractuales..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {motivoSuspension.length} / 10 caracteres mínimo
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspenderModal(false);
                setMotivoSuspension('');
                setEmpresaSeleccionada(null);
              }}
              disabled={isSuspending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspender}
              disabled={isSuspending || motivoSuspension.length < 10}
            >
              {isSuspending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Suspendiendo...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspender Empresa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BackofficeLayout>
  );
};

export default BackofficeEmpresas;
