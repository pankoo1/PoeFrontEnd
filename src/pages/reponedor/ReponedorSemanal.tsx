import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from 'lucide-react';
import ReponedorLayout from '@/components/layout/ReponedorLayout';

const ReponedorSemanal = () => {
  const userName = localStorage.getItem('userName') || 'Reponedor';

  return (
    <ReponedorLayout>
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">
          Vista Semanal
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500">Reponedor</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
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

          {/* Estado vacío - no hay endpoint backend */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 rounded-full bg-amber-50">
                  <AlertCircle className="w-12 h-12 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Vista Semanal No Disponible</h3>
                  <p className="text-slate-600 max-w-md">
                    Esta funcionalidad requiere configuración adicional en el backend. 
                    Por ahora, puedes consultar tus tareas en la sección "Mis Tareas".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </ReponedorLayout>
  );
};

export default ReponedorSemanal;
