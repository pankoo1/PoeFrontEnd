import React from 'react';
import { MapPin, Mail, Phone, Linkedin, Twitter, Facebook } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold">
                <span className="text-purple-400">POE</span>Ruteo
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Control y gestión de reposición para supermercados en Chile. Soluciones modernas y eficientes.
            </p>
          </div>

          {/* Soluciones */}
          <div>
            <h3 className="font-bold text-lg mb-4">Soluciones</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Ruteo optimizado</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Gestión de tareas</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Control de reposición</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Reportes y métricas</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-bold text-lg mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contenidos</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Marcas</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Políticas de privacidad</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-400" />
                <a href="tel:+23241" className="hover:text-purple-400 transition-colors">+2324153300</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <a href="mailto:ventas@poeruteo.com" className="hover:text-purple-400 transition-colors">
                  ventas@poeruteo.com
                </a>
              </li>
            </ul>

            {/* Redes sociales */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} POERuteo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
