import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Building2, 
  Activity,
  FileText,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ApiService } from '@/services/api';

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

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    ApiService.logout();
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
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Backoffice</h1>
              <p className="text-xs text-slate-500 font-medium">SUPER ADMIN</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={isActive('/backoffice')} 
            onClick={() => navigate('/backoffice')} 
          />
          <SidebarItem 
            icon={Building2} 
            label="Empresas" 
            active={isActive('/backoffice/empresas')} 
            onClick={() => navigate('/backoffice/empresas')} 
          />
          <SidebarItem 
            icon={Activity} 
            label="Auditoría" 
            active={isActive('/backoffice/auditoria')} 
            onClick={() => navigate('/backoffice/auditoria')} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Reportes" 
            active={false} 
            onClick={() => toast({ title: "Próximamente", description: "Módulo en desarrollo" })} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default BackofficeLayout;
