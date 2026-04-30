import React from 'react';
import Reveal from '../animations/Reveal';
import Counter from '../animations/Counter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import HeroCarousel from './HeroCarousel';

const Hero: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/dashboard');
    } else {
      navigate('/login');
    }
  };


  return (
    <section className="relative pt-24 pb-20 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Reveal>
            <h1 className="font-headline text-5xl md:text-6xl leading-[1.1] text-primary tracking-tight">
              Votre identité officielle,<br/>
              <span className="italic text-secondary">en 2 minutes.</span>
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Le premier système souverain de Guinée basé sur la blockchain. Sécurisé, infalsifiable et accessible à tous, où qu'ils soient.
            </p>
          </Reveal>
          
          <Reveal delay={0.4}>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleCtaClick}
                className="bg-primary guinea-gradient-primary text-white px-7 py-3.5 rounded-md font-bold text-base flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-primary/20"
              >
                {isAuthenticated ? "Accéder à mon espace" : "Commencer ma demande"}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <button 
                onClick={() => navigate('/verify')}
                className="border-l-4 border-primary text-primary px-6 py-3.5 font-bold text-base hover:bg-surface-container-low transition-colors"
              >
                Vérifier un titre existant
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="pt-8 flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs text-outline opacity-40">person</span>
                    </div>
                  ))}
               </div>
               <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                 <span className="text-primary">+<Counter value={12000} /></span> Citoyens déjà enregistrés
               </p>
            </div>
          </Reveal>
        </div>

        <div className="flex justify-center lg:justify-end overflow-visible">
           <HeroCarousel />
        </div>
      </div>
    </section>
  );
};

export default Hero;