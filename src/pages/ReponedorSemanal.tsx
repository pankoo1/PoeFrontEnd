
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock } from 'lucide-react';

const ReponedorSemanal = () => {
  const navigate = useNavigate();

  // Datos simulados de la vista semanal
  const semanasData = [
    {
      semana: 'Semana Actual (3-9 Junio)',
      actual: true,
      tareas: {
        total: 28,
        completadas: 18,
        pendientes: 8,
        en_progreso: 2
      },
      dias: [
        { dia: 'Lun', fecha: '3/6', completadas: 4, total: 4, progreso: 100 },
        { dia: 'Mar', fecha: '4/6', completadas: 3, total: 4, progreso: 75 },
        { dia: 'Mié', fecha: '5/6', completadas: 5, total: 5, progreso: 100 },
        { dia: 'Jue', fecha: '6/6', completadas: 4, total: 4, progreso: 100 },
        { dia: 'Vie', fecha: '7/6', completadas: 2, total: 6, progreso: 33 },
        { dia: 'Sáb', fecha: '8/6', completadas: 0, total: 3, progreso: 0 },
        { dia: 'Dom', fecha: '9/6', completadas: 0, total: 2, progreso: 0 }
      ]
    },
    {
      semana: 'Semana Anterior (27 Mayo - 2 Junio)',
      actual: false,
      tareas: {
        total: 32,
        completadas: 30,
        pendientes: 0,
        en_progreso: 0
      },
      dias: [
        { dia: 'Lun', fecha: '27/5', completadas: 5, total: 5, progreso: 100 },
        { dia: 'Mar', fecha: '28/5', completadas: 4, total: 4, progreso: 100 },
        { dia: 'Mié', fecha: '29/5', completadas: 6, total: 6, progreso: 100 },
        { dia: 'Jue', fecha: '30/5', completadas: 4, total: 4, progreso: 100 },
        { dia: 'Vie', fecha: '31/5', completadas: 5, total: 5, progreso: 100 },
        { dia: 'Sáb', fecha: '1/6', completadas: 3, total: 4, progreso: 75 },
        { dia: 'Dom', fecha: '2/6', completadas: 3, total: 4, progreso: 75 }
      ]
    }
  ];

  const getProgresoColor = (progreso: number) => {
    if (progreso === 100) return 'bg-green-500';
    if (progreso >= 75) return 'bg-yellow-500';
    if (progreso >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgresoText = (progreso: number) => {
    if (progreso === 100) return 'Completado';
    if (progreso >= 75) return 'Buen progreso';
    if (progreso >= 50) return 'En progreso';
    return 'Pendiente';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Vista Semanal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de Tareas por Semana</h2>
          <p className="text-muted-foreground">
            Visualiza tu progreso semanal y rendimiento en las tareas asignadas
          </p>
        </div>

        <div className="space-y-8">
          {semanasData.map((semana, index) => (
            <Card key={index} className={semana.actual ? 'border-blue-200 bg-blue-50/30' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{semana.semana}</span>
                      {semana.actual && (
                        <Badge className="bg-blue-500">Actual</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Progreso general de la semana
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {semana.tareas.completadas}/{semana.tareas.total}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((semana.tareas.completadas / semana.tareas.total) * 100)}% completado
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Resumen de tareas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold text-green-600">{semana.tareas.completadas}</div>
                    <div className="text-sm text-muted-foreground">Completadas</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-lg font-bold text-blue-600">{semana.tareas.en_progreso}</div>
                    <div className="text-sm text-muted-foreground">En Progreso</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-lg font-bold text-yellow-600">{semana.tareas.pendientes}</div>
                    <div className="text-sm text-muted-foreground">Pendientes</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-lg font-bold text-gray-600">{semana.tareas.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                {/* Progreso diario */}
                <div>
                  <h4 className="font-semibold mb-4">Progreso Diario</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {semana.dias.map((dia, diaIndex) => (
                      <div key={diaIndex} className="text-center">
                        <div className="text-sm font-medium mb-2">{dia.dia}</div>
                        <div className="text-xs text-muted-foreground mb-2">{dia.fecha}</div>
                        <div className="h-20 bg-gray-100 rounded-lg flex flex-col justify-end p-2">
                          <div 
                            className={`${getProgresoColor(dia.progreso)} rounded transition-all duration-300`}
                            style={{ height: `${dia.progreso}%`, minHeight: '8px' }}
                          ></div>
                        </div>
                        <div className="text-xs mt-2">
                          <div className="font-medium">{dia.completadas}/{dia.total}</div>
                          <div className="text-muted-foreground">{getProgresoText(dia.progreso)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ReponedorSemanal;
