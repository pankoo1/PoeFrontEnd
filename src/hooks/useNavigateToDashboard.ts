import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para navegar al dashboard correcto según el rol del usuario
 */
export const useNavigateToDashboard = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    const userRole = localStorage.getItem('userRole');
    
    switch (userRole) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'supervisor':
        navigate('/supervisor-dashboard');
        break;
      case 'reponedor':
        navigate('/reponedor-dashboard');
        break;
      default:
        // Si no hay rol válido, redirigir al login
        navigate('/login');
        break;
    }
  };

  return navigateToDashboard;
};
