import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService, CreateUsuarioData, CreateReponedorData, Usuario } from '@/services/api';
import { LimitePlanDialog } from '@/components/plan/LimitePlanDialog';
import { ErrorLimitePlan } from '@/types/plan.types';

interface UserFormProps {
  onUserAdded: (user: Usuario) => void;
  isSupervisor?: boolean;
  buttonLabel?: string;
}

const UserForm = ({ onUserAdded, isSupervisor = false, buttonLabel = "Nuevo Usuario" }: UserFormProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [limitError, setLimitError] = useState<ErrorLimitePlan | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: isSupervisor ? 'Reponedor' : '',
    contraseña: '',
    estado: 'activo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verificar que el usuario esté autenticado
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      // Verificar permisos según el rol
      const userRole = localStorage.getItem('userRole');
      if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
        throw new Error('No tienes permisos para crear usuarios.');
      }

      let newUser: Usuario;

      if (isSupervisor) {
        // Si es supervisor, usar el endpoint específico para crear reponedores
        const reponedorData: CreateReponedorData = {
          nombre: formData.nombre,
          correo: formData.correo,
          contraseña: formData.contraseña
        };
        newUser = await ApiService.createReponedor(reponedorData);
      } else {
        // Si es administrador, usar el endpoint general
        const userData: CreateUsuarioData = {
          nombre: formData.nombre,
          correo: formData.correo,
          contraseña: formData.contraseña,
          rol: formData.rol,
          estado: formData.estado
        };
        newUser = await ApiService.createUsuario(userData);
      }
      
      // Notificar al componente padre con el usuario completo
      onUserAdded(newUser);
      
      toast({
        title: "Usuario creado",
        description: `${newUser.rol} ${newUser.nombre} ha sido registrado exitosamente`,
      });
      
      // Resetear formulario y cerrar el diálogo
      setFormData({
        nombre: '',
        correo: '',
        rol: isSupervisor ? 'Reponedor' : '',
        contraseña: '',
        estado: 'activo'
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      
      // Verificar si es un error de límite de plan (HTTP 402)
      if (error?.response?.status === 402 && ApiService.isLimitePlanError(error.response.data)) {
        setLimitError(error.response.data.detail);
        setShowLimitDialog(true);
        setIsOpen(false); // Cerrar el formulario
      } else {
        toast({
          title: "Error al crear usuario",
          description: error instanceof Error ? error.message : "Ha ocurrido un error al crear el usuario",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LimitePlanDialog 
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        error={limitError}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSupervisor ? "Registrar Nuevo Reponedor" : "Registrar Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo">Email</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              required
            />
          </div>
          {!isSupervisor && (
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select 
                value={formData.rol} 
                onValueChange={(value) => setFormData({...formData, rol: value})} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Reponedor">Reponedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {isSupervisor && (
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Input
                id="rol"
                value="Reponedor"
                disabled
                className="bg-muted"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="contraseña">Contraseña</Label>
            <Input
              id="contraseña"
              type="password"
              value={formData.contraseña}
              onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
              required
            />
          </div>
          {!isSupervisor && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(value) => setFormData({...formData, estado: value})} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UserForm;
