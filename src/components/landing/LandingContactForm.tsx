import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api';

interface FormData {
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  nombreEmpresa: string;
  rutEmpresa: string;
  cantidadSupervisores: string;
  cantidadReponedores: string;
  cantidadProductos: string;
  integracionesRequeridas: string;
  comentarios: string;
  aceptaPoliticas: boolean;
}

const LandingContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombreContacto: '',
    emailContacto: '',
    telefonoContacto: '',
    nombreEmpresa: '',
    rutEmpresa: '',
    cantidadSupervisores: '',
    cantidadReponedores: '',
    cantidadProductos: '',
    integracionesRequeridas: '',
    comentarios: '',
    aceptaPoliticas: false
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombreContacto || !formData.emailContacto || !formData.nombreEmpresa) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.telefonoContacto || formData.telefonoContacto.length < 9) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un número de teléfono válido.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cantidadSupervisores || !formData.cantidadReponedores) {
      toast({
        title: "Información incompleta",
        description: "Por favor indica la cantidad de supervisores y reponedores.",
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
      // Preparar datos para enviar al backend según schema CotizacionCreate
      const cotizacionData = {
        nombre_contacto: formData.nombreContacto,
        empresa: formData.nombreEmpresa,  // Backend espera 'empresa'
        email: formData.emailContacto,    // Backend espera 'email'
        telefono: formData.telefonoContacto || undefined,
        cantidad_supervisores: parseInt(formData.cantidadSupervisores),
        cantidad_reponedores: parseInt(formData.cantidadReponedores),
        cantidad_productos: formData.cantidadProductos ? parseInt(formData.cantidadProductos) : undefined,
        integraciones_requeridas: formData.integracionesRequeridas || undefined,
        comentarios: formData.comentarios || undefined,
      };

      // Enviar solicitud de cotización al backend
      const response = await ApiService.solicitarCotizacion(cotizacionData);

      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: `Tu cotización #${response.id_cotizacion} ha sido registrada. Nos pondremos en contacto contigo pronto.`,
      });

      // Limpiar formulario
      setFormData({
        nombreContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        nombreEmpresa: '',
        rutEmpresa: '',
        cantidadSupervisores: '',
        cantidadReponedores: '',
        cantidadProductos: '',
        integracionesRequeridas: '',
        comentarios: '',
        aceptaPoliticas: false
      });
    } catch (error: any) {
      console.error('Error al solicitar cotización:', error);
      toast({
        title: "Error al enviar solicitud",
        description: error.message || "Hubo un problema al enviar tu solicitud. Por favor intenta nuevamente.",
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
              Solicita una cotización personalizada para tu empresa
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Optimiza la gestión de reposición con POERuteo. Ruteo inteligente, seguimiento GPS en tiempo real 
              y control completo de tareas. Planes diseñados específicamente para cadenas de supermercados de todos los tamaños.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Implementación rápida</h3>
                  <p className="text-gray-600">Sistema en funcionamiento en menos de 48 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Planes escalables</h3>
                  <p className="text-gray-600">Desde pequeños equipos hasta grandes cadenas nacionales</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Soporte dedicado</h3>
                  <p className="text-gray-600">Equipo técnico disponible para resolver cualquier consulta</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Sin costos ocultos</h3>
                  <p className="text-gray-600">Cotización transparente basada en tus necesidades reales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicita una cotización</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nombreContacto}
                  onChange={(e) => handleInputChange('nombreContacto', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo corporativo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.emailContacto}
                  onChange={(e) => handleInputChange('emailContacto', e.target.value)}
                  placeholder="correo@empresa.com"
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de contacto <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.telefonoContacto}
                  onChange={(e) => handleInputChange('telefonoContacto', e.target.value)}
                  placeholder="+56 9 1234 5678"
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
                  RUT de la empresa (opcional)
                </label>
                <Input
                  type="text"
                  value={formData.rutEmpresa}
                  onChange={(e) => handleInputChange('rutEmpresa', e.target.value)}
                  placeholder="12.345.678-9"
                  className="bg-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de supervisores <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.cantidadSupervisores}
                    onValueChange={(value) => handleInputChange('cantidadSupervisores', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 supervisor</SelectItem>
                      <SelectItem value="2">2 supervisores</SelectItem>
                      <SelectItem value="3">3 supervisores</SelectItem>
                      <SelectItem value="5">5 supervisores</SelectItem>
                      <SelectItem value="10">10 supervisores</SelectItem>
                      <SelectItem value="20">20+ supervisores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de reponedores <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.cantidadReponedores}
                    onValueChange={(value) => handleInputChange('cantidadReponedores', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">1-5 reponedores</SelectItem>
                      <SelectItem value="10">6-10 reponedores</SelectItem>
                      <SelectItem value="25">11-25 reponedores</SelectItem>
                      <SelectItem value="50">26-50 reponedores</SelectItem>
                      <SelectItem value="100">51-100 reponedores</SelectItem>
                      <SelectItem value="200">101-200 reponedores</SelectItem>
                      <SelectItem value="500">Más de 200 reponedores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad aproximada de productos (opcional)
                </label>
                <Select 
                  value={formData.cantidadProductos}
                  onValueChange={(value) => handleInputChange('cantidadProductos', value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Menos de 100</SelectItem>
                    <SelectItem value="500">100-500</SelectItem>
                    <SelectItem value="1000">500-1000</SelectItem>
                    <SelectItem value="5000">1000-5000</SelectItem>
                    <SelectItem value="10000">Más de 5000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Integraciones requeridas (opcional)
                </label>
                <Input
                  type="text"
                  value={formData.integracionesRequeridas}
                  onChange={(e) => handleInputChange('integracionesRequeridas', e.target.value)}
                  placeholder="ERP, WMS, etc."
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <Textarea
                  value={formData.comentarios}
                  onChange={(e) => handleInputChange('comentarios', e.target.value)}
                  placeholder="Cuéntanos más sobre tus necesidades..."
                  rows={4}
                  className="bg-white"
                />
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  'Solicitar cotización gratuita'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingContactForm;
