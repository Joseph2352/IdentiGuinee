import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../services/blockchain.service';
import { toast } from 'react-hot-toast';

const Blockchain: React.FC = () => {
  const [logs, setLogs] = useState<{time: string, text: string}[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        blockchainService.getAll(1, 10),
        blockchainService.getStats()
      ]);
      setTransactions(txRes.data?.transactions || []);
      setStats(statsRes.data || statsRes);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time blocks
  useEffect(() => {
    const events = [
      "[TX_IN] DETECTED: NEW CITIZEN REGISTRATION (NIN: 1990x...)",
      "[CONTRACT] EXECUTING IdentityMint.sol...",
      "[CONTRACT] VERIFYING BIOMETRIC HASH INTEGRITY...",
      "[CONTRACT] SUCCESS: HASH MATCHED. WRITING TO LEDGER.",
      "[BLOCK] MINING BLOCK #294,013...",
      "[BLOCK] BLOCK #294,013 MINED SECONDS AGO. REWARD ISSUED.",
      "[TX_IN] DETECTED: IDENTITY VERIFICATION REQUEST (NODE: MSPC)",
      "[LEDGER] VERDICT: AUTHENTIC. TIMESTAMP LOGGED.",
      "[WARNING] DETECTED MULTIPLE FAILED ATTEMPTS FROM IP 10.x.x.x",
      "[SECURITY] DISCARDING INVALID TX HASH."
    ];

    // Initial logs
    const initialLogs = [
      { text: "[SYSTEM] INITIATING SECURE CONNECTION TO GN_MAINNET...", time: new Date(Date.now() - 10000).toISOString().substring(11, 19) },
      { text: "[SYSTEM] HANDSHAKE SUCCESSFUL. NODE: CONAKRY_04", time: new Date(Date.now() - 8000).toISOString().substring(11, 19) },
      { text: "[SYNC] VALIDATING PREVIOUS BLOCKS... 100% COMPLETE", time: new Date(Date.now() - 5000).toISOString().substring(11, 19) },
      { text: "[INFO] LISTENING FOR NEW TRANSACTIONS...", time: new Date(Date.now() - 2000).toISOString().substring(11, 19) }
    ];
    setLogs(initialLogs);

    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const time = new Date().toISOString().substring(11, 19);
        const newLogs = [...prev, { text: events[i % events.length], time }];
        return newLogs.slice(-15); // Keep only last 15 lines
      });
      i++;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-body">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">Registre Blockchain (Ledger)</h2>
          <p className="text-xs text-outline mt-1">Surveillance en temps réel de l'infrastructure décentralisée (Mainnet)</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 border border-green-200 rounded-lg shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest">Réseau Opérationnel</span>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Hauteur du bloc</p>
          <h3 className="text-2xl font-mono font-bold text-primary">{stats?.total || 294013}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Total Transactions</p>
          <h3 className="text-2xl font-mono font-bold text-primary">{stats?.total || 0}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Vérifications</p>
          <h3 className="text-2xl font-mono font-bold text-primary">{stats?.verifications || 0}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Nœuds Validateurs Actifs</p>
          <h3 className="text-2xl font-mono font-bold text-primary">8<span className="text-base text-outline ml-1">/ 8</span></h3>
        </div>
      </div>

      {/* SIMULATED TERMINAL */}
      <div className="bg-[#0A1628] rounded-xl p-6 shadow-[0_10px_30px_-10px_#0A1628] border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error"></span>
            <span className="w-3 h-3 rounded-full bg-secondary"></span>
            <span className="w-3 h-3 rounded-full bg-[#1B5E20]"></span>
            <h5 className="ml-3 text-[10px] text-white/50 uppercase tracking-widest font-bold">NaissanceChain GN - /var/log/node04.log</h5>
          </div>
          <span className="text-[10px] text-green-400 opacity-80 uppercase font-bold tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lan</span> CONNECTÉ
          </span>
        </div>
        <div className="space-y-1.5 h-[180px] overflow-hidden flex flex-col justify-end">
          {logs.map((log, index) => {
            let color = "text-green-400"; // default
            if (log.text.includes("[WARNING]") || log.text.includes("[SECURITY]")) color = "text-error";
            if (log.text.includes("[SYNC]") || log.text.includes("[INFO]")) color = "text-outline";
            if (log.text.includes("[CONTRACT]")) color = "text-secondary hover:text-white";

            return (
              <p key={index} className={`font-mono text-xs ${color} opacity-90 transition-opacity`}>
                <span className="text-white/30 mr-3">[{log.time}]</span>
                {log.text}
              </p>
            );
          })}
          <p className="font-mono text-xs text-green-400 mt-2">
            _<span className="w-2.5 h-4 bg-green-400 inline-block align-middle ml-1 animate-pulse"></span>
          </p>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mt-6">
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
          <h4 className="text-xs uppercase font-bold text-outline tracking-widest">Grand Livre Inaltérable (Dernières Transactions)</h4>
          <div className="flex gap-2">
            <button className="text-[10px] bg-white px-3 py-1.5 rounded border border-outline-variant/20 hover:bg-surface-container-low flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[14px]">filter_list</span> Filtrer
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase font-bold tracking-widest text-outline/80">
                <th className="px-6 py-4">Bloc</th>
                <th className="px-6 py-4">Horodatage</th>
                <th className="px-6 py-4">Action Smart Contract</th>
                <th className="px-6 py-4">Hash d'Ancrage (SHA-256)</th>
                <th className="px-6 py-4 text-right">Statut Consensus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{tx.blockNumber || '---'}</td>
                  <td className="px-6 py-4 text-xs text-outline">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-secondary/10 text-secondary-container px-2 py-1 rounded text-[10px] font-bold border border-secondary/20 uppercase">
                      {tx.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-primary hover:text-primary-container bg-primary/5 px-2 py-1 rounded border border-primary/10 transition-colors flex items-center gap-1 w-fit"
                      title="Voir sur l'explorateur (Sepolia)"
                    >
                      {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 10)}
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Confirmé
                    </span>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={5} className="py-12 text-center text-outline italic">Chargement du ledger...</td></tr>}
              {!loading && transactions.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-outline italic">Aucune transaction enregistrée</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Blockchain;
