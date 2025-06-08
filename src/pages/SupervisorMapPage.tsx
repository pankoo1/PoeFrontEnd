
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';

const SupervisorMapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/supervisor-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mapa de Supervisión</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-200px)]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-500 text-white">
                <Map className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Visualización de Rutas y Ubicaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Mapa de Supervisión</h3>
                <p className="text-muted-foreground mb-4">
                  El mapa interactivo para supervisión de rutas y reponedores será integrado manualmente aquí
                </p>
                <Button variant="outline">
                  Configurar Mapa de Supervisión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorMapPage;
