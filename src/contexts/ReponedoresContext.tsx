import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Reponedor {
  id: number;
  name: string;
  email: string;
  estado: string;
  tareasAsignadas: number;
  supervisor: string;
  password?: string; // Opcional ya que no se mostrará en la UI
  role?: string; // Para identificar el rol en el sistema
}

interface ReponedoresContextType {
  reponedores: Reponedor[];
  addReponedor: (reponedor: Omit<Reponedor, 'id' | 'tareasAsignadas' | 'supervisor' | 'role'>) => void;
  updateReponedor: (id: number, reponedor: Partial<Reponedor>) => void;
  deleteReponedor: (id: number) => void;
}

const ReponedoresContext = createContext<ReponedoresContextType | undefined>(undefined);

export const useReponedores = () => {
  const context = useContext(ReponedoresContext);
  if (!context) {
    throw new Error('useReponedores debe ser usado dentro de un ReponedoresProvider');
  }
  return context;
};

interface ReponedoresProviderProps {
  children: ReactNode;
}

// Datos iniciales por defecto
const defaultReponedores: Reponedor[] = [
  { id: 1, name: 'Carlos Martínez', email: 'carlos@empresa.com', estado: 'Activo', tareasAsignadas: 5, supervisor: 'María González' },
  { id: 2, name: 'Ana López', email: 'ana@empresa.com', estado: 'Activo', tareasAsignadas: 3, supervisor: 'María González' },
  { id: 3, name: 'Miguel Santos', email: 'miguel@empresa.com', estado: 'En Descanso', tareasAsignadas: 0, supervisor: 'María González' },
  { id: 4, name: 'Laura Pérez', email: 'laura@empresa.com', estado: 'Activo', tareasAsignadas: 2, supervisor: 'María González' },
];

export const ReponedoresProvider: React.FC<ReponedoresProviderProps> = ({ children }) => {
  // Inicializar el estado con los datos del localStorage o los datos por defecto
  const [reponedores, setReponedores] = useState<Reponedor[]>(() => {
    const storedReponedores = localStorage.getItem('reponedores');
    return storedReponedores ? JSON.parse(storedReponedores) : defaultReponedores;
  });

  // Actualizar localStorage cuando cambia el estado de reponedores
  useEffect(() => {
    localStorage.setItem('reponedores', JSON.stringify(reponedores));
    
    // También actualizar la lista de usuarios para el login
    const users = reponedores.map(reponedor => ({
      email: reponedor.email,
      password: reponedor.password || '',
      name: reponedor.name,
      role: 'Reponedor',
      status: reponedor.estado
    }));
    
    // Obtener usuarios existentes que no son reponedores
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const nonReponedorUsers = storedUsers.filter(user => 
      !reponedores.some(reponedor => reponedor.email === user.email)
    );
    
    // Combinar y guardar todos los usuarios
    localStorage.setItem('users', JSON.stringify([...nonReponedorUsers, ...users]));
  }, [reponedores]);

  const addReponedor = (newReponedor: Omit<Reponedor, 'id' | 'tareasAsignadas' | 'supervisor' | 'role'>) => {
    const id = reponedores.length > 0 ? Math.max(...reponedores.map(r => r.id)) + 1 : 1;
    setReponedores(prev => [
      ...prev,
      {
        ...newReponedor,
        id,
        tareasAsignadas: 0,
        supervisor: 'María González', // Valor por defecto o podría venir de un contexto de usuario actual
        role: 'Reponedor' // Asignar rol por defecto
      }
    ]);
  };

  const updateReponedor = (id: number, updatedData: Partial<Reponedor>) => {
    setReponedores(prev => 
      prev.map(reponedor => 
        reponedor.id === id ? { ...reponedor, ...updatedData } : reponedor
      )
    );
  };

  const deleteReponedor = (id: number) => {
    setReponedores(prev => prev.filter(reponedor => reponedor.id !== id));
  };

  return (
    <ReponedoresContext.Provider value={{ reponedores, addReponedor, updateReponedor, deleteReponedor }}>
      {children}
    </ReponedoresContext.Provider>
  );
};