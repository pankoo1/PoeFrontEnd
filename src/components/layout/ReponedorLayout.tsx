import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package,
  CheckCircle, 
  Map,
  Calendar,
  User,
  LogOut
} from 'lucide-react';

// Componente de Sidebar Item
function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
      <span className="font-medium text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
    </button>
  );
}

interface ReponedorLayoutProps {
  children: React.ReactNode;
}

const ReponedorLayout: React.FC<ReponedorLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Reponedor';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="h-20 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Reponedor</h1>
              <p className="text-xs text-slate-500 font-medium">{userName.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarItem 
            icon={Package} 
            label="Dashboard" 
            active={isActive('/reponedor-dashboard')} 
            onClick={() => navigate('/reponedor-dashboard')} 
          />
          <SidebarItem 
            icon={CheckCircle} 
            label="Mis Tareas" 
            active={isActive('/reponedor-tareas')} 
            onClick={() => navigate('/reponedor-tareas')} 
          />
          <SidebarItem 
            icon={Map} 
            label="Mapa y Rutas" 
            active={isActive('/reponedor-map')} 
            onClick={() => navigate('/reponedor-map')} 
          />
          <SidebarItem 
            icon={Calendar} 
            label="Vista Semanal" 
            active={isActive('/reponedor-semanal')} 
            onClick={() => navigate('/reponedor-semanal')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/reponedor-profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white mb-2"
          >
            <User size={20} />
            <span className="font-medium text-sm">Mi Perfil</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-600 hover:text-white"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ReponedorLayout;
