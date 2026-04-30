import React, { useState, useEffect } from 'react';

const Blockchain: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] INITIATING SECURE CONNECTION TO GN_MAINNET...",
    "[SYSTEM] HANDSHAKE SUCCESSFUL. NODE: CONAKRY_04",
    "[SYNC] VALIDATING PREVIOUS BLOCKS... 100% COMPLETE",
    "[INFO] LISTENING FOR NEW TRANSACTIONS..."
  ]);

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

    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, events[i % events.length]];
        return newLogs.slice(-15); // Keep only last 15 lines
      });
      i++;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const ledgerTransactions = [
    { block: '#294,013', type: 'Délivrance_CNI', hash: '0x4f2a8b3c9d1e5f7a2b4c6d8e0f1a3b5c7d9e1f2a', date: 'Il y a 12s', status: 'confirmé' },
    { block: '#294,012', type: 'Vérification_AFIS', hash: '0x3e1b7c2d8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d', date: 'Il y a 2m', status: 'confirmé' },
    { block: '#294,012', type: 'Inscription_Naissance', hash: '0x5g3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s', date: 'Il y a 2m', status: 'confirmé' },
    { block: '#294,011', type: 'Révocation_Passeport', hash: '0x7e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d', date: 'Il y a 5m', status: 'confirmé' },
    { block: '#294,010', type: 'Tentative_Doublon', hash: '0x2b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c', date: 'Il y a 8m', status: 'rejeté' },
    { block: '#294,009', type: 'Délivrance_Extrait', hash: '0x1d5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f', date: 'Il y a 14m', status: 'confirmé' },
  ];

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
          <h3 className="text-2xl font-mono font-bold text-primary">294,013</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Temps de bloc moyen</p>
          <h3 className="text-2xl font-mono font-bold text-primary">2.4<span className="text-base text-outline ml-1">sec</span></h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Délai d'émission (avg)</p>
          <h3 className="text-2xl font-mono font-bold text-primary">~48<span className="text-base text-outline ml-1">h</span></h3>
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
            if (log.includes("[WARNING]") || log.includes("[SECURITY]")) color = "text-error";
            if (log.includes("[SYNC]") || log.includes("[INFO]")) color = "text-outline";
            if (log.includes("[CONTRACT]")) color = "text-secondary hover:text-white";

            return (
              <p key={index} className={`font-mono text-xs ${color} opacity-90 transition-opacity`}>
                <span className="text-white/30 mr-3">[{new Date().toISOString().substring(11, 19)}]</span>
                {log}
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
              {ledgerTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{tx.block}</td>
                  <td className="px-6 py-4 text-xs text-outline">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className="bg-secondary/10 text-secondary-container px-2 py-1 rounded text-[10px] font-bold border border-secondary/20">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] text-outline bg-surface-container-low px-2 py-1 rounded">
                      {tx.hash}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'confirmé' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Confirmé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-error uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">block</span>
                        Rejeté
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Blockchain;
