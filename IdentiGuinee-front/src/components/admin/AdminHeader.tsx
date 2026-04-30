import React from 'react';

const AdminHeader: React.FC<{ title: string; onMenuToggle: () => void }> = ({ title, onMenuToggle }) => {
  return (
    <header className="h-16 bg-white border-b border-surface-variant/30 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-6">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-outline hover:bg-surface-container-low rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <h2 className="font-headline text-lg font-bold text-primary">{title}</h2>
          <nav aria-label="Breadcrumb" className="flex text-[10px] text-outline uppercase font-bold tracking-tighter">
            <span className="hover:text-primary cursor-pointer">Portail Admin</span>
            <span className="mx-1 opacity-50">/</span>
            <span className="text-primary-container">{title}</span>
          </nav>
        </div>
        <div className="hidden lg:block relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-full pl-10 h-10 text-xs focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
            placeholder="Rechercher un citoyen, un hash TX..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Blockchain: Mainnet Active</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-outline hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-[1px] bg-surface-variant/30 hidden sm:block"></div>
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-tight">M. Camara</p>
              <p className="text-[9px] text-outline uppercase font-bold tracking-tighter">Admin National</p>
            </div>
            <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center border-2 border-primary group-hover:shadow-md transition-all overflow-hidden">
               <img src="/assets/external-assets/asset_1.png" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
