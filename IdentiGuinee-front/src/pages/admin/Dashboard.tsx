import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/axios';
import { demandeService } from '../../services/demande.service';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { DashboardCardsSkeleton } from '../../components/common/DashboardCardsSkeleton';
import { Skeleton } from '../../components/common/Skeleton';
import { TableSkeleton } from '../../components/common/TableSkeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<{time: string, text: string, type?: string}[]>([]);

  // Simulation de l'activité blockchain en temps réel
  useEffect(() => {
    const messages = [
      { text: "BLOCK #294,012 VALIDATED - TX_COUNT: 42", type: "info" },
      { text: "NEW TRANSACTION INCOMING: 0x9f8...d421 [ECOWAS_CARD_DELIVERY]", type: "info" },
      { text: "HASH MATCHED: SHA-256 INTEGRITY VERIFIED", type: "info" },
      { text: "WARNING: MULTIPLE ATTEMPTS FROM IP 192.168.1.42 [BLOCKED BY FIREWALL]", type: "warning" },
      { text: "BLOCK #294,013 MINTING STARTED...", type: "info" },
      { text: "SYNCING WITH GLOBAL NODES [8/8 NODES REACHED]", type: "info" },
      { text: "NEW IDENTITY ANCHORED: 0x4d2...a892", type: "info" },
      { text: "CONSENSUS REACHED BY 6/8 VALIDATORS", type: "info" }
    ];

    const addLog = () => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
      setTerminalLogs(prev => [...prev, { ...msg, time }].slice(-8));
    };

    // Initial logs
    const initialLogs = [];
    for(let i = 0; i < 5; i++) {
       const msg = messages[i % messages.length];
       const d = new Date();
       d.setSeconds(d.getSeconds() - (20 - i*4));
       initialLogs.push({ ...msg, time: d.toLocaleTimeString('fr-FR', { hour12: false }) });
    }
    setTerminalLogs(initialLogs);

    const interval = setInterval(addLog, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatut = async (id: string, statut: string, progression: number) => {
    try {
      await demandeService.updateStatut(id, { statut, progression });
      toast.success(`Statut mis à jour : ${statut}`);
      // Actualisation
      const requestsRes = await demandeService.getAll(1, 10);
      setRecentRequests(requestsRes.data?.data?.demandes || requestsRes.data?.demandes || []);
      
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, statut, progression });
      }
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          demandeService.getStats(),
          demandeService.getAll(1, 10),
        ]);
        setStats(statsRes.data || statsRes);
        setRecentRequests(requestsRes.data?.demandes || requestsRes.data || []);
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
  // Chart Data
  const getWeeklyLabels = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const labels = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      labels.push(days[date.getDay()]);
    }
    return labels;
  };

  const barData = {
    labels: getWeeklyLabels(),
    datasets: [{
      label: 'Documents délivrés',
      data: stats?.weeklyStats || [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: '#0d631b',
      borderRadius: 4,
      barThickness: 24,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { borderDash: [2], color: '#e1e3dd' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  const donutData = {
    labels: ['Délivrés', 'En cours', 'Rejetés'],
    datasets: [{
      data: [stats?.delivrees || 0, (stats?.soumises || 0) + (stats?.enVerification || 0) + (stats?.enProduction || 0), stats?.rejetees || 0],
      backgroundColor: ['#0d631b', '#fcab28', '#ac0c18'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
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
                       
                       <div className="bg-surface-container-low p-5 rounded-2xl space-y-4 text-left">
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
                   
                   <div className="lg:col-span-2">
                        {pdfLoading ? (
                          <div className="aspect-video bg-surface-container-high rounded-2xl flex flex-col items-center justify-center gap-4">
                             <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                             <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Chargement sécurisé...</p>
                          </div>
                        ) : pdfUrl ? (
                          <div className="aspect-video bg-surface-container-high rounded-2xl overflow-hidden shadow-inner border border-outline-variant/10">
                             <iframe 
                               src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                               className="w-full h-full border-none"
                               title="Extrait"
                             />
                          </div>
                        ) : (
                          <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-red-400 text-center">
                             <span className="material-symbols-outlined text-4xl">error_outline</span>
                             <p className="text-xs font-bold mt-2">Aucun document fourni</p>
                          </div>
                        )}
                       
                       <div className="mt-8 flex gap-2">
                          {selectedRequest.statut === 'SOUMISE' && (
                            <button onClick={() => handleUpdateStatut(selectedRequest.id, 'VERIFICATION', 30)} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-bold shadow-lg hover:scale-[1.02] transition-transform">APPROUVER</button>
                          )}
                          <button className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors">REJETER</button>
                       </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
      {/* KPI Cards Grid */}
      {loading ? (
        <DashboardCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-primary">
            <p className="text-outline text-xs mb-1">Total Demandes</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-headline font-bold text-on-surface">{stats?.total || 0}</h3>
              <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                En cours: {stats?.soumises || 0}
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#2e7d32]">
            <p className="text-outline text-xs mb-1">Délivrés auto</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-headline font-bold text-on-surface">{stats?.delivrees || 0}</h3>
              <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">check_circle</span> {stats?.tauxDelivrance || 0}%
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#fcab28]">
            <p className="text-outline text-xs mb-1">En attente</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-headline font-bold text-on-surface">{stats?.enAttente || 0}</h3>
              <span className="text-secondary text-[10px] font-bold bg-secondary/5 px-2 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">pending</span> Action requise
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 signature-card shadow-sm border-l-4 border-[#ac0c18]">
            <p className="text-outline text-xs mb-1">Fraudes bloquées</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-headline font-bold text-on-surface">{stats?.fraudes || 0}</h3>
              <span className="text-tertiary text-[10px] font-bold bg-tertiary/5 px-2 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">security</span> Vigilance
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations & Activity */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] w-full lg:col-span-2 rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-headline font-bold text-lg text-primary">Documents délivrés</h4>
                <p className="text-[10px] text-outline uppercase tracking-widest">Analyse sur les 7 derniers jours</p>
              </div>
              <select className="bg-surface-container-low border-none text-[10px] rounded-lg px-3 py-1 font-bold text-outline outline-none">
                <option>Cette semaine</option>
                <option>Mois dernier</option>
              </select>
            </div>
            <div className="h-64">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
            <h4 className="font-headline font-bold text-lg text-primary mb-1">Répartition par statut</h4>
            <p className="text-[10px] text-outline uppercase tracking-widest mb-8">État global du registre</p>
            <div className="h-56 flex items-center justify-center relative">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-headline text-primary">{stats?.total || 0}</span>
                <span className="text-[10px] text-outline">Total</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Validés</span>
                <span className="font-bold">{stats?.total > 0 ? Math.round((stats.delivrees / stats.total) * 100) : 0}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> En cours</span>
                <span className="font-bold">{stats?.total > 0 ? Math.round(((stats.soumises + stats.enVerification + stats.enProduction) / stats.total) * 100) : 0}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Rejetés</span>
                <span className="font-bold">{stats?.total > 0 ? Math.round((stats.rejetees / stats.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50">
          <h4 className="font-headline font-bold text-primary">Dernières demandes transmises</h4>
          <button className="text-xs font-bold text-primary hover:underline">Voir tout le registre</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-outline text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3 font-semibold">Identifiant / Citoyen</th>
                <th className="px-6 py-3 font-semibold">Type de Document</th>
                <th className="px-6 py-3 font-semibold">Date de dépôt</th>
                <th className="px-6 py-3 font-semibold">Statut Blockchain</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <TableSkeleton columns={5} rows={5} />
              ) : recentRequests.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-outline italic">Aucune demande transmise récemment</td></tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {req.citoyen.prenom[0]}{req.citoyen.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{req.citoyen.prenom} {req.citoyen.nom}</p>
                          <p className="text-[10px] font-mono text-outline font-bold">REF: {req.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{req.type}</td>
                    <td className="px-6 py-4 text-xs text-outline font-bold tracking-tight">
                      {(() => {
                        const d = req.dateSoumission || req.createdAt ? new Date(req.dateSoumission || req.createdAt) : null;
                        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR') : '---';
                      })()}
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
                      <button 
                        onClick={() => openQuickView(req)}
                        className="p-2 hover:bg-surface-container-highest rounded transition-colors text-outline"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockchain Terminal Activity */}
      <div className="bg-[#0D1B2A] rounded-lg p-6 terminal-glow border border-white/5 font-mono shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <h5 className="ml-4 text-xs text-white/50 uppercase tracking-widest font-bold">Activité Blockchain en temps réel</h5>
          </div>
        </div>
        <div className="space-y-1 overflow-hidden h-40 text-[11px] leading-relaxed flex flex-col justify-end">
          {terminalLogs.map((log, index) => (
            <p key={index} className={`${log.type === 'warning' ? 'text-[#fcab28]' : 'text-green-500'} opacity-90`}>
              <span className="text-white/30 mr-2">[{log.time}]</span> {log.text}
            </p>
          ))}
          <p className="text-green-500">_ <span className="animate-pulse inline-block w-2 h-4 bg-green-500 ml-1"></span></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
