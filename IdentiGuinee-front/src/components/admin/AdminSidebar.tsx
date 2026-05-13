import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Tableau de bord' },
    { to: '/admin/requests', icon: 'description', label: 'Demandes' },
    { to: '/admin/documents', icon: 'verified_user', label: 'Documents' },
    { to: '/admin/verifications', icon: 'fact_check', label: 'Vérifications' },
    { to: '/admin/citizens', icon: 'group', label: 'Citoyens' },
    { to: '/admin/blockchain', icon: 'token', label: 'Registre Blockchain' },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-[#1A3A1C] text-white flex-shrink-0 flex flex-col pt-8 z-[60] transition-transform duration-300 transform lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        
        {/* Close Button for mobile */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-10 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      


      {/* Admin Profile */}
      <div className="px-6 mb-8">
        <div className="bg-primary-container/20 p-3 rounded-xl flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img 
              className="w-7 h-7 object-contain" 
              src="/favicon.png" 
              alt="Admin" 
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Admin System</p>
            <p className="text-[10px] text-primary-fixed truncate">Super-utilisateur</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                ? 'bg-primary-container text-on-primary-container font-medium' 
                : 'text-white/70 hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-6 pb-2 px-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Système</p>
        </div>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) => 
            `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive 
              ? 'bg-primary-container text-on-primary-container font-medium' 
              : 'text-white/70 hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm">Paramètres</span>
        </NavLink>

      </nav>

      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-300 hover:bg-red-500/10 mt-4 border border-red-500/10"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-bold uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>

      {/* Footer Sidebar */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>v2</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
