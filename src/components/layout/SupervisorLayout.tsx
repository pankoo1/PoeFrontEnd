import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Map, Users, LogOut, User, Brain } from 'lucide-react';

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
    {isActive && (
      <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
    )}
  </button>
);

const SupervisorLayout: React.FC<SupervisorLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('nombre') || 'Supervisor';

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/supervisor-dashboard' },
    { icon: <ListTodo size={20} />, label: 'Gestión de Tareas', path: '/supervisor-tareas' },
    { icon: <Users size={20} />, label: 'Reponedores', path: '/reponedores' },
    { icon: <Map size={20} />, label: 'Mapa', path: '/supervisor-map' },
    { icon: <Brain size={20} />, label: 'Predicciones ML', path: '/predicciones' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/supervisor-profile');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white">Panel Supervisor</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión y Monitoreo</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleProfile}
            className="w-full flex items-center px-4 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors mb-2"
          >
            <User size={20} className="mr-3" />
            <div className="flex-1 text-left">
              <div className="font-medium text-white">{userName}</div>
              <div className="text-xs text-slate-500">Ver perfil</div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default SupervisorLayout;
