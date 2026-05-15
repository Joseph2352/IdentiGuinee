import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { demandeService } from '../../services/demande.service';
import RequestModal from '../../components/citizen/RequestModal';
import toast from 'react-hot-toast';
import { DashboardCardsSkeleton } from '../../components/common/DashboardCardsSkeleton';
import { Skeleton } from '../../components/common/Skeleton';

const CitizenDashboard: React.FC = () => {
  const { profile, refreshProfile } = useOutletContext<{ profile: any; refreshProfile: () => Promise<void> }>();
  const [showQR, setShowQR] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDemandes = async () => {
    try {
      const demandesRes = await demandeService.getMyDemandes();
      setDemandes(demandesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoadingDemandes(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
    
    // Check if we should open the modal (from redirect)
    if ((location.state as any)?.openRequestModal) {
      setShowRequestModal(true);
      window.history.replaceState({}, document.title);
    }

    const interval = setInterval(() => {
      fetchDemandes();
      refreshProfile();
    }, 10000); // Polling toutes les 10 secondes

    return () => clearInterval(interval);
  }, [location.state, refreshProfile]);

  const pendingDemandes = demandes.filter(d => d.statut !== 'DELIVREE' && d.statut !== 'REJETEE');
  const deliveredDemandes = demandes.filter(d => d.statut === 'DELIVREE');
  
  // Extraire la carte active (la plus récente délivrée)
  const activeCard = profile?.cartes?.find((c: any) => c.statut === 'ACTIVE') || (profile?.cartes && profile.cartes[0]);

  const handleFastTrackDuplicata = async () => {
    if (window.confirm("Confirmez-vous la déclaration de perte de votre carte ?\n\nUne nouvelle demande de DUPLICATA sera automatiquement générée. Aucune nouvelle information ni vérification documentaire n'est requise, nous utiliserons vos données sécurisées déjà authentifiées.")) {
      setLoadingDemandes(true);
      try {
        const data = new FormData();
        data.append('type', 'DUPLICATA');
        data.append('adresse', profile.quartier || 'Non renseignée');
        await demandeService.create(data as any);
        toast.success("Déclaration enregistrée ! Votre demande de duplicata est en attente de validation.");
        fetchDemandes();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de la déclaration');
        setLoadingDemandes(false);
      }
    }
  };

  if (!profile || loadingDemandes) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-2">
           <div>
             <Skeleton className="h-8 w-64 mb-2" />
             <Skeleton className="h-4 w-48" />
           </div>
        </div>
        <DashboardCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
             <Skeleton className="h-[400px] w-full rounded-2xl" />
           </div>
           <div>
             <Skeleton className="h-[400px] w-full rounded-3xl" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">Tableau de Bord</h2>
          <p className="text-xs text-outline font-medium">Bon retour, <span className="text-on-surface font-bold">{profile.prenom} {profile.nom}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-end items-center">
          {activeCard && pendingDemandes.length === 0 && (
            <button 
              onClick={handleFastTrackDuplicata}
              className="px-4 py-2 rounded-lg font-bold text-[13px] shadow-sm transition-all flex items-center gap-2 transform active:scale-95 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white border border-orange-200 hover:border-transparent hover:shadow-md"
            >
              <span className="material-symbols-outlined font-bold text-[18px]">policy</span>
              Déclarer une perte (Duplicata express)
            </button>
          )}

          <button 
            disabled={pendingDemandes.length > 0}
            onClick={() => setShowRequestModal(true)}
            className={`px-4 py-2 rounded-lg font-bold text-[13px] shadow-sm transition-all flex items-center gap-2 transform active:scale-95 ${
              pendingDemandes.length > 0 
              ? 'bg-surface-container-high text-outline cursor-not-allowed shadow-none' 
              : 'bg-[#0D631B] hover:bg-[#0A4D15] text-white hover:shadow-md'
            }`}
          >
            <span className="material-symbols-outlined font-bold text-[18px]">
              {pendingDemandes.length > 0 ? 'pending' : (activeCard ? 'autorenew' : 'add')}
            </span>
            {pendingDemandes.length > 0 ? 'Demande en cours' : (activeCard ? 'Renouveler ma carte' : 'Nouvelle Démarche')}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-primary">
          <p className="text-outline text-xs mb-1">Identité Principale</p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface">
              {profile?.nin ? 'Authentifiée' : 'Non validée'}
            </h3>
            <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
              <span className="material-symbols-outlined text-xs">verified</span> Blockchain
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#fcab28]">
          <p className="text-outline text-xs mb-1">Démarches en cours</p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-2xl font-headline font-bold text-on-surface">{pendingDemandes.length}</h3>
            <span className="text-outline text-[10px] font-bold bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
               {pendingDemandes.length > 0 ? 'Traitement' : 'Aucun flux'}
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#2e7d32]">
          <p className="text-outline text-xs mb-1">Documents Rattachés</p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-2xl font-headline font-bold text-on-surface">{deliveredDemandes.length}</h3>
            <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
              <span className="material-symbols-outlined text-sm">folder_open</span> Dossier certifié
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#0a1628]">
          <p className="text-outline text-xs mb-1">Dernière Mise à jour</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-headline font-bold text-on-surface">
              {demandes.length > 0 ? new Date(demandes[0].dateSoumission || demandes[0].updatedAt).toLocaleDateString() : 'Aujourd\'hui'}
            </h3>
          </div>
        </div>
      </div>

      {/* Visualizations: Digital CNI & Tools */}
      {deliveredDemandes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* Jumeau Numérique */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-headline font-bold text-lg text-primary">Jumeau Numérique (CNI)</h4>
                <p className="text-[10px] text-outline uppercase tracking-widest">Version biométrique certifiée conforme</p>
              </div>
              <button 
                onClick={() => navigate('/citizen/wallet')}
                className="bg-primary/10 text-primary font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span> Accéder au Portefeuille
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-xl">
               {/* THE REAL BACKEND GENERATED CARD WITH 3D FLIP */}
                <div className="relative w-full max-w-[440px] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`card-flip-inner shadow-2xl rounded-2xl ${isFlipped ? 'card-flipped' : ''}`}>
                     
                     {/* FRONT FACE (RECTO) - Relative for dynamic height */}
                     <div className="card-face !relative z-10 h-auto">
                        {activeCard?.carteRectoUrl ? (
                         <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-white flex flex-col">
                           <div className="tricolor-bar w-full h-1"></div>
                           <img 
                            src={`http://localhost:4000${activeCard.carteRectoUrl}`} 
                            alt="CNI Recto" 
                            className="w-full flex-1 object-cover"
                           />
                         </div>
                       ) : (
                         /* FALLBACK RÉACT DESIGN */
                         <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white border border-outline-variant/10">
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#ce1126] via-[#fcd116] to-[#006747]"></div>
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1A3A1C 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                            <div className="p-5 h-full flex flex-col justify-between">
                               <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 bg-surface-container-low rounded-full"></div>
                                   <div className="space-y-0.5">
                                     <h3 className="text-[10px] uppercase font-black tracking-tight text-[#006747] leading-none">République de Guinée</h3>
                                     <p className="text-[6px] uppercase font-bold tracking-widest text-[#ce1126]">Carte Nationale d'Identité Biométrique</p>
                                   </div>
                                 </div>
                               </div>
                               <div className="flex gap-4 items-center">
                                 <div className="w-[85px] h-[110px] bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0 rounded-sm"></div>
                                 <div className="flex-1 space-y-3">
                                   <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                   <div className="h-6 w-full bg-slate-100 rounded"></div>
                                   <div className="h-4 w-full bg-slate-100 rounded"></div>
                                 </div>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>

                    {/* BACK FACE (VERSO) */}
                    <div className="card-face card-back">
                       {activeCard?.carteVersoUrl ? (
                         <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-white">
                           <img 
                            src={`http://localhost:4000${activeCard.carteVersoUrl}`} 
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
               
               <p className="mt-4 text-[9px] text-outline font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                 <span className="material-symbols-outlined text-[14px]">touch_app</span> 
                 Cliquez sur la carte pour la retourner
               </p>
            </div>
          </div>

          {/* Blockchain Status Widget - Mode Ultra-Épuré */}
          <div className="bg-[#0D1B2A] p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center border border-white/5 h-full min-h-[400px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            
            <h4 className="font-headline font-bold text-white text-xl mb-1 tracking-tight">Vérification Blockchain</h4>
            <div className="flex items-center gap-2 mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em]">Protocole Sécurisé</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.2)] transition-all duration-500 border-4 border-emerald-500/10">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(activeCard?.qrCodeData || `http://localhost:5172/verify-card/${activeCard?.numeroCarte}`)}`} 
                alt="QR Verification" 
                className="w-full max-w-[240px] aspect-square rounded-xl"
              />
            </div>

            <p className="mt-10 text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">
              IdentiGuinee Chain Gateway
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low/30 border border-dashed border-outline-variant/30 rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-outline/30 mb-4">
             <span className="material-symbols-outlined text-4xl">id_card</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-on-surface">Votre Jumeau Numérique n'est pas encore disponible</h3>
          <p className="text-sm text-outline max-w-md mx-auto mt-2 font-medium">
            Il apparaîtra ici dès que votre première demande de titre d'identité biométrique sera validée et délivrée.
          </p>
          <button 
            onClick={() => navigate('/citizen/requests')}
            className="mt-6 bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:shadow-lg transition-all"
          >
            Suivre mes demandes
          </button>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50">
          <h4 className="font-headline font-bold text-primary">Activités de Titres & Certificats</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-outline text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3 font-semibold">Titre / Certificat</th>
                <th className="px-6 py-3 font-semibold">Type de démarche</th>
                <th className="px-6 py-3 font-semibold">Date de création</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
                <th className="px-6 py-3 font-semibold text-right">Preuve (Hash)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {demandes.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        ID
                      </div>
                      <p className="text-sm font-bold text-on-surface">Carte d'Identité</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-outline">
                    {req.type === 'PREMIERE_DEMANDE' ? 'Première Demande' : 
                     req.type === 'RENOUVELLEMENT' ? 'Renouvellement' : 
                     req.type === 'DUPLICATA' ? 'Duplicata' : req.type || '---'}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold tracking-tight text-on-surface">
                    {req.dateSoumission ? new Date(req.dateSoumission).toLocaleDateString() : '---'}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                      req.statut === 'DELIVREE' ? 'bg-green-50 text-green-700' :
                      req.statut === 'REJETEE' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      <span className="material-symbols-outlined text-[12px]">
                        {req.statut === 'DELIVREE' ? 'verified' : req.statut === 'REJETEE' ? 'cancel' : 'pending'}
                      </span> 
                      {req.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-[10px] text-outline font-bold bg-surface-container-low px-2 py-1 rounded">
                      {(() => {
                        const tx = req.transactions?.find((t: any) => t.type === 'CARTE_DELIVREE');
                        if (tx?.txHash && tx.txHash.startsWith('0x') && tx.txHash.length > 40) {
                          return (
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-primary hover:underline"
                            >
                              {tx.txHash.substring(0, 10)}...
                            </a>
                          );
                        }
                        return (req.carte?.blockchainHash?.substring(0, 10) || (req.statut === 'DELIVREE' ? 'Ancrage...' : '---')) + (req.carte?.blockchainHash ? '...' : '');
                      })()}
                    </span>
                  </td>
                </tr>
              ))}
              {demandes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-outline text-sm italic font-medium">
                    Aucune démarche enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS (QR & Revoke) */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline font-bold text-xl text-primary">Preuve Numérique</h3>
              <button onClick={() => setShowQR(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
            </div>
            <p className="text-xs text-outline leading-relaxed font-medium">
              Présentez ce code QR pour une vérification instantanée et sécurisée de votre identité biométrique.
            </p>
            <div className="bg-surface-container-low p-6 rounded-2xl inline-block border-2 border-primary/10">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=identiguinee-auth-${profile?.nin || profile?.id}`} alt="QR Auth" className="w-48 h-48 mx-auto" />
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 py-2 rounded-full border border-green-100">
              <span className="material-symbols-outlined text-sm">lock</span> Session Sécurisée
            </div>
          </div>
        </div>
      )}

      {showRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-error/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-4 text-error">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="font-headline font-bold text-xl">Révocation Critique</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              Souhaitez-vous vraiment révoquer l'accès numérique à votre identité ? 
              <br/><br/>
              <span className="text-error font-bold text-xs uppercase tracking-tighter">⚠️ Conséquence :</span> Votre carte physique et votre jumeau numérique seront immédiatement invalidés sur la blockchain.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowRevoke(false)} className="flex-1 py-3 font-bold text-sm text-on-surface-variant bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors">
                Annuler
              </button>
              <button onClick={() => setShowRevoke(false)} className="flex-1 py-3 font-bold text-sm text-white bg-error rounded-xl shadow-lg shadow-error/30 hover:bg-error/90 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <RequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
        profile={profile}
        onSuccess={() => { fetchDemandes(); refreshProfile(); }}
      />

    </div>
  );
};

export default CitizenDashboard;
