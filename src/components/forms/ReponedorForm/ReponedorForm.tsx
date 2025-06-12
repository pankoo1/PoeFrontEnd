import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { ReponedorFormContent } from '@/components/forms/ReponedorForm/ReponedorFormContent';
import { useReponedorForm } from './useReponedorForm';

export const ReponedorForm: React.FC = () => {
  const { isOpen, setIsOpen, formData, handleInputChange, handleSubmit } = useReponedorForm();

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
        <ReponedorFormContent 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};