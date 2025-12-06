import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { ErrorLimitePlan } from '@/types/plan.types';

interface LimitePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: ErrorLimitePlan | null;
}

const RECURSOS_LABELS: Record<string, string> = {
  supervisores: 'Supervisores',
  reponedores: 'Reponedores',
  productos: 'Productos',
  puntos: 'Puntos de Reposición'
};

export const LimitePlanDialog: React.FC<LimitePlanDialogProps> = ({
  open,
  onOpenChange,
  error
}) => {
  if (!error) return null;

  const recursoLabel = RECURSOS_LABELS[error.recurso] || error.recurso;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Límite de Plan Alcanzado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="text-base text-gray-700">
              {error.mensaje}
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Recurso</p>
                  <p className="font-semibold text-gray-900">{recursoLabel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Límite del plan</p>
                  <p className="font-semibold text-gray-900">{error.limite_plan}</p>
                </div>
                <div>
                  <p className="text-gray-500">Uso actual</p>
                  <p className="font-semibold text-gray-900">{error.uso_actual}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-semibold text-orange-600">
                    {error.uso_actual >= error.limite_plan ? 'Completo' : 'Disponible'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Sugerencia: </span>
                {error.sugerencia}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LimitePlanDialog;
