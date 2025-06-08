import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { ReponedorFormContent } from '@/components/forms/ReponedorForm/ReponedorFormContent';
// Ensure the hook file exists at this path
import { useReponedorForm } from '@/components/forms/ReponedorForm/useReponedorForm';

// Alternative solutions if the import still fails:
// 1. Check if the file exists at:
// import { useReponedorForm } from '../../../hooks/useReponedorForm';
// 2. Or create the hook file if missing at:
// src/hooks/useReponedorForm.ts

export const ReponedorForm: React.FC = () => {
  const { isOpen, setIsOpen, formData, handleInputChange, handleSelectChange, handleSubmit } = useReponedorForm();

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
          handleSelectChange={handleSelectChange}
          handleSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};