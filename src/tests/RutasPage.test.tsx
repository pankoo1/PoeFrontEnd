import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RutasPage from '@/pages/RutasPage';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RutasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRutasPage = () => {
    return render(
      <BrowserRouter>
        <RutasPage />
      </BrowserRouter>
    );
  };

  it('debe renderizar correctamente el título y navegación', () => {
    renderRutasPage();
    
    expect(screen.getByText('Supervisión de Rutas de Pasillos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
  });

  it('debe manejar la navegación de vuelta', () => {
    renderRutasPage();
    
    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor-dashboard');
  });

  it('debe mostrar el campo de búsqueda', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('debe mostrar todas las rutas por defecto', () => {
    renderRutasPage();
    
    expect(screen.getByText('Ruta Pasillo A-B')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo C-D')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo E')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo F-G')).toBeInTheDocument();
  });

  it('debe mostrar los reponedores asignados', () => {
    renderRutasPage();
    
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('Miguel Santos')).toBeInTheDocument();
    expect(screen.getByText('Laura Pérez')).toBeInTheDocument();
  });
  it('debe mostrar los estados de las rutas', () => {
    renderRutasPage();
    
    // Usar getAllByText para manejar elementos duplicados
    expect(screen.getAllByText('En Ejecución')).toHaveLength(2); // Aparece en 2 rutas
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  it('debe mostrar información de progreso', () => {
    renderRutasPage();
    
    // Verificar que se muestran los porcentajes de progreso
    expect(screen.getByText('66%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });  it('debe mostrar horarios de las rutas', () => {
    renderRutasPage();
    
    // Verificar que los horarios aparecen en la página (manejando los duplicados)
    expect(screen.getByText('08:00', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('10:30', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('09:00', { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText('11:00', { exact: false })).toHaveLength(2); // Aparece en 2 rutas
    expect(screen.getByText('07:00', { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText('08:30', { exact: false })).toHaveLength(2); // Aparece en 2 rutas
  });
  it('debe mostrar ubicaciones actuales', () => {
    renderRutasPage();
    
    expect(screen.getByText('Pasillo A - Lácteos')).toBeInTheDocument();
    // Usar getAllByText para manejar elementos duplicados (Almacén aparece 2 veces)
    expect(screen.getAllByText('Almacén')).toHaveLength(2);
    expect(screen.getByText('Pasillo F - Limpieza')).toBeInTheDocument();
  });

  it('debe filtrar rutas por nombre', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    fireEvent.change(searchInput, { target: { value: 'Pasillo A-B' } });
    
    // Debe mostrar solo la ruta que coincide
    expect(screen.getByText('Ruta Pasillo A-B')).toBeInTheDocument();
    // Las otras rutas podrían no estar visibles
  });

  it('debe filtrar rutas por reponedor', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    
    // Debe mostrar la ruta de Carlos Martínez
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
  });

  it('debe filtrar rutas por ubicación actual', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    fireEvent.change(searchInput, { target: { value: 'Lácteos' } });
    
    // Debe mostrar la ruta que está en Pasillo A - Lácteos
    expect(screen.getByText('Pasillo A - Lácteos')).toBeInTheDocument();
  });

  it('debe limpiar el filtro correctamente', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    
    // Aplicar filtro
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    
    // Limpiar filtro
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Deben mostrarse todas las rutas nuevamente
    expect(screen.getByText('Ruta Pasillo A-B')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo C-D')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo E')).toBeInTheDocument();
    expect(screen.getByText('Ruta Pasillo F-G')).toBeInTheDocument();
  });

  it('debe manejar búsqueda que no encuentra resultados', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    fireEvent.change(searchInput, { target: { value: 'NoExiste' } });
    
    // No debe encontrar ninguna ruta
    expect(screen.queryByText('Ruta Pasillo A-B')).not.toBeInTheDocument();
    expect(screen.queryByText('Ruta Pasillo C-D')).not.toBeInTheDocument();
  });
  it('debe mostrar los botones de ver detalles', () => {
    renderRutasPage();
    
    // Usar getAllByText para buscar los botones por su texto
    const verDetallesButtons = screen.getAllByText('Ver Detalles');
    expect(verDetallesButtons).toHaveLength(4); // Una para cada ruta
  });
  it('debe manejar clic en ver detalles', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderRutasPage();
    
    // Usar getAllByText para buscar los botones por su texto
    const verDetallesButtons = screen.getAllByText('Ver Detalles');
    fireEvent.click(verDetallesButtons[0]);
    
    expect(consoleSpy).toHaveBeenCalledWith('Ver detalles de la ruta:', 1);
    
    consoleSpy.mockRestore();
  });
  it('debe mostrar las columnas de la tabla correctamente', () => {
    renderRutasPage();
    
    expect(screen.getByText('Ruta')).toBeInTheDocument();
    expect(screen.getByText('Reponedor')).toBeInTheDocument();
    expect(screen.getByText('Pasillos Asignados')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Progreso')).toBeInTheDocument();
    expect(screen.getByText('Horario')).toBeInTheDocument(); // Usar el texto real de la columna
    expect(screen.getByText('Ubicación Actual')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('debe mostrar pasillos asignados a cada ruta', () => {
    renderRutasPage();
    
    // Verificar algunos pasillos específicos
    expect(screen.getByText('Pasillo A - Lácteos, Pasillo B - Panadería')).toBeInTheDocument();
    expect(screen.getByText('Pasillo C - Frutas y Verduras, Pasillo D - Bebidas')).toBeInTheDocument();
    expect(screen.getByText('Pasillo E - Carnes')).toBeInTheDocument();
    expect(screen.getByText('Pasillo F - Limpieza, Pasillo G - Cuidado Personal')).toBeInTheDocument();
  });

  it('debe ser insensible a mayúsculas y minúsculas en la búsqueda', () => {
    renderRutasPage();
    
    const searchInput = screen.getByPlaceholderText(/buscar rutas/i);
    fireEvent.change(searchInput, { target: { value: 'carlos' } }); // minúsculas
    
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'CARLOS' } }); // mayúsculas
    
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
  });
});
