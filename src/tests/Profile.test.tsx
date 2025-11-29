import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '@/pages/common/Profile';
import * as api from '@/services/api';
import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

vi.mock('../services/api');

const mockProfile = {
  id_usuario: 1,
  nombre: 'Juan Pérez',
  correo: 'juan@test.com',
  rol: 'Supervisor',
  estado: 'activo',
};

describe('Pruebas de caja negra: Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.ApiService.getProfile as any).mockResolvedValue(mockProfile);
    (api.ApiService.updateProfile as any).mockResolvedValue({ ...mockProfile, nombre: 'Juan Actualizado' });
  });

  it('muestra los datos del perfil al cargar', async () => {
    render(
      <MemoryRouter>
        <>
          <Profile />
          <Toaster />
        </>
      </MemoryRouter>
    );
    expect(await screen.findByDisplayValue('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('juan@test.com')).toBeInTheDocument();
  });

  // Puedes agregar más pruebas de edición, validación y mensajes aquí
});
