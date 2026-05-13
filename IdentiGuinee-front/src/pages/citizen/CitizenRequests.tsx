import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandeService } from '../../services/demande.service';

const CitizenRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await demandeService.getMyDemandes();
        setRequests(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-headline font-bold text-primary">Mes Démarches</h2>
           <p className="text-xs text-outline mt-1">Suivi en direct de vos requêtes administratives</p>
        </div>
         <button 
           onClick={() => navigate('/citizen/dashboard', { state: { openRequestModal: true } })}
           className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all"
         >
           <span className="material-symbols-outlined text-sm">add</span> Nouvelle Démarche
         </button>
      </div>

      <div className="space-y-6">
         {requests.map((req) => (
           <div key={req.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
             {req.statut === 'DELIVREE' && <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full flex items-start justify-end p-4 z-0"><span className="material-symbols-outlined text-green-500">check_circle</span></div>}
             
             <div className="flex justify-between items-start mb-6">
                <div className="relative z-10">
                  <p className="text-[10px] font-mono text-outline font-bold mb-1">{req.reference}</p>
                  <h3 className="text-lg font-bold text-on-surface">
                    {req.type === 'PREMIERE_DEMANDE' ? 'Première Demande' : 
                     req.type === 'RENOUVELLEMENT' ? 'Renouvellement' : 
                     req.type === 'DUPLICATA' ? 'Duplicata' : req.type}
                  </h3>
                </div>
                <div className="text-right relative z-10 mr-12">
                  <p className="text-xs font-bold text-primary">{req.statut === 'DELIVREE' ? 'PRÊT' : '48h est.'}</p>
                  <p className="text-[10px] text-outline uppercase tracking-widest mt-1">État actuel</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className={req.statut === 'DELIVREE' ? 'text-green-600' : 'text-primary'}>
                    {req.statut}
                  </span>
                  <span className="text-outline">{req.progression}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${req.statut === 'DELIVREE' ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${req.progression}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-[10px] uppercase font-bold text-outline-variant pt-2">
                   <span>Initiée le {req.dateSoumission ? new Date(req.dateSoumission).toLocaleDateString() : '---'}</span>
                   <span>Blockchain: {(() => {
                     const tx = req.transactions?.find((t: any) => t.type === 'CARTE_DELIVREE');
                     if (tx?.txHash && tx.txHash.startsWith('0x') && tx.txHash.length > 40) {
                       return (
                         <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer" className="hover:underline">
                           {tx.txHash.substring(0, 10)}...
                         </a>
                       );
                     }
                     return req.carte?.blockchainHash?.substring(0, 10) || (req.statut === 'DELIVREE' ? 'Ancrage...' : '0x...');
                   })()}</span>
                </div>
              </div>

              {req.statut === 'DELIVREE' && (
                <div className="mt-6 pt-4 border-t border-outline-variant/10">
                  <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">visibility</span> Voir mon titre numérique
                  </button>
                </div>
              )}
           </div>
         ))}
         {requests.length === 0 && (
           <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/20">
             <span className="material-symbols-outlined text-6xl text-outline/20">description</span>
             <p className="text-sm text-outline mt-4">Vous n'avez pas encore de démarche en cours.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default CitizenRequests;
