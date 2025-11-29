import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NotFound from '@/pages/common/NotFound';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock de console.error para verificar que se registra el error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotFound', () => {
  afterEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('renderiza la página 404 correctamente', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    expect(screen.getByText('Return to Home')).toBeInTheDocument();
  });

  it('muestra el enlace para volver al inicio', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /return to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('registra el error 404 en la consola', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/ruta-inexistente'
    );
  });

  it('muestra los estilos correctos para la página de error', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    const container = screen.getByText('404').closest('div')?.parentElement;
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-100');
    
    const title = screen.getByText('404');
    expect(title).toHaveClass('text-4xl', 'font-bold', 'mb-4');
  });  it('maneja diferentes rutas inexistentes', () => {
    // Primer renderizado con una ruta
    render(
      <MemoryRouter initialEntries={['/otra-ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/otra-ruta-inexistente'
    );

    // Limpiar y renderizar un componente completamente nuevo con otra ruta
    mockConsoleError.mockClear();

    render(
      <MemoryRouter initialEntries={['/admin/ruta-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/admin/ruta-inexistente'
    );
  });
});
