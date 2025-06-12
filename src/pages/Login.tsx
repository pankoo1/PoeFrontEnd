
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificar usuarios en localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find(u => u.email === email && u.password === password);

    setTimeout(() => {
      // Verificar credenciales predeterminadas
      if (email === 'admin@admin.com' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Administrador');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al panel de administración",
        });
        navigate('/dashboard');
      } else if (email === 'supervisor@supervisor.com' && password === 'supervisor123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'supervisor');
        localStorage.setItem('userName', 'Supervisor Principal');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al panel de supervisión",
        });
        navigate('/supervisor-dashboard');
      } else if (email === 'reponedor@reponedor.com' && password === 'reponedor123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'reponedor');
        localStorage.setItem('userName', 'Juan Pérez');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido a tu panel de trabajo",
        });
        navigate('/reponedor-dashboard');
      } 
      // Verificar si es un usuario registrado en localStorage
      else if (user) {
        // Verificar si el usuario está activo
        if (user.status === 'Inactivo') {
          toast({
            title: "Acceso denegado",
            description: "Tu cuenta está inactiva. Contacta al administrador.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const role = user.role === 'Supervisor' ? 'supervisor' : 'reponedor';
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role.toLowerCase());
        localStorage.setItem('userName', user.name);
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido ${user.name}`,
        });
        
        // Redirigir según el rol
        if (role === 'supervisor') {
          navigate('/supervisor-dashboard');
        } else {
          navigate('/reponedor-dashboard');
        }
      } else {
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground text-center">
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Credenciales de prueba:</p>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Administrador:</p>
                  <p>Email: admin@admin.com</p>
                  <p>Contraseña: admin123</p>
                </div>
                <div>
                  <p className="font-medium">Supervisor:</p>
                  <p>Email: supervisor@supervisor.com</p>
                  <p>Contraseña: supervisor123</p>
                </div>
                <div>
                  <p className="font-medium">Reponedor:</p>
                  <p>Email: reponedor@reponedor.com</p>
                  <p>Contraseña: reponedor123</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
