import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from 'lucide-react';

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  nombreEmpresa: string;
  telefono: string;
  numeroEmpleados: string;
  necesitaSoporte: string;
  aceptaPoliticas: boolean;
}

const LandingContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    nombreEmpresa: '',
    telefono: '',
    numeroEmpleados: '',
    necesitaSoporte: '',
    aceptaPoliticas: false
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.nombreEmpresa) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.telefono || formData.telefono.length < 9) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un número de teléfono válido.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.aceptaPoliticas) {
      toast({
        title: "Políticas de privacidad",
        description: "Debes aceptar las políticas de privacidad para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulación de envío (aquí puedes integrar con tu API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "¡Solicitud enviada!",
        description: "Nos pondremos en contacto contigo pronto.",
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        nombreEmpresa: '',
        telefono: '',
        numeroEmpleados: '',
        necesitaSoporte: '',
        aceptaPoliticas: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Información */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Solicita una demo gratuita y conoce cómo optimizar la reposición en tus supermercados
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Optimiza la gestión de reposición con POERuteo. Ruteo inteligente, seguimiento GPS y control de tareas. 
              Soluciones para cadenas de supermercados de todos los tamaños.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ruteo optimizado</h3>
                  <p className="text-gray-600">Rutas inteligentes con geolocalización GPS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gestión de tareas en tiempo real</h3>
                  <p className="text-gray-600">App móvil para reponedores con todas las funcionalidades</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Control y supervisión completa</h3>
                  <p className="text-gray-600">Dashboard con métricas y analíticas en tiempo real</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    placeholder="Tu apellido"
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo corporativo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="correo@empresa.com"
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={(e) => handleInputChange('nombreEmpresa', e.target.value)}
                  placeholder="Nombre de tu empresa"
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de teléfono <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Select defaultValue="chile">
                    <SelectTrigger className="w-28 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chile">Chile</SelectItem>
                      <SelectItem value="argentina">Argentina</SelectItem>
                      <SelectItem value="peru">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    required
                    className="flex-1 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de reponedores <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.numeroEmpleados}
                  onValueChange={(value) => handleInputChange('numeroEmpleados', value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 reponedores</SelectItem>
                    <SelectItem value="11-50">11-50 reponedores</SelectItem>
                    <SelectItem value="51-200">51-200 reponedores</SelectItem>
                    <SelectItem value="201-500">201-500 reponedores</SelectItem>
                    <SelectItem value="500+">Más de 500 reponedores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Usas POERuteo y necesitas Soporte? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="soporte"
                      value="si"
                      checked={formData.necesitaSoporte === 'si'}
                      onChange={(e) => handleInputChange('necesitaSoporte', e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="soporte"
                      value="no"
                      checked={formData.necesitaSoporte === 'no'}
                      onChange={(e) => handleInputChange('necesitaSoporte', e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="politicas"
                  checked={formData.aceptaPoliticas}
                  onChange={(e) => handleInputChange('aceptaPoliticas', e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="politicas" className="text-sm text-gray-600">
                  Confirmo que he leído y acepto las{' '}
                  <a href="#" className="text-purple-600 hover:underline">políticas de privacidad</a> establecidas
                  <span className="text-red-500">*</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-6 text-lg font-semibold"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar demo gratuita'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingContactForm;
