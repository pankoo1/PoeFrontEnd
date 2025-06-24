import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Products from '../pages/Products';
import * as api from '../services/api';
import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '../components/ui/toaster';

vi.mock('../services/api');

const mockProductos = [
  { id_producto: 1, nombre: 'Coca Cola', codigo: 'CC123', stock: 10 },
  { id_producto: 2, nombre: 'Pepsi', codigo: 'PP456', stock: 5 },
];

describe('Pruebas de caja negra: Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.ApiService.getProductos as any).mockResolvedValue({ productos: mockProductos });
    (api.ApiService.deleteProducto as any).mockResolvedValue(undefined);
  });

  it('muestra la lista de productos al cargar', async () => {
    render(
      <MemoryRouter>
        <>
          <Products />
          <Toaster />
        </>
      </MemoryRouter>
    );
    expect(screen.getByText(/Cargando productos/i)).toBeInTheDocument();
    expect(await screen.findByText('Coca Cola')).toBeInTheDocument();
    expect(screen.getByText('Pepsi')).toBeInTheDocument();
  });

  // Puedes agregar más pruebas de flujos y validaciones aquí
});
