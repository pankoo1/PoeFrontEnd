import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReponedorFormContentProps } from './types';
import { FormField } from './FormField';
import { areaOptions, turnoOptions } from './constants';

export const ReponedorFormContent: React.FC<ReponedorFormContentProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField>
        <Label htmlFor="nombre">Nombre Completo</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <FormField>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <FormField>
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={formData.telefono}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <FormField>
        <Label htmlFor="area">Área Asignada</Label>
        <Select 
          value={formData.area} 
          onValueChange={(value) => handleSelectChange('area', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            {areaOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField>
        <Label htmlFor="turno">Turno de Trabajo</Label>
        <Select 
          value={formData.turno} 
          onValueChange={(value) => handleSelectChange('turno', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar turno" />
          </SelectTrigger>
          <SelectContent>
            {turnoOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField>
        <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
        <Input
          id="fechaIngreso"
          type="date"
          value={formData.fechaIngreso}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Registrar Reponedor
        </Button>
      </div>
    </form>
  );
};