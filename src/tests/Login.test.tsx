import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '@/pages/auth/Login';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    toasts: [], // Agregar array vacío de toasts para el componente Toaster
    dismiss: vi.fn(),
  }),
}));

// Mock del hook useAuth
const mockLogin = vi.fn();
const mockUseAuth = {
  user: null,
  login: mockLogin,
  logout: vi.fn(),
  isAuthenticated: false,
  loading: false,
};

// Mock del contexto de autenticación
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderLoginWithProviders = () => {
  return render(
    <MemoryRouter>
      <Login />
      <Toaster />
    </MemoryRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLogin.mockResolvedValue({}); // Por defecto, el login es exitoso
  });  it('renderiza el formulario de login correctamente', () => {
    renderLoginWithProviders();
    
    // Buscar el título específicamente como heading
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('permite escribir en los campos de correo y contraseña', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('llama a la función login cuando se envía el formulario', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        correo: 'test@example.com',
        contraseña: 'password123'
      });
    });
  });

  it('muestra estado de carga durante el login', async () => {
    // Mock que simula una promesa pendiente
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Verificar que el botón muestra estado de carga
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('maneja errores de autenticación correctamente', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'));
    
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
  it('no envía el formulario si los campos están vacíos', () => {
    renderLoginWithProviders();
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);
    
    // Al no tener valores, no debería llamar al login
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('navega correctamente después de un login exitoso', async () => {
    localStorage.setItem('userRole', 'supervisor');
    mockLogin.mockResolvedValueOnce({});
    
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'supervisor@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      expect(mockNavigate).toHaveBeenCalledWith('/supervisor-dashboard');
    });
  });  it('muestra credenciales de prueba', () => {
    renderLoginWithProviders();
    
    expect(screen.getByText('Credenciales de prueba:')).toBeInTheDocument();
    expect(screen.getByText('Administrador:')).toBeInTheDocument();
    expect(screen.getByText('Supervisor:')).toBeInTheDocument();
    expect(screen.getByText('Reponedor:')).toBeInTheDocument();
    
    // Verificar que contiene los textos de email de forma más flexible
    expect(document.body.textContent).toContain('admin@admin.com');
    expect(document.body.textContent).toContain('supervisor@supervisor.com');
    expect(document.body.textContent).toContain('reponedor@reponedor.com');
  });
});
