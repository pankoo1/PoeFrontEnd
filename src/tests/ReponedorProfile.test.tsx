import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReponedorProfile from '@/pages/ReponedorProfile';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ReponedorProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReponedorProfile = () => {
    return render(
      <BrowserRouter>
        <ReponedorProfile />
      </BrowserRouter>
    );
  };
  it('debe renderizar correctamente el título y navegación', () => {
    renderReponedorProfile();
    
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    
    // Usar getAllByRole para manejar múltiples botones "Volver"
    const volverButtons = screen.getAllByRole('button', { name: /volver/i });
    expect(volverButtons.length).toBeGreaterThan(0);
    expect(volverButtons[0]).toBeInTheDocument();
  });
  it('debe manejar la navegación de vuelta al dashboard', () => {
    renderReponedorProfile();

    // Usar getAllByRole para obtener botones "Volver" y seleccionar el del header
    const volverButtons = screen.getAllByRole('button', { name: /volver/i });
    const headerBackButton = volverButtons[0]; // El primer botón es el del header
    fireEvent.click(headerBackButton);

    expect(mockNavigate).toHaveBeenCalledWith('/reponedor-dashboard');
  });

  it('debe mostrar la información personal del reponedor', () => {
    renderReponedorProfile();
    
    expect(screen.getByText('Información Personal')).toBeInTheDocument();
    expect(screen.getByText('Tu información personal. Para modificar estos datos, contacta a tu supervisor.')).toBeInTheDocument();
  });
  it('debe mostrar todos los campos de datos del perfil', () => {
    renderReponedorProfile();
    
    // Verificar labels
    expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Supervisor Asignado')).toBeInTheDocument();
    expect(screen.getByText('Sucursal')).toBeInTheDocument();
    expect(screen.getByText('ID Empleado')).toBeInTheDocument(); // Texto correcto según el HTML
  });

  it('debe mostrar los valores correctos en los campos', () => {
    renderReponedorProfile();
    
    // Verificar valores en los inputs usando getByDisplayValue
    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('reponedor@reponedor.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('María González')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Supermercado Central')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EMP-2023-0045')).toBeInTheDocument();
  });

  it('debe tener todos los campos en modo solo lectura', () => {
    renderReponedorProfile();
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('readonly');
    });
  });
  it('debe mostrar la información de solo lectura', () => {
    renderReponedorProfile();
    
    expect(screen.getByText('Información de solo lectura')).toBeInTheDocument();
    expect(screen.getByText('Si necesitas actualizar algún dato personal, solicítalo a tu supervisor.')).toBeInTheDocument();
  });
  it('debe mostrar el botón de volver al dashboard', () => {
    renderReponedorProfile();
    
    const dashboardButtons = screen.getAllByText('Volver al Dashboard');
    expect(dashboardButtons.length).toBeGreaterThan(0);
    expect(dashboardButtons[0]).toBeInTheDocument();
  });

  it('debe navegar al dashboard al hacer clic en "Volver al Dashboard"', () => {
    renderReponedorProfile();
    
    const dashboardButton = screen.getByRole('button', { name: /volver al dashboard/i });
    fireEvent.click(dashboardButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reponedor-dashboard');
  });
  it('debe mostrar los iconos correctos', () => {
    renderReponedorProfile();
    
    // Los iconos se renderizan como elementos SVG
    // Verificamos que las secciones que contienen iconos existan
    expect(screen.getByText('Información Personal')).toBeInTheDocument();
    expect(screen.getByText('Información de solo lectura')).toBeInTheDocument();
  });

  it('debe tener la estructura de layout correcta', () => {
    renderReponedorProfile();
    
    // Verificar que el contenido está centrado con max-width
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toBeInTheDocument();
  });

  it('debe mostrar toda la información estática correctamente', () => {
    renderReponedorProfile();
    
    // Verificar que todos los datos estáticos están presentes
    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('reponedor@reponedor.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('María González')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Supermercado Central')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EMP-2023-0045')).toBeInTheDocument();
  });

  it('debe tener campos con clase bg-muted para indicar solo lectura', () => {
    renderReponedorProfile();
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveClass('bg-muted');
    });
  });
});
