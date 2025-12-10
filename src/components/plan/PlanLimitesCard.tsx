import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Users, Package, MapPin, UserCheck } from 'lucide-react';
import { ApiService } from '@/services/api';
import { PlanConUso, ValidacionRecurso } from '@/types/plan.types';
import { useToast } from "@/hooks/use-toast";

interface RecursoInfo {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const RECURSOS_INFO: Record<string, RecursoInfo> = {
  supervisores: {
    icon: <UserCheck className="h-5 w-5" />,
    label: 'Supervisores',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  reponedores: {
    icon: <Users className="h-5 w-5" />,
    label: 'Reponedores',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  productos: {
    icon: <Package className="h-5 w-5" />,
    label: 'Productos',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  puntos: {
    icon: <MapPin className="h-5 w-5" />,
    label: 'Puntos de Reposición',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
};

export const PlanLimitesCard: React.FC = () => {
  const [plan, setPlan] = useState<PlanConUso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cargarPlan();
  }, []);

  const cargarPlan = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.obtenerMiPlan();
      setPlan(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (porcentaje: number): string => {
    if (porcentaje >= 100) return 'bg-red-500';
    if (porcentaje >= 80) return 'bg-orange-500';
    if (porcentaje >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderRecurso = (key: string, validacion: ValidacionRecurso) => {
    const info = RECURSOS_INFO[key];
    if (!info) return null;

    const { limite_plan, cantidad_actual, porcentaje_uso, excedido } = validacion;
    
    // Si es ilimitado
    if (limite_plan === null) {
      return (
        <div key={key} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 ${info.bgColor} rounded-lg`}>
                <span className={info.color}>{info.icon}</span>
              </div>
              <span className="font-medium text-gray-900">{info.label}</span>
            </div>
            <span className="text-sm font-semibold text-green-600">Ilimitado</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uso actual: {cantidad_actual}</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 ${info.bgColor} rounded-lg`}>
              <span className={info.color}>{info.icon}</span>
            </div>
            <span className="font-medium text-gray-900">{info.label}</span>
          </div>
          {excedido ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {cantidad_actual} de {limite_plan}
            </span>
            <span className={`font-semibold ${excedido ? 'text-red-600' : 'text-gray-900'}`}>
              {porcentaje_uso.toFixed(0)}%
            </span>
          </div>

          <Progress 
            value={Math.min(porcentaje_uso, 100)} 
            className="h-2"
            indicatorClassName={getProgressColor(porcentaje_uso)}
          />

          {excedido && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Límite alcanzado. Contacte al administrador para ampliar su plan.
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Límites del Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan || !plan.validaciones) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Límites del Plan</span>
          {plan.activo ? (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Activo
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
              Inactivo
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(plan.validaciones).map(([key, validacion]) =>
            renderRecurso(key, validacion)
          )}
        </div>

        {!plan.activo && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Atención:</strong> Su plan está inactivo. Contacte al administrador para reactivarlo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanLimitesCard;
