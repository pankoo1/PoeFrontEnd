import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SupervisorDashboard from '../pages/SupervisorDashboard';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === 'object' && actual !== null ? actual : {}),
    useNavigate: () => mockNavigate,
  };
});

describe('SupervisorDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renderiza los accesos principales del dashboard de supervisor', () => {
    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Panel de Supervisión')).toBeInTheDocument();
    expect(screen.getByText('Reponedores')).toBeInTheDocument();
    expect(screen.getByText('Tareas')).toBeInTheDocument();
    expect(screen.getByText('Rutas')).toBeInTheDocument();
    expect(screen.getByText('Mapa Interactivo')).toBeInTheDocument();
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('navega correctamente al hacer click en las tarjetas y botones', () => {
    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Reponedores'));
    expect(mockNavigate).toHaveBeenCalledWith('/reponedores');
    fireEvent.click(screen.getByText('Tareas'));
    expect(mockNavigate).toHaveBeenCalledWith('/tareas');
    fireEvent.click(screen.getByText('Rutas'));
    expect(mockNavigate).toHaveBeenCalledWith('/rutas');
    fireEvent.click(screen.getByText('Mapa Interactivo'));
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor-map');
    fireEvent.click(screen.getByText('Mi Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor-profile');
  });

  it('permite hacer logout y limpiar localStorage', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'supervisor');
    localStorage.setItem('userName', 'Supervisor');
    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
