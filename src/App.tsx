import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from './components/shared/ProtectedRoute';
import { ReponedoresProvider } from './contexts/ReponedoresContext';

// Landing & Auth Pages
import Index from './pages/landing/Index';
import Login from './pages/auth/Login';

// Common Pages
import NotFound from './pages/common/NotFound';
import Profile from './pages/common/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import TasksPage from './pages/admin/Tasks';
import MapPage from './pages/admin/Map';
import ReportsPage from './pages/admin/Reports';

// Backoffice Pages (SuperAdmin)
import BackofficeDashboard from './pages/backoffice/BackofficeDashboard';
import BackofficeEmpresas from './pages/backoffice/BackofficeEmpresas';
import BackofficeEmpresaDetalle from './pages/backoffice/BackofficeEmpresaDetalle';
import BackofficeAuditoria from './pages/backoffice/BackofficeAuditoria';
import BackofficeCotizaciones from './pages/backoffice/BackofficeCotizaciones';
import BackofficeFacturas from './pages/backoffice/BackofficeFacturas';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorProfile from './pages/supervisor/SupervisorProfile';
import ReponedoresPage from './pages/supervisor/ReponedoresPage';
import SupervisorMapPage from './pages/supervisor/SupervisorMapPage';
import SupervisorTareas from './pages/supervisor/SupervisorTareas';
import Predicciones from './pages/supervisor/Predicciones';

// Reponedor Pages
import ReponedorDashboard from './pages/reponedor/ReponedorDashboard';
import ReponedorProfile from './pages/reponedor/ReponedorProfile';
import ReponedorTareas from './pages/reponedor/ReponedorTareas';
import ReponedorMapPage from './pages/reponedor/ReponedorMapPage';
import ReponedorSemanal from './pages/reponedor/ReponedorSemanal';

import './App.css';

function App() {
  return (
    <ReponedoresProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas de Backoffice (SuperAdmin) */}
            <Route path="/backoffice" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/backoffice/empresas" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeEmpresas />
              </ProtectedRoute>
            } />
            <Route path="/backoffice/empresas/:id" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeEmpresaDetalle />
              </ProtectedRoute>
            } />
            <Route path="/backoffice/auditoria" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeAuditoria />
              </ProtectedRoute>
            } />
            <Route path="/backoffice/cotizaciones" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeCotizaciones />
              </ProtectedRoute>
            } />
            <Route path="/backoffice/facturas" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <BackofficeFacturas />
              </ProtectedRoute>
            } />
            
            {/* Rutas de Administrador */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MapPage />
              </ProtectedRoute>
            } />
            <Route path="/reportes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin-tareas" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TasksPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TasksPage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de Supervisor */}
            <Route path="/supervisor-dashboard" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/supervisor-profile" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorProfile />
              </ProtectedRoute>
            } />
            <Route path="/reponedores" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <ReponedoresPage />
              </ProtectedRoute>
            } />
            <Route path="/tareas" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorTareas />
              </ProtectedRoute>
            } />
            <Route path="/supervisor-tareas" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorTareas />
              </ProtectedRoute>
            } />


            <Route path="/supervisor-map" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorMapPage />
              </ProtectedRoute>
            } />
            <Route path="/predicciones" element={
              <ProtectedRoute allowedRoles={['supervisor', 'administrador']}>
                <Predicciones />
              </ProtectedRoute>
            } />
            
            {/* Rutas de Reponedor */}
            <Route path="/reponedor-dashboard" element={
              <ProtectedRoute allowedRoles={['reponedor']}>
                <ReponedorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reponedor-profile" element={
              <ProtectedRoute allowedRoles={['reponedor']}>
                <ReponedorProfile />
              </ProtectedRoute>
            } />
            <Route path="/reponedor-tareas" element={
              <ProtectedRoute allowedRoles={['reponedor']}>
                <ReponedorTareas />
              </ProtectedRoute>
            } />
            <Route path="/reponedor-map" element={
              <ProtectedRoute allowedRoles={['reponedor']}>
                <ReponedorMapPage />
              </ProtectedRoute>
            } />
            <Route path="/reponedor-semanal" element={
              <ProtectedRoute allowedRoles={['reponedor']}>
                <ReponedorSemanal />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ReponedoresProvider>
  );
}

export default App;
