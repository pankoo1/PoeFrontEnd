import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/shared/Logo';
import { ShieldCheck, Radar, Route, Sparkles } from 'lucide-react';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ correo, contraseña });
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      
      // Obtener el rol del usuario y redirigir según corresponda
      const userRole = localStorage.getItem('userRole');
      switch(userRole) {
        case 'superadmin':
          navigate('/backoffice');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        case 'supervisor':
          navigate('/supervisor-dashboard');
          break;
        case 'reponedor':
          navigate('/reponedor-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0 bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-slate-900/60 to-blue-900/70" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(120,119,198,0.20), transparent 35%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.15), transparent 30%), radial-gradient(circle at 50% 80%, rgba(14,165,233,0.18), transparent 35%)" }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10 lg:px-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          {/* Panel izquierdo: narrativa y beneficios */}
          <div className="hidden lg:flex flex-col gap-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                <Logo size="lg" showText={false} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">Plataforma POE</p>
                <h1 className="text-3xl font-semibold leading-tight">Optimiza tiendas, rutas y stock en una sola vista</h1>
              </div>
            </div>

            <p className="text-base text-slate-200/80 leading-relaxed max-w-xl">
              Accede al backoffice unificado para orquestar rutas, supervisar reposición y controlar el inventario en tiempo real. Diseñado para retail exigente con visibilidad total y decisiones rápidas.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-xl">
              {[{
                icon: <ShieldCheck className="w-5 h-5" />, label: 'Seguridad multi-tenant', desc: 'Contexto de empresa y roles protegidos'
              }, {
                icon: <Radar className="w-5 h-5" />, label: 'Monitoreo vivo', desc: 'Estado de tareas y reposición en segundos'
              }, {
                icon: <Route className="w-5 h-5" />, label: 'Rutas optimizadas', desc: 'Menos pasillos, más reposición'
              }, {
                icon: <Sparkles className="w-5 h-5" />, label: 'UX consistente', desc: 'UI alineada con módulos y landing'
              }].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-md">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="p-2 rounded-xl bg-white/10 border border-white/10">{item.icon}</span>
                    {item.label}
                  </div>
                  <p className="text-xs text-slate-200/80 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho: formulario */}
          <div className="w-full">
            <Card className="relative overflow-hidden border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-400/5 to-cyan-400/10" />
              <CardHeader className="relative z-10 space-y-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <Logo size="md" showText={false} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-200/70">Acceso</p>
                    <CardTitle className="text-2xl font-bold text-white">Inicia sesión</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-slate-200/80 leading-relaxed">
                  Ingresa con tus credenciales para administrar operaciones, rutas y equipos dentro de POE.
                </p>
              </CardHeader>

              <CardContent className="relative z-10 space-y-6 pt-2 pb-8 px-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="correo" className="text-sm font-semibold text-slate-100">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      autoComplete="username"
                      placeholder="admin@empresa.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      className="h-11 text-base border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contraseña" className="text-sm font-semibold text-slate-100">Contraseña</Label>
                    <Input
                      id="contraseña"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      required
                      className="h-11 text-base border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-base font-semibold rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-slate-950 hover:brightness-110 transition-all duration-200 shadow-lg shadow-blue-900/40"
                  >
                    {isLoading ? 'Iniciando sesión…' : 'Entrar a POE'}
                  </Button>
                </form>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-200/70">¿Eres nuevo?</p>
                  <p className="text-sm text-slate-200/80 leading-relaxed">
                    Conoce la propuesta completa de POE, casos de uso y beneficios en la landing principal.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-10 bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                    onClick={() => navigate('/')}
                  >
                    Ir a la landing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
