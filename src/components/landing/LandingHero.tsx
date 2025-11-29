import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const LandingHero = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-white pt-32 pb-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-20 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              Solución SaaS B2B para supermercados
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              POERuteo: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Control y gestión de reposición</span> para supermercados en Chile
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Optimiza el <strong>control de reposición de productos con POERuteo</strong>. 
              Ruteo inteligente, seguimiento en tiempo real y gestión de tareas. Soluciones para supermercados de todos los tamaños.
            </p>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Ruteo optimizado para reponedores con geolocalización GPS
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Gestión de tareas de reposición en tiempo real
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Sistema de control integrado con supervisores y administradores
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToContact}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-lg px-8 py-6 group"
              >
                Solicitar demo gratuita
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToContact}
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg px-8 py-6"
              >
                Cotizar ahora
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white"></div>
                </div>
                <span>+50 supermercados confían en nosotros</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span>4.9/5 valoración</span>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup/Image */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              {/* Simulated dashboard preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Dashboard POERuteo</h3>
                      <p className="text-sm text-gray-500">Panel de control de reposición en tiempo real</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">94%</div>
                    <div className="text-xs text-green-600">Completado</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">45</div>
                    <div className="text-xs text-blue-600">Reponedores</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">320</div>
                    <div className="text-xs text-purple-600">Tareas</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-200"></div>
                      <div>
                        <div className="text-sm font-medium">Juan Pérez</div>
                        <div className="text-xs text-gray-500">Jumbo Maipú - 12/15 tareas</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200"></div>
                      <div>
                        <div className="text-sm font-medium">María González</div>
                        <div className="text-xs text-gray-500">Líder Las Condes - 18/20 tareas</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200"></div>
                      <div>
                        <div className="text-sm font-medium">Carlos Muñoz</div>
                        <div className="text-xs text-gray-500">Unimarc Providencia - 8/10 tareas</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-300 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-300 rounded-full opacity-60 animate-pulse animation-delay-1000"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default LandingHero;
