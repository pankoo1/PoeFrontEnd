import { useState, ChangeEvent, FormEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ReponedorFormData } from './types';
import { useReponedores } from '@/contexts/ReponedoresContext';

export const useReponedorForm = () => {
  const { toast } = useToast();
  const { addReponedor } = useReponedores();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ReponedorFormData>({
    nombre: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Agregar el nuevo reponedor al contexto
    addReponedor({
      name: formData.nombre,
      email: formData.email,
      estado: 'Activo', // Estado por defecto
      password: formData.password
    });
    
    toast({
      title: "Reponedor registrado",
      description: `${formData.nombre} ha sido registrado correctamente`,
    });
    
    resetForm();
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    formData,
    handleInputChange,
    handleSubmit,
  };
};