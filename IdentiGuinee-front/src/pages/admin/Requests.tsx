import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/axios';
import { demandeService } from '../../services/demande.service';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/common/TableSkeleton';


const Requests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, statsRes] = await Promise.all([
          demandeService.getAll(),
          demandeService.getStats()
        ]);
        // Structure API: { success: true, data: { demandes: [], total: ... } }
        setRequests(requestsRes.data?.demandes || requestsRes.data || []);
        setStats(statsRes.data || statsRes);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatut = async (id: string, statut: string, progression: number) => {
    try {
      setLoading(true);
      await demandeService.updateStatut(id, { statut, progression });
      toast.success(`Statut mis à jour : ${statut}`);
      // Actualisation
      const requestsRes = await demandeService.getAll();
      setRequests(requestsRes.data?.demandes || requestsRes.data.data?.demandes || []);
      
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, statut, progression });
      }
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const openQuickView = async (req: any) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
    
    if (req.extraitNaissanceUrl) {
      setPdfLoading(true);
      try {
        const filename = req.extraitNaissanceUrl.split('/').pop();
        const blob = await demandeService.getDocumentBlob(filename);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Erreur PDF:", error);
        toast.error("Impossible de charger l'extrait de naissance");
      } finally {
        setPdfLoading(false);
      }
    }
  };

  const closeQuickView = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Search & Filter Header removed for brevity, keep existing logic */}
      
      {/* Modal de Vue Rapide */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-outline-variant/20">
             <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div>
                   <h3 className="text-xl font-headline font-bold text-primary">Dossier de Demande</h3>
                   <p className="text-[10px] text-outline font-bold uppercase tracking-widest">{selectedRequest.reference}</p>
                </div>
                <button onClick={closeQuickView} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all text-outline">
                   <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Col 1: Photo & Citoyen */}
                   <div className="space-y-6">
                      <div className="text-center">
                         <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto border-4 border-white shadow-lg ring-1 ring-outline-variant/20">
                            <img 
                              src={selectedRequest.citoyen.photoUrl ? `${API_BASE_URL}${selectedRequest.citoyen.photoUrl}` : `https://ui-avatars.com/api/?name=${selectedRequest.citoyen.prenom}+${selectedRequest.citoyen.nom}&background=0d631b&color=fff`} 
                              className="w-full h-full object-cover" 
                              alt="Profil" 
                            />
                         </div>
                         <h4 className="mt-4 font-bold text-lg text-on-surface">{selectedRequest.citoyen.prenom} {selectedRequest.citoyen.nom}</h4>
                         <p className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded inline-block mt-1">NIN: {selectedRequest.citoyen.nin || 'NON ATTRIBUÉ'}</p>
                      </div>
                      
                      <div className="bg-surface-container-low p-5 rounded-2xl space-y-4">
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Sexe:</span>
                            <span className="font-bold">{selectedRequest.citoyen.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Nationalité:</span>
                            <span className="font-bold">{selectedRequest.citoyen.nationalite || 'Guinéenne'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Naissance:</span>
                            <span className="font-bold">{new Date(selectedRequest.citoyen.dateNaissance).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Lieu:</span>
                            <span className="font-bold">{selectedRequest.citoyen.lieuNaissance}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Taille:</span>
                            <span className="font-bold">{selectedRequest.citoyen.taille || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Région:</span>
                            <span className="font-bold">{selectedRequest.citoyen.region?.nom || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Préfecture:</span>
                            <span className="font-bold">{selectedRequest.citoyen.prefecture?.nom || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">S-Préfecture:</span>
                            <span className="font-bold">{selectedRequest.citoyen.sousPrefecture?.nom || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Quartier:</span>
                            <span className="font-bold">{selectedRequest.citoyen.quartier || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span className="text-outline">Secteur/Vill.:</span>
                            <span className="font-bold">{selectedRequest.citoyen.secteurVillage || 'N/A'}</span>
                         </div>
                         <div className="pt-2">
                            <p className="text-[9px] font-black text-outline uppercase tracking-tighter mb-2">Contact</p>
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-xs">
                                  <span className="material-symbols-outlined text-sm text-primary">phone</span>
                                  <span className="font-bold">{selectedRequest.citoyen.user?.telephone || 'N/A'}</span>
                               </div>
                               <div className="flex items-center gap-2 text-xs">
                                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                                  <span className="truncate max-w-[150px] font-medium opacity-80">{selectedRequest.citoyen.user?.email || 'N/A'}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Col 2 & 3: Document & Actions */}
                   <div className="lg:col-span-2 space-y-6">
                      <div>
                         <h5 className="text-[10px] font-black text-outline uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">description</span>
                            Justificatif : Extrait de Naissance
                         </h5>
                         {pdfLoading ? (
                            <div className="aspect-[4/5] bg-surface-container-high rounded-2xl flex flex-col items-center justify-center gap-4">
                               <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                               <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Chargement sécurisé...</p>
                            </div>
                          ) : pdfUrl ? (
                            <div className="aspect-[4/5] bg-surface-container-high rounded-2xl border border-outline-variant/20 overflow-hidden shadow-inner relative group">
                               <iframe 
                                 src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                 className="w-full h-full border-none"
                                 title="Extrait"
                               />
                               <div className="absolute inset-0 bg-primary/5 pointer-events-none group-hover:opacity-0 transition-opacity"></div>
                            </div>
                          ) : (
                            <div className="aspect-[4/5] bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-red-400 gap-2">
                               <span className="material-symbols-outlined text-4xl">error_outline</span>
                               <p className="text-xs font-bold">Aucun document fourni</p>
                            </div>
                          )}
                      </div>
                      
                      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                         <div className="flex justify-between items-center">
                            <div>
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">ID Extrait de Naissance</p>
                               <p className="font-mono text-sm font-bold text-primary">{selectedRequest.extraitNaissanceId || 'NON RENSEIGNÉ'}</p>
                            </div>
                            {selectedRequest.extraitNaissanceId && (
                               <div className="flex items-center gap-2">
                                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                  <span className="text-[10px] font-black text-green-600 uppercase">Vérifié (Auto)</span>
                               </div>
                            )}
                         </div>
                         {!selectedRequest.extraitNaissanceId && (
                            <p className="text-[10px] text-red-500 italic">Attention: Aucun ID d'extrait fourni par l'usager.</p>
                         )}
                      </div>

                      <div className="p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-3xl flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-outline uppercase mb-1">Statut Actuel</p>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black ${
                              selectedRequest.statut === 'DELIVREE' ? 'bg-green-100 text-green-700' :
                              selectedRequest.statut === 'REJETEE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>{selectedRequest.statut}</span>
                         </div>
                         <div className="flex gap-2">
                            {selectedRequest.statut === 'SOUMISE' && (
                               <button onClick={() => handleUpdateStatut(selectedRequest.id, 'VERIFICATION', 30)} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">APPROUVER LE DOSSIER</button>
                            )}
                            {selectedRequest.statut === 'VERIFICATION' && (
                               <button onClick={() => handleUpdateStatut(selectedRequest.id, 'PRODUCTION', 60)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform">LANCER LA PRODUCTION</button>
                            )}
                            <button className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors">REJETER</button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-title font-bold text-[#1A3A1C]">Gestion des demandes</h2>
          <p className="text-xs text-[#78909C]">Suivi et traitement des demandes de documents d'identité</p>
        </div>
        <div className="flex flex-wrap gap-2 font-bold tracking-tighter uppercase">
          <span className="px-3 py-1 bg-surface-container-low text-[11px] text-outline rounded-full border border-outline-variant/20">● {stats?.total || 0} au total</span>
          <span className="px-3 py-1 bg-green-50 text-[11px] text-green-700 rounded-full border border-green-200">✓ {stats?.delivrees || 0} délivrées</span>
          <span className="px-3 py-1 bg-orange-50 text-[11px] text-orange-700 rounded-full border border-orange-200">⚠ {stats?.soumises || 0} en attente</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 h-10 text-sm focus:ring-primary/20 outline-none" 
            placeholder="Chercher par nom, NIN, ID dossier..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-surface-container-low border-none rounded-lg h-10 px-4 text-sm text-on-surface-variant focus:ring-primary/20 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Tous les statuts</option>
          <option>Délivré</option>
          <option>En attente</option>
        </select>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline font-bold">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">ID Dossier</th>
              <th className="px-6 py-4">Nom complet</th>
              <th className="px-6 py-4">Soumis le</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <TableSkeleton columns={6} />
            ) : (() => {
              const filteredRequests = requests.filter(req => {
                if (statusFilter === 'Délivré' && req.statut !== 'DELIVREE') return false;
                if (statusFilter === 'En attente' && (req.statut === 'DELIVREE' || req.statut === 'REJETEE')) return false;
                if (searchTerm) {
                  const term = searchTerm.toLowerCase();
                  const nom = req.citoyen?.nom?.toLowerCase() || '';
                  const prenom = req.citoyen?.prenom?.toLowerCase() || '';
                  const nin = req.citoyen?.nin?.toLowerCase() || '';
                  const ref = req.reference?.toLowerCase() || '';
                  if (!nom.includes(term) && !prenom.includes(term) && !nin.includes(term) && !ref.includes(term)) {
                    return false;
                  }
                }
                return true;
              });

              if (filteredRequests.length === 0) {
                return (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-outline italic">
                      Aucune demande trouvée.
                    </td>
                  </tr>
                );
              }

              return filteredRequests.map((req, i) => (
                <tr key={req.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-outline">{i+1}</td>
                  <td className="px-6 py-4 font-mono text-[11px] font-bold">{req.reference}</td>
                  <td className="px-6 py-4 text-sm font-bold">{req.citoyen.prenom} {req.citoyen.nom}</td>
                  <td className="px-6 py-4 text-xs text-outline">
                    {(() => {
                      const d = req.dateSoumission ? new Date(req.dateSoumission) : null;
                      return d && !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR') : '---';
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      req.statut === 'DELIVREE' ? 'bg-green-50 text-green-700' :
                      req.statut === 'REJETEE' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                    }`}>{req.statut}</span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => openQuickView(req)}
                      className="p-1.5 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="Voir les détails"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    {req.statut === 'SOUMISE' && (
                      <button onClick={() => handleUpdateStatut(req.id, 'VERIFICATION', 30)} className="bg-primary text-white px-2 py-1 rounded text-[10px] font-bold">VÉRIFIER</button>
                    )}
                    {req.statut === 'VERIFICATION' && (
                      <button onClick={() => handleUpdateStatut(req.id, 'PRODUCTION', 60)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">PRODUIRE</button>
                    )}
                    {req.statut === 'PRODUCTION' && (
                      <button onClick={() => handleUpdateStatut(req.id, 'DELIVREE', 100)} className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold">DÉLIVRER</button>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;
