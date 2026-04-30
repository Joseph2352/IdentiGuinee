import React, { useState, useEffect } from 'react';
import { carteService } from '../../services/carte.service';
import { toast } from 'react-hot-toast';

const Documents: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [cartes, setCartes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartes = async (page = 1) => {
    setLoading(true);
    try {
      const res = await carteService.getAll(page);
      setCartes(res.cartes);
    } catch (error) {
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartes();
  }, []);

  const openModal = (doc: any) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const handleDownloadPDF = (id: string) => {
    window.open(carteService.getPDFUrl(id), '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-title font-bold text-[#1A3A1C]">Documents délivrés</h2>
          <p className="text-xs text-[#78909C]">Registre officiel des titres d'identité certifiés par Blockchain</p>
        </div>
        <div className="flex items-center bg-surface-container-low rounded-lg p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button 
             onClick={() => setViewMode('list')}
             className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-xl">list</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-primary animate-pulse">Chargement du registre...</p>
        </div>
      ) : cartes.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline/20">folder_open</span>
          <p className="text-outline mt-4">Aucun document n'a été délivré pour le moment.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartes.map((carte) => (
            <div key={carte.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-outline-variant/10 flex flex-col group hover:shadow-md transition-all">
              <div className="tricolor-bar shrink-0"></div>
              <div className="card-doc-gradient p-4 flex justify-between items-start text-white">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl opacity-80">badge</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">CNI ECOWAS</p>
                    <p className="font-bold text-sm tracking-tighter">{carte.numeroCarte}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 uppercase tracking-tighter ${carte.statut === 'ACTIVE' ? 'bg-white/20 border-white/30 text-white' : 'bg-red-500/20 border-red-500/30 text-red-100'}`}>
                  <span className="material-symbols-outlined text-[10px] fill-1">{carte.statut === 'ACTIVE' ? 'verified' : 'cancel'}</span> {carte.statut}
                </span>
              </div>
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center font-bold text-primary border border-primary/10 uppercase">
                    {carte.citoyen.prenom[0]}{carte.citoyen.nom[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface uppercase">{carte.citoyen.prenom} {carte.citoyen.nom}</h4>
                    <p className="text-[10px] font-mono text-outline font-bold">NIN: {carte.citoyen.nin || 'Non assigné'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/5">
                  <div><p className="text-[9px] text-outline uppercase font-bold">Émission</p><p className="text-xs font-semibold">{new Date(carte.dateEmission).toLocaleDateString()}</p></div>
                  <div><p className="text-[9px] text-outline uppercase font-bold">Lieu</p><p className="text-xs font-semibold">{carte.lieuDelivrance || 'Conakry'}</p></div>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/10">
                <p className="text-[9px] font-mono text-blue-700 truncate mb-3 font-bold opacity-60">TX: {carte.blockchainHash || '0x...'}</p>
                <div className="flex gap-2 text-[11px] font-bold uppercase tracking-tighter">
                  <button 
                    onClick={() => openModal(carte)}
                    className="flex-1 bg-white border border-primary/20 text-primary py-2 rounded hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    Voir ↗
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(carte.id)}
                    className="flex-1 bg-white border border-outline-variant/30 text-outline py-2 rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1"
                  >
                    PDF ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline font-bold">
              <tr>
                <th className="px-6 py-4">NIN</th>
                <th className="px-6 py-4">Titulaire</th>
                <th className="px-6 py-4">Date Délivrance</th>
                <th className="px-6 py-4">Lieu</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {cartes.map((carte) => (
                <tr key={carte.id} className="hover:bg-surface-container-low transition-colors text-xs font-bold tracking-tight">
                  <td className="px-6 py-4 font-mono">{carte.citoyen.nin || '---'}</td>
                  <td className="px-6 py-4 text-on-surface uppercase">{carte.citoyen.prenom} {carte.citoyen.nom}</td>
                  <td className="px-6 py-4">{new Date(carte.dateEmission).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{carte.lieuDelivrance || 'Conakry'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openModal(carte)}
                      className="text-primary hover:underline"
                    > 
                      Voir ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[150] bg-[#1A3A1C]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white w-full max-w-[500px] max-h-[90vh] rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-fadeIn border border-outline-variant/20">
            {/* Minimal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                <h3 className="font-bold text-on-surface text-sm tracking-tight uppercase">Document certifié</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-outline text-lg">close</span>
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Main Card View */}
              <div className="space-y-4">
                <div className="aspect-[1.58/1] bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm group">
                  {selectedDoc?.carteRectoUrl ? (
                    <img src={`http://localhost:4000${selectedDoc.carteRectoUrl}`} alt="Carte Recto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline/30">
                      <span className="material-symbols-outlined text-4xl">badge</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-1">
                   <div>
                     <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{selectedDoc?.numeroCarte}</p>
                     <p className="text-xs font-bold text-on-surface uppercase">{selectedDoc?.citoyen.prenom} {selectedDoc?.citoyen.nom}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Émis le</p>
                     <p className="text-xs font-bold text-on-surface">{new Date(selectedDoc?.dateEmission).toLocaleDateString()}</p>
                   </div>
                </div>
              </div>

              {/* Minimal Verification Section */}
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
                <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-sm border border-outline-variant/10">
                  {selectedDoc?.qrCodeData ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedDoc?.qrCodeData)}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline/20">
                      <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Authentification Blockchain</p>
                  <p className="text-[10px] font-mono text-outline truncate mb-1">{selectedDoc?.blockchainHash || '0x...'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Intégrité vérifiée</span>
                  </div>
                </div>
              </div>

              {/* Compact Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface-container-lowest border border-outline-variant/10 p-3 rounded-lg">
                    <p className="text-[8px] text-outline uppercase font-bold mb-0.5">NIN</p>
                    <p className="text-[10px] font-mono font-bold text-on-surface">{selectedDoc?.citoyen.nin || '---'}</p>
                 </div>
                 <div className="bg-surface-container-lowest border border-outline-variant/10 p-3 rounded-lg">
                    <p className="text-[8px] text-outline uppercase font-bold mb-0.5">Sexe</p>
                    <p className="text-[10px] font-bold text-on-surface">{selectedDoc?.citoyen.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-surface-container-low/30 border-t border-outline-variant/10 flex flex-col gap-2">
              <button 
                onClick={() => handleDownloadPDF(selectedDoc?.id)}
                className="w-full bg-primary text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all uppercase tracking-widest active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Télécharger le titre numérique
              </button>
              <button className="w-full text-error/60 py-2 text-[10px] font-bold hover:text-error transition-all uppercase tracking-widest">
                Invalider le document
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-surface-container-high text-outline py-3 rounded-xl text-xs font-bold hover:bg-surface-container-highest transition-all uppercase tracking-widest"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
