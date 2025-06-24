import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renderiza los accesos principales del dashboard', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Productos')).toBeInTheDocument();
    expect(screen.getByText('Mapa Interactivo')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Tareas')).toBeInTheDocument();
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('permite hacer logout y limpiar localStorage', () => {
    localStorage.setItem('user', 'test');
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navega correctamente al hacer click en las tarjetas y botones', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Gestión de Usuarios'));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
    fireEvent.click(screen.getByText('Gestión de Productos'));
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    fireEvent.click(screen.getByText('Mapa Interactivo'));
    expect(mockNavigate).toHaveBeenCalledWith('/map');
    fireEvent.click(screen.getByText('Reportes'));
    expect(mockNavigate).toHaveBeenCalledWith('/reportes');
    fireEvent.click(screen.getByText('Gestión de Tareas'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin-tareas');
    fireEvent.click(screen.getByText('Mi Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
