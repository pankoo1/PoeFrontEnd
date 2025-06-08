
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const TareaForm = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    reponedor: '',
    producto: '',
    area: '',
    cantidad: '',
    prioridad: '',
    fechaLimite: '',
    descripcion: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nueva tarea:', formData);
    toast({
      title: "Tarea asignada",
      description: `Tarea de reposición asignada a ${formData.reponedor}`,
    });
    setFormData({
      reponedor: '',
      producto: '',
      area: '',
      cantidad: '',
      prioridad: '',
      fechaLimite: '',
      descripcion: ''
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Asignar Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Nueva Tarea de Reposición</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reponedor">Reponedor Asignado</Label>
            <Select value={formData.reponedor} onValueChange={(value) => setFormData({...formData, reponedor: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar reponedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carlos">Carlos Martínez</SelectItem>
                <SelectItem value="ana">Ana López</SelectItem>
                <SelectItem value="miguel">Miguel Santos</SelectItem>
                <SelectItem value="laura">Laura Pérez</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="producto">Producto a Reponer</Label>
            <Input
              id="producto"
              value={formData.producto}
              onChange={(e) => setFormData({...formData, producto: e.target.value})}
              placeholder="Ej: Leche Entera 1L"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Área del Supermercado</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => setFormData({...formData, prioridad: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaLimite">Fecha Límite</Label>
            <Input
              id="fechaLimite"
              type="datetime-local"
              value={formData.fechaLimite}
              onChange={(e) => setFormData({...formData, fechaLimite: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción Adicional</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Instrucciones especiales..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Asignar Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TareaForm;
