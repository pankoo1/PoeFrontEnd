import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Users from '@/pages/admin/Users';
import * as api from '@/services/api';
import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { within } from '@testing-library/react';

// Mock de ApiService
vi.mock('../services/api');

const mockUsuarios = [
  { id_usuario: 1, nombre: 'Juan Pérez', correo: 'juan@test.com', rol: 'Supervisor', estado: 'activo' },
  { id_usuario: 2, nombre: 'Ana López', correo: 'ana@test.com', rol: 'Reponedor', estado: 'inactivo' },
];

describe('Pruebas de caja negra: Users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.ApiService.getUsuarios as any).mockResolvedValue(mockUsuarios);
    (api.ApiService.deleteUsuario as any).mockResolvedValue(undefined);
  });

  it('muestra la lista de usuarios al cargar', async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
  });

  it('filtra usuarios por nombre', async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    await screen.findByText('Juan Pérez');
    fireEvent.change(screen.getByPlaceholderText(/Buscar usuarios/i), { target: { value: 'Ana' } });
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('muestra mensaje de error si falla la carga', async () => {
    (api.ApiService.getUsuarios as any).mockRejectedValue(new Error('Error de red'));
    render(
      <MemoryRouter>
        <>
          <Users />
          <Toaster />
        </>
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(document.body.textContent).toMatch(/Error al cargar usuarios/i);
      },
      { timeout: 2000 }
    );
  });

  it('permite eliminar un usuario', async () => {
    render(
      <MemoryRouter>
        <>
          <Users />
          <Toaster />
        </>
      </MemoryRouter>
    );
    await screen.findByText('Juan Pérez');
    // Busca la fila de Juan Pérez
    const row = screen.getByText('Juan Pérez').closest('tr');
    // Busca el botón "Eliminar" dentro de esa fila
    const deleteButton = within(row!).getByText('Eliminar');
    fireEvent.click(deleteButton);
    expect(screen.getByText(/Confirmar Eliminación/i)).toBeInTheDocument();
    // Selecciona el botón "Eliminar" del diálogo de confirmación
    const confirmButton = screen.getAllByText('Eliminar').find(
      (btn) => btn.closest('button') && btn.closest('dialog, [role=dialog]')
    );
    fireEvent.click(confirmButton!);
    await waitFor(() => expect(api.ApiService.deleteUsuario).toHaveBeenCalled());
  });

  // Puedes agregar más pruebas de flujos y validaciones aquí
});
