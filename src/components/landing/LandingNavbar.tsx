import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <MapPin className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              <span className="text-purple-600">POE</span>Ruteo
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('soluciones')}
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Soluciones
            </button>
            <button
              onClick={() => scrollToSection('caracteristicas')}
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Características
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Contacto
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Acceso usuarios
            </Button>
            <Button
              onClick={() => scrollToSection('contacto')}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
            >
              Cotizar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('soluciones')}
                className="text-left text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Soluciones
              </button>
              <button
                onClick={() => scrollToSection('caracteristicas')}
                className="text-left text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Características
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="text-left text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Contacto
              </button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-purple-600 text-purple-600"
              >
                Acceso usuarios
              </Button>
              <Button
                onClick={() => scrollToSection('contacto')}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white"
              >
                Cotizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;
