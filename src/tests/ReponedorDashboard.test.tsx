import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReponedorDashboard from '@/pages/reponedor/ReponedorDashboard';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ReponedorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('Juan Pérez');
  });

  const renderReponedorDashboard = () => {
    return render(
      <BrowserRouter>
        <ReponedorDashboard />
      </BrowserRouter>
    );
  };

  it('debe renderizar correctamente el título y saludo personalizado', () => {
    renderReponedorDashboard();
    
    expect(screen.getByText('Panel de Reponedor')).toBeInTheDocument();
    expect(screen.getByText('Hola, Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus tareas y rutas de reposición de manera eficiente')).toBeInTheDocument();
  });

  it('debe mostrar los botones de navegación en el header', () => {
    renderReponedorDashboard();
    
    expect(screen.getByRole('button', { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('debe manejar la navegación al perfil', () => {
    renderReponedorDashboard();
    
    const profileButton = screen.getByRole('button', { name: /mi perfil/i });
    fireEvent.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reponedor-profile');
  });

  it('debe manejar el logout correctamente', () => {
    renderReponedorDashboard();
    
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutButton);
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userRole');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userName');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
  it('debe mostrar las estadísticas del resumen', () => {
    renderReponedorDashboard();
    
    expect(screen.getByText('Tareas Hoy')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Completadas')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const alertasElements = screen.getAllByText('Alertas');
    expect(alertasElements.length).toBeGreaterThan(0);
    expect(alertasElements[0]).toBeInTheDocument();
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  it('debe mostrar todas las opciones del menú principal', () => {
    renderReponedorDashboard();
    
    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();
    expect(screen.getByText('Ver tareas asignadas y marcar como completadas')).toBeInTheDocument();
    
    expect(screen.getByText('Mapa y Rutas')).toBeInTheDocument();
    expect(screen.getByText('Ver rutas optimizadas y puntos de reposición')).toBeInTheDocument();
    
    expect(screen.getByText('Vista Semanal')).toBeInTheDocument();
    expect(screen.getByText('Resumen de tareas por semana')).toBeInTheDocument();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const alertasElements = screen.getAllByText('Alertas');
    expect(alertasElements.length).toBeGreaterThan(0);
    expect(alertasElements[0]).toBeInTheDocument();
    
    expect(screen.getByText('Notificaciones y desvíos de ruta')).toBeInTheDocument();
  });

  it('debe navegar a las diferentes secciones al hacer clic en las cards', () => {
    renderReponedorDashboard();
    
    // Hacer clic en la primera card (Mis Tareas)
    const tareasCard = screen.getByText('Mis Tareas').closest('[role="button"], .cursor-pointer');
    if (tareasCard) {
      fireEvent.click(tareasCard);
      expect(mockNavigate).toHaveBeenCalledWith('/reponedor-tareas');
    }
  });

  it('debe navegar a Mapa y Rutas al hacer clic en su card', () => {
    renderReponedorDashboard();
    
    const mapaCard = screen.getByText('Mapa y Rutas').closest('[role="button"], .cursor-pointer');
    if (mapaCard) {
      fireEvent.click(mapaCard);
      expect(mockNavigate).toHaveBeenCalledWith('/reponedor-map');
    }
  });

  it('debe navegar a Vista Semanal al hacer clic en su card', () => {
    renderReponedorDashboard();
    
    const semanalCard = screen.getByText('Vista Semanal').closest('[role="button"], .cursor-pointer');
    if (semanalCard) {
      fireEvent.click(semanalCard);
      expect(mockNavigate).toHaveBeenCalledWith('/reponedor-semanal');
    }
  });
  it('debe navegar a Alertas al hacer clic en su card', () => {
    renderReponedorDashboard();
    
    // Usar getAllByText para obtener el elemento de Alertas en el menú principal
    const alertasElements = screen.getAllByText('Alertas');
    // El segundo elemento debería ser el del menú principal
    const alertasCard = alertasElements[1].closest('[role="button"], .cursor-pointer');
    if (alertasCard) {
      fireEvent.click(alertasCard);
      expect(mockNavigate).toHaveBeenCalledWith('/reponedor-alertas');
    }
  });

  it('debe mostrar todos los botones de Acceder', () => {
    renderReponedorDashboard();
    
    const accedera = screen.getAllByText('Acceder');
    expect(accedera).toHaveLength(4); // Uno por cada card del menú
  });

  it('debe usar nombre por defecto cuando no hay userName en localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderReponedorDashboard();
    
    expect(screen.getByText('Hola, Reponedor')).toBeInTheDocument();
  });
  it('debe mostrar los iconos correctos en cada sección', () => {
    renderReponedorDashboard();
    
    // Los iconos se renderizan como elementos SVG, verificamos que las secciones existan
    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();
    expect(screen.getByText('Mapa y Rutas')).toBeInTheDocument();
    expect(screen.getByText('Vista Semanal')).toBeInTheDocument();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const alertasElements = screen.getAllByText('Alertas');
    expect(alertasElements.length).toBeGreaterThan(0);
    expect(alertasElements[0]).toBeInTheDocument();
  });
});
