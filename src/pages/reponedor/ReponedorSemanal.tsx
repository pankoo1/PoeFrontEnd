
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, Home, BarChart3, TrendingUp } from 'lucide-react';
import Logo from '@/components/shared/Logo';

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
    if (progreso === 100) return 'bg-success';
    if (progreso >= 75) return 'bg-warning';
    if (progreso >= 50) return 'bg-info';
    return 'bg-destructive';
  };

  const getProgresoText = (progreso: number) => {
    if (progreso === 100) return 'Completado';
    if (progreso >= 75) return 'Buen progreso';
    if (progreso >= 50) return 'En progreso';
    return 'Pendiente';
  };

  return (
    <>
      {/* Background fijo que cubre toda la pantalla */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.80) 100%), url('/POE.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="min-h-screen relative z-10">
        {/* Header con diseño unificado */}
        <header className="border-b shadow-sm rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80 mx-6 mt-6">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-primary/20 rounded-xl border-2 border-primary/30 shadow-lg">
                <Logo size="lg" showText={true} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Vista Semanal
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  Análisis de progreso y rendimiento semanal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reponedor-dashboard')}
                className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/reponedor-dashboard')}
                className="border-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Banner informativo */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-primary/40 backdrop-blur-sm bg-white/80">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/40 rounded-xl">
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Análisis Semanal</h2>
                <p className="text-muted-foreground">Visualiza tu progreso y rendimiento en las tareas asignadas</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {semanasData.map((semana, index) => (
              <Card key={index} className={`card-supermarket hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-md ${semana.actual ? 'border-2 border-primary/40 bg-gradient-to-r from-primary/5 to-primary/10' : ''}`}>
                <CardHeader className={semana.actual ? 'bg-gradient-to-r from-primary/10 to-primary/20' : 'bg-gradient-to-r from-muted/10 to-muted/20'}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${semana.actual ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'}`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span>{semana.semana}</span>
                        {semana.actual && (
                          <Badge className="bg-primary text-primary-foreground">Actual</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Progreso general de la semana
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        {semana.tareas.completadas}/{semana.tareas.total}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((semana.tareas.completadas / semana.tareas.total) * 100)}% completado
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Resumen de tareas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 transition-colors">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
                      <div className="text-lg font-bold text-success">{semana.tareas.completadas}</div>
                      <div className="text-sm text-muted-foreground">Completadas</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-info/10 border border-info/20 hover:bg-info/20 transition-colors">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-info" />
                      <div className="text-lg font-bold text-info">{semana.tareas.en_progreso}</div>
                      <div className="text-sm text-muted-foreground">En Progreso</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20 hover:bg-warning/20 transition-colors">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-warning" />
                      <div className="text-lg font-bold text-warning">{semana.tareas.pendientes}</div>
                      <div className="text-sm text-muted-foreground">Pendientes</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/30 border border-muted/40 hover:bg-muted/40 transition-colors">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-lg font-bold text-muted-foreground">{semana.tareas.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {/* Progreso diario */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Progreso Diario</span>
                    </h4>
                    <div className="grid grid-cols-7 gap-2">
                      {semana.dias.map((dia, diaIndex) => (
                        <div key={diaIndex} className="text-center">
                          <div className="text-sm font-medium mb-2">{dia.dia}</div>
                          <div className="text-xs text-muted-foreground mb-2">{dia.fecha}</div>
                          <div className="h-20 bg-muted/30 rounded-lg flex flex-col justify-end p-2 border border-muted/40">
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
    </>
  );
};

export default ReponedorSemanal;
