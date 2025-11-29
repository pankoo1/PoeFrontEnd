
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirigir según el rol
    if (userRole === 'superadmin') {
      return <Navigate to="/backoffice" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === 'supervisor') {
      return <Navigate to="/supervisor-dashboard" replace />;
    } else if (userRole === 'reponedor') {
      return <Navigate to="/reponedor-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
