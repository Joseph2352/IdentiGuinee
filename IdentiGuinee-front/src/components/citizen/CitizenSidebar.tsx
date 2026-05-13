import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
}

const CitizenSidebar: React.FC<SidebarProps> = ({ profile, isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/citizen/dashboard', icon: 'badge', label: 'Mon Identité' },
    { to: '/citizen/requests', icon: 'pending_actions', label: 'Mes Démarches' },
    { to: '/citizen/wallet', icon: 'account_balance_wallet', label: 'Portefeuille Num.', },
  ];

  return (
    <aside className={`
      w-[260px] bg-[#0F172A] text-white border-r border-white/5 flex-shrink-0 flex flex-col z-50 h-screen 
      fixed lg:sticky top-0 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      
      {/* Logo Section */}
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg shadow-sm border border-white/10 overflow-hidden">
            <img src="/favicon.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl leading-tight tracking-tight text-white">Mon Espace</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Portail Citoyen</p>
          </div>
        </div>
        
        {/* Close button for Mobile */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Citizen Profile - DYNAMIC */}
      <div className="px-6 mb-8">
        <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-8 h-8 bg-green-500/20 rounded-bl-3xl flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-green-400 text-[10px]">verified</span>
          </div>
          <img 
            className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-sm" 
            src={profile?.photoUrl ? `http://localhost:4000${profile.photoUrl}` : `https://ui-avatars.com/api/?name=${profile?.prenom || 'N'}+${profile?.nom || 'P'}&background=0d631b&color=fff`} 
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile?.prenom || 'N'}+${profile?.nom || 'P'}&background=0d631b&color=fff` }}
            alt="Profil" 
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{profile ? `${profile.prenom} ${profile.nom}` : '---'}</p>
            <p className="text-[10px] text-green-400 font-mono truncate">NIN: {profile?.nin || '---'}</p>
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
                ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-bold">{item.label}</span>
          </NavLink>
        ))}
        
      </nav>

      {/* Logout at bottom */}
      <div className="px-4 pb-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 text-left font-bold transition-colors border border-red-400/10"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>

      {/* Footer Citoyen */}
      <div className="p-6 border-t border-white/5 bg-[#0B1121]">
        <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">assured_workload</span>
            <p className="text-xs font-bold text-white">Portail Sécurisé</p>
        </div>
        <p className="text-[10px] text-white/40">Gouvernement de la République de Guinée (Version 1.0.0)</p>
      </div>
    </aside>
  );
};

export default CitizenSidebar;
