
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReponedorForm = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    area: '',
    turno: '',
    fechaIngreso: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nuevo reponedor:', formData);
    toast({
      title: "Reponedor registrado",
      description: `${formData.nombre} ha sido asignado al área de ${formData.area}`,
    });
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      area: '',
      turno: '',
      fechaIngreso: ''
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Reponedor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Reponedor</DialogTitle>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Área Asignada</Label>
            <Select value={formData.area} onValueChange={(value) => setFormData({...formData, area: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lacteos">Lácteos</SelectItem>
                <SelectItem value="frutas-verduras">Frutas y Verduras</SelectItem>
                <SelectItem value="carnes">Carnes y Embutidos</SelectItem>
                <SelectItem value="panaderia">Panadería</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
                <SelectItem value="enlatados">Enlatados y Conservas</SelectItem>
                <SelectItem value="limpieza">Productos de Limpieza</SelectItem>
                <SelectItem value="higiene">Higiene Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="turno">Turno de Trabajo</Label>
            <Select value={formData.turno} onValueChange={(value) => setFormData({...formData, turno: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mañana">Mañana (6:00 AM - 2:00 PM)</SelectItem>
                <SelectItem value="tarde">Tarde (2:00 PM - 10:00 PM)</SelectItem>
                <SelectItem value="noche">Noche (10:00 PM - 6:00 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
            <Input
              id="fechaIngreso"
              type="date"
              value={formData.fechaIngreso}
              onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Reponedor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReponedorForm;
