import React from 'react';

const Citizens: React.FC = () => {
  const citizensList = [
    { id: '1', nin: '199061203647631', name: 'BAH Oumar', dob: '12/06/1999', status: 'verified', hash: '0x4f2a...1a2b', date: 'Aujourd\'hui, 10:24' },
    { id: '2', nin: '198503124891022', name: 'DIALLO Fatoumata', dob: '03/12/1985', status: 'verified', hash: '0x3e1b...c782', date: 'Aujourd\'hui, 09:12' },
    { id: '3', nin: '199706044421837', name: 'KOUYATÉ Aissatou', dob: '06/04/1997', status: 'flagged', hash: 'N/A (Anomalie)', date: 'Hier, 16:45' },
    { id: '4', nin: '200107085634711', name: 'SYLLA Ibrahim', dob: '07/08/2001', status: 'pending_auto', hash: 'En cours d\'ancrage...', date: 'Hier, 14:30' },
    { id: '5', nin: '200312201145609', name: 'CONDÉ Sékou', dob: '20/12/2003', status: 'verified', hash: '0x5g3a...e812', date: '11/04/2026' },
    { id: '6', nin: '199209143302814', name: 'BARRY Thierno', dob: '14/09/1992', status: 'verified', hash: '0x1d5f...a044', date: '11/04/2026' },
    { id: '7', nin: '200109172234561', name: 'FOFANA Moussa', dob: '17/09/2001', status: 'flagged', hash: 'Incohérence AFIS', date: '10/04/2026' },
    { id: '8', nin: '199604287412093', name: 'TRAORÉ Lansana', dob: '28/04/1996', status: 'verified', hash: '0xbk7f...c119', date: '09/04/2026' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-body">
      
      {/* HEADER & METRICS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">Annuaire Citoyen</h2>
          <p className="text-xs text-outline mt-1">Registre national automatisé et sécurisé par Blockchain (0 intermédiaire)</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all">
            <span className="material-symbols-outlined text-sm">person_add</span> Inscription Manuelle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-widest text-outline">Total Citoyens Enregistrés</span>
            <span className="material-symbols-outlined text-primary/40 text-2xl">groups</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-on-surface">3,492,041</h3>
          <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> +12k ce mois
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-widest text-outline">Validation Automatisée</span>
            <span className="material-symbols-outlined text-primary/40 text-2xl">auto_awesome</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-on-surface">98.5%</h3>
          <p className="text-[10px] text-primary font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">security</span> Sans intervention humaine
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 border-l-4 border-l-error">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-widest text-outline">Anomalies AFIS / Fraudes</span>
            <span className="material-symbols-outlined text-error/40 text-2xl">warning</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-on-surface">142</h3>
          <p className="text-[10px] text-error font-bold mt-2 flex items-center gap-1">
            Bloqués en quarantaine système
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10 mt-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/60 text-lg">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline/50" 
            placeholder="Rechercher par NIN, nom, ou adresse biométrique..." 
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-surface-container-low border-none rounded-lg h-11 px-4 text-sm text-on-surface-variant font-medium outline-none focus:ring-2 focus:ring-primary/20 flex-1 md:w-48">
            <option>Tous les statuts</option>
            <option>Certifié Blockchain</option>
            <option>Anomalie Biométrique</option>
          </select>
          <button className="bg-surface-container-low text-on-surface p-2.5 rounded-lg border-none hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* CITIZENS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-outline">Citoyen & Naissance</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-outline">Numéro Identification (NIN)</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-outline">Statut Réglementaire</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-outline">Empreinte Blockchain</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {citizensList.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        citizen.status === 'verified' ? 'bg-primary/10 text-primary' : 
                        citizen.status === 'flagged' ? 'bg-error/10 text-error' : 
                        'bg-secondary/10 text-secondary'
                      }`}>
                        {citizen.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{citizen.name}</p>
                        <p className="text-[10px] text-outline mt-0.5">Né(e) le {citizen.dob}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-primary tracking-tighter bg-primary/5 px-2 py-1 rounded">
                      {citizen.nin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {citizen.status === 'verified' && (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Actif
                        </span>
                      )}
                      {citizen.status === 'pending_auto' && (
                        <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">cycle</span> Auto-examen
                        </span>
                      )}
                      {citizen.status === 'flagged' && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">warning</span> Suspect
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-mono text-[10px] truncate max-w-[120px] ${citizen.status === 'verified' ? 'text-green-600' : 'text-outline'}`}>
                      {citizen.hash}
                    </p>
                    <p className="text-[9px] text-outline mt-0.5 uppercase tracking-wide">{citizen.date}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:underline text-xs font-bold px-3 py-1.5 rounded hover:bg-primary/5 transition-colors">Consulter Profil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Simplifiée */}
        <div className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/10 flex justify-between items-center text-xs text-outline font-medium">
          <p>Affichage de 1 à 8 sur 3 492 041 citoyens</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-primary/20 bg-primary/5 text-primary font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/20 hover:bg-surface-container-low">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/20 hover:bg-surface-container-low">3</button>
            <span className="w-8 h-8 flex items-center justify-center">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/20 hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Citizens;
