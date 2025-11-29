import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SupervisorProfile from '@/pages/supervisor/SupervisorProfile';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import * as api from '@/services/api';

vi.mock('../services/api');

const mockProfile = {
  nombre: 'Supervisor Test',
  correo: 'supervisor@test.com',
  rol: 'Supervisor',
  estado: 'activo',
};

describe('SupervisorProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.ApiService.getSupervisorProfile as any).mockResolvedValue(mockProfile);
    (api.ApiService.updateSupervisorProfile as any).mockResolvedValue(mockProfile);
  });

  it('renderiza los datos del perfil del supervisor', async () => {
    render(
      <MemoryRouter>
        <SupervisorProfile />
      </MemoryRouter>
    );
    expect(await screen.findByDisplayValue('Supervisor Test')).toBeInTheDocument();
    expect(screen.getByLabelText(/Rol/i)).toHaveValue('Supervisor');
    expect(screen.getByDisplayValue('supervisor@test.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toHaveValue('activo');
  });

  it('muestra mensaje de error si falla la carga', async () => {
    (api.ApiService.getSupervisorProfile as any).mockRejectedValue(new Error('Error de red'));
    render(
      <MemoryRouter>
        <>
          <SupervisorProfile />
          <Toaster />
        </>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Error al cargar perfil/i);
    });
  });

  it('permite editar y guardar el perfil', async () => {
    render(
      <MemoryRouter>
        <SupervisorProfile />
      </MemoryRouter>
    );
    // Espera a que cargue el perfil
    await screen.findByDisplayValue('Supervisor Test');
    // Haz click en el botón de editar
    fireEvent.click(screen.getByText(/Editar/i));
    // Cambia el nombre
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Nuevo Nombre' } });
    // Haz click en guardar
    fireEvent.click(screen.getByText(/Guardar/i));
    await waitFor(() => {
      expect(api.ApiService.updateSupervisorProfile).toHaveBeenCalled();
    });
  });
});
