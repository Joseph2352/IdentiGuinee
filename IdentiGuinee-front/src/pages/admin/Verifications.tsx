import React, { useState, useEffect } from 'react';
import { verificationService } from '../../services/verification.service';

const Verifications: React.FC = () => {
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [searchParams, setSearchParams] = useState({ nin: '' });
  const [resultData, setResultData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchHistory();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchHistory();
    }, 10000); // Polling toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await verificationService.getStats();
      if (res.success) setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await verificationService.getHistorique();
      if (res.success) setHistory(res.data.verifications);
    } catch (err) { console.error(err); }
  };

  const handleVerify = async () => {
    if (!searchParams.nin) return;
    
    setVerifyStatus('loading');
    setResultData(null);
    try {
      const res = await verificationService.verifierCarte({
        nin: searchParams.nin,
        institution: 'Portail Admin'
      });
      
      if (res.success) {
        setResultData(res.data);
        setVerifyStatus('valid');
      } else {
        setVerifyStatus('invalid');
      }
      
      fetchStats();
      fetchHistory();
    } catch (err) {
      setVerifyStatus('invalid');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* BLOC 1: EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-title font-bold text-[#1A3A1C]">Centre de vérification</h2>
          <p className="text-xs text-[#78909C]">Vérification décentralisée des documents officiels</p>
        </div>
        <div className="flex flex-wrap gap-2 font-bold tracking-tighter uppercase">
          <span className="px-3 py-1 bg-surface-container-low text-[11px] text-outline rounded-full border border-outline-variant/20">{stats?.total || 0} vérifications</span>
          <span className="px-3 py-1 bg-green-50 text-[11px] text-green-700 rounded-full border border-green-200">✓ {stats?.successPct || '---'}% certifiés</span>
          <span className="px-3 py-1 bg-red-50 text-[11px] text-red-700 rounded-full border border-red-200">⚠ {stats?.fraudes || 0} fraudes</span>
        </div>
      </div>

      {/* BLOC 2: OUTIL DE VÉRIFICATION */}
      <div className="mt-6 max-w-4xl mx-auto w-full">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-headline font-bold text-primary mb-1">Authentifier un document</h3>
          <p className="text-xs text-outline mb-6">Saisissez les informations d'identité pour contrôler l'authenticité</p>

          <div className="animate-fadeIn space-y-4">
            <div>
              <label className="block text-xs uppercase text-outline font-bold tracking-widest mb-2">Numéro NIN personnel</label>
              <input 
                value={searchParams.nin}
                onChange={(e) => setSearchParams({...searchParams, nin: e.target.value})}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 h-12 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="ex : 199061203647631" 
              />
            </div>
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 text-xs text-primary font-medium mt-2">
              <span className="material-symbols-outlined text-sm align-middle mr-1">info</span> 
              Saisissez le NIN à 15 chiffres figurant sur le document.
            </div>
            
            <button 
              onClick={handleVerify}
              className="w-full bg-primary text-white font-bold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/10 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">search</span> Lancer la vérification
            </button>
          </div>

          {/* RESULTS OVERLAY */}
          {verifyStatus !== 'idle' && (
            <div className="mt-8 pt-8 border-t border-outline-variant/10 relative">
              
              {verifyStatus === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
                  <span className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></span>
                  <p className="text-sm font-bold text-on-surface">Vérification cryptographique en cours...</p>
                  <p className="text-[10px] uppercase font-bold text-outline tracking-widest mt-1">Connexion au nœud principal</p>
                </div>
              )}

              {verifyStatus === 'valid' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-fadeIn relative flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">verified</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-900 border-b border-green-200/50 pb-1">DOCUMENT AUTHENTIQUE</p>
                      <p className="text-xs text-green-700 mt-1 uppercase font-bold">Vérifié sur Blockchain · il y a quelques secondes</p>
                    </div>
                  </div>
                  
                  {/* Visual Card Display */}
                  <div className="w-full space-y-4">
                    <div className="aspect-[1.58/1] bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-md group relative">
                      {resultData?.carteRectoUrl ? (
                        <img 
                          src={`http://localhost:4000${resultData.carteRectoUrl}`} 
                          alt="Carte Recto" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 select-none">
                          <span className="material-symbols-outlined text-4xl text-primary/20 mb-2">badge</span>
                          <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-4 text-center">
                            Aperçu numérique sécurisé
                          </div>
                        </div>
                      )}
                      {/* Floating Verification Seal */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm rounded-full p-1 border border-emerald-100">
                         <span className="material-symbols-outlined text-emerald-600 text-xl font-bold">verified</span>
                      </div>
                    </div>

                    {/* Info Summary under card */}
                    <div className="flex justify-between items-end px-1">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">{resultData?.numeroCarte || resultData?.metadata?.numeroCarte}</p>
                        <p className="text-base font-bold text-on-surface uppercase tracking-tight">{resultData?.citoyen?.prenom} {resultData?.citoyen?.nom}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono font-bold text-outline">NIN: {resultData?.citoyen?.nin || resultData?.metadata?.nin}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-end gap-1 mt-1">
                          Certifié Blockchain
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-on-background rounded-xl p-4 w-full border border-white/10 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg shadow-inner flex-shrink-0">
                      { (resultData?.blockchainHash || resultData?.txHash) ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(resultData?.blockchainHash || resultData?.txHash)}`} 
                          alt="Verification QR" 
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline/20">
                          <span className="material-symbols-outlined text-xl">qr_code_2</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] uppercase font-bold text-green-400 tracking-widest mb-1">Preuve d'ancrage vérifiée</p>
                      <p className="text-[10px] font-mono text-green-300 break-all leading-tight opacity-90">{resultData?.blockchainHash || resultData?.txHash}</p>
                    </div>
                  </div>

                  <div className="w-full mt-2 text-center">
                    <button onClick={() => setVerifyStatus('idle')} className="text-[11px] text-outline font-bold underline hover:text-on-surface transition-colors inline-block decoration-outline-variant/30">
                       Effectuer une nouvelle vérification
                    </button>
                  </div>
                </div>
              )}

              {verifyStatus === 'invalid' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-fadeIn relative flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">error</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-900 border-b border-red-200/50 pb-1">DOCUMENT REJETÉ</p>
                      <p className="text-xs text-red-700 mt-1 uppercase font-bold">Absence de l'identifiant sur le registre</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 w-full shadow-sm border border-red-100">
                    <p className="text-sm font-bold text-on-surface mb-2">Protocoles de signalement</p>
                    <ul className="text-xs text-outline space-y-1.5 list-disc list-inside">
                      <li>Assurez-vous de l'exactitude des identifiants saisis.</li>
                      <li>Le document a potentiellement fait l'objet d'une révocation administrative.</li>
                      <li>Saisissez l'autorité centrale en cas de non-conformité manifeste.</li>
                    </ul>
                    <button className="w-full mt-4 bg-tertiary text-white rounded-lg py-2.5 text-xs font-bold hover:bg-tertiary/90 transition-colors">
                      Générer un rapport d'anomalie
                    </button>
                  </div>

                  <div className="w-full mt-2 text-center">
                    <button onClick={() => setVerifyStatus('idle')} className="text-[10px] text-outline font-bold underline hover:text-on-surface inline-block">
                       Réessayer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BLOC 3: HISTORIQUE DES CONTRÔLES */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6 border-t border-outline-variant/10 pt-8">
          <h3 className="text-xl font-headline font-bold text-on-surface">Historique des Contrôles</h3>
          <span className="text-[10px] bg-surface-container-high px-2 py-1 rounded font-bold text-outline">TEMPS RÉEL</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
           <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
              <h4 className="text-xs uppercase font-bold text-outline tracking-widest">Dernières vérifications effectuées</h4>
              <button className="text-xs text-primary font-bold hover:underline">Exporter le registre</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-lowest text-[10px] uppercase tracking-widest text-outline font-bold border-b border-outline-variant/10">
                   <tr>
                      <th className="px-6 py-3 font-semibold">Horodatage</th>
                      <th className="px-6 py-3 font-semibold">Demandeur</th>
                      <th className="px-6 py-3 font-semibold">Titulaire</th>
                      <th className="px-6 py-3 font-semibold">Résultat API</th>
                      <th className="px-6 py-3 font-semibold">Référence</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                   {history.length > 0 ? history.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                         <td className="px-6 py-3 text-outline font-mono">{new Date(row.createdAt).toLocaleString()}</td>
                         <td className="px-6 py-3 font-bold text-on-surface-variant truncate max-w-[150px]">{row.institution}</td>
                         <td className="px-6 py-3 font-bold text-on-surface">{row.carte?.citoyen?.prenom} {row.carte?.citoyen?.nom}</td>
                         <td className="px-6 py-3">
                            <div className={`px-2 py-1 rounded inline-flex items-center gap-1.5 font-bold text-[10px] ${
                               row.resultat === 'VALIDE' ? 'bg-green-50 text-green-700' : 
                               row.resultat === 'INVALIDE' ? 'bg-red-50 text-red-700' : 
                               'bg-on-background text-white'
                            }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${row.resultat === 'VALIDE' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                               {row.resultat === 'VALIDE' ? 'AUTHENTIQUE' : row.resultat === 'INVALIDE' ? 'FRAUDE' : 'RÉVOQUÉ'}
                            </div>
                         </td>
                         <td className="px-6 py-3">
                            <span className="font-mono text-[10px] bg-surface-container-low px-1.5 py-0.5 rounded text-outline">{row.carte?.numeroCarte}</span>
                         </td>
                      </tr>
                   )) : (
                     <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-outline italic">Aucun log de vérification disponible</td>
                     </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      </div>
      
    </div>
  );
};

export default Verifications;
