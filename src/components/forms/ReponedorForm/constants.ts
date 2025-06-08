import { AreaOption, TurnoOption } from './types';

export const areaOptions: AreaOption[] = [
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'frutas-verduras', label: 'Frutas y Verduras' },
  { value: 'carnes', label: 'Carnes y Embutidos' },
  { value: 'panaderia', label: 'Panadería' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'enlatados', label: 'Enlatados y Conservas' },
  { value: 'limpieza', label: 'Productos de Limpieza' },
  { value: 'higiene', label: 'Higiene Personal' }
];

export const turnoOptions: TurnoOption[] = [
  { value: 'mañana', label: 'Mañana (6:00 AM - 2:00 PM)' },
  { value: 'tarde', label: 'Tarde (2:00 PM - 10:00 PM)' },
  { value: 'noche', label: 'Noche (10:00 PM - 6:00 AM)' }
];