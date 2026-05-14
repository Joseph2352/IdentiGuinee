import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CitizenSidebar from '../../components/citizen/CitizenSidebar';
import { citoyenService } from '../../services/citoyen.service';

const CitizenLayout: React.FC = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const refreshProfile = async () => {
    try {
      const res = await citoyenService.getMyProfile();
      setProfile(res.data);
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  // Fermer la sidebar lors du changement de page sur mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const getTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Mon Identité Numérique';
    if (location.pathname.includes('requests')) return 'Suivi de mes démarches';
    if (location.pathname.includes('wallet')) return 'Portefeuille Cryptographique';
    return 'Portail Citoyen';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-lowest font-body relative">
      {/* Overlay pour Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <CitizenSidebar 
        profile={profile} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Header Citoyen */}
        <header className="h-16 bg-white border-b border-surface-variant/30 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm shrink-0">
          {/* Left side: Title */}
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-outline hover:bg-surface-container-low rounded-lg active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="hidden sm:block">
              <h2 className="font-headline text-base md:text-lg font-bold text-primary truncate max-w-[150px] md:max-w-none">{getTitle()}</h2>
              <nav aria-label="Breadcrumb" className="hidden xl:flex text-[10px] text-outline uppercase font-bold tracking-tighter">
                <span className="hover:text-primary cursor-pointer">Mon Espace</span>
                <span className="mx-1 opacity-50">/</span>
                <span className="text-primary-container">{getTitle()}</span>
              </nav>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center px-4 md:px-8">
            <div className="relative w-full max-w-2xl group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-surface-container-low border-none rounded-full pl-12 h-11 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/40 font-medium shadow-inner" 
                placeholder="Rechercher une démarche, un document, ou une transaction..." 
                type="text"
              />
            </div>
          </div>
          
          {/* Right side: Profile & Notifications */}
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-outline hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-surface-variant/30 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface leading-tight">
                  {profile ? `${profile.prenom.charAt(0)}. ${profile.nom}` : 'Citoyen'}
                </p>
                <p className="text-[9px] text-outline uppercase font-bold tracking-tighter">Espace Citoyen</p>
              </div>
              <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover:border-primary transition-colors">
                  <img 
                  src={profile?.photoUrl ? `http://localhost:4000${profile.photoUrl}` : `https://ui-avatars.com/api/?name=${profile?.prenom || 'N'}+${profile?.nom || 'P'}&background=e2e8f0&color=94a3b8`} 
                  alt="Profil" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile?.prenom || 'N'}+${profile?.nom || 'P'}&background=e2e8f0&color=94a3b8` }}
                  />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-8">
          <Outlet context={{ profile, refreshProfile }} />
        </main>
      </div>
    </div>
  );
};

export default CitizenLayout;
