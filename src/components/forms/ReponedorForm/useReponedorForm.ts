import { useState, ChangeEvent, FormEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
interface ReponedorFormData {
  nombre: string;
  email: string;
  telefono: string;
  area: string;
  turno: string;
  fechaIngreso: string;
}

export const useReponedorForm = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ReponedorFormData>({
    nombre: '',
    email: '',
    telefono: '',
    area: '',
    turno: '',
    fechaIngreso: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      area: '',
      turno: '',
      fechaIngreso: ''
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Nuevo reponedor:', formData);
    toast({
      title: "Reponedor registrado",
      description: `${formData.nombre} ha sido asignado al área de ${formData.area}`,
    });
    resetForm();
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    formData,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    resetForm
  };
};