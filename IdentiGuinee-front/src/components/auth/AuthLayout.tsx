import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans selection:bg-secondary-container">
      {/* 8px Tricolor Band */}
      <div className="fixed top-0 left-0 right-0 h-2 flex z-[300]">
        <div className="bg-[#CE1126] flex-1"></div>
        <div className="bg-[#FCD116] flex-1"></div>
        <div className="bg-[#009460] flex-1"></div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel (Institutional) */}
        <div className="lg:w-1/2 bg-primary text-white p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden h-screen">
          {/* Background Decorative Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg height="100%" width="100%">
              <pattern height="40" id="pattern" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
                <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="white" strokeWidth="1"></path>
              </pattern>
              <rect fill="url(#pattern)" height="100%" width="100%"></rect>
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="bg-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <span className="text-lg font-bold tracking-tight">IdentiGuinée</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-title font-extrabold leading-tight mb-3">
              Votre identité officielle, <br/>
              <span className="text-accent">sans corruption.</span>
            </h1>
            <p className="text-sm opacity-80 max-w-sm font-light leading-relaxed">
              Accédez aux services de l'État en toute transparence. Un système souverain, automatisé et sécurisé pour chaque citoyen guinéen.
            </p>
          </div>

          {/* ID Card Illustration */}
          <div className="relative z-10 my-4 hidden lg:block scale-90 origin-left">
            <div 
              className="w-full max-w-sm p-6 aspect-[1.58/1] border-t-4 border-accent text-on-surface rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)' }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-2">
                  <div className="w-8 h-10 bg-[#CE1126] rounded-sm"></div>
                  <div className="w-8 h-10 bg-[#FCD116] rounded-sm"></div>
                  <div className="w-8 h-10 bg-[#009460] rounded-sm"></div>
                </div>
                <div className="bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  <span className="text-[10px] font-bold text-primary uppercase">Vérifié Blockchain</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400 text-5xl">person</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-100 rounded w-full mt-4"></div>
                  <div className="h-2 bg-gray-100 rounded w-full"></div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div className="text-[10px] text-gray-400 font-mono">ID: 224-XXXX-XXXX-XXXX</div>
                <div className="w-12 h-12 border-2 border-primary/20 rounded-full flex items-center justify-center opacity-30">
                  <span className="material-symbols-outlined text-primary">fingerprint</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Forms) */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-8 bg-white relative">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-2xl border-l-4 border-primary overflow-hidden">
              {/* Form Tabs */}
              <div className="flex bg-[#F9FAFB] border-b border-gray-100">
                <button 
                  onClick={() => onTabChange('login')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'login' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-primary'}`}
                >
                  CONNEXION <br/> <span className="text-[10px] font-medium opacity-60">Login</span>
                </button>
                <button 
                  onClick={() => onTabChange('signup')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-primary'}`}
                >
                  INSCRIPTION <br/> <span className="text-[10px] font-medium opacity-60">Sign Up</span>
                </button>
              </div>

              <div className="p-6">
                {children}
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>© 2024 Administration Numérique de la Guinée. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
