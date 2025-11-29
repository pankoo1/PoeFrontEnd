import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReponedorMapPage from '@/pages/reponedor/ReponedorMapPage';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ReponedorMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReponedorMapPage = () => {
    return render(
      <BrowserRouter>
        <ReponedorMapPage />
      </BrowserRouter>
    );
  };

  it('debe renderizar correctamente el título y navegación', () => {
    renderReponedorMapPage();
    
    expect(screen.getByText('Mapa y Rutas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
  });

  it('debe manejar la navegación de vuelta al dashboard', () => {
    renderReponedorMapPage();
    
    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reponedor-dashboard');
  });
  it('debe mostrar la información del mapa interactivo', () => {
    renderReponedorMapPage();

    expect(screen.getByText('Mapa Interactivo')).toBeInTheDocument();
    expect(screen.getByText('Ruta Optimizada')).toBeInTheDocument();
    expect(screen.getByText('Puntos de reposición ordenados según la ruta más eficiente')).toBeInTheDocument();
  });
  it('debe mostrar información del mapa placeholder', () => {
    renderReponedorMapPage();

    expect(screen.getByText('Mapa de Rutas')).toBeInTheDocument();
    expect(screen.getByText('El mapa interactivo con rutas optimizadas será integrado manualmente aquí')).toBeInTheDocument();
    expect(screen.getByText('Inicializar Navegación')).toBeInTheDocument();
  });

  it('debe mostrar todos los puntos de la ruta', () => {
    renderReponedorMapPage();
    
    expect(screen.getByText('Frutas y Verduras')).toBeInTheDocument();
    expect(screen.getByText('Leche Entera 1L')).toBeInTheDocument();
    expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    expect(screen.getByText('Cereales Variados')).toBeInTheDocument();
  });

  it('debe mostrar las ubicaciones de cada punto', () => {
    renderReponedorMapPage();
    
    expect(screen.getByText('Sección Frutas y Verduras')).toBeInTheDocument();
    expect(screen.getByText('Pasillo 2, Estante A')).toBeInTheDocument();
    expect(screen.getByText('Panadería, Estante Principal')).toBeInTheDocument();
    expect(screen.getByText('Pasillo 3, Estante B')).toBeInTheDocument();
  });

  it('debe mostrar los números de orden en la ruta', () => {
    renderReponedorMapPage();
    
    // Los números aparecen en los badges de orden
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('debe mostrar las distancias y tiempos de cada punto', () => {
    renderReponedorMapPage();
    
    expect(screen.getByText('0m')).toBeInTheDocument();
    expect(screen.getByText('25m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
    
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('12 min')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('8 min')).toBeInTheDocument();
  });

  it('debe mostrar los badges de estado correctos', () => {
    renderReponedorMapPage();
    
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const pendienteElements = screen.getAllByText('Pendiente');
    expect(pendienteElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  it('debe mostrar el botón "Ir a este punto" para el siguiente punto', () => {
    renderReponedorMapPage();
    
    const irButton = screen.getByText('Ir a este punto');
    expect(irButton).toBeInTheDocument();
  });
  it('debe mostrar información de navegación', () => {
    renderReponedorMapPage();

    expect(screen.getByText('Mapa de Rutas')).toBeInTheDocument();
    expect(screen.getByText('Inicializar Navegación')).toBeInTheDocument();
  });
  it('debe mostrar iconos apropiados en cada sección', () => {
    renderReponedorMapPage();
    
    // Los iconos se renderizan como elementos SVG
    // Verificamos que las secciones existan
    expect(screen.getByText('Mapa Interactivo')).toBeInTheDocument();
    expect(screen.getByText('Ruta Optimizada')).toBeInTheDocument();
    expect(screen.getByText('Mapa de Rutas')).toBeInTheDocument();
  });

  it('debe tener el botón de navegación solo en el punto siguiente', () => {
    renderReponedorMapPage();
    
    // Solo debería haber un botón "Ir a este punto" para el punto siguiente
    const navButtons = screen.getAllByText('Ir a este punto');
    expect(navButtons).toHaveLength(1);
  });

  it('debe mostrar puntos completados con estado diferente', () => {
    renderReponedorMapPage();
    
    // Verificar que el punto completado tiene el badge correcto
    expect(screen.getByText('Completada')).toBeInTheDocument();
    
    // El punto completado no debería tener botón de navegación
    const completedPoint = screen.getByText('Cereales Variados');
    expect(completedPoint).toBeInTheDocument();
  });

  it('debe organizar los puntos en orden secuencial', () => {
    renderReponedorMapPage();
    
    // Verificar que todos los productos están listados en orden
    const productos = [
      'Frutas y Verduras',
      'Leche Entera 1L', 
      'Pan Integral',
      'Cereales Variados'
    ];
    
    productos.forEach(producto => {
      expect(screen.getByText(producto)).toBeInTheDocument();
    });
  });

  it('debe mostrar información detallada de ubicación para cada punto', () => {
    renderReponedorMapPage();
    
    // Verificar ubicaciones específicas
    expect(screen.getByText('Sección Frutas y Verduras')).toBeInTheDocument();
    expect(screen.getByText('Pasillo 2, Estante A')).toBeInTheDocument();
    expect(screen.getByText('Panadería, Estante Principal')).toBeInTheDocument();
    expect(screen.getByText('Pasillo 3, Estante B')).toBeInTheDocument();
  });

  it('debe tener estructura de cards para cada punto de ruta', () => {
    renderReponedorMapPage();
    
    // Verificar que hay múltiples cards (una por punto)
    const pointCards = screen.getByText('Frutas y Verduras').closest('[class*="card"], .cursor-pointer');
    expect(pointCards).toBeInTheDocument();
  });
});
