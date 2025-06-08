export interface ReponedorFormData {
  nombre: string;
  email: string;
  telefono: string;
  area: string;
  turno: string;
  fechaIngreso: string;
}

export interface ReponedorFormContentProps {
  formData: ReponedorFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export type AreaOption = {
  value: string;
  label: string;
};

export type TurnoOption = {
  value: string;
  label: string;
};