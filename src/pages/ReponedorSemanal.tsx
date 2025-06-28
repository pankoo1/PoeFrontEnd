
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, TrendingUp, Target, BarChart3 } from 'lucide-react';

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
    if (progreso === 100) return 'bg-gradient-to-t from-green-500 to-green-400';
    if (progreso >= 75) return 'bg-gradient-to-t from-yellow-500 to-yellow-400';
    if (progreso >= 50) return 'bg-gradient-to-t from-orange-500 to-orange-400';
    return 'bg-gradient-to-t from-red-500 to-red-400';
  };

  const getProgresoText = (progreso: number) => {
    if (progreso === 100) return 'Completado';
    if (progreso >= 75) return 'Buen progreso';
    if (progreso >= 50) return 'En progreso';
    return 'Pendiente';
  };

  const getProgresoTextColor = (progreso: number) => {
    if (progreso === 100) return 'text-green-600';
    if (progreso >= 75) return 'text-yellow-600';
    if (progreso >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reponedor-dashboard')}
            className="mr-4 glass-card hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Vista Semanal
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Análisis Semanal de Rendimiento</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualiza tu progreso semanal y analiza tu rendimiento en las tareas asignadas
          </p>
        </div>

        <div className="space-y-8">
          {semanasData.map((semana, index) => (
            <Card key={index} className={`glass-card border-0 bg-gradient-to-br from-white/90 to-white/70 overflow-hidden ${semana.actual ? 'ring-2 ring-purple-200' : ''}`}>
              <CardHeader className="relative">
                <div className={`absolute inset-0 ${semana.actual ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'} opacity-5`}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <CardTitle className="text-2xl flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-xl ${semana.actual ? 'bg-gradient-to-br from-purple-500 to-violet-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white shadow-lg`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-gray-900">{semana.semana}</span>
                      {semana.actual && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0 shadow-sm">
                          ✨ Actual
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Progreso general de la semana
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {semana.tareas.completadas}/{semana.tareas.total}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {Math.round((semana.tareas.completadas / semana.tareas.total) * 100)}% completado
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Resumen de tareas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="glass-card text-center p-4 rounded-xl bg-green-50/50 border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mx-auto mb-3 shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">{semana.tareas.completadas}</div>
                    <div className="text-sm text-gray-600 font-medium">Completadas</div>
                  </div>
                  
                  <div className="glass-card text-center p-4 rounded-xl bg-blue-50/50 border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-3 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{semana.tareas.en_progreso}</div>
                    <div className="text-sm text-gray-600 font-medium">En Progreso</div>
                  </div>
                  
                  <div className="glass-card text-center p-4 rounded-xl bg-yellow-50/50 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl w-fit mx-auto mb-3 shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{semana.tareas.pendientes}</div>
                    <div className="text-sm text-gray-600 font-medium">Pendientes</div>
                  </div>
                  
                  <div className="glass-card text-center p-4 rounded-xl bg-gray-50/50 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl w-fit mx-auto mb-3 shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-600 mb-1">{semana.tareas.total}</div>
                    <div className="text-sm text-gray-600 font-medium">Total</div>
                  </div>
                </div>

                {/* Progreso diario */}
                <div className="glass-card bg-white/50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Progreso Diario
                  </h4>
                  <div className="grid grid-cols-7 gap-4">
                    {semana.dias.map((dia, diaIndex) => (
                      <div key={diaIndex} className="text-center group">
                        <div className="text-sm font-semibold mb-2 text-gray-700">{dia.dia}</div>
                        <div className="text-xs text-gray-500 mb-3">{dia.fecha}</div>
                        <div className="h-24 bg-gray-100/50 rounded-lg flex flex-col justify-end p-1 border border-gray-200 group-hover:shadow-md transition-all duration-300">
                          <div 
                            className={`${getProgresoColor(dia.progreso)} rounded-md transition-all duration-500 shadow-sm`}
                            style={{ height: `${Math.max(dia.progreso, 8)}%`, minHeight: '4px' }}
                          ></div>
                        </div>
                        <div className="text-xs mt-3 space-y-1">
                          <div className="font-semibold text-gray-800">{dia.completadas}/{dia.total}</div>
                          <div className={`text-xs font-medium ${getProgresoTextColor(dia.progreso)}`}>
                            {getProgresoText(dia.progreso)}
                          </div>
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
