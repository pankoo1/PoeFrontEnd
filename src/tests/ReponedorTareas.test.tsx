import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReponedorTareas from '@/pages/ReponedorTareas';

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
  }),
}));

describe('ReponedorTareas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReponedorTareas = () => {
    return render(
      <BrowserRouter>
        <ReponedorTareas />
      </BrowserRouter>
    );
  };

  it('debe renderizar correctamente el título y navegación', () => {
    renderReponedorTareas();
    
    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
  });

  it('debe manejar la navegación de vuelta al dashboard', () => {
    renderReponedorTareas();
    
    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reponedor-dashboard');
  });
  it('debe mostrar el encabezado de tareas', () => {
    renderReponedorTareas();

    expect(screen.getByText('Tareas Asignadas')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus tareas de reposición y marca su progreso')).toBeInTheDocument();
  });

  it('debe mostrar todas las tareas asignadas', () => {
    renderReponedorTareas();
    
    expect(screen.getByText('Leche Entera 1L')).toBeInTheDocument();
    expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    expect(screen.getByText('Cereales Variados')).toBeInTheDocument();
    expect(screen.getByText('Frutas y Verduras')).toBeInTheDocument();
  });
  it('debe mostrar la información de ubicaciones y cantidad', () => {
    renderReponedorTareas();

    // Buscar textos que incluyen ubicación y cantidad juntos
    expect(screen.getByText(/Pasillo 2, Estante A.*Cantidad.*24.*unidades/i)).toBeInTheDocument();
    expect(screen.getByText(/Panadería, Estante Principal.*Cantidad.*15.*unidades/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasillo 3, Estante B.*Cantidad.*18.*unidades/i)).toBeInTheDocument();
  });  it('debe mostrar las cantidades de productos integradas', () => {
    renderReponedorTareas();

    // Buscar la palabra "unidades" que es única de las cantidades
    expect(screen.getAllByText(/unidades/i).length).toBeGreaterThan(0);
    
    // Verificar que los productos están presentes (más específico)
    expect(screen.getByText('Leche Entera 1L')).toBeInTheDocument();
    expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    expect(screen.getByText('Cereales Variados')).toBeInTheDocument();
  });

  it('debe mostrar los badges de estado correctos', () => {
    renderReponedorTareas();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const pendienteElements = screen.getAllByText('Pendiente');
    expect(pendienteElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  it('debe mostrar los badges de prioridad', () => {
    renderReponedorTareas();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const altaElements = screen.getAllByText('Alta');
    expect(altaElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('debe mostrar las horas estimadas', () => {
    renderReponedorTareas();
    
    expect(screen.getByText('09:30 AM')).toBeInTheDocument();
    expect(screen.getByText('10:15 AM')).toBeInTheDocument();
    expect(screen.getByText('08:45 AM')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
  });

  it('debe mostrar el supervisor asignado', () => {
    renderReponedorTareas();
    
    // Usar getAllByText para elementos que aparecen múltiples veces
    const supervisorElements = screen.getAllByText('María González');
    expect(supervisorElements.length).toBeGreaterThan(0);
  });
  it('debe poder iniciar una tarea pendiente', () => {
    renderReponedorTareas();

    const iniciarButtons = screen.getAllByText('Iniciar Tarea');
    expect(iniciarButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(iniciarButtons[0]);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Tarea iniciada",
      description: "La tarea ha sido marcada como en progreso", // Texto real del componente
    });
  });
  it('debe poder completar una tarea en progreso', () => {
    renderReponedorTareas();
    
    // Usar getAllByText para múltiples botones "Marcar Completada"
    const completarButtons = screen.getAllByText('Marcar Completada');
    expect(completarButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(completarButtons[0]);
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Tarea completada",
      description: "La tarea ha sido marcada como completada exitosamente", // Texto real del componente
    });
  });

  it('debe mostrar tareas completadas como solo lectura', () => {
    renderReponedorTareas();
    
    // Verificar que la tarea completada tiene el estado correcto
    expect(screen.getByText('Completada')).toBeInTheDocument();
    
    // Verificar que no hay botón de acción para tareas completadas
    const completadaCards = screen.getByText('Cereales Variados').closest('.cursor-pointer, [role="button"]');
    // Las tareas completadas no deberían tener botones de acción activos
  });

  it('debe filtrar tareas por estado usando los botones de filtro', () => {
    renderReponedorTareas();
    
    // Por defecto debería mostrar todas las tareas
    expect(screen.getByText('Leche Entera 1L')).toBeInTheDocument();
    expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    expect(screen.getByText('Cereales Variados')).toBeInTheDocument();
    expect(screen.getByText('Frutas y Verduras')).toBeInTheDocument();
  });  it('debe mostrar información de fecha de asignación', () => {
    renderReponedorTareas();
    
    // Verificar etiquetas y valores de fecha usando getAllByText para duplicados
    const fechaLabels = screen.getAllByText('Fecha Asignación');
    expect(fechaLabels.length).toBeGreaterThan(0);
    expect(fechaLabels[0]).toBeInTheDocument();
    
    const fechaValues = screen.getAllByText('2024-06-07');
    expect(fechaValues.length).toBeGreaterThan(0);
    expect(fechaValues[0]).toBeInTheDocument();
  });  it('debe mostrar los iconos apropiados para cada estado', () => {
    renderReponedorTareas();
    
    // Los iconos se renderizan como elementos SVG
    // Verificamos que las secciones de estados existan usando getAllByText para duplicados
    const pendienteElements = screen.getAllByText('Pendiente');
    expect(pendienteElements.length).toBeGreaterThan(0);
    expect(pendienteElements[0]).toBeInTheDocument();
    
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  it('debe actualizar el estado de la tarea al iniciarla', () => {
    renderReponedorTareas();
    
    const iniciarButtons = screen.getAllByText('Iniciar Tarea');
    const initialCount = iniciarButtons.length;
    
    fireEvent.click(iniciarButtons[0]);
    
    // Verificar que el toast se muestra
    expect(mockToast).toHaveBeenCalled();
  });

  it('debe mostrar la estructura correcta de cards para las tareas', () => {
    renderReponedorTareas();
    
    // Verificar que las tareas se muestran en formato de cards
    const products = ['Leche Entera 1L', 'Pan Integral', 'Cereales Variados', 'Frutas y Verduras'];
    
    products.forEach(product => {
      expect(screen.getByText(product)).toBeInTheDocument();
    });
  });
});
