import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Smartphone, 
  BarChart3, 
  Users, 
  Clock, 
  Shield,
  CheckCircle,
  Zap
} from 'lucide-react';

const LandingFeatures = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Ruteo optimizado",
      description: "Sistema de ruteo inteligente con geolocalización GPS para optimizar las rutas de reposición",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Gestión de tareas en tiempo real",
      description: "App móvil para reponedores con asignación y seguimiento de tareas de reposición",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Control y supervisión",
      description: "Dashboard para supervisores y administradores con métricas en tiempo real",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Optimización de rutas",
      description: "Reduce hasta un 40% el tiempo de desplazamiento con ruteo inteligente"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestión centralizada",
      description: "Control total de reponedores, supervisores y tareas desde una plataforma"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Seguridad garantizada",
      description: "Datos protegidos con encriptación de nivel empresarial"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Implementación rápida",
      description: "Comienza a usar el sistema en menos de 24 horas"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Sin contratos largos",
      description: "Planes flexibles que se adaptan a tu cadena de supermercados"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Métricas en tiempo real",
      description: "Seguimiento de productividad y cumplimiento de tareas al instante"
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Características principales */}
        <div id="soluciones" className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Optimiza la gestión de reposición en tus supermercados
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ruteo inteligente, seguimiento GPS y gestión de tareas. Soluciones para cadenas de supermercados de todos los tamaños.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beneficios */}
        <div id="caracteristicas" className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir POERuteo?
            </h2>
            <p className="text-xl text-gray-600">
              Solución integral para la gestión de reposición en supermercados modernos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    {benefit.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-purple-100">Supermercados confían en nosotros</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">2k+</div>
              <div className="text-purple-100">Reponedores activos</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-purple-100">Tiempo de actividad</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-purple-100">Soporte técnico</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFeatures;
