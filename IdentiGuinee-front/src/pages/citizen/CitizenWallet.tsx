import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api, { API_BASE_URL } from '../../lib/axios';
import { citoyenService } from '../../services/citoyen.service';
import { Skeleton } from '../../components/common/Skeleton';

const CitizenWallet: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await citoyenService.getMyProfile();
        setProfile(profileRes.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadPDF = async () => {
    if (!activeCard) return;
    try {
      setDownloading(true);
      const response = await api.get(`/citoyens/carte/pdf/${activeCard.id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carte-identite-${profile?.nom}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur de téléchargement PDF:', error);
    } finally {
      setDownloading(false);
    }
  };


  const activeCard = profile?.cartes?.find((c: any) => c.statut === 'ACTIVE') || (profile?.cartes && profile.cartes[0]);

  if (loading) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-surface-variant/10 pb-10">
          <div>
             <Skeleton className="h-10 w-64 mb-4" />
             <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl hidden md:block" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 py-8">
      {/* Header section épurée */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-surface-variant/10 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
           <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">Portefeuille Numérique</h2>
           <p className="text-sm text-outline mt-2 font-medium opacity-70">Vos titres d'identité certifiés et sécurisés par blockchain.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* CNI Card - Only if active */}
        {activeCard && (
          <div className="flex flex-col items-center justify-center p-6 bg-surface-container-lowest border border-outline-variant/10 shadow-sm rounded-3xl">
            {/* THE REAL BACKEND GENERATED CARD WITH 3D FLIP */}
            <div className="relative w-full max-w-[440px] md:max-w-full xl:max-w-[440px] aspect-[1.586/1] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`card-flip-inner shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-2xl ${isFlipped ? 'card-flipped' : ''}`}>
                 
                 {/* FRONT FACE (RECTO) */}
                 <div className="card-face">
                    {activeCard?.carteRectoUrl ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-white flex flex-col group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-shadow duration-500">
                        <div className="tricolor-bar w-full h-1"></div>
                        <img 
                         src={`${API_BASE_URL}${activeCard.carteRectoUrl}`} 
                         alt="CNI Recto" 
                         className="w-full flex-1 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-50 border-2 border-dashed border-outline-variant/20 rounded-2xl flex items-center justify-center">
                         <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Recto non généré</p>
                      </div>
                    )}
                 </div>

                 {/* BACK FACE (VERSO) */}
                 <div className="card-face card-back">
                    {activeCard?.carteVersoUrl ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-white group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-shadow duration-500">
                        <img 
                         src={`${API_BASE_URL}${activeCard.carteVersoUrl}`} 
                         alt="CNI Verso" 
                         className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-50 border-2 border-dashed border-outline-variant/20 rounded-2xl flex items-center justify-center">
                         <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Verso non généré</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
            
            <p className="mt-8 text-[9px] text-outline font-black uppercase tracking-widest flex items-center gap-2 animate-pulse bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px]">touch_app</span> 
              Cliquez sur la carte pour voir le verso
            </p>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              )}
              {downloading ? 'Génération...' : 'Télécharger en PDF'}
            </button>
          </div>
        )}

        {!activeCard && (
          <div className="lg:col-span-2 py-40 text-center">
             <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-outline/20 mb-8">
                <span className="material-symbols-outlined text-5xl">id_card</span>
             </div>
             <h2 className="text-2xl font-headline font-bold text-outline">Aucun titre disponible</h2>
             <p className="text-sm text-outline/50 mt-4 max-w-sm mx-auto font-medium">
               Votre Carte Nationale d'Identité apparaîtra ici dès qu'elle sera validée et délivrée.
             </p>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default CitizenWallet;
