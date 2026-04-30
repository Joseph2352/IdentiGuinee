import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  // Close sidebar on navigation (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Determine title based on path
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Tableau de bord général';
    if (path.includes('demandes')) return 'Gestion des demandes';
    if (path.includes('documents')) return 'Registre des documents';
    if (path.includes('verifs')) return 'Centre de Vérification';
    if (path.includes('citizens')) return 'Annuaire Citoyen';
    if (path.includes('blockchain')) return 'Registre Blockchain';
    return 'Administration';
  };

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden h-screen flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        <AdminHeader title={getTitle()} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-8 bg-surface custom-scrollbar">
          <Outlet />
        </main>

        {/* Floating FAB - can be contextual or global */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group z-[100]">
          <span className="material-symbols-outlined">add</span>
          <span className="absolute right-16 bg-primary text-white px-3 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest pointer-events-none">Nouvelle Action</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
