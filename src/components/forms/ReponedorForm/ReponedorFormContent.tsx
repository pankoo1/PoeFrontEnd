import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReponedorFormContentProps } from './types';
import { FormField } from './FormField';

export const ReponedorFormContent: React.FC<ReponedorFormContentProps> = ({
  formData,
  handleInputChange,
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
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
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